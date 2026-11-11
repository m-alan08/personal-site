export interface ResearchInterest {
  label?: string;
  title: string;
  summary: string;
}

export interface WritingLink {
  title: string;
  href: string;
  note: string;
}

export interface Experience {
  role: string;
  organization: string;
  period: string;
  summary: string;
  metrics?: string[];
  href?: string;
}

export const profile = {
  name: "Alan Mozhoor",
  portraitAlt: "Headshot of Alan Mozhoor in a navy suit and tie",
  tagline: "Georgia Tech · RL for robotics",
  headline:
    "I train reinforcement learning policies for robotics and measure how few bits they need before they stop working.",
  intro: [
    "I study math and computer science at Georgia Tech. The question under most of my projects: when a robot has a fast learned controller and a slower planner or VLA model, which one should make which call?",
  ],
  availability:
    "Open to research collaborations and robotics machine learning roles.",
  currentLabel: "What I'm working on",
  current: [
    {
      label: "Research",
      text: "quantrl-fetch, my study of how few bits a robot arm policy needs. Quantization sweeps are done; post-training is next.",
    },
    {
      label: "Startup",
      text: "Ari AI, where I'm CTO. It reproduces exploits in a sandbox and checks patches before a developer looks at them.",
    },
    {
      label: "Team",
      text: "The RL post-training teacher pipeline for a SmolVLA robot arm policy.",
    },
    {
      label: "Teaching",
      text: "Ascent Math, a math tutoring business I co-founded.",
    },
  ],
  about: [
    "Most of my solo work is reinforcement learning for manipulation. For quantrl-fetch I wrote Soft Actor-Critic and Hindsight Experience Replay from scratch in PyTorch, then cut the actor's precision bit by bit to find where a simulated Fetch arm stops finishing its task.",
    "On a team robot arm project, I built the success-guided sampling teacher for RL post-training of a SmolVLA policy and helped set up our SO-101 arm. At Ari AI I designed the defense policy for its simulated network defense lab.",
  ],
  education: {
    school: "Georgia Institute of Technology",
    shortName: "Georgia Tech",
    city: "Atlanta",
    field: "Mathematics and Computer Science",
    graduation: "Expected May 2029",
  },
};

export const researchNote =
  "Independent projects and public notes, not published research.";

export const researchInterests: ResearchInterest[] = [
  {
    label: "RL",
    title: "Reinforcement learning for robotics",
    summary:
      "Goal-conditioned off-policy methods such as SAC with HER for manipulation, plus online RL post-training after imitation learning to win back performance lost to quantization or limited fine-tuning.",
  },
  {
    label: "Agents",
    title: "Agentic control and hierarchical robotics",
    summary:
      "Pairing learned low-level control with higher-level reasoning and planning, and deciding which layer owns which decision.",
  },
  {
    label: "VLA",
    title: "Vision-language-action models",
    summary:
      "How pretrained VLA policies such as SmolVLA and pi0 adapt to new tasks from a few demonstrations, and which parts of the model to fine-tune or freeze.",
  },
  {
    label: "World models",
    title: "World models and world-action models",
    summary:
      "Models that predict how a scene responds to actions, and whether that prediction helps with planning or as a training signal for a policy.",
  },
  {
    label: "Efficiency",
    title: "Efficient, hardware-aware policies",
    summary:
      "Quantization, smaller architectures and inference cost, judged by closed-loop behavior within the memory, latency and precision limits of microcontrollers and FPGAs.",
  },
];

export const writing: { intro: string; links: WritingLink[] } = {
  intro:
    "I learn in public. My X series works through reinforcement learning for robotics: RL algorithms, robot learning, vision-language-action models, world models, agentic control and research papers.",
  links: [
    {
      title: "Learning RL for robotics, on X",
      href: "https://x.com/alanmozhoor",
      note: "The ongoing post series on my X profile.",
    },
    {
      title: "quantrl-fetch results and method",
      href: "https://github.com/m-alan08/quantrl-fetch#key-results",
      note: "Results tables, method, reproduction steps and limitations for my quantization-aware RL experiments.",
    },
  ],
};

export const experience: Experience[] = [
  {
    role: "Co-founder and head of engineering",
    organization: "Ascent Math",
    period: "May 2026 to present",
    summary:
      "I co-founded this math tutoring business and built its operations software for scheduling, customer records, lead intake and automated follow-ups.",
    metrics: [
      "Automates 85% of administrative work",
      "Platform grew 3x month over month to 100+ students",
    ],
    href: "https://www.joinascentmath.com",
  },
  {
    role: "CTO",
    organization: "Ari AI",
    period: "October 2026 to present",
    summary:
      "Ari AI started at HackATL and kept going, and was submitted to Y Combinator. I lead the technical work, including the multi-agent security pipeline and the simulated RL defense lab.",
    href: "https://ari-ai-lake.vercel.app",
  },
  {
    role: "Automation developer",
    organization: "The Pert Group LLC",
    period: "November 2025 to August 2026",
    summary:
      "I built an AI voice agent with Python, Twilio, the OpenAI API and Make that takes inquiries, order intake and follow-ups and turns LLM output into structured order data.",
    metrics: [
      "Handles 150+ interactions a month",
      "Completes 83.7% of tasks without a person",
      "Cut handling time by 65%",
    ],
  },
  {
    role: "Applied mathematics and machine learning research",
    organization: "Georgia Southern University",
    period: "June 2025 to July 2025",
    summary:
      "I trained a TensorFlow CNN to tell tinea from circular eczema in skin images and presented the work in a university-hosted research program.",
    metrics: ["About 96% validation accuracy"],
  },
];

export const uniqueFeature = null;
