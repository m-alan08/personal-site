import { figures } from "./figures";
import { profile } from "./profile";

const { bits, series } = figures.quantization;
const fineTuneAtFourBits =
  series.find((line) => line.id === "finetune")?.values[bits.indexOf("4")] ?? 0;

export const hero = {
  actions: {
    projects: "View projects",
    resume: "Resume",
    email: "Email",
  },
  now: "Now",
  proofHeading: "Key results",
  proof: [
    {
      value: `${fineTuneAtFourBits}%`,
      label: "FetchReach success, 4-bit actor, QAT fine-tuning",
      highlight: true,
    },
    {
      value: "96.3%",
      label: "FetchPush success, 5-bit actor, QAT from scratch",
      highlight: false,
    },
    {
      value: "SAC + HER",
      label: "Written from scratch in PyTorch",
      highlight: false,
    },
    {
      value: profile.education.graduation.replace(/^Expected\s+/, ""),
      label: "Expected graduation, Georgia Tech math and CS",
      highlight: false,
    },
  ],
};

export const header = {
  menu: "Menu",
};
