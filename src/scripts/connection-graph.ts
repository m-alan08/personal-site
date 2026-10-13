import type { connectionSample } from "../data/illustrations";
type Sample = typeof connectionSample;
type Node = Sample["nodes"][number];
function solve(nodes: Node[], edges: number[][]) {
  for (let step = 0; step < 64; step++) {
    const forces = nodes.map((node) => ({
      x: (160 - node.x) * 0.015,
      y: (150 - node.y) * 0.015,
    }));
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const scale = 150 / (dx * dx + dy * dy + 1);
        forces[i].x += dx * scale;
        forces[i].y += dy * scale;
        forces[j].x -= dx * scale;
        forces[j].y -= dy * scale;
      }
    }
    for (const [from, to] of edges) {
      const dx = nodes[to].x - nodes[from].x;
      const dy = nodes[to].y - nodes[from].y;
      const distance = Math.hypot(dx, dy) || 1;
      const scale = ((distance - 95) * 0.035) / distance;
      forces[from].x += dx * scale;
      forces[from].y += dy * scale;
      forces[to].x -= dx * scale;
      forces[to].y -= dy * scale;
    }
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].x = Math.max(32, Math.min(288, nodes[i].x + forces[i].x * 0.6));
      nodes[i].y = Math.max(32, Math.min(268, nodes[i].y + forces[i].y * 0.6));
    }
  }
}
export function initialize(root: HTMLElement) {
  const sample = JSON.parse(root.dataset.sample ?? "{}") as Sample;
  const nodes = sample.nodes.map((node) => ({ ...node }));
  const svg = root.querySelector<SVGSVGElement>("svg");
  const groups = [...root.querySelectorAll<SVGGElement>("[data-graph-node]")];
  const lines = [...root.querySelectorAll<SVGLineElement>("[data-graph-edge]")];
  const buttons = [
    ...root.querySelectorAll<HTMLButtonElement>("[data-graph-select]"),
  ];
  const status = root.querySelector<HTMLElement>("[data-graph-status]");
  if (!svg || !status) return;
  let selected = -1;
  let dragging = -1;
  let scheduled = false;
  const draw = () => {
    for (const [index, group] of groups.entries()) {
      group.setAttribute(
        "transform",
        `translate(${nodes[index].x} ${nodes[index].y})`,
      );
      group.dataset.selected = String(selected === index);
    }
    for (const [index, edge] of sample.edges.entries()) {
      const [from, to] = edge;
      lines[index].setAttribute("x1", String(nodes[from].x));
      lines[index].setAttribute("y1", String(nodes[from].y));
      lines[index].setAttribute("x2", String(nodes[to].x));
      lines[index].setAttribute("y2", String(nodes[to].y));
      lines[index].setAttribute(
        "opacity",
        selected < 0 || edge.includes(selected) ? "0.7" : "0.15",
      );
      lines[index].setAttribute(
        "stroke-width",
        edge.includes(selected) ? "2.5" : "1.5",
      );
    }
    scheduled = false;
  };
  const select = (index: number) => {
    selected = index;
    for (const [buttonIndex, button] of buttons.entries())
      button.setAttribute("aria-pressed", String(index === buttonIndex));
    const node = nodes[index];
    const neighbors = sample.edges
      .filter((edge) => edge.includes(index))
      .map(([from, to]) => nodes[from === index ? to : from].id)
      .sort()
      .join(", ");
    status.textContent =
      status.dataset.template
        ?.replace("{id}", node.id)
        .replace(
          "{count}",
          String(sample.edges.filter((edge) => edge.includes(index)).length),
        )
        .replace("{topic}", node.topic)
        .replace("{neighbors}", neighbors) ?? "";
    draw();
  };
  const reset = () => {
    for (const [index, node] of nodes.entries())
      Object.assign(node, sample.nodes[index]);
    solve(nodes, sample.edges);
    selected = -1;
    for (const button of buttons) button.setAttribute("aria-pressed", "false");
    status.textContent = status.dataset.initial ?? "";
    draw();
  };
  for (const [index, button] of buttons.entries()) {
    button.disabled = false;
    button.addEventListener("click", () => select(index));
    button.addEventListener("keydown", (event) => {
      const delta = {
        ArrowLeft: [-10, 0],
        ArrowRight: [10, 0],
        ArrowUp: [0, -10],
        ArrowDown: [0, 10],
      }[event.key];
      if (!delta) return;
      event.preventDefault();
      nodes[index].x = Math.max(32, Math.min(288, nodes[index].x + delta[0]));
      nodes[index].y = Math.max(32, Math.min(268, nodes[index].y + delta[1]));
      select(index);
    });
  }
  const resetButton =
    root.querySelector<HTMLButtonElement>("[data-graph-reset]");
  if (resetButton) {
    resetButton.disabled = false;
    resetButton.addEventListener("click", reset);
  }
  svg.addEventListener("pointerdown", (event) => {
    const target = (event.target as Element).closest<SVGGElement>(
      "[data-graph-node]",
    );
    if (!target) return;
    dragging = Number(target.dataset.graphNode);
    select(dragging);
    buttons[dragging].focus();
    svg.setPointerCapture(event.pointerId);
  });
  svg.addEventListener("pointermove", (event) => {
    if (dragging < 0) return;
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const local = point.matrixTransform(matrix.inverse());
    nodes[dragging].x = Math.max(32, Math.min(288, local.x));
    nodes[dragging].y = Math.max(32, Math.min(268, local.y));
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(draw);
    }
  });
  svg.addEventListener("pointerup", () => {
    dragging = -1;
  });
  svg.addEventListener("pointercancel", () => {
    dragging = -1;
  });
  reset();
  root.dataset.ready = "true";
}
