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
      maxWidth: { reading: "68ch" },
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
      colors: {
        canvas: "var(--canvas)",
        chrome: "var(--chrome)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
        control: "var(--control)",
        accent: "var(--accent)",
      },
    },
  },
};
