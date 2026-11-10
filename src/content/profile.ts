export interface ResearchInterest {
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
  href?: string;
}

export const profile = {
  name: "Alan Mozhoor",
  portraitAlt: "Headshot of Alan Mozhoor in a navy suit and tie",
  headline:
    "I study mathematics and computer science at Georgia Tech and work on reinforcement learning for robot control.",
  intro: [
    "I'm interested in robot systems where a learned low-level controller and a higher-level reasoning or planning layer work together, and in what it takes for those policies to run within real latency and compute budgets.",
  ],
  about: [
    "Most of my independent work is reinforcement learning for manipulation. In quantrl-fetch I implemented Soft Actor-Critic and Hindsight Experience Replay from scratch in PyTorch and measured how far a simulated Fetch arm's actor network can be quantized before control breaks down. On FetchReach, quantization-aware fine-tuning brings a 4-bit actor back to 100% success. On FetchPush, a 5-bit actor trained with quantization from the start reaches 96.3%, and lower precision degrades sharply.",
    "I also work on team projects. On a robot arm project I built the success-guided sampling teacher pipeline for RL post-training of a SmolVLA policy in simulation and helped set up the SO-101 arm. I'm CTO of Ari AI, a system that investigates vulnerabilities, reproduces exploits in a sandbox, and verifies proposed patches before a developer reviews them. I also co-founded Ascent Math, a math tutoring business.",
    "The question I keep returning to is how a hierarchical robot system should divide its work: what a fast learned controller handles, what a slower planner or vision-language-action model handles, and how inference cost, latency, and architectural complexity constrain that split. I write about what I'm learning in a public series on X.",
  ],
  education: {
    school: "Georgia Institute of Technology",
    field: "Mathematics and Computer Science",
    graduation: "Expected May 2029",
  },
};

export const researchNote =
  "These are directions I'm exploring through independent projects, reading, and public notes. They are not formal research appointments or published results.";

export const researchInterests: ResearchInterest[] = [
  {
    title: "Reinforcement learning for robotics",
    summary:
      "Off-policy, goal-conditioned methods such as SAC with HER for manipulation, evaluated across seeds with controls that separate the effect of a method from the effect of extra training.",
  },
  {
    title: "Agentic control and hierarchical robotics",
    summary:
      "Pairing learned low-level control with higher-level reasoning and planning, and deciding which layer owns which decision.",
  },
  {
    title: "Vision-language-action models",
    summary:
      "How pretrained VLA policies such as SmolVLA and pi0 adapt to new tasks from a small number of demonstrations, and which parts of the model to fine-tune or freeze.",
  },
  {
    title: "World models and world-action models",
    summary:
      "Models that predict how a scene responds to actions, and whether that prediction is useful for planning or as a training signal for a policy.",
  },
  {
    title: "Reinforcement learning post-training",
    summary:
      "Online RL after imitation learning, for example to recover performance lost to quantization or to improve a fine-tuned VLA policy on a specific task.",
  },
  {
    title: "Efficient machine learning systems",
    summary:
      "Quantization, smaller architectures, and inference cost, judged by their effect on closed-loop behavior rather than only on offline accuracy.",
  },
  {
    title: "Hardware-aware policy deployment",
    summary:
      "Running robot policies within the memory, latency, and precision limits of embedded hardware such as microcontrollers and FPGAs.",
  },
];

export const writing: { intro: string; links: WritingLink[] } = {
  intro:
    "I document what I'm learning in public. My ongoing X series works through reinforcement learning for robotics: RL algorithms, robot learning, vision-language-action models, world models and world-action models, agentic control, and readings of research papers.",
  links: [
    {
      title: "Learning RL for robotics, on X",
      href: "https://x.com/alanmozhoor",
      note: "The ongoing post series on my X profile.",
    },
    {
      title: "quantrl-fetch results and method",
      href: "https://github.com/m-alan08/quantrl-fetch#key-results",
      note: "Results tables, method, reproduction steps, and limitations for my quantization-aware RL experiments.",
    },
  ],
};

export const experience: Experience[] = [
  {
    role: "Co-founder and head of engineering",
    organization: "Ascent Math",
    period: "May 2026 to present",
    summary:
      "A math tutoring business I co-founded. I built its operations software for scheduling, customer records, lead intake, and automated follow-ups. It automates 85% of administrative work with 95% session fulfillment across 150+ sessions, and the lead pipeline has handled 400+ inquiries at 35% conversion while the platform grew 3x month over month to 100+ students.",
    href: "https://www.joinascentmath.com",
  },
  {
    role: "CTO",
    organization: "Ari AI",
    period: "October 2026 to present",
    summary:
      "An AI security engineering project that started at HackATL and kept going. I lead the technical work, including the multi-agent security pipeline and the simulated RL defense lab. Ari AI was submitted to Y Combinator.",
    href: "https://ari-ai-lake.vercel.app",
  },
  {
    role: "Automation developer",
    organization: "The Pert Group LLC",
    period: "November 2025 to August 2026",
    summary:
      "Built an AI voice agent with Python, Twilio, the OpenAI API, and Make that handles 150+ interactions a month, automates 85% of inquiries, order intake, and follow-ups, and cut handling time by 65%. Its pipeline connects 6+ REST APIs and webhooks and turns LLM output into structured order data with 82.3% accuracy. With validation, retries, and logging, it completes 83.7% of tasks without a person and saves 25+ hours a month.",
  },
  {
    role: "Applied mathematics and machine learning research",
    organization: "Georgia Southern University",
    period: "June 2025 to July 2025",
    summary:
      "Trained a TensorFlow CNN to tell tinea from circular eczema in skin images, reaching about 96% validation accuracy, and presented the work in a university-hosted research program.",
  },
  {
    role: "Hackathon participant",
    organization: "HackGT 13 and HackATL",
    period: "2026",
    summary:
      "Built Constellation at HackGT 13, where I owned matching and ranking, and started Ari AI at HackATL.",
  },
];

export const uniqueFeature = null;
