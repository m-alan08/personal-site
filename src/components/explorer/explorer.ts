import { bitWidths, type MethodId, type TaskId } from "../../data/explorerData";
import {
  bitLabel,
  formatValue,
  measurementFor,
  seedText,
  selectionText,
  statusText,
} from "./format";

function pick<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing ${selector}`);
  return element;
}

export function mountExplorer(root: HTMLElement): void {
  const form = pick<HTMLFormElement>(root, "[data-explorer-form]");
  const slider = pick<HTMLInputElement>(form, 'input[type="range"]');
  const bitsOutput = pick<HTMLElement>(root, "[data-explorer-bits]");
  const value = pick<HTMLElement>(root, "[data-explorer-value]");
  const seeds = pick<HTMLElement>(root, "[data-explorer-seeds]");
  const bar = pick<HTMLElement>(root, "[data-explorer-bar]");
  const selection = pick<HTMLElement>(root, "[data-explorer-selection]");
  const status = pick<HTMLElement>(root, "[data-explorer-status]");
  const marker = pick<SVGCircleElement>(root, "[data-explorer-marker]");
  const series = [...root.querySelectorAll<SVGGElement>("[data-series]")];

  function render(): void {
    const data = new FormData(form);
    const task = String(data.get("explorer-task")) as TaskId;
    const method = String(data.get("explorer-method")) as MethodId;
    const bits = bitWidths[Number(slider.value)] ?? bitWidths[0];
    const measurement = measurementFor(task, method, bits);
    value.textContent = formatValue(measurement);
    value.classList.toggle("text-display", measurement !== null);
    value.classList.toggle("text-h2", measurement === null);
    seeds.textContent = measurement ? seedText(measurement) : "";
    bar.style.width = `${measurement ? measurement[0] : 0}%`;
    bitsOutput.textContent = bitLabel(bits);
    slider.setAttribute("aria-valuetext", bitLabel(bits));
    selection.textContent = selectionText(task, method, bits);
    status.textContent = statusText(task, method, bits);
    for (const group of series) {
      const shown = group.dataset.task === task;
      const selected = shown && group.dataset.method === method;
      group.setAttribute("display", shown ? "inline" : "none");
      group.setAttribute("stroke", selected ? "var(--ink)" : "var(--control)");
      group.setAttribute("stroke-width", selected ? "2.5" : "1.5");
      if (selected) marker.before(group);
    }
    const point = root.querySelector<SVGCircleElement>(
      `[data-point][data-task="${task}"][data-method="${method}"][data-bits="${bits}"]`,
    );
    marker.setAttribute("display", point ? "inline" : "none");
    marker.setAttribute("cx", point?.getAttribute("cx") ?? "0");
    marker.setAttribute("cy", point?.getAttribute("cy") ?? "0");
  }

  form.addEventListener("input", render);
  form.addEventListener("submit", (event) => event.preventDefault());
  render();
  pick<HTMLElement>(root, "[data-explorer-static]").hidden = true;
  pick<HTMLElement>(root, "[data-explorer-ui]").hidden = false;
}
