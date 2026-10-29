import { test } from "node:test";
import assert from "node:assert/strict";
import images from "../src/_data/images.js";
import { imageHtml, findMissingImages, findMissingReferences } from "../lib/images.js";
import { linkContacts, telHref } from "../lib/contact-links.js";

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

test("each activity type has a default image", () => {
  assert.deepEqual(images.typeDefaults, { Atelier: "IA5", Sortie: "IA6", Rencontre: "IA7", Cours: "IA8" });
  for (const code of Object.values(images.typeDefaults)) {
    assert.equal(images.byCode[code].width, 1200);
    assert.equal(images.byCode[code].height, 630);
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
  assert.match(html, /src="\/assets\/images\/ia11.webp" width="1536" height="1024" alt=""/);
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
