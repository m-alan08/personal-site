export function initialize(root: HTMLElement) {
  const buttons =
    root.querySelectorAll<HTMLButtonElement>("[data-policy-bits]");
  const update = (bits: number) => {
    const levels = 2 ** Math.min(bits, 16) - 1;
    for (const edge of root.querySelectorAll<SVGLineElement>(
      "[data-policy-weight]",
    )) {
      const weight =
        Math.round(Number(edge.dataset.policyWeight) * levels) / levels;
      edge.setAttribute("opacity", String(0.15 + weight * 0.65));
      edge.setAttribute("stroke-width", String(0.5 + weight * 2.5));
    }
    for (const button of buttons)
      button.setAttribute(
        "aria-pressed",
        String(Number(button.dataset.policyBits) === bits),
      );
    const status = root.querySelector<HTMLElement>("[data-policy-status]");
    if (status)
      status.textContent =
        status.dataset.template?.replace("{bits}", String(bits)) ?? "";
  };
  for (const button of buttons) {
    button.disabled = false;
    button.addEventListener("click", () =>
      update(Number(button.dataset.policyBits)),
    );
  }
  update(8);
  root.dataset.ready = "true";
}
