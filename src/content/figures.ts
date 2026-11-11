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
  base: [
    { label: "Based at", value: "Georgia Tech, Atlanta" },
    { label: "Studying", value: profile.education.field },
    { label: "Graduation", value: profile.education.graduation },
  ],
};
