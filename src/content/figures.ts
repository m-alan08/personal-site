import { profile } from "./profile";

export const figures = {
  arm: "Fig. 1 · SO-101 arm, side elevation",
  loop: {
    caption: "Fig. 2 · RL loop, SAC with HER",
    policy: "policy π(a | s, g)",
    environment: "environment",
    environmentDetail: "Fetch · MuJoCo",
    action: "aₜ",
    observation: "sₜ₊₁, rₜ",
    buffer: "replay buffer",
    relabel: "HER: g ← g′",
  },
  hierarchy: {
    caption: "Fig. 3 · Which layer makes which call",
    layers: [
      { title: "VLA or planner", detail: "vision and language · slow" },
      { title: "learned controller", detail: "RL policy · fast" },
      { title: "SO-101 arm", detail: "joint commands" },
    ],
    split: "the split",
  },
  notes: {
    caption: "From my notes · soft actor-critic",
    heading: "SOFT ACTOR-CRITIC",
    entries: [
      {
        before: "J(π) = Σ E[ r + ",
        accent: "α",
        after: " H(π(·|s)) ]",
        note: "reward plus an entropy bonus",
      },
      {
        before: "y = r + γ ( min Q′ − ",
        accent: "α",
        after: " log π )",
        note: "soft Bellman target, twin critics",
      },
      {
        before: "g ← ",
        accent: "g′",
        after: " achieved",
        note: "hindsight relabel for missed goals",
      },
    ],
  },
  timeline: {
    caption: "Roles over time",
    now: "now",
  },
  quantization: {
    caption: "FetchReach success rate by actor bit width",
    note: "Mean over 3 training seeds, each scored on the same 100 episodes. Weights and activations use the same bit width. Where lines overlap, the methods tie.",
    summary:
      "Line chart of three ways to get a low-bit actor. Down to 5 bits every method stays at 97.7 percent success or higher. At 4 bits, quantization-aware fine-tuning keeps 100 percent, quantization-aware training from scratch keeps 96 percent, and post-training quantization drops to 82 percent. At 3 bits all three fall to between 32.3 and 50.3 percent, and at 2 bits to 0.7 percent or less.",
    source: {
      label: "Source: quantrl-fetch key results",
      href: "https://github.com/m-alan08/quantrl-fetch#key-results",
    },
    xLabel: "Actor bit width",
    yLabel: "Success rate (%)",
    bitsLabel: "Bits",
    bits: ["2", "3", "4", "5", "6", "8", "fp32"],
    series: [
      {
        id: "ptq",
        name: "Post-training quantization",
        values: [0.0, 43.0, 82.0, 97.7, 100.0, 100.0, 100.0],
      },
      {
        id: "scratch",
        name: "Quantization-aware training from scratch",
        values: [0.7, 32.3, 96.0, 100.0, 100.0, 100.0, 100.0],
      },
      {
        id: "finetune",
        name: "Quantization-aware fine-tuning",
        values: [0.3, 50.3, 100.0, 100.0, 100.0, 100.0, 100.0],
      },
    ],
  },
  base: [
    { label: "Based at", value: "Georgia Tech, Atlanta" },
    { label: "Studying", value: profile.education.field },
    { label: "Graduation", value: profile.education.graduation },
  ],
};
