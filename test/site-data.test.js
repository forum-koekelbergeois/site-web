import { test } from "node:test";
import assert from "node:assert/strict";
import site from "../src/_data/site.js";
import { findBlockingMarkers, describeBlockingMarkers, findPlaceholders } from "../lib/markers.js";

test("homework fee is defined once and shared", () => {
  const paying = site.homeworkSchools.filter((s) => s.id !== "intergenerationnelle");
  for (const school of paying) assert.equal(school.fee, site.homeworkFee);
  assert.equal(site.homeworkSchools.find((s) => s.id === "intergenerationnelle").fee, "gratuite");
});

test("contact sentences render word for word", () => {
  assert.equal(
    `Appelez-nous au ${site.phone.display}, ${site.phone.hours}, ou laissez-nous un message. Nous vous répondons ${site.email.replyDelay}.`,
    "Appelez-nous au 02 435 68 45, du lundi au vendredi de 8h30 à 18h30, ou laissez-nous un message. Nous vous répondons dans les 3 jours ouvrables.",
  );
  assert.equal(
    `Participation : ${site.homeworkSchools[0].fee}`,
    "Participation : 15 € par trimestre",
  );
});

test("no personal mobile number in the shared data", () => {
  assert.doesNotMatch(JSON.stringify(site), /\b04\d{2}/);
});

test("map links are plain OpenStreetMap searches", () => {
  for (const place of Object.values(site.places)) {
    assert.match(place.mapUrl, /^https:\/\/www\.openstreetmap\.org\/search\?query=/);
  }
});

test("blocking markers are detected, [À VENIR] is allowed", () => {
  assert.deepEqual(findBlockingMarkers("a [DONNÉE À COMPLÉTER pour chaque mardi] b"), ["[DONNÉE À COMPLÉTER pour chaque mardi]"]);
  assert.deepEqual(findBlockingMarkers("[À VÉRIFIER : garanties]"), ["[À VÉRIFIER : garanties]"]);
  assert.deepEqual(findBlockingMarkers("[À VENIR] [PROPOSITION À VALIDER]"), []);
});

test("blocking markers are described with their context", () => {
  const html = '<meta name="description" content="[DONNÉE À COMPLÉTER]"><p><em>Dernière mise à jour : [DONNÉE À COMPLÉTER]</em></p>';
  assert.deepEqual(describeBlockingMarkers(html), [
    "[DONNÉE À COMPLÉTER] (métadonnées : description)",
    "[DONNÉE À COMPLÉTER] (après « …Dernière mise à jour : »)",
  ]);
});

test("placeholder blocks are detected", () => {
  assert.deepEqual(findPlaceholders('<div data-placeholder="Formulaire : tâche 4.5">x</div>'), ["Formulaire : tâche 4.5"]);
});
