export const playgroundCopy = {
  label: "Live policy",
  title: "Give it somewhere to reach",
  intro:
    "This arm is driven by the SAC + HER policy from quantrl-fetch, running in your browser. Click or drag to place the red target. Every step, the network reads the arm's position, velocity and the target, then outputs the next move.",
  stageLabel:
    "Robot arm playground. Click or drag to place the target. With the keyboard, use the arrow keys to move the target and the robot reaches for it.",
  noScript: "The policy needs JavaScript to run.",
  hint: "give me somewhere to reach",
  status: {
    loading: "loading the policy...",
    reaching: "reaching...",
    following: "following...",
    reached: "got it!",
    missed: "not quite, try again?",
    table: "that's inside the table",
    far: "too far for me",
    error: "the policy did not load",
  },
  metrics: {
    distance: "Distance",
    steps: "Reached in",
    latency: "Decision time",
    running: "Running",
  },
  explore: "Explore the controller",
  controllerLegend: "Controller",
  controllers: {
    policy: "Learned policy (SAC + HER)",
    proportional: "Proportional controller (scripted)",
  },
  precisionLegend: "Policy precision",
  depthLabel: "Target depth",
  depthNote:
    "The side view hides depth, so the target's sideways offset lives here.",
  benchmark: "Run the 100 evaluation targets",
  benchmarkHeaders: ["Run", "Success", "Mean final distance"],
  benchmarkRows: {
    browser: "In this tab",
    surrogate: "Same model, Python",
    mujoco: "MuJoCo, offline",
  },
  proportionalNote:
    "The proportional controller is a hand-written rule, not learned: it pushes straight toward the target. It runs on the same arm model so you can compare.",
  realTitle: "What is real",
  real: "The weights, observation normalization, action scaling and quantization come from a trained PyTorch checkpoint, and every move is one forward pass in this tab. A Node test checks the browser network against PyTorch outputs.",
  simplifiedTitle: "What is simplified",
  simplified:
    "MuJoCo does not run here. The arm moves under a small linear model fitted to MuJoCo FetchReach rollouts, and the drawing is a stylized side view of the Fetch arm. The checkpoint was retrained from the repository's FetchReach config for this page, so its numbers differ slightly from the README.",
  quantNote:
    "Quantized variants are fake quantized like the repository's PTQ and QAT: weights and activations snap to an integer grid, but the math stays in float32. Latency here says nothing about integer hardware.",
  sourceLabel: "Training code on GitHub",
  source: "https://github.com/m-alan08/quantrl-fetch",
  replay: "Replay from the start",
  stepLabel: "Step",
  notYet: "not yet",
};
