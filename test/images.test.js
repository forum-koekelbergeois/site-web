import { test } from "node:test";
import assert from "node:assert/strict";
import images from "../src/_data/images.js";
import { imageHtml, galleryHtml, findMissingImages, findMissingReferences } from "../lib/images.js";
import { linkContacts, telHref } from "../lib/contact-links.js";
import { readFileSync, readdirSync } from "node:fs";

// Reads the RIFF chunks of a WebP file: image size and metadata chunks.
function webpInfo(path) {
  const data = readFileSync(path);
  assert.equal(data.toString("latin1", 0, 4), "RIFF", path);
  assert.equal(data.toString("latin1", 8, 12), "WEBP", path);
  const chunks = [];
  let size = null;
  for (let pos = 12; pos + 8 <= data.length; ) {
    const fourcc = data.toString("latin1", pos, pos + 4);
    const length = data.readUInt32LE(pos + 4);
    const body = pos + 8;
    if (fourcc === "VP8 ") size = [data.readUInt16LE(body + 6) & 0x3fff, data.readUInt16LE(body + 8) & 0x3fff];
    if (fourcc === "VP8L") {
      const bits = data.readUInt32LE(body + 1);
      size = [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
    }
    if (fourcc === "VP8X") size = [data.readUIntLE(body + 4, 3) + 1, data.readUIntLE(body + 7, 3) + 1];
    chunks.push(fourcc.trim());
    pos = body + length + (length & 1);
  }
  return { size, metadata: chunks.filter((c) => ["EXIF", "XMP", "ICCP"].includes(c)) };
}

const EXPECTED = ["IA1", "IA3", "IA4", "IA5", "IA6", "IA7", "IA8", "IA9", "IA11", "IA12",
  "IA13", "IA14", "IA15",
  "R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8",
  "R61", "R63", "R64", "R65", "R66", "R67", "R68",
  "R71", "R72", "R73", "R75", "R76", "R77", "R78", "R81",
  "R9", "R10", "R12", "R13"];

test("every image of annex E has a slot, and only those", () => {
  assert.deepEqual(images.list.map((i) => i.code), EXPECTED);
});

test("decorative images have an empty alt, the others a text", () => {
  for (const image of images.list) {
    if (["IA11", "IA12"].includes(image.code)) assert.equal(image.alt, "", image.code);
    else assert.ok(image.alt.length > 10, image.code);
  }
});

test("only R9 and R10 have the visible caption « Illustration »", () => {
  const captioned = images.list.filter((i) => i.caption).map((i) => i.code);
  assert.deepEqual(captioned, ["R9", "R10"]);
  assert.ok(captioned.every((code) => images.byCode[code].caption === "Illustration"));
});

test("each activity type has a default image and a 1 200 × 630 share image", () => {
  assert.deepEqual(images.typeDefaults, { Atelier: "IA5", Sortie: "IA6", Rencontre: "IA7", Cours: "IA8" });
  for (const code of Object.values(images.typeDefaults)) {
    const share = images.byCode[code].share;
    assert.ok(share, code);
    assert.deepEqual(webpInfo(`src${share}`).size, [1200, 630], code);
  }
});

test("no slot is waiting for its file any more", () => {
  assert.deepEqual(images.pending, []);
});

test("every image file exists with the size declared in images.js", () => {
  for (const image of images.list) {
    assert.deepEqual(webpInfo(`src${image.file}`).size, [image.width, image.height], image.code);
  }
});

test("no WebP file of the site contains metadata (EXIF, XMP, ICC)", () => {
  const files = ["src/assets/images", "src/assets/logos", "src/assets"].flatMap((dir) =>
    readdirSync(dir).filter((f) => f.endsWith(".webp")).map((f) => `${dir}/${f}`),
  );
  assert.ok(files.length >= 33);
  for (const file of files) {
    assert.deepEqual(webpInfo(file).metadata, [], file);
  }
});

// Smaller versions (scripts/make_responsive.py), named <name>-<width>w.webp.
const VERSION = /^(.+)-(\d+)w\.webp$/;

test("each smaller version keeps the crop, is smaller, and has no metadata", () => {
  const dir = "src/assets/images";
  const versions = readdirSync(dir).filter((f) => VERSION.test(f));
  assert.ok(versions.length >= 100, `${versions.length} versions`);
  for (const file of versions) {
    const [, base, width] = file.match(VERSION);
    const source = webpInfo(`${dir}/${base}.webp`);
    const version = webpInfo(`${dir}/${file}`);
    assert.equal(version.size[0], Number(width), file);
    assert.ok(version.size[0] < source.size[0], `${file} not enlarged`);
    const expectedHeight = Math.round((source.size[1] * version.size[0]) / source.size[0]);
    assert.ok(Math.abs(version.size[1] - expectedHeight) <= 1, `${file} same aspect ratio`);
    assert.deepEqual(version.metadata, [], file);
  }
  assert.deepEqual(webpInfo("src/assets/logo-forum-koekelbergeois-320w.webp").metadata, []);
});

test("every version comes from an image of images.js or a share image", () => {
  const known = new Set(images.list.flatMap((i) => [i.file, i.share].filter(Boolean)).map((f) => f.split("/").pop()));
  for (const file of readdirSync("src/assets/images").filter((f) => VERSION.test(f))) {
    assert.ok(known.has(`${file.match(VERSION)[1]}.webp`), file);
  }
});

test("srcset lists the existing versions and the file itself, with the layout's sizes", () => {
  const image = images.byCode.R9;
  const files = new Set([image.file, "/assets/images/r9-320w.webp", "/assets/images/r9-720w.webp"]);
  const html = imageHtml(image, { exists: (f) => files.has(f), sizes: "place" });
  assert.match(html, /srcset="\/assets\/images\/r9-320w\.webp 320w, \/assets\/images\/r9-720w\.webp 720w, \/assets\/images\/r9\.webp 920w"/);
  assert.match(html, /sizes="\(min-width: 48rem\) 29rem, calc\(100vw - 2rem\)"/);
  assert.match(html, /src="\/assets\/images\/r9\.webp"/);
  assert.doesNotMatch(imageHtml(image, { exists: (f) => f === image.file }), /srcset/, "no version, no srcset");
  assert.doesNotMatch(imageHtml(image, { exists: () => false }), /srcset/, "placeholder, no srcset");
});

test("a missing file gives a placeholder that is reported", () => {
  const html = imageHtml(images.byCode.R9, { exists: () => false });
  assert.match(html, /src="\/assets\/placeholder.svg"/);
  assert.match(html, /<figcaption>Illustration<\/figcaption>/);
  assert.deepEqual(findMissingImages(html), ["R9 (/assets/images/r9.webp)"]);
});

test("an existing file is used and not reported", () => {
  const html = imageHtml(images.byCode.IA11, { exists: (file) => file === images.byCode.IA11.file });
  assert.match(html, /src="\/assets\/images\/ia11.webp" width="768" height="512" alt=""/);
  assert.deepEqual(findMissingImages(html), []);
});

test("the Wednesday and holiday galleries hold eight photos each", () => {
  const page = readFileSync("src/pages/ecoles-de-devoirs.njk", "utf8");
  const galleries = [...page.matchAll(/\{% gallery (\[[^\]]*\]) %\}/g)].map((m) => JSON.parse(m[1]));
  assert.deepEqual(galleries, [
    ["R6", "R61", "R63", "R64", "R65", "R66", "R67", "R68"],
    ["R7", "R71", "R72", "R73", "R75", "R76", "R77", "R78"],
    ["R8", "R81"],
  ]);
});

