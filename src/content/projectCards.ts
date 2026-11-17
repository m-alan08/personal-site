export const projectCardLabels = {
  caseStudy: "Case study",
  result: "Headline result",
};

export interface HeadlineResult {
  value: string;
  detail: string;
}

export const headlineResults: Record<string, HeadlineResult> = {
  "quantrl-fetch": {
    value: "100%",
    detail: "FetchReach success at 4 bits with QAT fine-tune, vs 82.0% for PTQ",
  },
  "ari-ai": {
    value: "7.1%",
    detail:
      "of held-out simulated episodes with a compromise, vs 83.0% for tuned threshold rules, at a 75% false disruption rate",
  },
  constellation: {
    value: "0.82 AUC",
    detail:
      "logistic regression vs a 0.73 hand-tuned baseline, on simulated outcomes only",
  },
};
