export type ThreadStatus = "Reading" | "Looking for gaps" | "Sketching";

export interface Reading {
  title: string;
  authors: string;
  year: number;
  url: string;
  note: string;
}

export interface Thread {
  id: string;
  title: string;
  question: string;
  whyItMatters: string;
  status: ThreadStatus;
  updated: string;
  directions?: string[];
  readings: Reading[];
}

export const exploringIntro = "What I'm reading and working through right now.";

export const exploringLabels = {
  updated: "Updated",
  directions: "Directions",
  reading: "Reading",
};

export const staleAfterDays = 120;

export const threads: Thread[] = [
  {
    id: "world-action-models",
    title: "World action models",
    question:
      "Where do recent world action model papers leave gaps, both in how the architecture could perform better and in how it could be simplified to cost less compute?",
    whyItMatters:
      "I want to find out whether a model that predicts how a scene responds to actions can help a robot plan or train a policy at a cost real hardware can run.",
    status: "Looking for gaps",
    updated: "2026-11-11",
    directions: ["Boost performance", "Cut computational cost"],
    readings: [],
  },
  {
    id: "agentic-orchestration",
    title: "Agentic orchestration over learned policies",
    question:
      "How should a higher-level agent coordinate learned low-level controllers, and how should it decide when to call one?",
    whyItMatters:
      "It is the question under most of my projects: when a robot has a fast learned controller and a slower planner or VLA model, which one should make which call?",
    status: "Reading",
    updated: "2026-11-11",
    readings: [],
  },
];

const day = 24 * 60 * 60 * 1000;
const isoDate = /^\d{4}-\d{2}-\d{2}$/;

export function staleThreadErrors(
  entries: Thread[],
  today: Date = new Date(),
): string[] {
  const todayUtc = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  return entries.flatMap((thread) => {
    const where = `Thread "${thread.id}" in src/data/exploring.ts`;
    const fix = `Review the thread, then set its updated field to today's date (YYYY-MM-DD).`;
    const updated = isoDate.test(thread.updated ?? "")
      ? Date.parse(`${thread.updated}T00:00:00Z`)
      : Number.NaN;
    if (Number.isNaN(updated))
      return [`${where} has a missing or invalid updated date. ${fix}`];
    if (updated > todayUtc)
      return [
        `${where} has an updated date in the future (${thread.updated}). ${fix}`,
      ];
    const age = Math.round((todayUtc - updated) / day);
    if (age > staleAfterDays)
      return [
        `${where} was last updated ${thread.updated}, ${age} days ago, past the ${staleAfterDays} day limit. ${fix}`,
      ];
    return [];
  });
}

export function assertThreadsFresh(entries: Thread[] = threads): void {
  const errors = staleThreadErrors(entries);
  if (errors.length > 0)
    throw new Error(
      `Currently exploring date check failed.\n${errors.join("\n")}`,
    );
}
