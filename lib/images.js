// Image slots: HTML for an image, or a neutral placeholder while its file is missing.
const PLACEHOLDER = "/assets/placeholder.svg";

const escapeAttribute = (value) => String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");

// `image` is an entry of src/_data/images.js; `exists` tells whether its file is there.
export function imageHtml(image, { exists, loading = "lazy", className = "" }) {
  const classes = ["photo", className].filter(Boolean).join(" ");
  const src = exists ? image.file : PLACEHOLDER;
  const missing = exists ? "" : ` data-missing-image="${image.code} (${image.file})"`;
  const img =
    `<img class="${classes}" src="${src}" width="${image.width}" height="${image.height}"` +
    ` alt="${escapeAttribute(image.alt)}" loading="${loading}" data-image="${image.code}"${missing}>`;
  if (!image.caption) return img;
  return `<figure class="figure">${img}<figcaption>${image.caption}</figcaption></figure>`;
}

// Photos of the same format in a list, cropped to 4:3 by the stylesheet.
export function galleryHtml(images, exists) {
  const items = images.map(
    (image) => `<li>${imageHtml({ ...image, caption: "" }, { exists: exists(image.file), className: "gallery__photo" })}</li>`,
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
