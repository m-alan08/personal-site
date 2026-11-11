export interface KeyResult {
  kind: "result";
  value: string;
  label: string;
  context: string;
  source: { label: string; href: string };
}

export interface StatusNote {
  kind: "status";
  text: string;
}

export interface CaseStudyExtras {
  highlight: KeyResult | StatusNote;
  enhanceImages?: boolean;
}

export const caseStudyLabels = {
  keyResult: "Key result",
  status: "Status",
  onThisPage: "On this page",
  problem: "Problem",
  role: "My role",
  approach: "Approach",
  results: "Results",
  figures: "Figures",
  limitations: "Limitations",
  lessons: "What I learned",
  sources: "Sources",
  planned: "Planned",
  links: "Project links",
  badges: "Project facts",
  step: "Step",
};

export const caseStudyExtras: Record<string, CaseStudyExtras> = {
  "quantrl-fetch": {
    highlight: {
      kind: "result",
      value: "100%",
      label: "FetchReach success with a 4-bit actor after QAT fine-tuning",
      context:
        "Post-training quantization alone reaches 82.0% at 4 bits, against 100% for the fp32 policy.",
      source: {
        label: "Key results",
        href: "https://github.com/m-alan08/quantrl-fetch#key-results",
      },
    },
  },
  "ari-ai": {
    highlight: {
      kind: "result",
      value: "7.1%",
      label:
        "of held-out episodes end with a compromise under the Double DQN defense policy",
      context:
        "Down from 83.0% for tuned threshold rules, at the cost of a 75% false disruption rate, in the simulated 10-node defense lab (5 seeds, 100 episodes each).",
      source: {
        label: "rl-defense evaluation",
        href: "https://github.com/adamissac/ari-ai/blob/main/rl-defense/README.md",
      },
    },
  },
  armlab: {
    enhanceImages: true,
    highlight: {
      kind: "status",
      text: "The SGS teacher pipeline is built and runs in simulation; distilling it into SmolVLA with DAgger and evaluating on the SO-101 arm are next.",
    },
  },
  constellation: {
    highlight: {
      kind: "status",
      text: "A 36-hour HackGT 13 prototype; its ranking models were measured on simulated outcomes only, and the real-data training path has not been run.",
    },
  },
  "vla-finetuning-scaling": {
    highlight: {
      kind: "status",
      text: "The repository and environment are being set up and no experiments have run; next is fine-tuning SmolVLA, pi0, and ACT on LIBERO.",
    },
  },
};
