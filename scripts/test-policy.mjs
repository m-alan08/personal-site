import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import {
  act,
  buildActor,
  policyInputs,
} from "../src/components/playground/policy.ts";
import {
  policyController,
  proportionalController,
  runEpisode,
} from "../src/components/playground/simulation.ts";

const folder = "public/models/fetch-reach";
const manifest = JSON.parse(await readFile(`${folder}/policy.json`, "utf8"));
const vectors = JSON.parse(
  await readFile("scripts/policy/fetch-reach-vectors.json", "utf8"),
);
const now = () => performance.now();

async function weights(file) {
  const bytes = await readFile(`${folder}/${file}`);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length);
}

function benchmark(controller) {
  const outcomes = manifest.evaluationGoals.map((goal) =>
    runEpisode(manifest, controller, goal, now),
  );
  const successes = outcomes.filter(
    (outcome) => outcome.finalDistance < manifest.successThreshold,
  ).length;
  const meanFinal =
    outcomes.reduce((total, outcome) => total + outcome.finalDistance, 0) /
    outcomes.length;
  return { successRate: successes / outcomes.length, meanFinal };
}

const normalized = policyInputs(
  manifest.normalizer,
  vectors.normalized.observation,
  vectors.normalized.goal,
);
const inputError = Math.max(
  ...vectors.normalized.inputs.map((value, index) =>
    Math.abs(value - normalized[index]),
  ),
);
assert.ok(inputError < 1e-6, `normalizer matches (${inputError})`);
console.log(`PASS normalizer: max error ${inputError.toExponential(2)}`);

for (const variant of manifest.variants) {
  const buffer = await weights(variant.weights);
  assert.equal(buffer.byteLength, variant.bytes, `${variant.id}: size`);
  const actor = buildActor(manifest, variant, buffer);
  const expected = vectors.actions[variant.id];
  let worst = 0;
  vectors.inputs.forEach((row, index) => {
    const action = act(actor, Float32Array.from(row));
    expected[index].forEach((value, axis) => {
      worst = Math.max(worst, Math.abs(value - action[axis]));
    });
  });
  assert.ok(worst < 1e-5, `${variant.id}: PyTorch parity (${worst})`);
  const result = benchmark(policyController(manifest, actor));
  const reference = variant.validation.surrogate;
  assert.ok(
    Math.abs(result.successRate - reference.successRate) < 0.015,
    `${variant.id}: success ${result.successRate} vs ${reference.successRate}`,
  );
  assert.ok(
    Math.abs(result.meanFinal - reference.meanFinalDistance) < 0.002,
    `${variant.id}: final ${result.meanFinal} vs ${reference.meanFinalDistance}`,
  );
  console.log(
    `PASS ${variant.id}: ${vectors.inputs.length} PyTorch actions within ${worst.toExponential(2)}, ` +
      `surrogate ${result.successRate.toFixed(2)} (python ${reference.successRate.toFixed(2)}), ` +
      `MuJoCo ${variant.validation.mujoco.successRate.toFixed(2)}`,
  );
}

const baseline = benchmark(proportionalController(manifest));
assert.ok(baseline.successRate > 0.9, "proportional controller reaches goals");
console.log(
  `PASS proportional controller: success ${baseline.successRate.toFixed(2)}, mean final ${(baseline.meanFinal * 100).toFixed(1)} cm`,
);
