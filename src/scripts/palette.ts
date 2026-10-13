let initialized = false;
let opener: Element | null = null;
export function open(previous: Element | null) {
  const dialog = document.querySelector<HTMLDialogElement>("#command-palette");
  const query = document.querySelector<HTMLInputElement>("#palette-query");
  if (!dialog || !query) return;
  if (dialog.open) {
    dialog.close();
    return;
  }
  opener = previous;
  if (!initialized) {
    dialog
      .querySelector<HTMLButtonElement>("[data-palette-close]")
      ?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => {
      if (opener instanceof HTMLElement) opener.focus();
    });
    query.addEventListener("input", () => {
      const entries = [
        ...dialog.querySelectorAll<HTMLLIElement>("[data-palette-entry]"),
      ];
      for (const entry of entries)
        entry.hidden = !entry.textContent
          ?.toLowerCase()
          .includes(query.value.trim().toLowerCase());
      const empty = dialog.querySelector<HTMLElement>("[data-palette-empty]");
      if (empty) empty.hidden = entries.some((entry) => !entry.hidden);
    });
    query.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        dialog
          .querySelector<HTMLAnchorElement>(
            "[data-palette-entry]:not([hidden]) a",
          )
          ?.focus();
      }
      if (event.key === "Enter")
        dialog
          .querySelector<HTMLAnchorElement>(
            "[data-palette-entry]:not([hidden]) a",
          )
          ?.click();
    });
    initialized = true;
  }
  query.value = "";
  query.dispatchEvent(new Event("input"));
  dialog.showModal();
  query.focus();
}