test("a gallery is a list of lazy-loaded images with their size", () => {
  const codes = ["R8", "R81", "IA13"];
  const html = galleryHtml(codes.map((code) => images.byCode[code]), (file) => !file.includes("ia13"));
  assert.match(html, /^<ul class="gallery" role="list">(<li><img [^>]+><\/li>){3}<\/ul>$/);
  assert.equal(html.match(/class="photo gallery__photo"/g).length, 3);
  assert.equal(html.match(/loading="lazy"/g).length, 3);
  assert.match(html, /src="\/assets\/images\/r81.webp" srcset="[^"]+" sizes="\(min-width: 48rem\) 15rem, calc\(50vw - 1\.25rem\)" width="640" height="480"/);
  const wide = galleryHtml([images.byCode.R77], () => true);
  assert.match(wide, /sizes="\(min-width: 48rem\) calc\(15rem \* 1\.99\), calc\(\(50vw - 1\.25rem\) \* 1\.99\)"/, "R77 is cropped by its height");
  assert.deepEqual(findMissingImages(html), ["IA13 (/assets/images/ia13.webp)"]);
});

test("share images pointing to a missing file are reported", () => {
  const html = '<meta property="og:image" content="https://www.forumkoekelbergeois.be/assets/images/ia5.webp">';
  assert.deepEqual(findMissingReferences(html, () => false), ["/assets/images/ia5.webp"]);
  assert.deepEqual(findMissingReferences(html, () => true), []);
});

test("phone numbers and e-mails in a text become links", () => {
  assert.equal(telHref("02 427 75 42"), "tel:+3224277542");
  assert.equal(
    linkContacts("02 427 75 42 ou info@3oeil.be"),
    '<a class="nowrap" href="tel:+3224277542">02 427 75 42</a> ou <a href="mailto:info@3oeil.be">info@3oeil.be</a>',
  );
  assert.equal(linkContacts("Le <b>Troisième</b> Œil"), "Le &lt;b&gt;Troisième&lt;/b&gt; Œil");
});
