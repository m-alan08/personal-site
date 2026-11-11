export const bitWidths = ["fp32", "8", "6", "5", "4", "3", "2"] as const;

export type BitWidth = (typeof bitWidths)[number];
export type MethodId = "ptq" | "qat-finetune" | "qat-scratch";
export type TaskId = "fetch-reach" | "fetch-push";
export type Measurement = readonly [mean: number, low: number, high: number];

export interface ExplorerMethod {
  id: MethodId;
  label: string;
}

export interface ExplorerDataset {
  task: TaskId;
  label: string;
  source: string;
  sourceTable: string;
  results: Record<MethodId, Record<BitWidth, Measurement | null>>;
}

export const methods: ExplorerMethod[] = [
  { id: "ptq", label: "Post-training quantization" },
  { id: "qat-finetune", label: "QAT fine-tune" },
  { id: "qat-scratch", label: "QAT from scratch" },
];

export const datasets: ExplorerDataset[] = [
  {
    task: "fetch-reach",
    label: "FetchReach",
    source: "https://github.com/m-alan08/quantrl-fetch#key-results",
    sourceTable: "Three ways to get a low-bit actor on FetchReach",
    results: {
      ptq: {
        fp32: [100.0, 100, 100],
        "8": [100.0, 100, 100],
        "6": [100.0, 100, 100],
        "5": [97.7, 95, 99],
        "4": [82.0, 79, 86],
        "3": [43.0, 38, 47],
        "2": [0.0, 0, 0],
      },
      "qat-finetune": {
        fp32: [100.0, 100, 100],
        "8": [100.0, 100, 100],
        "6": [100.0, 100, 100],
        "5": [100.0, 100, 100],
        "4": [100.0, 100, 100],
        "3": [50.3, 42, 60],
        "2": [0.3, 0, 1],
      },
      "qat-scratch": {
        fp32: [100.0, 100, 100],
        "8": [100.0, 100, 100],
        "6": [100.0, 100, 100],
        "5": [100.0, 100, 100],
        "4": [96.0, 95, 97],
        "3": [32.3, 30, 35],
        "2": [0.7, 0, 1],
      },
    },
  },
  {
    task: "fetch-push",
    label: "FetchPush",
    source: "https://github.com/m-alan08/quantrl-fetch#key-results",
    sourceTable: "Three ways to get a low-bit actor on FetchPush",
    results: {
      ptq: {
        fp32: [98.3, 98, 99],
        "8": [98.7, 98, 99],
        "6": [95.0, 93, 97],
        "5": [82.7, 74, 90],
        "4": [14.7, 2, 22],
        "3": [8.0, 8, 8],
        "2": [8.0, 8, 8],
      },
      "qat-finetune": {
        fp32: [98.3, 98, 99],
        "8": [98.3, 97, 99],
        "6": [98.0, 96, 100],
        "5": [83.7, 74, 94],
        "4": [10.7, 9, 14],
        "3": [8.0, 8, 8],
        "2": [8.0, 8, 8],
      },
      "qat-scratch": {
        fp32: [98.3, 98, 99],
        "8": [100.0, 100, 100],
        "6": [99.3, 99, 100],
        "5": [96.3, 95, 98],
        "4": [39.3, 32, 53],
        "3": [7.3, 7, 8],
        "2": [6.7, 6, 8],
      },
    },
  },
];

export const explorerDefaults: {
  task: TaskId;
  method: MethodId;
  bits: BitWidth;
} = { task: "fetch-push", method: "qat-scratch", bits: "5" };

export const explorerLabels = {
  notMeasured: "Not measured",
  fp32Label: "fp32 (not quantized)",
  bitsSuffix: "bits",
  lowestSeed: "Lowest seed",
  highestSeed: "highest seed",
  successSuffix: "success rate",
};

export const explorerCopy = {
  label: "Interactive",
  title: "How few bits does a robot arm policy need?",
  intro:
    "Pick a task, a quantization method and a bit width to see how often my quantized actor completes the task in quantrl-fetch. Each value is the success rate in percent on the same 100 evaluation episodes, as the mean over 3 training seeds. Weights and activations use the same bit width, and fp32 is the unquantized baseline.",
  taskLegend: "Task",
  methodLegend: "Method",
  bitsLabel: "Bit width",
  bitsHeading: "Bits",
  successLabel: "Success rate",
  tableNote: "Mean over 3 seeds, lowest and highest seed below each value.",
  chartCaption:
    "Success rate at every bit width for the selected task. The bright line is the selected method and the grey lines are the other two.",
  sourceLabel: "Source: quantrl-fetch key results on GitHub",
};
