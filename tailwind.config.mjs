export default {
  theme: {
    extend: {
      maxWidth: { reading: "68ch" },
      fontFamily: {
        display: [
          '"IBM Plex Sans Variable"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
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
