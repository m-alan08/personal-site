export const playgroundVariants = [
  { id: "fp32", label: "FP32" },
  { id: "ptq8", label: "8-bit PTQ" },
  { id: "ptq6", label: "6-bit PTQ" },
  { id: "ptq5", label: "5-bit PTQ" },
  { id: "ptq4", label: "4-bit PTQ" },
  { id: "ptq3", label: "3-bit PTQ" },
  { id: "ptq2", label: "2-bit PTQ" },
  { id: "qat4", label: "4-bit QAT" },
] as const;

export const playgroundDefaults = { controller: "policy", variant: "fp32" };

export const playgroundModelPath = "models/fetch-reach/";
