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
export interface ProjectLink {
  label: string;
  href: string;
  kind: "repository" | "demo" | "writeup" | "source";
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
  links?: ProjectLink[];
  contribution?: string;
  featured?: boolean;
  order?: number;
}

export const projects: Project[] = [
  {
    category: "Research",
    event: null,
    role: "Solo project. I implemented SAC, HER, fake quantization, and the evaluation scripts from scratch in PyTorch.",
    problem:
      "Low-precision networks are cheaper to store and run, which matters for robot policies on embedded hardware. Whether a quantized actor still controls the arm well has to be measured in closed loop, not inferred from weight error.",
    approach: [
      "Train an fp32 SAC actor with HER on MuJoCo Fetch tasks. Keep the critics at fp32 and apply fake quantization to the actor only.",
      "Compare three paths at each bit width: post-training quantization (PTQ), quantization-aware fine-tuning from the fp32 policy (QAT fine-tune), and quantization-aware training from scratch (QAT scratch). Report success rate across seeds, with an fp32 continued-training control so gains are not just extra training.",
      "Repeat the sweep on FetchPush, a harder contact task where precision matters more.",
    ],
    lessons: [
      "FetchReach: fp32 reaches 100% success. At 4 bits, PTQ reaches 82.0%, QAT fine-tune 100%, and QAT scratch 96.0%. At 3 bits every method lands between 32.3% and 50.3%, and 2 bits fails.",
      "FetchPush: QAT scratch at 5 bits reaches 96.3%. Lower bit widths degrade sharply, so the usable precision depends on the task.",
      "Fake quantization models accuracy effects only. It says nothing yet about speed, memory traffic, or energy on real hardware.",
    ],
    limitations: [
      "Simulation only. Quantization is simulated in fp32 arithmetic, so no hardware latency or energy result is claimed.",
      "Phase 5 is planned, not done: distill the fp32 policy into a quantized behavior cloning student, then test whether online RL post-training recovers low-bit performance.",
    ],
    diagram: {
      title: "Actor precision pipeline",
      description:
        "Simulation pipeline for comparing quantization methods on Fetch tasks. Post-training recovery is the planned next stage.",
      nodes: [
        { title: "Fetch simulation", detail: "MuJoCo + Gymnasium Robotics" },
        { title: "SAC + HER", detail: "PyTorch training, fp32 critics" },
        {
          title: "Actor fake quantization",
          detail: "PTQ, QAT fine-tune, QAT scratch",
        },
        {
          title: "Closed-loop evaluation",
          detail: "Success rate across seeds",
        },
        {
          title: "RL post-training",
          detail: "Planned: BC student, online recovery",
        },
      ],
      note: "Derived from the quantrl-fetch README and roadmap. The last stage is planned, and no hardware deployment is shown.",
    },
    sources: [
      {
        label: "Key results",
        href: "https://github.com/m-alan08/quantrl-fetch#key-results",
      },
      {
        label: "Roadmap",
        href: "https://github.com/m-alan08/quantrl-fetch/blob/main/ROADMAP.md",
      },
    ],
    devpost: "",
    interactive: "none",
    slug: "quantrl-fetch",
    title: "Quantization-aware RL for robotic arm control",
    summary:
      "I measure how low an RL policy's actor precision can go before a simulated Fetch robot arm stops completing its task.",
    question: "How few bits does a robot arm policy need?",
    ownership: "Solo project",
    status: "Quantization sweeps done; post-training next",
    scope:
      "SAC, HER, and quantization implemented from scratch in PyTorch. Simulation only.",
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
      "This project asks how far a policy's actor network can be reduced in precision before its control behavior suffers. Robot policies that run on embedded hardware have tight memory and latency budgets, and quantization is one of the simplest ways to fit them. The experiments use a simulated Fetch arm in MuJoCo.",
      "I implemented Soft Actor-Critic with Hindsight Experience Replay, then compared post-training quantization, quantization-aware fine-tuning, and quantization-aware training from scratch at several bit widths. On FetchReach, 4-bit QAT fine-tuning recovers 100% success where PTQ alone reaches 82.0%. At 3 bits no method gets past about 50%. On FetchPush, 5-bit QAT from scratch reaches 96.3%.",
      "The next phase tests whether a quantized student trained by behavior cloning can recover low-bit performance through online RL post-training. Quantization here is simulated in fp32 arithmetic, so these results describe policy accuracy, not hardware speed or energy.",
    ],
    sourceNote:
      "Results from the repository README and roadmap, checked on November 10, 2026.",
    links: [
      {
        label: "Repository",
        href: "https://github.com/m-alan08/quantrl-fetch",
        kind: "repository",
      },
      {
        label: "Results and method",
        href: "https://github.com/m-alan08/quantrl-fetch#key-results",
        kind: "writeup",
      },
    ],
    contribution:
      "Everything: algorithms, quantization, experiments, and analysis.",
    featured: true,
    order: 1,
  },
  {
    slug: "ari-ai",
    title: "Ari AI",
    category: "Hackathon",
    event: null,
    summary:
      "An AI security engineering system that investigates suspected vulnerabilities, reproduces exploits in a sandbox, proposes patches, and verifies them before a developer reviews the fix.",
    question: "Can an agent show that a fix actually works?",
    ownership: "Team project",
    status: "In development; submitted to Y Combinator",
    scope:
      "Team project. I contribute to the backend, tests, and release integration.",
    technology: [
      "Python",
      "FastAPI",
      "PostgreSQL",
      "Docker",
      "Next.js",
      "TypeScript",
    ],
    repository: "https://github.com/adamissac/ari-ai",
    writeup: [
      "Ari AI started during a hackathon and kept going afterward. It treats a suspected vulnerability as a hypothesis: agents investigate the code, try to reproduce the exploit inside an isolated sandbox, propose a patch, and rerun the reproduction to check that the patch closes it. A developer reviews the evidence and decides whether to accept the fix.",
      "Security tooling that only flags issues leaves the hard work to developers, and a model's claim that a patch works is not evidence. Ari keeps reproduction, patching, and verification as separate steps, and testing is limited to authorized scope.",
      "Ari AI was submitted to Y Combinator. That is an application, not an acceptance, investment, or endorsement.",
    ],
    sourceNote:
      "Based on the public README and Alan's description, checked on November 10, 2026. Ari AI is a team project; this page describes only Alan's part.",
    role: "I contribute to the backend, tests, and release integration. Adam Issac and other teammates build the project with me.",
    problem:
      "Vulnerability scanners produce findings, not proof. Developers need to know whether an exploit is real and whether a proposed fix closes it before they merge anything.",
    approach: [
      "Investigate a suspected vulnerability against a repository commit within an approved scope.",
      "Reproduce the exploit in an isolated sandbox to confirm it is real.",
      "Propose a patch, then rerun the reproduction and tests against the patched code.",
      "Hand the evidence and the proposed fix to a developer, who reviews and decides.",
    ],
    lessons: [
      "Keeping reproduction, patching, and verification separate makes it clear what is evidence and what is a proposal.",
    ],
    limitations: [
      "Team project under active development. Testing is limited to authorized targets. The RL defense lab in the repository is a simulation.",
    ],
    diagram: {
      title: "From suspicion to a reviewed fix",
      description:
        "Each stage produces evidence for the next, and a developer makes the final decision.",
      nodes: [
        { title: "Investigate", detail: "Suspected vulnerability, scoped" },
        { title: "Reproduce", detail: "Exploit in an isolated sandbox" },
        { title: "Patch", detail: "Proposed fix" },
        { title: "Verify", detail: "Rerun reproduction and tests" },
        { title: "Developer review", detail: "Accept or reject the fix" },
      ],
      note: "Simplified from the public README. This is the intended workflow, not a production record.",
    },
    sources: [
      {
        label: "Project README",
        href: "https://github.com/adamissac/ari-ai#readme",
      },
    ],
    devpost: "",
    interactive: "none",
    links: [
      { label: "Demo", href: "https://ari-ai-lake.vercel.app", kind: "demo" },
      {
        label: "Repository",
        href: "https://github.com/adamissac/ari-ai",
        kind: "repository",
      },
    ],
    contribution: "Backend, tests, and release integration.",
    featured: true,
    order: 2,
  },
  {
    category: "Robotics",
    event: null,
    role: "I built the success-guided sampling (SGS) teacher pipeline used for RL post-training.",
    problem:
      "A fine-tuned vision-language-action policy can still fail on parts of a task. RL post-training can help, but only if training spends its effort on the states where the policy fails.",
    approach: [
      "Success-guided sampling: record per-state success and reset training episodes toward the states where the policy struggles, from rest, reaching, stable grasp, and near-goal reset families.",
      "Train a privileged-observation teacher with PPO in JAX on a randomized pick-and-place scene, using MJX and MuJoCo Warp for batched GPU simulation with CPU parity tests.",
      "Planned: distill the teacher into the fine-tuned SmolVLA policy with DAgger, then evaluate on an SO-101 arm.",
    ],
    lessons: [
      "Comparisons between SGS and uniform resets need held-out evaluation across seeds with confidence intervals, not single runs.",
    ],
    limitations: [
      "Team project. Simulation work so far; distillation into SmolVLA and real-arm evaluation are planned. Project-wide results are not claimed here.",
    ],
    diagram: {
      title: "SGS post-training plan",
      description:
        "The teacher is trained in simulation with success-guided resets, then distilled into the VLA policy.",
      nodes: [
        { title: "Pick-and-place sim", detail: "Randomized scene, MJX/Warp" },
        { title: "SGS resets", detail: "Sample where the policy fails" },
        { title: "PPO teacher", detail: "Privileged observations, JAX" },
        { title: "DAgger to SmolVLA", detail: "Planned" },
        { title: "SO-101 evaluation", detail: "Planned" },
      ],
      note: "Derived from Alan's commits and plan documents. The last two stages are planned.",
    },
    sources: [
      {
        label: "Repository README",
        href: "https://github.com/psamin/robotfpga#readme",
      },
    ],
    devpost: "",
    interactive: "none",
    slug: "armlab",
    title: "Robot arm RL post-training",
    summary:
      "On a team robot arm project, I built the success-guided sampling pipeline for RL post-training of a SmolVLA pick-and-place policy in simulation.",
    question: "Where should post-training spend its effort?",
    ownership: "Team project",
    status: "In progress: teacher pipeline built, distillation planned",
    scope:
      "My part is the SGS sampler, PPO teacher, simulation environments, and evaluation. The arm hardware and broader system belong to the team.",
    technology: ["Python", "JAX", "MuJoCo", "MJX", "MuJoCo Warp", "SmolVLA"],
    repository: "https://github.com/psamin/robotfpga",
    writeup: [
      "This is a team robot arm project. My part is the RL post-training pipeline for a fine-tuned SmolVLA pick-and-place policy.",
      "I implemented success-guided sampling in NumPy and JAX, reset families for a randomized pick-and-place scene, a privileged-observation teacher trained with PPO in JAX, batched MJX and MuJoCo Warp environments with CPU parity tests, and held-out evaluation comparing SGS with uniform resets across seeds.",
      "Distilling the teacher into SmolVLA with DAgger and evaluating on an SO-101 arm are planned. These notes do not claim ownership of the arm, the FPGA work, or the team's results.",
    ],
    sourceNote:
      "Based on Alan's commits and the plan documents in the team repository, checked on November 10, 2026.",
    links: [
      {
        label: "Team repository",
        href: "https://github.com/psamin/robotfpga",
        kind: "repository",
      },
    ],
    contribution:
      "SGS sampler, PPO teacher, simulation environments, and evaluation.",
    featured: true,
    order: 3,
  },
  {
    category: "Research",
    event: null,
    role: "Solo project. I designed the experiment plan.",
    problem:
      "Pretrained VLA policies are often fine-tuned with little data. It is not clear how much pretraining helps or which parts of the model should stay frozen.",
    approach: [
      "Fine-tune SmolVLA, pi0, and ACT on LIBERO with varying amounts of demonstration data.",
      "Compare pretrained and from-scratch starts and different freezing choices.",
    ],
    lessons: [],
    limitations: ["No experiments have been run yet. There are no results."],
    diagram: null,
    sources: [
      {
        label: "Repository README",
        href: "https://github.com/m-alan08/vla-finetuning-scaling#readme",
      },
    ],
    devpost: "",
    interactive: "none",
    slug: "vla-finetuning-scaling",
    title: "VLA fine-tuning scaling",
    summary:
      "A planned study of how pretraining and freezing affect fine-tuning of vision-language-action policies on LIBERO.",
    question: "How much does VLA pretraining help with little data?",
    ownership: "Solo project",
    status: "Planned: no experiments run yet",
    scope: "Experiment design only so far.",
    technology: ["Python", "PyTorch", "LIBERO", "SmolVLA", "pi0", "ACT"],
    repository: "https://github.com/m-alan08/vla-finetuning-scaling",
    writeup: [
      "This planned study asks how pretraining and freezing choices affect fine-tuning of vision-language-action policies with small amounts of data, using SmolVLA, pi0, and ACT on the LIBERO benchmark.",
      "No experiments have been run and there are no results yet.",
    ],
    sourceNote: "Based on the repository README, checked on November 10, 2026.",
    links: [
      {
        label: "Repository",
        href: "https://github.com/m-alan08/vla-finetuning-scaling",
        kind: "repository",
      },
    ],
    contribution: "Experiment design.",
    featured: false,
    order: 5,
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
    links: [
      {
        label: "Repository",
        href: "https://github.com/adamissac/constellation",
        kind: "repository",
      },
      {
        label: "Demo",
        href: "https://formal-connection-dashboard.vercel.app",
        kind: "demo",
      },
    ],
    contribution: "Matching, ranking models, and match explanations.",
    featured: false,
    order: 4,
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
      "Also called Omen AI. An autonomous cybersecurity prototype with Red and Blue agents, independent verification, and an owned, isolated lab app.",
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
    repository: "",
    writeup: [],
    sourceNote:
      "Alan supplied the event, 36-hour duration, and lead roles. The README and architecture documentation were checked on October 12, 2026. The source repository is private, so only the demo is linked.",
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
    sources: [],
    devpost: "",
    interactive: "none",
    links: [
      {
        label: "Demo",
        href: "https://omen-ai-security.vercel.app",
        kind: "demo",
      },
    ],
    contribution: "Security agents, backend workflows, lab app, and frontend.",
    featured: false,
    order: 6,
  },
];
