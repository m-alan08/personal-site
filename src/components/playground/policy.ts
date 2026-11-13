export interface Outcome {
  successRate: number;
  meanFinalDistance: number;
}

export interface VariantSpec {
  id: string;
  method: "fp32" | "ptq" | "qat_finetune";
  bits: number;
  weights: string;
  bytes: number;
  activationMaxAbs?: number[];
  validation: { mujoco: Outcome; surrogate: Outcome };
}

export interface Normalizer {
  observationMean: number[];
  observationStd: number[];
  goalMean: number[];
  goalStd: number[];
  obsClip: number;
  normalizedClip: number;
}

export interface PolicyManifest {
  env: string;
  episodeSteps: number;
  controlDt: number;
  actionScale: number;
  successThreshold: number;
  targetRange: number;
  origin: number[];
  startObservation: number[];
  workspace: { low: number[]; high: number[] };
  layers: [number, number][];
  normalizer: Normalizer;
  dynamics: { matrix: number[][] };
  variants: VariantSpec[];
  evaluationGoals: number[][];
  provenance: {
    repository: string;
    checkpointSha256: Record<string, string>;
    trainingSteps: Record<string, number>;
    seed: number;
    calibrationEpisodes: number;
    evaluationEpisodes: number;
  };
}

interface Layer {
  inputs: number;
  outputs: number;
  weight: Float32Array;
  bias: Float32Array;
  inputMaxAbs: number | null;
}

export interface Actor {
  id: string;
  bits: number;
  layers: Layer[];
  actionDim: number;
}

const toFloat32 = Math.fround;
const scaleFloor = 1e-8;

function maxLevel(bits: number): number {
  return 2 ** (bits - 1) - 1;
}

export function roundHalfEven(value: number): number {
  const floor = Math.floor(value);
  const fraction = value - floor;
  if (fraction < 0.5) return floor;
  if (fraction > 0.5) return floor + 1;
  return floor % 2 === 0 ? floor : floor + 1;
}

function scaleFor(maxAbs: number, bits: number): number {
  return Math.max(toFloat32(toFloat32(maxAbs) / maxLevel(bits)), scaleFloor);
}

function quantizeValue(value: number, scale: number, level: number): number {
  const integer = roundHalfEven(toFloat32(value / scale));
  return toFloat32(Math.min(level, Math.max(-level, integer)) * scale);
}

function quantizeWeights(
  weight: Float32Array,
  inputs: number,
  bits: number,
): Float32Array {
  const level = maxLevel(bits);
  const result = new Float32Array(weight.length);
  for (let row = 0; row < weight.length / inputs; row += 1) {
    const start = row * inputs;
    let maxAbs = 0;
    for (let column = 0; column < inputs; column += 1)
      maxAbs = Math.max(maxAbs, Math.abs(weight[start + column]));
    const scale = scaleFor(maxAbs, bits);
    for (let column = 0; column < inputs; column += 1)
      result[start + column] = quantizeValue(
        weight[start + column],
        scale,
        level,
      );
  }
  return result;
}

function readFloat32(view: DataView, offset: number, count: number) {
  const values = new Float32Array(count);
  for (let index = 0; index < count; index += 1)
    values[index] = view.getFloat32(offset + index * 4, true);
  return values;
}

function fp32Layers(manifest: PolicyManifest, buffer: ArrayBuffer): Layer[] {
  const view = new DataView(buffer);
  let offset = 0;
  return manifest.layers.map(([inputs, outputs]) => {
    const weight = readFloat32(view, offset, inputs * outputs);
    offset += inputs * outputs * 4;
    const bias = readFloat32(view, offset, outputs);
    offset += outputs * 4;
    return { inputs, outputs, weight, bias, inputMaxAbs: null };
  });
}

