import { profile } from "./profile";

export const figures = {
  hierarchy: {
    caption:
      "Which layer makes which call: a slow VLA model or planner above the split, a fast learned RL controller below it, and joint commands to the SO-101 arm.",
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
  base: [
    { label: "Based at", value: "Georgia Tech, Atlanta" },
    { label: "Studying", value: profile.education.field },
    { label: "Graduation", value: profile.education.graduation },
  ],
};
