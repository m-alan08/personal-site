const heroProperties = [
  "display",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "z-index",
  "isolation",
  "max-width",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "border-top-width",
  "border-top-style",
  "border-top-color",
  "border-bottom-width",
  "border-bottom-color",
  "border-radius",
  "row-gap",
  "column-gap",
  "align-items",
  "justify-content",
  "flex-wrap",
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "letter-spacing",
  "text-transform",
  "color",
  "background-color",
  "background-image",
  "opacity",
  "box-shadow",
  "object-fit",
  "aspect-ratio",
  "pointer-events",
];

export const heroWidths = [1440, 390];

export async function heroSnapshot(page) {
  return page.evaluate((properties) => {
    const hero = document.querySelector("main > section:first-of-type");
    const elements = [hero, ...hero.querySelectorAll("*")];
    return {
      html: hero.outerHTML,
      styles: elements.map((element) => {
        const style = getComputedStyle(element);
        return Object.fromEntries(
          properties.map((property) => [
            property,
            style.getPropertyValue(property),
          ]),
        );
      }),
    };
  }, heroProperties);
}

export async function wordsAfterHero(page) {
  return page.evaluate(() => {
    const hero = document.querySelector("main > section:first-of-type");
    const blocks = [...document.querySelectorAll("main > *")].filter(
      (element) => element !== hero && element.textContent.trim(),
    );
    const text = [...blocks, document.querySelector("footer")]
      .map((element) => element.innerText)
      .join(" ");
    return text.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word))
      .length;
  });
}
