export function filter(category: string) {
  const root = document.querySelector<HTMLElement>("[data-project-explorer]");
  if (!root) return;
  const entries = [
    ...root.querySelectorAll<HTMLElement>("[data-project-category]"),
  ];
  for (const entry of entries)
    entry.hidden =
      category !== "all" && entry.dataset.projectCategory !== category;
  for (const group of root.querySelectorAll<HTMLElement>(
    "[data-project-group]",
  ))
    group.hidden = !group.querySelector(
      "[data-project-category]:not([hidden])",
    );
  for (const button of root.querySelectorAll<HTMLButtonElement>(
    "[data-project-filter]",
  ))
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.projectFilter === category),
    );
  const count = root.querySelector<HTMLElement>("[data-project-count]");
  if (count)
    count.textContent =
      count.dataset.template?.replace(
        "{count}",
        String(entries.filter((entry) => !entry.hidden).length),
      ) ?? "";
}
