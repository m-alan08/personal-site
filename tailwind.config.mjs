const sans = [
  '"Instrument Serif"',
  '"Instrument Serif Fallback"',
  "ui-serif",
  "Georgia",
  "serif",
];

const display = [
  '"Soria"',
  '"Instrument Serif"',
  '"Soria Fallback"',
  "ui-serif",
  "Georgia",
  "serif",
];

export default {
  theme: {
    extend: {
      maxWidth: { reading: "52ch" },
      fontFamily: {
        sans,
        display,
        mono: [
          '"Geist Mono Variable"',
          '"Geist Mono Fallback"',
          "ui-monospace",
          "monospace",
        ],
      },
      fontSize: {
        display: [
          "clamp(3.5rem, 2rem + 5vw, 5.75rem)",
          { lineHeight: "0.95", letterSpacing: "0", fontWeight: "400" },
        ],
        h1: [
          "clamp(2.75rem, 2.1rem + 2.2vw, 3.5rem)",
          { lineHeight: "1.05", letterSpacing: "0", fontWeight: "400" },
        ],
        h2: [
          "clamp(2rem, 1.6rem + 1.2vw, 2.625rem)",
          { lineHeight: "1.1", letterSpacing: "0", fontWeight: "400" },
        ],
        h3: [
          "1.5rem",
          { lineHeight: "1.25", letterSpacing: "0", fontWeight: "400" },
        ],
        body: ["var(--text-body)", { lineHeight: "1.65", fontWeight: "400" }],
        small: ["1rem", { lineHeight: "1.5" }],
        sm: ["1rem", { lineHeight: "1.5" }],
        label: [
          "0.875rem",
          {
            lineHeight: "1.125rem",
            letterSpacing: "0.01em",
            fontWeight: "400",
          },
        ],
        eyebrow: [
          "0.8125rem",
          {
            lineHeight: "1.125rem",
            letterSpacing: "0.08em",
            fontWeight: "400",
          },
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
        glow: "rgb(var(--glow) / <alpha-value>)",
        "chart-blue": "var(--chart-blue)",
        "chart-gold": "var(--chart-gold)",
        paper: "var(--paper)",
        "paper-ink": "var(--paper-ink)",
      },
    },
  },
};
