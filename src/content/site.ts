export const site = {
  name: "Alan Mozhoor",
  title: "Alan Mozhoor | Reinforcement learning and AI/ML",
  description:
    "Alan Mozhoor's reinforcement learning and robotics projects, with simulation work, project notes, and source code.",
  introduction: "Reinforcement learning and AI/ML at Georgia Tech.",
  bio: [
    "I'm a Georgia Tech student focused on AI/ML, reinforcement learning, and research.",
    "My work includes quantization-aware RL in simulation and RL post-training ideas and implementation for a team robot arm project.",
  ],
  footer: "Reinforcement learning, robotics, and research.",
  skip: "Skip to content",
  focusHeading: "What I'm working on",
  focus: ["Policy precision in simulation", "RL post-training for robot arms"],
  selectedProjects: "Selected projects",
  allProjects: "All projects",
};

export const navigation = [
  { label: "Projects", path: "projects/" },
  { label: "About", path: "about/" },
  { label: "Contact", path: "contact/" },
  { label: "Resume", path: "resume/" },
];

export const labels = {
  mainNavigation: "Main",
  github: "GitHub",
  x: "X",
  email: "Email me",
  resume: "Resume",
  repository: "View repository",
  repositoryMissing: "Repository link is not available yet.",
  technology: "Tools and methods",
  technologyMissing: "A verified technology list is not available yet.",
  projectNotes: "Project notes",
  contribution: "My contribution",
  backToProjects: "Back to projects",
  source: "Source and scope",
  readme: "Project README",
  readNotes: "Read project notes",
};

export const pages = {
  projects: {
    title: "Projects",
    description:
      "Research, robotics, and hackathon work. Each project names my contribution and the limits of its evidence.",
    meta: "Explore Alan Mozhoor's RL, robotics, Constellation and ZeroDay Arena case studies, with clear team roles and evidence boundaries.",
  },
  about: {
    title: "About",
    description:
      "I'm Alan, a Georgia Tech student working on reinforcement learning and AI/ML.",
    meta: "About Alan Mozhoor, a Georgia Tech student focused on AI/ML, reinforcement learning, and research.",
    workHeading: "My work",
    work: "In my solo project, I study how low-bit precision affects a policy for a simulated Fetch robot arm. In the team robot arm project, my contribution is RL post-training policy ideas and implementation.",
    workLink: "Explore the projects",
  },
  contact: {
    title: "Contact",
    description: "Find my work and source code on GitHub.",
    meta: "Contact information and GitHub profile for Alan Mozhoor, a Georgia Tech student working on reinforcement learning.",
    missingEmail: "My email address is not listed here yet.",
    githubText: "Browse my projects on GitHub.",
  },
  resume: {
    title: "Resume",
    description: "A copy of my resume, when available.",
    meta: "Resume availability and project links for Alan Mozhoor.",
    download: "Download resume (PDF)",
    missing: "My resume is not available here yet.",
    fallback:
      "You can read about my projects and find their source code while the PDF is unavailable.",
    projectLink: "View my projects",
  },
  notFound: {
    title: "Page not found",
    description:
      "This page isn't here. You can return home or browse my projects.",
    meta: "The requested page was not found on Alan Mozhoor's portfolio.",
    home: "Return home",
  },
};

export const palette = {
  trigger: "Find a page",
  shortcut: "Ctrl or Command K",
  title: "Find a page",
  search: "Search pages and projects",
  close: "Close",
  empty: "No matching pages.",
  home: "Home",
};

export const caseStudy = {
  problem: "The problem",
  role: "My role and contributions",
  approach: "The approach",
  stack: "Stack",
  lessons: "What I learned",
  limitations: "Limitations and status",
  status: "Project status",
  read: "Read case study",
  devpost: "Devpost",
  hackathons: "Hackathons",
  hackathonIntro:
    "Two team projects built in 36 hours each, with distinct roles and evidence boundaries.",
  research: "Research and robotics",
  all: "All projects",
  filter: "Filter projects",
  results: "{count} projects shown",
};
