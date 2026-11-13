import argparse
import hashlib
import json
from pathlib import Path

import gymnasium as gym
import gymnasium_robotics
import numpy as np
import torch

from quantrl.checkpoint import deterministic_policy_function, load_checkpoint, load_policy
from quantrl.config import QuantConfig
from quantrl.eval.evaluate import evaluation_seeds
from quantrl.quant.layers import QuantLinear
from quantrl.quant.ptq import collect_calibration_inputs, quantize_actor_post_training
from quantrl.quant.quantizer import fake_quantize_weight, weight_scale

gym.register_envs(gymnasium_robotics)

PTQ_BITS = [8, 6, 5, 4, 3, 2]
TABLE_OFFSET = -0.118
WORKSPACE = {"low": [-0.4, -0.3, TABLE_OFFSET], "high": [0.4, 0.3, 0.4]}
SUCCESS_THRESHOLD = 0.05


def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def f32(values):
    return [float(v) for v in np.asarray(values, dtype=np.float32).ravel()]


def f64(values):
    return [float(v) for v in np.asarray(values, dtype=np.float64).ravel()]


def linear_layers(actor):
    return [m for m in actor.network if isinstance(m, torch.nn.Linear)]


def activation_ranges(actor):
    return [float(layer.input_quantizer.running_max_abs) for layer in linear_layers(actor)]


def fit_dynamics(env, policy, normalizer, origin, rng):
    rows, targets = [], []
    unwrapped = env.unwrapped
    for episode in range(700):
        observation, _ = env.reset(seed=episode)
        if 300 <= episode < 500:
            goal = origin + rng.uniform(-0.3, 0.3, 3)
            goal[2] = max(goal[2], origin[2] - 0.1)
            unwrapped.goal = goal.copy()
            observation = unwrapped._get_obs()
        for _ in range(50):
            state = observation["observation"]
            if episode < 500:
                action = policy(normalizer(state, observation["desired_goal"])[None])[0]
                action = action + rng.normal(0, 0.3, 4)
            else:
                action = rng.uniform(-1, 1, 4)
            action = np.clip(action, -1, 1)
            next_observation, *_ = env.step(action)
            relative = state[:3] - origin
            if np.abs(relative).max() < 0.35 and relative[2] > -0.1:
                rows.append(np.concatenate([0.05 * action[:3], state[5:8]]))
                following = next_observation["observation"]
                targets.append(np.concatenate([following[:3] - state[:3], following[5:8]]))
            observation = next_observation
    rows, targets = np.array(rows), np.array(targets)
    weights, *_ = np.linalg.lstsq(rows, targets, rcond=None)
    error = rows @ weights - targets
    rmse = {
        "position_mm": float(np.sqrt((error[:, :3] ** 2).mean()) * 1000),
        "velocity_mm": float(np.sqrt((error[:, 3:] ** 2).mean()) * 1000),
        "samples": int(len(rows)),
    }
    return weights, rmse


def surrogate_episode(policy, normalizer, weights, origin, start, goal):
    state = start.copy()
    low = origin + np.array(WORKSPACE["low"])
    high = origin + np.array(WORKSPACE["high"])
    for _ in range(50):
        action = np.clip(policy(normalizer(state, goal)[None])[0], -1, 1)
        step = np.concatenate([0.05 * action[:3], state[5:8]]) @ weights
        state[:3] += step[:3]
        state[5:8] = step[3:]
        clamped = np.clip(state[:3], low, high)
        state[5:8] = np.where(clamped != state[:3], 0.0, state[5:8])
        state[:3] = clamped
    return float(np.linalg.norm(state[:3] - goal))


def mujoco_episode(env, policy, normalizer, seed):
    observation, _ = env.reset(seed=seed)
    info = {}
    for _ in range(50):
        action = policy(normalizer(observation["observation"], observation["desired_goal"])[None])[0]
        observation, _, _, _, info = env.step(action)
    distance = np.linalg.norm(observation["achieved_goal"] - observation["desired_goal"])
    return float(distance), float(info["is_success"])


def compare(env, policy, normalizer, weights, origin, seeds):
    mujoco, surrogate = [], []
    for seed in seeds:
        mujoco.append(mujoco_episode(env, policy, normalizer, seed))
        observation, _ = env.reset(seed=seed)
        surrogate.append(
            surrogate_episode(
                policy,
                normalizer,
                weights,
                origin,
                observation["observation"].copy(),
                observation["desired_goal"].copy(),
            )
        )
    mujoco = np.array(mujoco)
    surrogate = np.array(surrogate)
    return {
        "mujoco": {
            "successRate": float(mujoco[:, 1].mean()),
            "meanFinalDistance": float(mujoco[:, 0].mean()),
        },
        "surrogate": {
            "successRate": float((surrogate < SUCCESS_THRESHOLD).mean()),
            "meanFinalDistance": float(surrogate.mean()),
        },
    }


def write_fp32(actor, path):
    chunks = []
    for layer in linear_layers(actor):
        chunks.append(layer.weight.detach().numpy().astype("<f4").ravel())
        chunks.append(layer.bias.detach().numpy().astype("<f4").ravel())
    np.concatenate(chunks).tofile(path)


