import {
  datasets,
  explorerLabels,
  methods,
  type BitWidth,
  type Measurement,
  type MethodId,
  type TaskId,
} from "../../data/explorerData";

export function measurementFor(
  task: TaskId,
  method: MethodId,
  bits: BitWidth,
): Measurement | null {
  return (
    datasets.find((set) => set.task === task)?.results[method][bits] ?? null
  );
}

export function formatMean(measurement: Measurement): string {
  return measurement[0].toFixed(1);
}

export function formatValue(measurement: Measurement | null): string {
  return measurement
    ? `${formatMean(measurement)}%`
    : explorerLabels.notMeasured;
}

export function seedRange(measurement: Measurement): string {
  return `${measurement[1]} to ${measurement[2]}`;
}

export function seedText(measurement: Measurement): string {
  return `${explorerLabels.lowestSeed} ${measurement[1]}%, ${explorerLabels.highestSeed} ${measurement[2]}%`;
}

export function bitLabel(bits: BitWidth): string {
  return bits === "fp32"
    ? explorerLabels.fp32Label
    : `${bits} ${explorerLabels.bitsSuffix}`;
}

export function selectionText(
  task: TaskId,
  method: MethodId,
  bits: BitWidth,
): string {
  const taskLabel = datasets.find((set) => set.task === task)?.label ?? task;
  const methodLabel =
    methods.find((entry) => entry.id === method)?.label ?? method;
  return `${taskLabel}, ${methodLabel}, ${bitLabel(bits)}`;
}

export function statusText(
  task: TaskId,
  method: MethodId,
  bits: BitWidth,
): string {
  const measurement = measurementFor(task, method, bits);
  const result = measurement
    ? `${formatValue(measurement)} ${explorerLabels.successSuffix}`
    : explorerLabels.notMeasured;
  return `${selectionText(task, method, bits)}: ${result}`;
}
