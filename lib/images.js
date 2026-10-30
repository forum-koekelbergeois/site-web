// Image slots: HTML for an image, or a neutral placeholder while its file is missing.
const PLACEHOLDER = "/assets/placeholder.svg";

const escapeAttribute = (value) => String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");

// Displayed width of an image for each layout (see src/css/style.css), so the
// browser picks the smallest sufficient version. Content column: 58rem at most.
export const SIZES = {
  hero: "100vw",
  content: "(min-width: 60rem) 58rem, calc(100vw - 2rem)",
  card: "(min-width: 48rem) 24rem, calc(100vw - 2rem)",
  split: "(min-width: 48rem) 23rem, calc(100vw - 2rem)",
  place: "(min-width: 48rem) 29rem, calc(100vw - 2rem)",
  gallery: "(min-width: 48rem) 15rem, calc(50vw - 1.25rem)",
  "photo--small": "(min-width: 20rem) 18rem, calc(100vw - 2rem)",
  "photo--medium": "(min-width: 34rem) 32rem, calc(100vw - 2rem)",
  "photo--portrait": "(min-width: 24rem) 22rem, calc(100vw - 2rem)",
  "photo--decor": "(min-width: 26rem) 24rem, calc(100vw - 2rem)",
  "photo--banner": "(min-width: 60rem) 58rem, calc(100vw - 2rem)",
};

// Smaller versions made by scripts/make_responsive.py: <name>-<width>w.webp.
export const versionFile = (file, width) => file.replace(/\.webp$/, `-${width}w.webp`);
export const VERSION_WIDTHS = [320, 480, 720, 960, 1280];

// `image` is an entry of src/_data/images.js; `exists` tells whether a file
// (the image or one of its versions) is there. `sizes` names a layout of SIZES.
export function imageHtml(image, { exists, loading = "lazy", className = "", sizes }) {
  const classes = ["photo", className].filter(Boolean).join(" ");
  const found = exists(image.file);
  const src = found ? image.file : PLACEHOLDER;
  const missing = found ? "" : ` data-missing-image="${image.code} (${image.file})"`;
  const versions = found
    ? VERSION_WIDTHS.filter((w) => w < image.width && exists(versionFile(image.file, w)))
    : [];
  const layout = sizes?.custom ?? SIZES[sizes ?? className] ?? SIZES.content;
  const srcset = versions.length
    ? ` srcset="${[...versions.map((w) => `${versionFile(image.file, w)} ${w}w`), `${image.file} ${image.width}w`].join(", ")}" sizes="${layout}"`
    : "";
  const img =
    `<img class="${classes}" src="${src}"${srcset} width="${image.width}" height="${image.height}"` +
    ` alt="${escapeAttribute(image.alt)}" loading="${loading}" data-image="${image.code}"${missing}>`;
  if (!image.caption) return img;
  return `<figure class="figure">${img}<figcaption>${image.caption}</figcaption></figure>`;
}

// Photos of the same format in a list, cropped to 4:3 by the stylesheet.
// A photo wider than 4:3 fills the frame by its height: it needs more pixels.
const galleryLayout = (image) => {
  const factor = Math.round(Math.max(1, (image.width / image.height) / (4 / 3)) * 100) / 100;
  return factor === 1 ? "gallery" : { custom: `(min-width: 48rem) calc(15rem * ${factor}), calc((50vw - 1.25rem) * ${factor})` };
};

export function galleryHtml(images, exists) {
  const items = images.map(
    (image) => `<li>${imageHtml({ ...image, caption: "" }, { exists, className: "gallery__photo", sizes: galleryLayout(image) })}</li>`,
  );
  return `<ul class="gallery" role="list">${items.join("")}</ul>`;
}

const MISSING = /data-missing-image="([^"]*)"/g;
const REFERENCED = /(?:src|content)="(?:https?:\/\/[^/"]+)?(\/assets\/images\/[^"]+)"/g;

// Images still shown as placeholders in a page.
export function findMissingImages(html) {
  if (typeof html !== "string") return [];
  return [...html.matchAll(MISSING)].map((match) => match[1]);
}

// Image files referenced by a page (img src, og:image…); `exists` checks one path.
export function findMissingReferences(html, exists) {
  if (typeof html !== "string") return [];
  const paths = new Set([...html.matchAll(REFERENCED)].map((match) => match[1]));
  return [...paths].filter((path) => !exists(path));
}
