import { playgroundCopy as copy } from "../../content/playground";
import { playgroundVariants } from "../../data/playground";
import {
  armGeometry,
  clampToStage,
  fromScene,
  solveElbow,
  toScene,
  type Point,
} from "./arm";
import { buildActor, type Actor, type PolicyManifest } from "./policy";
import {
  distance,
  insideWorkspace,
  median,
  policyController,
  proportionalController,
  runEpisode,
  startObservation,
  step,
  type Controller,
  type Vector,
} from "./simulation";

type Phase = keyof typeof copy.status | "hint";
type ControllerKind = keyof typeof copy.controllers;

const stepMilliseconds = 40;
const keyStep = 20;
const celebrateMilliseconds = 900;

function pick<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing ${selector}`);
  return element;
}

function centimeters(meters: number): string {
  return `${(meters * 100).toFixed(1)} cm`;
}

function milliseconds(value: number): string {
  if (!Number.isFinite(value)) return copy.notYet;
  return value < 0.01 ? "<0.01 ms" : `${value.toFixed(2)} ms`;
}

function percent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export function mountPlayground(
  root: HTMLElement,
  pending: { clientX: number; clientY: number } | null,
): void {
  const stage = pick<HTMLElement>(root, "[data-playground-stage]");
  const svg = pick<SVGSVGElement>(root, "[data-playground-svg]");
  const bubble = pick<HTMLElement>(root, "[data-playground-bubble]");
  const status = pick<HTMLElement>(root, "[data-playground-status]");
  const target = pick<SVGGElement>(root, "[data-playground-target]");
  const handle = pick<SVGCircleElement>(root, "[data-playground-handle]");
  const hand = pick<SVGGElement>(root, "[data-playground-hand]");
  const eye = pick<SVGCircleElement>(root, "[data-playground-eye]");
  const trail = pick<SVGPolylineElement>(root, "[data-playground-trail]");
  const elbowJoint = pick<SVGCircleElement>(root, '[data-joint="elbow"]');
  const upperLinks = root.querySelectorAll<SVGLineElement>(
    '[data-link="upper"]',
  );
  const foreLinks = root.querySelectorAll<SVGLineElement>('[data-link="fore"]');
  const form = pick<HTMLFormElement>(root, "[data-playground-form]");
  const precision = pick<HTMLSelectElement>(
    root,
    "[data-playground-precision]",
  );
  const depthInput = pick<HTMLInputElement>(root, "#playground-depth");
  const depthOutput = pick<HTMLOutputElement>(root, "[data-playground-depth]");
  const replayButton = pick<HTMLButtonElement>(
    root,
    "[data-playground-replay]",
  );
  const benchmarkButton = pick<HTMLButtonElement>(
    root,
    "[data-playground-benchmark]",
  );
  const benchmarkNote = pick<HTMLElement>(
    root,
    "[data-playground-benchmark-note]",
  );
  const metric = (key: string) =>
    pick<HTMLElement>(root, `[data-metric="${key}"]`);
  const cell = (row: string, key: string) =>
    pick<HTMLElement>(
      root,
      `[data-benchmark-row="${row}"] [data-cell="${key}"]`,
    );
  const modelBase = root.dataset.modelBase ?? "";
  const now = () => performance.now();

  let manifest: PolicyManifest | null = null;
  let loading: Promise<PolicyManifest> | null = null;
  const buffers = new Map<string, Promise<ArrayBuffer>>();
  const actors = new Map<string, Actor>();
  let controllerKind: ControllerKind = "policy";
  let variantId = "fp32";
  let observation: Float64Array | null = null;
  let previousGrip: Point = { x: 0, y: 0 };
  let currentGrip: Point = { x: 0, y: 0 };
  let goalPoint: Point | null = null;
  let goal: Vector | null = null;
  let stepIndex = 0;
  let reachedAt: number | null = null;
  let latencies: number[] = [];
  let path: Point[] = [];
  let dragging = false;
  let pointerHandled = false;
  let running = false;
  let lastStep = 0;
  let frame = 0;
  let phase: Phase = "hint";
  let celebrateTimer = 0;
  let benchmarking = false;

  function setPhase(next: Phase): void {
    if (next === phase) return;
    phase = next;
    bubble.hidden = next !== "hint";
    status.textContent = next === "hint" ? copy.hint : copy.status[next];
  }

  async function fetchJson(): Promise<PolicyManifest> {
    const response = await fetch(`${modelBase}policy.json`);
    if (!response.ok) throw new Error(`policy.json ${response.status}`);
    return (await response.json()) as PolicyManifest;
  }

  function weights(file: string): Promise<ArrayBuffer> {
    const cached = buffers.get(file);
    if (cached) return cached;
    const request = fetch(`${modelBase}${file}`).then((response) => {
      if (!response.ok) throw new Error(`${file} ${response.status}`);
      return response.arrayBuffer();
    });
    request.catch(() => buffers.delete(file));
    buffers.set(file, request);
    return request;
  }

  async function ensureActor(
    loaded: PolicyManifest,
    id: string,
  ): Promise<void> {
    if (actors.has(id)) return;
    const variant = loaded.variants.find((entry) => entry.id === id);
    if (!variant) throw new Error(`Unknown variant ${id}`);
    actors.set(id, buildActor(loaded, variant, await weights(variant.weights)));
  }

  function ready(): Promise<PolicyManifest> {
    if (!loading) {
      loading = fetchJson().then(async (loaded) => {
        await ensureActor(loaded, variantId);
        manifest = loaded;
        observation ??= startObservation(loaded);
        currentGrip = toScene(loaded.origin, observation);
        previousGrip = currentGrip;
        markAvailable(loaded);
        showReference();
        return loaded;
      });
      loading.catch(() => {
        loading = null;
        setPhase("error");
      });
    }
    return loading;
  }

  function markAvailable(loaded: PolicyManifest): void {
    const available = new Set(loaded.variants.map((variant) => variant.id));
    for (const variant of playgroundVariants) {
      const option = precision.querySelector<HTMLOptionElement>(
        `option[value="${variant.id}"]`,
      );
      if (option) option.disabled = !available.has(variant.id);
    }
  }

  function controller(loaded: PolicyManifest): Controller {
    if (controllerKind === "proportional")
      return proportionalController(loaded);
    const actor = actors.get(variantId);
    if (!actor) throw new Error(`Missing actor ${variantId}`);
    return policyController(loaded, actor);
  }

  function variantLabel(): string {
    if (controllerKind === "proportional") return copy.controllers.proportional;
    const label = playgroundVariants.find(
      (variant) => variant.id === variantId,
    );
    return `${copy.controllers.policy}, ${label?.label ?? variantId}`;
  }

  function placeLink(
    lines: NodeListOf<SVGLineElement>,
    from: Point,
    to: Point,
  ) {
    for (const line of lines) {
      line.setAttribute("x1", String(from.x));
      line.setAttribute("y1", String(from.y));
      line.setAttribute("x2", String(to.x));
      line.setAttribute("y2", String(to.y));
    }
  }

  function drawArm(grip: Point): void {
    const { elbow, wrist } = solveElbow(grip);
    placeLink(upperLinks, armGeometry.shoulder, elbow);
    placeLink(foreLinks, elbow, wrist);
    elbowJoint.setAttribute("cx", String(elbow.x));
    elbowJoint.setAttribute("cy", String(elbow.y));
    hand.setAttribute("transform", `translate(${grip.x} ${grip.y})`);
    const look = goalPoint ?? grip;
    const gazeX = Math.max(-14, Math.min(14, (look.x + 610) * 0.02));
    const gazeY = Math.max(-8, Math.min(8, (look.y + 250) * 0.02));
    eye.setAttribute("cx", String(-610 + gazeX));
    eye.setAttribute("cy", String(-250 + gazeY));
  }

  function drawTrail(): void {
    trail.setAttribute(
      "points",
      path
        .map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`)
        .join(" "),
    );
  }

  function updateMetrics(): void {
    if (!manifest || !observation || !goal) return;
    metric("distance").textContent = centimeters(distance(observation, goal));
    metric("steps").textContent =
      reachedAt === null
        ? copy.notYet
        : `${reachedAt} / ${manifest.episodeSteps}`;
    metric("latency").textContent = milliseconds(median(latencies));
  }

  function celebrate(): void {
    window.clearTimeout(celebrateTimer);
    svg.removeAttribute("data-celebrate");
    void svg.getBoundingClientRect();
    svg.setAttribute("data-celebrate", "");
    celebrateTimer = window.setTimeout(
      () => svg.removeAttribute("data-celebrate"),
      celebrateMilliseconds,
    );
  }

  function finish(loaded: PolicyManifest): void {
    running = false;
    if (!observation || !goal) return;
    if (distance(observation, goal) < loaded.successThreshold) {
      setPhase("reached");
      return;
    }
    const floor = loaded.origin[2] + loaded.workspace.low[2];
    if (goal[2] < floor) setPhase("table");
    else if (!insideWorkspace(loaded, goal)) setPhase("far");
    else setPhase("missed");
  }

  function advanceOnce(loaded: PolicyManifest): void {
    if (!observation || !goal) return;
    const result = step(loaded, controller(loaded), observation, goal, now);
    observation = result.observation;
    latencies.push(result.latency);
    if (latencies.length > loaded.episodeSteps) latencies.shift();
    previousGrip = currentGrip;
    currentGrip = toScene(loaded.origin, observation);
    path.push(currentGrip);
    stepIndex += 1;
    const inside = distance(observation, goal) < loaded.successThreshold;
    if (inside && reachedAt === null) {
      reachedAt = stepIndex;
      celebrate();
    }
    if (!dragging) setPhase(inside ? "reached" : "reaching");
    if (!dragging && stepIndex >= loaded.episodeSteps) finish(loaded);
  }

  function tick(time: number): void {
    frame = 0;
    if (!manifest) return;
    let steps = 0;
    while (running && time - lastStep >= stepMilliseconds && steps < 3) {
      advanceOnce(manifest);
      lastStep += stepMilliseconds;
      steps += 1;
    }
    if (time - lastStep > stepMilliseconds * 3) lastStep = time;
    const blend = Math.min(
      1,
      Math.max(0, (time - lastStep) / stepMilliseconds),
    );
    drawArm({
      x: previousGrip.x + (currentGrip.x - previousGrip.x) * blend,
      y: previousGrip.y + (currentGrip.y - previousGrip.y) * blend,
    });
    if (steps > 0) {
      drawTrail();
      updateMetrics();
    }
    if (running || blend < 1) schedule();
  }

  function schedule(): void {
    if (!frame) frame = requestAnimationFrame(tick);
  }

  function beginAttempt(): void {
    if (!manifest || !observation) return;
    stepIndex = 0;
    reachedAt = null;
    latencies = [];
    path = [toScene(manifest.origin, observation)];
    running = true;
    lastStep = performance.now();
    setPhase(dragging ? "following" : "reaching");
    drawTrail();
    updateMetrics();
    schedule();
  }

  function showTarget(point: Point): void {
    goalPoint = point;
    target.setAttribute("transform", `translate(${point.x} ${point.y})`);
    target.setAttribute("visibility", "visible");
  }

  async function aim(point: Point, restart: boolean): Promise<void> {
    showTarget(point);
    if (!manifest) setPhase("loading");
    let loaded: PolicyManifest;
    try {
      loaded = await ready();
    } catch {
      return;
    }
    if (!goalPoint) return;
    goal = fromScene(
      loaded.origin,
      goalPoint,
      loaded.origin[1] + Number(depthInput.value) / 100,
    );
    if (restart || !running) beginAttempt();
    else updateMetrics();
  }

  function replay(): void {
    if (!manifest || !goalPoint) return;
    observation = startObservation(manifest);
    currentGrip = toScene(manifest.origin, observation);
    previousGrip = currentGrip;
    drawArm(currentGrip);
    void aim(goalPoint, true);
  }

  function scenePoint(clientX: number, clientY: number): Point {
    const matrix = svg.getScreenCTM();
    if (!matrix) return goalPoint ?? { x: 0, y: 0 };
    const point = new DOMPoint(clientX, clientY).matrixTransform(
      matrix.inverse(),
    );
    return clampToStage({ x: point.x, y: point.y });
  }

  handle.style.touchAction = "none";

  stage.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const onHandle = event.target === handle;
    if (event.pointerType === "touch" && !onHandle) return;
    event.preventDefault();
    pointerHandled = true;
    dragging = true;
    stage.setPointerCapture(event.pointerId);
    void aim(scenePoint(event.clientX, event.clientY), true);
  });
  stage.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    void aim(scenePoint(event.clientX, event.clientY), false);
  });
  const release = () => {
    if (!dragging) return;
    dragging = false;
    if (goalPoint) void aim(goalPoint, true);
  };
  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", release);
  stage.addEventListener("click", (event) => {
    if (pointerHandled) {
      pointerHandled = false;
      return;
    }
    void aim(scenePoint(event.clientX, event.clientY), true);
  });
  stage.addEventListener("keydown", (event) => {
    const moves: Record<string, Point> = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    const size = event.shiftKey ? keyStep * 4 : keyStep;
    const from = goalPoint ?? { x: currentGrip.x, y: currentGrip.y };
    void aim(
      clampToStage({ x: from.x + move.x * size, y: from.y + move.y * size }),
      true,
    );
  });

  function syncForm(): void {
    const data = new FormData(form);
    controllerKind = data.get("playground-controller") as ControllerKind;
    variantId = String(data.get("playground-variant"));
    precision.disabled = controllerKind === "proportional";
    depthOutput.value = `${depthInput.value} cm`;
  }

  form.addEventListener("change", async (event) => {
    syncForm();
    if (event.target === depthInput) {
      if (goalPoint) void aim(goalPoint, true);
      return;
    }
    showReference();
    try {
      const loaded = await ready();
      if (controllerKind === "policy") await ensureActor(loaded, variantId);
    } catch {
      setPhase("error");
      return;
    }
    replay();
  });
  depthInput.addEventListener("input", () => {
    depthOutput.value = `${depthInput.value} cm`;
  });
  replayButton.addEventListener("click", replay);

  function showReference(): void {
    const variant = manifest?.variants.find((entry) => entry.id === variantId);
    const policy = controllerKind === "policy" && variant;
    for (const row of ["surrogate", "mujoco"] as const) {
      const outcome = policy ? variant.validation[row] : null;
      cell(row, "success").textContent = outcome
        ? percent(outcome.successRate)
        : copy.notYet;
      cell(row, "distance").textContent = outcome
        ? centimeters(outcome.meanFinalDistance)
        : copy.notYet;
    }
    cell("browser", "success").textContent = copy.notYet;
    cell("browser", "distance").textContent = copy.notYet;
    benchmarkNote.textContent =
      controllerKind === "proportional" ? copy.proportionalNote : "";
  }

  benchmarkButton.addEventListener("click", async () => {
    if (benchmarking) return;
    benchmarking = true;
    benchmarkButton.disabled = true;
    try {
      const loaded = await ready();
      if (controllerKind === "policy") await ensureActor(loaded, variantId);
      const active = controller(loaded);
      const label = variantLabel();
      const finals: number[] = [];
      const times: number[] = [];
      for (const [index, entry] of loaded.evaluationGoals.entries()) {
        const outcome = runEpisode(loaded, active, entry as Vector, now);
        finals.push(outcome.finalDistance);
        times.push(...outcome.latencies);
        if (index % 5 === 4) {
          benchmarkNote.textContent = `${label}: ${index + 1} / ${loaded.evaluationGoals.length}`;
          await yieldToBrowser();
        }
      }
      const successes = finals.filter(
        (value) => value < loaded.successThreshold,
      ).length;
      const mean =
        finals.reduce((total, value) => total + value, 0) / finals.length;
      const average =
        times.reduce((total, value) => total + value, 0) / times.length;
      cell("browser", "success").textContent = percent(
        successes / finals.length,
      );
      cell("browser", "distance").textContent = centimeters(mean);
      benchmarkNote.textContent = `${label}: ${finals.length} targets, ${times.length} decisions, ${milliseconds(average)} mean per decision in this tab.`;
    } catch {
      setPhase("error");
    } finally {
      benchmarking = false;
      benchmarkButton.disabled = false;
    }
  });

  syncForm();
  root.dataset.playgroundReady = "";
  void ready().catch(() => undefined);
  if (pending) {
    void aim(scenePoint(pending.clientX, pending.clientY), true);
    return;
  }
  setPhase("hint");
  status.textContent = copy.hint;
  bubble.hidden = false;
}
