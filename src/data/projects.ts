import type { ImageMetadata } from "astro";
import quantrlFetchImage from "../assets/projects/quantrl-fetch.png";
import quantrlFetchResults from "../assets/projects/quantrl-fetch-results.png";
import ariAiConsole from "../assets/projects/ari-ai-console.png";
import ariAiDefenseLab from "../assets/projects/ari-ai-defense-lab.png";
import constellationImage from "../assets/projects/constellation.png";
import constellationPoster from "../assets/projects/constellation-poster.png";
import armlabFront from "../assets/projects/armlab-front.jpg";
import armlabWrist from "../assets/projects/armlab-wrist.jpg";
import ariAiCard from "../assets/projects/ari-ai-console-card.webp";

export interface ProjectImage {
  src: ImageMetadata;
  alt: string;
  fit: "contain" | "cover";
}
export interface ProjectCardImage {
  src: ImageMetadata;
  alt: string;
  caption: string;
  frame?: "screen" | "phone";
}
export interface ProjectChartSeries {
  label: string;
  values: number[];
  style: "solid" | "dashed" | "dotted";
  tone: "accent" | "blue" | "gold";
}
export interface ProjectCardChart {
  alt: string;
  caption: string;
  xLabel: string;
  yLabel: string;
  ticks: string[];
  yTicks: number[];
  highlight: { tick: string; label: string; series: string };
  series: ProjectChartSeries[];
}
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
  headline?: string;
  question: string;
  ownership: "Solo project" | "Team project";
  status: string;
  scope: string;
  technology: string[];
  repository: string;
  writeup: string[];
  links?: ProjectLink[];
  contribution?: string;
  featured?: boolean;
  order?: number;
  tier?: "in-progress";
  image?: ProjectImage;
  gallery?: ProjectImage[];
  cardImage?: ProjectCardImage;
  cardChart?: ProjectCardChart;
}

