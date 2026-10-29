import { test } from "node:test";
import assert from "node:assert/strict";
import { typographyHtml, typographyText } from "../lib/typography.js";

const NBSP = "\u00A0";
const NNBSP = "\u202F";

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

test("technical attributes are never changed", () => {
  const html = `<a href="https://exemple.be/?a=1&b='x'" title="Qui ? l'IA : oui" class="a:b">l'IA ?</a>`;
  assert.equal(
    typographyHtml(html),
    `<a href="https://exemple.be/?a=1&b='x'" title="Qui ? l'IA : oui" class="a:b">l’IA${NNBSP}?</a>`,
  );
  assert.equal(
    typographyHtml('<meta property="og:url" content="https://exemple.be/l\'IA?x=1">'),
    '<meta property="og:url" content="https://exemple.be/l\'IA?x=1">',
  );
  assert.equal(
    typographyHtml('<meta name="viewport" content="width=device-width, initial-scale=1">'),
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
  );
});

test("alt and aria-label texts are corrected", () => {
  assert.equal(typographyHtml('<img src="/a\'b.webp" alt="l\'IA : test">'), `<img src="/a'b.webp" alt="l’IA${NBSP}: test">`);
  assert.equal(typographyHtml("<img alt='Qui ?'>"), `<img alt='Qui${NNBSP}?'>`);
  assert.equal(typographyHtml('<img alt="">'), '<img alt="">');
  assert.equal(
    typographyHtml('<nav aria-label="Menu de l&#39;association : principal">x</nav>'),
    `<nav aria-label="Menu de l’association${NBSP}: principal">x</nav>`,
  );
});

test("meta description and Open Graph texts are corrected", () => {
  assert.equal(
    typographyHtml('<meta name="description" content="Aide aux devoirs : l&#39;école ?">'),
    `<meta name="description" content="Aide aux devoirs${NBSP}: l’école${NNBSP}?">`,
  );
  assert.equal(
    typographyHtml('<meta property="og:title" content="L\'IA : mon quotidien">'),
    `<meta property="og:title" content="L’IA${NBSP}: mon quotidien">`,
  );
  assert.equal(
    typographyHtml('<meta property="og:description" content="Appelez-nous au 02 435 68 45, de 8h30 à 18h30 !">'),
    `<meta property="og:description" content="Appelez-nous au 02 435 68 45, de 8h30 à 18h30${NNBSP}!">`,
  );
  assert.equal(
    typographyHtml('<meta content="L\'IA : x" property="og:image:alt">'),
    `<meta content="L’IA${NBSP}: x" property="og:image:alt">`,
  );
});

test("URLs and e-mails inside readable attributes are left intact", () => {
  assert.equal(
    typographyHtml('<a aria-label="Écrire à o\'brien@exemple.be : ok" href="mailto:o\'brien@exemple.be">x</a>'),
    `<a aria-label="Écrire à o'brien@exemple.be${NBSP}: ok" href="mailto:o'brien@exemple.be">x</a>`,
  );
  assert.equal(
    typographyHtml('<img alt="Voir https://www.openstreetmap.org/search?query=a">'),
    '<img alt="Voir https://www.openstreetmap.org/search?query=a">',
  );
});

test("attributes in Dutch are left intact", () => {
  assert.equal(
    typographyHtml('<p lang="nl"><img alt="Vragen? Bel ons"> <a aria-label="Info: hier">x</a></p>'),
    '<p lang="nl"><img alt="Vragen? Bel ons"> <a aria-label="Info: hier">x</a></p>',
  );
  assert.equal(typographyHtml('<img lang="nl" alt="Vragen?">'), '<img lang="nl" alt="Vragen?">');
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
