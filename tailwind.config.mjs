const sans = [
  '"Geist Variable"',
  '"Geist Fallback"',
  "ui-sans-serif",
  "system-ui",
  "sans-serif",
];

export default {
  theme: {
    extend: {
      maxWidth: { reading: "52ch" },
      fontFamily: {
        sans,
        display: sans,
        mono: [
          '"Geist Mono Variable"',
          '"Geist Mono Fallback"',
          "ui-monospace",
          "monospace",
        ],
      },
      fontSize: {
        display: [
          "clamp(3rem, 1.6rem + 4.4vw, 4.5rem)",
          { lineHeight: "1", letterSpacing: "-0.035em", fontWeight: "700" },
        ],
        h1: [
          "clamp(2.25rem, 1.8rem + 1.6vw, 2.75rem)",
          { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "700" },
        ],
        h2: [
          "clamp(1.5rem, 1.3rem + 0.8vw, 1.875rem)",
          { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" },
        ],
        h3: [
          "1.25rem",
          { lineHeight: "1.35", letterSpacing: "-0.015em", fontWeight: "600" },
        ],
        body: ["var(--text-body)", { lineHeight: "1.65", fontWeight: "400" }],
        small: ["0.875rem", { lineHeight: "1.55" }],
        label: [
          "0.75rem",
          { lineHeight: "1rem", letterSpacing: "0.01em", fontWeight: "500" },
        ],
        eyebrow: [
          "0.75rem",
          { lineHeight: "1rem", letterSpacing: "0.08em", fontWeight: "500" },
        ],
      },
      spacing: {
        "section-compact": "clamp(2.5rem, 2rem + 2vw, 3.5rem)",
        "section-normal": "clamp(3.5rem, 3rem + 1.5vw, 4rem)",
        "section-spacious": "clamp(4.5rem, 3rem + 5vw, 7rem)",
      },
      colors: {
        canvas: "var(--canvas)",
        chrome: "var(--chrome)",
        surface: "var(--surface)",
        raised: "var(--raised)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
        hairline: "var(--hairline)",
        control: "var(--control)",
        accent: "var(--accent)",
        "chart-blue": "var(--chart-blue)",
        "chart-gold": "var(--chart-gold)",
        paper: "var(--paper)",
        "paper-ink": "var(--paper-ink)",
      },
    },
  },
};
