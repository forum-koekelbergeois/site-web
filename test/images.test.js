import { test } from "node:test";
import assert from "node:assert/strict";
import images from "../src/_data/images.js";
import { imageHtml, findMissingImages, findMissingReferences } from "../lib/images.js";
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
  "R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9", "R10", "R12", "R13"];

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

test("a missing file gives a placeholder that is reported", () => {
  const html = imageHtml(images.byCode.R9, { exists: false });
  assert.match(html, /src="\/assets\/placeholder.svg"/);
  assert.match(html, /<figcaption>Illustration<\/figcaption>/);
  assert.deepEqual(findMissingImages(html), ["R9 (/assets/images/r9.webp)"]);
});

test("an existing file is used and not reported", () => {
  const html = imageHtml(images.byCode.IA11, { exists: true });
  assert.match(html, /src="\/assets\/images\/ia11.webp" width="768" height="512" alt=""/);
  assert.deepEqual(findMissingImages(html), []);
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
