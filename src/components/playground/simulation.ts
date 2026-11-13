import {
  act,
  policyInputs,
  type Actor,
  type PolicyManifest,
} from "./policy.ts";

export type Vector = [number, number, number];

export interface Controller {
  kind: "policy" | "proportional";
  decide(observation: Float64Array, goal: Vector): Float32Array;
}

export interface StepResult {
  action: Float32Array;
  latency: number;
}

export const proportionalGain = 1;

function clipUnit(value: number): number {
  return Math.min(1, Math.max(-1, value));
}

export function policyController(
  manifest: PolicyManifest,
  actor: Actor,
): Controller {
  return {
    kind: "policy",
    decide: (observation, goal) =>
      act(actor, policyInputs(manifest.normalizer, observation, goal)).map(
        clipUnit,
      ),
  };
}

export function proportionalController(manifest: PolicyManifest): Controller {
  return {
    kind: "proportional",
    decide: (observation, goal) => {
      const action = new Float32Array(4);
      for (let axis = 0; axis < 3; axis += 1)
        action[axis] = clipUnit(
          (proportionalGain * (goal[axis] - observation[axis])) /
            manifest.actionScale,
        );
      return action;
    },
  };
}

export function startObservation(manifest: PolicyManifest): Float64Array {
  return Float64Array.from(manifest.startObservation);
}

export function bounds(manifest: PolicyManifest): {
  low: Vector;
  high: Vector;
} {
  const shift = (offsets: number[]) =>
    offsets.map((offset, axis) => manifest.origin[axis] + offset) as Vector;
  return {
    low: shift(manifest.workspace.low),
    high: shift(manifest.workspace.high),
  };
}

export function insideWorkspace(manifest: PolicyManifest, goal: Vector) {
  const { low, high } = bounds(manifest);
  return goal.every((value, axis) => value >= low[axis] && value <= high[axis]);
}

export function insideTrainingRange(manifest: PolicyManifest, goal: Vector) {
  return goal.every(
    (value, axis) =>
      Math.abs(value - manifest.origin[axis]) <= manifest.targetRange + 1e-9,
  );
}

export function advance(
  manifest: PolicyManifest,
  observation: Float64Array,
  action: Float32Array,
): Float64Array {
  const matrix = manifest.dynamics.matrix;
  const features = [
    manifest.actionScale * action[0],
    manifest.actionScale * action[1],
    manifest.actionScale * action[2],
    observation[5],
    observation[6],
    observation[7],
  ];
  const change = matrix[0].map((_, column) =>
    features.reduce(
      (total, value, row) => total + value * matrix[row][column],
      0,
    ),
  );
  const { low, high } = bounds(manifest);
  const next = Float64Array.from(observation);
  for (let axis = 0; axis < 3; axis += 1) {
    const position = observation[axis] + change[axis];
    const clamped = Math.min(high[axis], Math.max(low[axis], position));
    next[axis] = clamped;
    next[5 + axis] = clamped === position ? change[3 + axis] : 0;
  }
  return next;
}

export function distance(observation: ArrayLike<number>, goal: Vector) {
  return Math.hypot(
    observation[0] - goal[0],
    observation[1] - goal[1],
    observation[2] - goal[2],
  );
}

export function step(
  manifest: PolicyManifest,
  controller: Controller,
  observation: Float64Array,
  goal: Vector,
  now: () => number,
): { observation: Float64Array } & StepResult {
  const started = now();
  const action = controller.decide(observation, goal);
  const latency = now() - started;
  return {
    observation: advance(manifest, observation, action),
    action,
    latency,
  };
}

export interface EpisodeOutcome {
  finalDistance: number;
  reachedAt: number | null;
  latencies: number[];
}

export function runEpisode(
  manifest: PolicyManifest,
  controller: Controller,
  goal: Vector,
  now: () => number,
): EpisodeOutcome {
  let observation = startObservation(manifest);
  let reachedAt: number | null = null;
  const latencies: number[] = [];
  for (let index = 1; index <= manifest.episodeSteps; index += 1) {
    const result = step(manifest, controller, observation, goal, now);
    observation = result.observation;
    latencies.push(result.latency);
    if (
      reachedAt === null &&
      distance(observation, goal) < manifest.successThreshold
    )
      reachedAt = index;
  }
  return { finalDistance: distance(observation, goal), reachedAt, latencies };
}

export function median(values: number[]): number {
  if (values.length === 0) return Number.NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}