function integerLayers(manifest: PolicyManifest, buffer: ArrayBuffer): Layer[] {
  const view = new DataView(buffer);
  const levels = new Int8Array(buffer);
  const levelCount = manifest.layers.reduce(
    (total, [inputs, outputs]) => total + inputs * outputs,
    0,
  );
  let levelOffset = 0;
  let offset = Math.ceil(levelCount / 4) * 4;
  return manifest.layers.map(([inputs, outputs]) => {
    const scales = readFloat32(view, offset, outputs);
    offset += outputs * 4;
    const bias = readFloat32(view, offset, outputs);
    offset += outputs * 4;
    const weight = new Float32Array(inputs * outputs);
    for (let index = 0; index < weight.length; index += 1)
      weight[index] = toFloat32(
        levels[levelOffset + index] * scales[Math.floor(index / inputs)],
      );
    levelOffset += inputs * outputs;
    return { inputs, outputs, weight, bias, inputMaxAbs: null };
  });
}

export function buildActor(
  manifest: PolicyManifest,
  variant: VariantSpec,
  buffer: ArrayBuffer,
): Actor {
  const integer = variant.method === "qat_finetune";
  const base = integer
    ? integerLayers(manifest, buffer)
    : fp32Layers(manifest, buffer);
  const layers = base.map((layer, index) => ({
    ...layer,
    weight:
      variant.method === "ptq"
        ? quantizeWeights(layer.weight, layer.inputs, variant.bits)
        : layer.weight,
    inputMaxAbs: variant.activationMaxAbs?.[index] ?? null,
  }));
  const outputs = manifest.layers[manifest.layers.length - 1][1];
  return { id: variant.id, bits: variant.bits, layers, actionDim: outputs / 2 };
}

function quantizeActivations(
  values: Float32Array,
  maxAbs: number,
  bits: number,
): Float32Array {
  const scale = scaleFor(maxAbs, bits);
  const level = maxLevel(bits);
  return values.map((value) => quantizeValue(value, scale, level));
}

export function act(actor: Actor, inputs: Float32Array): Float32Array {
  let values = inputs;
  actor.layers.forEach((layer, index) => {
    const source =
      layer.inputMaxAbs === null
        ? values
        : quantizeActivations(values, layer.inputMaxAbs, actor.bits);
    const next = new Float32Array(layer.outputs);
    for (let row = 0; row < layer.outputs; row += 1) {
      let total = 0;
      const start = row * layer.inputs;
      for (let column = 0; column < layer.inputs; column += 1)
        total += layer.weight[start + column] * source[column];
      const value = toFloat32(total + layer.bias[row]);
      next[row] = index < actor.layers.length - 1 ? Math.max(0, value) : value;
    }
    values = next;
  });
  return values
    .subarray(0, actor.actionDim)
    .map((value) => toFloat32(Math.tanh(value)));
}

function normalizePart(
  values: ArrayLike<number>,
  mean: number[],
  std: number[],
  normalizer: Normalizer,
  target: Float32Array,
  offset: number,
): void {
  for (let index = 0; index < mean.length; index += 1) {
    const raw = Math.min(
      normalizer.obsClip,
      Math.max(-normalizer.obsClip, values[index]),
    );
    const normalized = (raw - mean[index]) / std[index];
    target[offset + index] = Math.min(
      normalizer.normalizedClip,
      Math.max(-normalizer.normalizedClip, normalized),
    );
  }
}

export function policyInputs(
  normalizer: Normalizer,
  observation: ArrayLike<number>,
  goal: ArrayLike<number>,
): Float32Array {
  const size = normalizer.observationMean.length;
  const inputs = new Float32Array(size + normalizer.goalMean.length);
  normalizePart(
    observation,
    normalizer.observationMean,
    normalizer.observationStd,
    normalizer,
    inputs,
    0,
  );
  normalizePart(
    goal,
    normalizer.goalMean,
    normalizer.goalStd,
    normalizer,
    inputs,
    size,
  );
  return inputs;
}