export const projects: Project[] = [
  {
    category: "Research",
    event: null,
    role: "I built it alone: SAC, HER, fake quantization and the evaluation scripts, all from scratch in PyTorch.",
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
      "Next, phase 5: distill the fp32 policy into a quantized behavior cloning student, then test whether online RL post-training recovers low-bit performance.",
    ],
    diagram: {
      title: "Actor precision pipeline",
      description:
        "Simulation pipeline for comparing quantization methods on Fetch tasks. Post-training recovery is the next stage.",
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
      note: "The last stage is next on the roadmap. Everything here runs in simulation.",
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
    cardChart: {
      alt: "FetchReach results chart: success rate against actor bit width for PTQ, QAT fine-tuning, and QAT from scratch, mean of 3 training seeds. All three stay near 100% down to 5 bits. At 4 bits QAT fine-tuning holds 100%, QAT from scratch reaches 96%, and PTQ drops to 82%. At 3 bits all three fall to between 32% and 50%, and at 2 bits all reach 0%.",
      caption: "FetchReach success rate by actor bit width, mean of 3 seeds",
      xLabel: "Actor bit width",
      yLabel: "Success rate",
      ticks: ["fp32", "8", "6", "5", "4", "3", "2"],
      yTicks: [0, 0.25, 0.5, 0.75, 1],
      highlight: { tick: "4", label: "4-bit", series: "QAT fine-tune" },
      series: [
        {
          label: "PTQ",
          values: [1, 1, 1, 0.977, 0.82, 0.43, 0],
          style: "dashed",
          tone: "blue",
        },
        {
          label: "QAT fine-tune",
          values: [1, 1, 1, 1, 1, 0.503, 0.003],
          style: "solid",
          tone: "accent",
        },
        {
          label: "QAT from scratch",
          values: [1, 1, 1, 1, 0.96, 0.323, 0.007],
          style: "dotted",
          tone: "gold",
        },
      ],
    },
    image: {
      src: quantrlFetchImage,
      alt: "FetchReach simulation of the robot arm, comparing a 4-bit post-training quantized policy with a 4-bit quantization-aware fine-tuned policy",
      fit: "contain",
    },
    gallery: [
      {
        src: quantrlFetchResults,
        alt: "FetchReach results plot: success rate and final distance against bit width for PTQ, QAT fine-tuning, and QAT from scratch, averaged over 3 training seeds",
        fit: "contain",
      },
    ],
    title: "Quantization-aware RL for robotic arm control",
    summary:
      "How few bits does a robot arm policy need? Quantization-aware fine-tuning brings a 4-bit actor back to full FetchReach success; 3 bits breaks every method.",
    headline:
      "On FetchReach, 4-bit QAT fine-tuning recovers 100% success, where PTQ alone reaches 82.0%.",
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
      "Robot policies on embedded hardware have tight memory and latency budgets, and quantization is one of the simplest ways to fit them. I wanted to know where it starts to break a closed-loop controller, so I ran the sweep on a simulated Fetch arm in MuJoCo.",
      "The results above show the answer depends on the task: FetchReach tolerates much lower precision than FetchPush, and the best method changes between them.",
      "Next I test whether a quantized student trained by behavior cloning can recover low-bit performance through online RL post-training. Quantization is simulated in fp32 arithmetic, so the results describe policy accuracy, not hardware speed or energy.",
    ],
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
      "Everything: algorithms, quantization, experiments and analysis.",
    featured: true,
    order: 1,
  },
  {
    slug: "ari-ai",
    cardImage: {
      src: ariAiCard,
      alt: "Ari AI landing page headline, Find the flaw. Prove the fix., above an illustrated pipeline strip labeled not a recorded run",
      caption: "Ari AI landing page; the pipeline strip is an illustration",
    },
    image: {
      src: ariAiConsole,
      alt: "Ari AI landing page with the headline Find the flaw. Prove the fix. above its seven-stage pipeline from understand to monitor",
      fit: "cover",
    },
    gallery: [
      {
        src: ariAiDefenseLab,
        alt: "Ari AI Defense Lab network view replaying a recorded run, with the defender slowing traffic to the API server",
        fit: "contain",
      },
    ],
    title: "Ari AI",
    category: "Hackathon",
    event: null,
    summary:
      "Can an agent prove a fix works? Ari AI reproduces the exploit in a sandbox, proposes a patch, and reruns it before a developer decides.",
    question: "Can an agent show that a fix actually works?",
    ownership: "Team project",
    status: "In development",
    scope: "Team project. I'm the CTO.",
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
      "Ari AI started at HackATL and kept going afterward. It treats a suspected vulnerability as a hypothesis: agents investigate the code, try to reproduce the exploit inside an isolated sandbox, propose a patch, and rerun the reproduction to check that the patch closes it. A developer reviews the evidence and decides whether to accept the fix.",
      "Security tooling that only flags issues leaves the hard work to developers, and a model's claim that a patch works is not evidence. Ari keeps reproduction, patching, and verification as separate steps, and testing is limited to authorized scope.",
      "I designed a Double DQN defense policy for the simulated 10-node network defense lab. In the public held-out evaluation (5 seeds, 100 episodes each, held-out scenario configs), the current policy lowers the share of episodes with a compromise from 83.0% for tuned threshold rules to 7.1%, at the cost of a 75% false disruption rate.",
    ],
    role: "I'm the CTO. I designed the Double DQN defense policy in the simulated defense lab and work on the multi-agent security pipeline. I build Ari AI with Adam Issac and other teammates.",
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
      note: "A simplified view of the intended workflow in the project README.",
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
    contribution: "CTO: defense policy and security pipeline.",
    featured: true,
    order: 2,
  },
  {
    category: "Robotics",
    event: null,
    role: "I built the success-guided sampling (SGS) teacher pipeline used for RL post-training and helped assemble and set up the SO-101 arm.",
    problem:
      "A fine-tuned vision-language-action policy can still fail on parts of a task. RL post-training can help, but only if training spends its effort on the states where the policy fails.",
    approach: [
      "Success-guided sampling: record per-state success and reset training episodes toward the states where the policy struggles, from rest, reaching, stable grasp, and near-goal reset families.",
      "Train a privileged-observation teacher with PPO in JAX on a randomized pick-and-place scene, using MJX and MuJoCo Warp for batched GPU simulation with CPU parity tests.",
      "Planned: distill the teacher into the fine-tuned SmolVLA policy with DAgger, then evaluate on the SO-101 arm.",
    ],
    lessons: [
      "Comparisons between SGS and uniform resets need held-out evaluation across seeds with confidence intervals, not single runs.",
    ],
    limitations: [
      "My post-training work runs in simulation so far. Distillation into SmolVLA and evaluation on the real arm come next. The vision policy and FPGA work belong to my teammates.",
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
      note: "The last two stages are planned.",
    },
    sources: [],
    devpost: "",
    interactive: "none",
    slug: "armlab",
    image: {
      src: armlabFront,
      alt: "Overhead calibration frame from the team's SO-101 robot arm setup: the arm at the top of a white table, with a medicine bottle in the center and a paper plate on the left",
      fit: "contain",
    },
    gallery: [
      {
        src: armlabWrist,
        alt: "Calibration frame from the SO-101 wrist camera, looking past the open gripper jaws at the white table",
        fit: "contain",
      },
    ],
    title: "Robot arm vision policy: RL post-training",
    summary:
      "Where should RL post-training spend its effort? I built the success-guided sampling and PPO teacher pipeline for a team SmolVLA pick-and-place policy, in simulation.",
    question: "Where should post-training spend its effort?",
    ownership: "Team project",
    status: "Teacher pipeline built; distillation next",
    scope:
      "I own the SGS sampler, PPO teacher, simulation environments and evaluation, and helped set up the SO-101 arm.",
    technology: ["Python", "JAX", "MuJoCo", "MJX", "MuJoCo Warp", "SmolVLA"],
    repository: "",
    writeup: [
      "On this team robot arm project, I own the RL post-training pipeline for a fine-tuned SmolVLA pick-and-place policy.",
      "I implemented success-guided sampling in NumPy and JAX, reset families for a randomized pick-and-place scene, a privileged-observation teacher trained with PPO in JAX, batched MJX and MuJoCo Warp environments with CPU parity tests, and held-out evaluation comparing SGS with uniform resets across seeds.",
      "I also helped assemble and set up the SO-101 arm. Next is distilling the teacher into SmolVLA with DAgger and evaluating on the arm.",
    ],
    contribution:
      "SGS sampler, PPO teacher, simulation environments and evaluation.",
    featured: true,
    order: 3,
    tier: "in-progress",
  },
  {
    category: "Research",
    event: null,
    role: "I designed the study and am setting it up on my own.",
    problem:
      "Pretrained VLA policies are often fine-tuned with little data. It is not clear how much pretraining helps or which parts of the model should stay frozen.",
    approach: [
      "Fine-tune SmolVLA, pi0, and ACT on LIBERO with varying amounts of demonstration data.",
      "Compare pretrained and from-scratch starts and different freezing choices.",
    ],
    lessons: [],
    limitations: [
      "The experiments have not started, so there are no results yet.",
    ],
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
      "How much does pretraining help a VLA policy fine-tuned on little data? A planned study of SmolVLA, pi0 and ACT on LIBERO.",
    question: "How much does VLA pretraining help with little data?",
    ownership: "Solo project",
    status: "Environment setup; experiments next",
    scope: "Environment setup in progress; experiments come next.",
    technology: ["Python", "PyTorch", "LIBERO", "SmolVLA", "pi0", "ACT"],
    repository: "https://github.com/m-alan08/vla-finetuning-scaling",
    writeup: [
      "I want to know how success scales with the number of demonstrations when a pretrained VLA is fine-tuned, and which parts of the model should stay trainable. SmolVLA and pi0 start pretrained; ACT trains from scratch as the no-pretraining baseline.",
    ],
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
    cardImage: {
      src: constellationImage,
      alt: "Constellation app home screen for HackGT 13: Meet people here, with a Bluetooth scan for nearby matches, a toggle to let people find you, and a suggested introduction",
      caption: "Constellation app home screen, nearby discovery",
      frame: "phone",
    },
    image: {
      src: constellationPoster,
      alt: "Constellation title card: Real conversations. Real connections. Built at HackGT 13.",
      fit: "cover",
    },
    gallery: [
      {
        src: constellationImage,
        alt: "Constellation app home screen with nearby discovery settings and a suggested introduction",
        fit: "contain",
      },
    ],
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
      "Can a match become a real conversation? Constellation ranks relevant people at an event and connects them only after a verified in-person conversation.",
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
    role: "I owned the ML and algorithms layer: pairwise matching, ranking models and match explanations. Adam, Arjun and Akshar built the project with me.",
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
      "The real-data training path exists in the code but has not been run, so the AUC numbers above come from simulated outcomes.",
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
      note: "Ranking only suggests people. The in-person check is what confirms a conversation happened.",
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
    contribution: "Matching, ranking models and match explanations.",
    order: 4,
  },
];

export const orderedProjects = [...projects].sort(
  (a, b) => (a.order ?? Infinity) - (b.order ?? Infinity),
);
