import { test } from "node:test";
import assert from "node:assert/strict";
import { typographyHtml, typographyText } from "../lib/typography.js";

const NBSP = " ";
const NNBSP = " ";

test("straight apostrophes become typographic", () => {
  assert.equal(typographyText("l'école d'Anne"), "l’école d’Anne");
});

test("narrow no-break space before ; ? !", () => {
  assert.equal(typographyText("Qui sommes-nous ?"), `Qui sommes-nous${NNBSP}?`);
  assert.equal(typographyText("Bonjour !"), `Bonjour${NNBSP}!`);
  assert.equal(typographyText("un ; deux"), `un${NNBSP}; deux`);
  assert.equal(typographyText("Vraiment?"), `Vraiment${NNBSP}?`);
});

test("no-break space before a colon and inside French quotes", () => {
  assert.equal(typographyText("Pour qui : les parents"), `Pour qui${NBSP}: les parents`);
  assert.equal(typographyText("Pour qui: les parents"), `Pour qui${NBSP}: les parents`);
  assert.equal(typographyText("« Les cours de français »"), `«${NBSP}Les cours de français${NBSP}»`);
  assert.equal(typographyText("«Autre»"), `«${NBSP}Autre${NBSP}»`);
});

test("already correct text is left unchanged", () => {
  const ok = `Qui sommes-nous${NNBSP}? Pour qui${NBSP}: «${NBSP}Autre${NBSP}»`;
  assert.equal(typographyText(ok), ok);
});

test("hours are left intact", () => {
  assert.equal(typographyText("de 8h30 à 18h30"), "de 8h30 à 18h30");
  assert.equal(typographyText("à 9:30 précises"), "à 9:30 précises");
});

test("phone numbers are left intact", () => {
  assert.equal(typographyText("02 435 68 45"), "02 435 68 45");
});

test("URLs and e-mail addresses are left intact", () => {
  const url = "https://www.openstreetmap.org/search?query=17%20rue&x=1";
  assert.equal(typographyText(`Voir ${url} !`), `Voir ${url}${NNBSP}!`);
  assert.equal(typographyText("www.autoriteprotectiondonnees.be"), "www.autoriteprotectiondonnees.be");
  assert.equal(
    typographyText("E-mail : fkoekelbergeois@koekelberg.brussels"),
    `E-mail${NBSP}: fkoekelbergeois@koekelberg.brussels`,
  );
  assert.equal(typographyText("o'brien@exemple.be"), "o'brien@exemple.be");
});

test("HTML attributes are never changed", () => {
  const html = `<a href="https://exemple.be/?a=1&b='x'" title="Qui ? l'IA : oui">l'IA ?</a>`;
  assert.equal(
    typographyHtml(html),
    `<a href="https://exemple.be/?a=1&b='x'" title="Qui ? l'IA : oui">l’IA${NNBSP}?</a>`,
  );
  assert.equal(typographyHtml('<img alt="l\'IA : test">'), '<img alt="l\'IA : test">');
});

test("tel: and mailto: links are left intact", () => {
  const html = '<a href="tel:+3224356845">02 435 68 45</a> <a href="mailto:fkoekelbergeois@koekelberg.brussels">fkoekelbergeois@<wbr>koekelberg.brussels</a>';
  assert.equal(typographyHtml(html), html);
});

test("code, pre, script and style are left intact", () => {
  const html = "<p>l'IA</p><code>a ? b : c</code><pre>it's: ok</pre><script>x = a ? 'b' : 'c';</script><style>a:hover{}</style>";
  assert.equal(
    typographyHtml(html),
    "<p>l’IA</p><code>a ? b : c</code><pre>it's: ok</pre><script>x = a ? 'b' : 'c';</script><style>a:hover{}</style>",
  );
});

test("Dutch text is left intact, including nested elements", () => {
  const html = '<p lang="nl">Vragen? Bel ons op <strong>02 435 68 45</strong>: tot \'s avonds!</p><p>Questions ?</p>';
  assert.equal(
    typographyHtml(html),
    `<p lang="nl">Vragen? Bel ons op <strong>02 435 68 45</strong>: tot 's avonds!</p><p>Questions${NNBSP}?</p>`,
  );
});

test("French inside Dutch is still corrected when marked lang=fr", () => {
  assert.equal(
    typographyHtml('<div lang="nl">Hallo <span lang="fr">l\'école ?</span> dag!</div>'),
    `<div lang="nl">Hallo <span lang="fr">l’école${NNBSP}?</span> dag!</div>`,
  );
});

test("entities are respected, &#39; and &nbsp; are normalised", () => {
  assert.equal(typographyHtml("<p>l&#39;IA&nbsp;: A &amp; B ; C</p>"), `<p>l’IA${NBSP}: A &amp; B${NNBSP}; C</p>`);
});

test("punctuation right after an inline element", () => {
  assert.equal(typographyHtml("<p><strong>Pour qui</strong>: parents</p>"), `<p><strong>Pour qui</strong>${NBSP}: parents</p>`);
  assert.equal(typographyHtml("<p><a href=\"/\">Accueil</a>!</p>"), `<p><a href="/">Accueil</a>${NNBSP}!</p>`);
});

test("markers keep their brackets", () => {
  assert.equal(typographyText("[DONNÉE À COMPLÉTER]"), "[DONNÉE À COMPLÉTER]");
  assert.equal(typographyText("[À VÉRIFIER : x]"), `[À VÉRIFIER${NBSP}: x]`);
});