def write_quantized(actor, bits, path):
    levels, tail = [], []
    for layer in linear_layers(actor):
        scale = weight_scale(layer.weight, bits, True)
        integers = torch.round(fake_quantize_weight(layer.weight, bits, True) / scale)
        levels.append(integers.detach().numpy().astype(np.int8).ravel())
        tail.append(scale.detach().numpy().astype("<f4").ravel())
        tail.append(layer.bias.detach().numpy().astype("<f4").ravel())
    level_bytes = np.concatenate(levels).tobytes()
    padding = b"\0" * (-len(level_bytes) % 4)
    Path(path).write_bytes(level_bytes + padding + np.concatenate(tail).tobytes())


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--fp32", required=True)
    parser.add_argument("--qat", required=True)
    parser.add_argument("--qat-bits", type=int, default=4)
    parser.add_argument("--out", required=True)
    parser.add_argument("--vectors", required=True)
    args = parser.parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    loaded = load_policy(args.fp32)
    qat = load_policy(args.qat)
    normalizer = loaded.normalizer
    env = gym.make(loaded.config.env.env_id)
    unwrapped = env.unwrapped
    origin = unwrapped.initial_gripper_xpos.copy()
    rng = np.random.default_rng(0)
    fp32_policy = deterministic_policy_function(loaded.actor)

    weights, rmse = fit_dynamics(env, fp32_policy, normalizer, origin, rng)
    calibration = collect_calibration_inputs(
        env,
        fp32_policy,
        normalizer,
        evaluation_seeds(loaded.config.eval.calibration_seed_offset, loaded.config.eval.calibration_episodes),
    )
    seeds = evaluation_seeds(loaded.config.eval.seed_offset, loaded.config.eval.episodes)

    actors = {"fp32": loaded.actor}
    variants = [{"id": "fp32", "method": "fp32", "bits": 32, "weights": "actor-fp32.bin"}]
    for bits in PTQ_BITS:
        config = QuantConfig(weight_bits=bits, activation_bits=bits, per_channel_weights=True)
        actor = quantize_actor_post_training(loaded.actor, loaded.config.sac, config, calibration)
        actors[f"ptq{bits}"] = actor
        variants.append(
            {
                "id": f"ptq{bits}",
                "method": "ptq",
                "bits": bits,
                "weights": "actor-fp32.bin",
                "activationMaxAbs": activation_ranges(actor),
            }
        )
    qat_id = f"qat{args.qat_bits}"
    qat_file = f"actor-qat-w{args.qat_bits}a{args.qat_bits}.bin"
    actors[qat_id] = qat.actor
    variants.append(
        {
            "id": qat_id,
            "method": "qat_finetune",
            "bits": args.qat_bits,
            "weights": qat_file,
            "activationMaxAbs": activation_ranges(qat.actor),
        }
    )
    write_fp32(loaded.actor, out / "actor-fp32.bin")
    write_quantized(qat.actor, args.qat_bits, out / qat_file)

    for variant in variants:
        policy = deterministic_policy_function(actors[variant["id"]])
        variant["validation"] = compare(env, policy, normalizer, weights, origin, seeds)
        variant["bytes"] = (out / variant["weights"]).stat().st_size
        print(variant["id"], variant["validation"])

    goals = []
    for seed in seeds:
        observation, _ = env.reset(seed=seed)
        goals.append(f64(observation["desired_goal"]))
    start, _ = env.reset(seed=seeds[0])

    layers = [[m.in_features, m.out_features] for m in linear_layers(loaded.actor)]
    checkpoint = load_checkpoint(args.fp32)
    manifest = {
        "env": loaded.config.env.env_id,
        "episodeSteps": 50,
        "controlDt": float(unwrapped.n_substeps * unwrapped.model.opt.timestep),
        "actionScale": 0.05,
        "successThreshold": SUCCESS_THRESHOLD,
        "targetRange": float(unwrapped.target_range),
        "origin": f64(origin),
        "startObservation": f64(start["observation"]),
        "workspace": WORKSPACE,
        "layers": layers,
        "normalizer": {
            "observationMean": f64(normalizer.observation.mean),
            "observationStd": f64(normalizer.observation.std),
            "goalMean": f64(normalizer.goal.mean),
            "goalStd": f64(normalizer.goal.std),
            "obsClip": float(normalizer.obs_clip),
            "normalizedClip": float(normalizer.observation.clip),
        },
        "dynamics": {"matrix": [f64(row) for row in weights], "fit": rmse},
        "variants": variants,
        "evaluationGoals": goals,
        "provenance": {
            "repository": "https://github.com/m-alan08/quantrl-fetch",
            "checkpointSha256": {"fp32": sha256(args.fp32), qat_id: sha256(args.qat)},
            "trainingSteps": {"fp32": int(checkpoint["total_steps"]), qat_id: int(load_checkpoint(args.qat)["total_steps"])},
            "seed": int(loaded.config.seed),
            "calibrationEpisodes": int(loaded.config.eval.calibration_episodes),
            "evaluationEpisodes": len(seeds),
        },
    }
    (out / "policy.json").write_text(json.dumps(manifest, separators=(",", ":")) + "\n")

    rng = np.random.default_rng(1)
    samples = calibration[rng.choice(len(calibration), 48, replace=False)]
    samples = np.concatenate([samples, rng.normal(0, 2, (16, samples.shape[1])).astype(np.float32)])
    vectors = {"inputs": [f32(row) for row in samples], "actions": {}}
    for variant_id, actor in actors.items():
        actions = deterministic_policy_function(actor)(samples)
        vectors["actions"][variant_id] = [f32(row) for row in actions]
    raw = start["observation"]
    goal = start["desired_goal"]
    vectors["normalized"] = {
        "observation": f64(raw),
        "goal": f64(goal),
        "inputs": f32(normalizer(raw, goal)),
    }
    Path(args.vectors).write_text(json.dumps(vectors, separators=(",", ":")) + "\n")


if __name__ == "__main__":
    main()
