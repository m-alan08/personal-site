export default {
  theme: {
    extend: {
      maxWidth: { reading: "68ch" },
      fontFamily: {
        display: [
          "ui-serif",
          '"Iowan Old Style"',
          '"Palatino Linotype"',
          "Palatino",
          "Georgia",
          "serif",
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
