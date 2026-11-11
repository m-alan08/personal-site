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
  base: [
    { label: "Based at", value: "Georgia Tech, Atlanta" },
    { label: "Studying", value: profile.education.field },
    { label: "Graduation", value: profile.education.graduation },
  ],
};
