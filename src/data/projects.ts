export interface ProjectEvent {
  name: string;
  year: number;
  dates: string;
  location: string;
  duration: string;
  teammates: string[];
}
export interface Pipeline {
  title: string;
  description: string;
  nodes: { title: string; detail: string }[];
  note: string;
}
export interface Project {
  category: "Research" | "Robotics" | "Hackathon";
  event: ProjectEvent | null;
  role: string;
  problem: string;
  approach: string[];
  lessons: string[];
  limitations: string[];
  diagram: Pipeline | null;
  sources: { label: string; href: string }[];
  devpost: string;
  interactive: "connections" | "none";
  slug: string;
  title: string;
  summary: string;
  question: string;
  ownership: "Solo project" | "Team project";
  status: string;
  scope: string;
  technology: string[];
  repository: string;
  writeup: string[];
  sourceNote: string;
}

export const projects: Project[] = [
  {
    category: "Research",
    event: null,
    role: "I implemented SAC, HER, and quantization from scratch in PyTorch.",
    problem:
      "Lower precision may reduce an actor network's memory footprint, but the effect on its control behavior needs to be measured.",
    approach: [
      "Train the fp32 SAC actor with HER in MuJoCo Fetch environments. Keep the critics at fp32 while applying fake quantization to the actor.",
      "Compare post-training quantization, quantization-aware fine-tuning, and training with quantization from the start. These evaluation comparisons are planned, not completed results.",
    ],
    lessons: [
      "Fake quantization models accuracy effects. Hardware speed and energy savings require separate evidence.",
    ],
    limitations: [
      "Simulation only. The README reports completed fp32 FetchReach baselines and a tested quantization module; quantization evaluation results are pending.",
    ],
    diagram: {
      title: "Actor precision pipeline",
      description:
        "The documented simulation pipeline, with the quantization evaluation stage explicitly pending.",
      nodes: [
        { title: "Fetch simulation", detail: "MuJoCo + Gymnasium Robotics" },
        { title: "SAC + HER", detail: "PyTorch training, fp32 critics" },
        {
          title: "Actor fake quantization",
          detail: "PTQ, fine-tuning, from-scratch paths",
        },
        {
          title: "Evaluate control behavior",
          detail: "Quantization comparisons pending",
        },
      ],
      note: "Derived from the quantrl-fetch README. This diagram shows the experiment design, not a measured hardware deployment.",
    },
    sources: [
      {
        label: "Repository README",
        href: "https://github.com/m-alan08/quantrl-fetch#readme",
      },
    ],
    devpost: "",
    interactive: "none",
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
    writeup: [
      "This project asks how far a policy's actor network can be reduced in precision before its control behavior suffers. The experiments use a simulated Fetch robot arm, rather than hardware.",
      "I implemented Soft Actor-Critic and Hindsight Experience Replay in PyTorch. The README reports completed fp32 FetchReach baselines and a written and tested quantization module. Quantization evaluation results are still pending.",
      "The planned comparison covers post-training quantization, quantization-aware fine-tuning, and training with quantization from the start. Later work asks whether behavior cloning followed by online post-training can recover performance. Fake quantization models accuracy effects; it does not establish speed or energy savings on real hardware.",
    ],
    sourceNote:
      "Based on the repository README, checked on October 12, 2026. Follow the repository for current status and evidence.",
  },
  {
    category: "Robotics",
    event: null,
    role: "I work on RL post-training policy ideas and implementation.",
    problem: "How can post-training improve a robot arm policy?",
    approach: [],
    lessons: [],
    limitations: [
      "The broader robot arm project is a team effort. These notes describe only my contribution. A verified repository, system architecture, and project-wide results are not available here yet.",
    ],
    diagram: null,
    sources: [],
    devpost: "",
    interactive: "none",
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
    writeup: [
      "This is a team robot arm project referred to as armlab. My contribution is RL post-training policy ideas and implementation.",
      "These notes describe my part of the work. They do not claim ownership of the arm, the broader system, or the team's results.",
    ],
    sourceNote:
      "Contribution description supplied by Alan. A verified repository link, technology list, and project-wide status are not available here yet.",
  },
  {
    slug: "constellation",
    title: "Constellation",
    category: "Hackathon",
    event: {
      name: "HackGT 13",
      year: 2026,
      dates: "September 25 to 27, 2026",
      location: "Georgia Tech",
      duration: "36 hours",
      teammates: ["Adam", "Arjun", "Akshar"],
    },
    summary:
      "A proximity-verified event networking app that ranks relevant matches and connects people only after a verified in-person conversation and mutual consent.",
    question: "Can a match become a real conversation?",
    ownership: "Team project",
    status: "Hackathon prototype",
    scope:
      "I owned the ML and algorithms layer: pairwise matching, ranking models, and match explanations.",
    technology: [
      "Python",
      "FastAPI",
      "sentence-transformers",
      "scikit-learn",
      "LightGBM",
      "Supabase",
      "Expo",
    ],
    repository: "https://github.com/adamissac/constellation",
    writeup: [],
    sourceNote:
      "Project scope, team, event details, synthetic training provenance, and the unused real-data path were supplied by Alan. The public README and ml/README.md were checked on October 12, 2026.",
    role: "I owned the ML and algorithms layer, including pairwise matching and ranking models and the match explanation layer. Adam, Arjun, and Akshar built the project with me.",
    problem:
      "Event networking can turn into profile collecting rather than conversation. Constellation aims to find relevant students and recruiters without public stranger browsing or public connection counts.",
    approach: [
      "Extract weighted interest profiles with evidence, embed their facets, and score pairs using shared interests, complementary goals, and cross-disciplinary overlap. Match explanations are grounded in information both people choose to share.",
      "Train logistic regression and LightGBM LambdaRank on a synthetic population seeded from hand-tagged HackGT 12 winning Devpost projects. Split training and evaluation by user rather than by row to avoid leakage.",
      "The hand-tuned baseline had AUC 0.73; logistic regression reached 0.82. These measurements are on simulated outcomes, not real attendee outcomes.",
      "The app uses Bluetooth proximity with a QR fallback for in-person verification. A connection requires a verified conversation and mutual, silent consent. Counts stay private and discovery is limited to eligible matches and existing connections.",
    ],
    lessons: [
      "Matching is a per-person ranking problem. Viewer-grouped evaluation and grounded explanations keep the model's role clear.",
      "Simulated outcomes can exercise the training pipeline, but they cannot establish how real attendees will connect.",
    ],
    limitations: [
      "The real-data training path exists in the code but was never run. The reported AUC improvement is measured on simulated data only.",
      "Bluetooth functionality requires a native development build. Prototype behavior depends on the client build and configured services.",
    ],
    diagram: {
      title: "From interests to a private connection",
      description:
        "Interest extraction feeds pair scoring and ranking, then grounded explanations. Verified conversations and mutual consent gate a private connection.",
      nodes: [
        {
          title: "Interest profiles",
          detail: "Evidence-based extraction + embeddings",
        },
        {
          title: "Pair scoring and ranking",
          detail: "Logistic regression + LambdaRank",
        },
        {
          title: "Match explanations",
          detail: "Shared topics and grounded starters",
        },
        {
          title: "Verified conversation",
          detail: "Bluetooth proximity + QR fallback",
        },
        {
          title: "Private connection",
          detail: "Mutual, silent consent",
        },
      ],
      note: "Derived from the public README and ML documentation. ML recommendations do not establish that a conversation happened.",
    },
    sources: [
      {
        label: "Project README",
        href: "https://github.com/adamissac/constellation#readme",
      },
      {
        label: "ML documentation",
        href: "https://github.com/adamissac/constellation/blob/main/ml/README.md",
      },
    ],
    devpost: "",
    interactive: "connections",
  },
  {
    slug: "zeroday-arena",
    title: "ZeroDay Arena",
    category: "Hackathon",
    event: {
      name: "Hacklanta",
      year: 2026,
      dates: "",
      location: "",
      duration: "36 hours",
      teammates: [],
    },
    summary:
      "Also called Omen AI, an autonomous cybersecurity prototype with Red and Blue agents, independent verification, and an owned, isolated lab app.",
    question: "What counts as proof that a fix works?",
    ownership: "Team project",
    status: "Hackathon proof of concept",
    scope:
      "I led security, agents, and the application: backend workflows, the agent system, the lab app, and the main frontend. My teammate built the separate RL Defense Lab.",
    technology: [
      "Python",
      "FastAPI",
      "Pydantic",
      "SQLite",
      "NetworkX",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
    ],
    repository: "https://github.com/adamissac/omen-ai",
    writeup: [],
    sourceNote:
      "Alan supplied the event, 36-hour duration, and lead roles. The public README and architecture documentation were checked on October 12, 2026. This project lives in its own Omen AI repository.",
    role: "I was Security and Agents lead and Application lead, responsible for backend security workflows, the agent system, the lab app, and the main frontend. I built it with one teammate, who owned the separate RL Defense Lab.",
    problem:
      "A suspected vulnerability is not proof, and a proposed patch is not a verified fix. The prototype makes those distinctions visible through an evidence-backed workflow.",
    approach: [
      "A deterministic orchestrator dispatches seven specialist Red, Blue, and independent verification roles. Tool allowlists bound each role's authority.",
      "Red roles investigate and validate suspected weaknesses against Atlas Bank, the team's owned fictional lab app with synthetic customers. Blue roles diagnose and propose candidate fixes in disposable worktrees.",
      "The independent verifier reruns a trusted test suite. Models may suggest decisions or patches, but trusted tests determine pass or fail. The main frontend keeps hypotheses, lab evidence, and simulator results separate.",
    ],
    lessons: [
      "Separating patch authority from verification authority keeps proposed fixes distinct from evidence. A trusted test suite, rather than an agent's assertion, determines the outcome.",
      "A simulated defensive policy and a real isolated-lab workflow have different evidence boundaries and need distinct labels.",
    ],
    limitations: [
      "This is an on-demand proof of concept against the owned Atlas Bank lab. It does not continuously monitor real companies or automatically respond in production.",
      "The separate Double DQN Defense Lab is simulated and was built by my teammate. I do not claim that RL work as my contribution.",
    ],
    diagram: {
      title: "Independent evidence at each boundary",
      description:
        "The Next.js frontend calls FastAPI and its deterministic orchestrator. Red roles test the owned lab, Blue roles propose worktree fixes, and an independent auditor retests with trusted criteria.",
      nodes: [
        {
          title: "Main frontend",
          detail: "Next.js + TypeScript",
        },
        {
          title: "API and orchestrator",
          detail: "FastAPI + bounded role tools",
        },
        {
          title: "Red validation",
          detail: "Authorized tests on the owned lab",
        },
        {
          title: "Blue remediation",
          detail: "Candidate fixes in disposable worktrees",
        },
        {
          title: "Independent verification",
          detail: "Trusted retests and evidence",
        },
      ],
      note: "Derived from README and architecture/agent-system.md. The teammate's simulated RL Defense Lab is a separate engine, not part of this workflow.",
    },
    sources: [
      {
        label: "Project README",
        href: "https://github.com/adamissac/omen-ai#readme",
      },
      {
        label: "Agent system",
        href: "https://github.com/adamissac/omen-ai/blob/main/docs/architecture/agent-system.md",
      },
      {
        label: "Architecture overview",
        href: "https://github.com/adamissac/omen-ai/blob/main/docs/architecture/overview.md",
      },
    ],
    devpost: "",
    interactive: "none",
  },
];
