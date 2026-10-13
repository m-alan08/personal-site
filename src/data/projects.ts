export interface Project {
  slug: string;
  title: string;
  summary: string;
  question: string;
  ownership: "Solo project" | "Team project";
  status: string;
  scope: string;
  technology: string[];
  repository: string;
  simulationOnly: boolean;
  writeup: string[];
  sourceNote: string;
}

export const projects: Project[] = [
  {
    slug: "quantrl-fetch",
    title: "Quantization-aware RL",
    summary:
      "I study how low-bit actor precision affects reinforcement learning policies for a simulated Fetch robot arm.",
    question: "How few bits does a robot arm policy need?",
    ownership: "Solo project",
    status: "In progress: quantization evaluation next",
    scope:
      "SAC, HER, and quantization are implemented from scratch in PyTorch. This work is simulation only.",
    technology: [
      "Python",
      "PyTorch",
      "MuJoCo",
      "Gymnasium Robotics",
      "SAC",
      "HER",
    ],
    repository: "https://github.com/m-alan08/quantrl-fetch",
    simulationOnly: true,
    writeup: [
      "This project asks how far a policy's actor network can be reduced in precision before its control behavior suffers. The experiments use a simulated Fetch robot arm, rather than hardware.",
      "I implemented Soft Actor-Critic and Hindsight Experience Replay in PyTorch. The README reports completed fp32 FetchReach baselines and a written and tested quantization module. Quantization evaluation results are still pending.",
      "The planned comparison covers post-training quantization, quantization-aware fine-tuning, and training with quantization from the start. Later work asks whether behavior cloning followed by online post-training can recover performance. Fake quantization models accuracy effects; it does not establish speed or energy savings on real hardware.",
    ],
    sourceNote:
      "Based on the repository README, checked on October 12, 2026. Follow the repository for current status and evidence.",
  },
  {
    slug: "armlab",
    title: "Robot arm RL post-training",
    summary:
      "On a team robot arm project, I work on RL post-training policy ideas and implementation.",
    question: "How can post-training improve a robot arm policy?",
    ownership: "Team project",
    status: "My contribution: RL post-training work",
    scope:
      "My part is policy ideas and implementation for RL post-training. The broader robot arm project is a team effort.",
    technology: [],
    repository: "",
    simulationOnly: false,
    writeup: [
      "This is a team robot arm project referred to as armlab. My contribution is RL post-training policy ideas and implementation.",
      "These notes describe my part of the work. They do not claim ownership of the arm, the broader system, or the team's results.",
    ],
    sourceNote:
      "Contribution description supplied by Alan. A verified repository link, technology list, and project-wide status are not available here yet.",
  },
];
