import { test } from "node:test";
import assert from "node:assert/strict";
import { validateActivity, assertValidActivity, FUNDERS, VENUES, DEFAULTS } from "../lib/activity-schema.js";
import site from "../src/_data/site.js";

const valid = {
  ...DEFAULTS,
  title: "L'IA et les devoirs de mes enfants",
  type: "Atelier",
  audience: "Parents",
  startDate: new Date("2026-11-06T00:00:00Z"),
  schedule: "Le vendredi 6 novembre 2026, de 9h à 12h",
  venue: "Forum Koekelbergeois (rue Herkoliers 17)",
  free: true,
  places: 12,
  summary: "Un atelier pratique d'une matinée.",
  funders: ["urban.brussels (CQD)", "Commune de Koekelberg"],
};

const errorsFor = (changes, options) => validateActivity({ ...valid, ...changes }, options);

test("a complete activity is valid", () => {
  assert.deepEqual(validateActivity(valid), []);
});

test("required fields", () => {
  for (const key of ["title", "type", "audience", "startDate", "schedule", "venue", "status", "registration", "summary"]) {
    const errors = errorsFor({ [key]: "" });
    assert.equal(errors.length, 1, key);
    assert.match(errors[0], /ce champ est obligatoire et il est vide/);
  }
});

test("title: 60 characters at most", () => {
  assert.deepEqual(errorsFor({ title: "x".repeat(60) }), []);
  assert.deepEqual(errorsFor({ title: "x".repeat(61) }), [
    "Champ 1 « Titre » : 61 caractères, alors que 60 au maximum sont permis. Retirez 1 caractère.",
  ]);
  assert.deepEqual(errorsFor({ title: "é".repeat(60) }), []);
});

test("short description: 155 characters at most", () => {
  assert.deepEqual(errorsFor({ summary: "x".repeat(155) }), []);
  assert.match(errorsFor({ summary: "x".repeat(160) })[0], /^Champ 15 « Description courte » : 160 caractères.*Retirez 5 caractères\.$/);
});

test("choice lists", () => {
  assert.match(errorsFor({ type: "Conférence" })[0], /^Champ 2 « Type » : la valeur « Conférence » n'est pas permise/);
  assert.match(errorsFor({ status: "Complet" })[0], /^Champ 11 « Statut »/);
  assert.match(errorsFor({ registration: "Sur place" })[0], /^Champ 12 « Inscription »/);
  assert.match(errorsFor({ venue: "Ailleurs" })[0], /^Champ 7 « Lieu »/);
  assert.match(errorsFor({ funders: ["COCOF", "Région"] })[0], /^Champ 20 « Avec le soutien de » : « Région »/);
});

test("address is required when the venue is « Autre »", () => {
  assert.match(errorsFor({ venue: "Autre" })[0], /^Champ 8 .* obligatoire quand le lieu est « Autre »/);
  assert.deepEqual(errorsFor({ venue: "Autre", venueAddress: "Basilique de Koekelberg" }), []);
});

test("partner name (13a) and details (13b) are required when registration is « Chez un partenaire »", () => {
  const errors = errorsFor({ registration: "Chez un partenaire" });
  assert.equal(errors.length, 2);
  assert.match(errors[0], /^Champ 13a « Nom du partenaire d'inscription » : ce champ est obligatoire quand l'inscription est « Chez un partenaire »/);
  assert.match(errors[1], /^Champ 13b « Coordonnées du partenaire »/);
  assert.match(errorsFor({ registration: "Chez un partenaire", registrationPartnerName: "X" })[0], /^Champ 13b /);
  assert.deepEqual(
    errorsFor({
      registration: "Chez un partenaire",
      registrationPartnerName: "Le Troisième Œil",
      registrationPartnerContact: "02 427 75 42 ou info@3oeil.be",
    }),
    [],
  );
});

test("alternative text is required when there is a photo", () => {
  assert.match(errorsFor({ photo: "/assets/activites/marche.webp" })[0], /^Champ 19 .* une photo est ajoutée/);
  assert.deepEqual(errorsFor({ photo: "/assets/activites/marche.webp", photoAlt: "Un chemin dans un parc" }), []);
});

test("price: « Gratuit » or an amount, not both, not neither", () => {
  assert.deepEqual(errorsFor({ free: undefined, price: "5 € par personne" }), []);
  assert.match(errorsFor({ free: undefined })[0], /^Champ 9 « Prix » : ce champ est obligatoire/);
  assert.match(errorsFor({ free: false })[0], /^Champ 9 « Prix » : ce champ est obligatoire/);
  assert.match(errorsFor({ price: "5 €" })[0], /pas les deux/);
});

test("dates must be readable, end date not before start date", () => {
  assert.match(errorsFor({ startDate: "06/11/2026" })[0], /AAAA-MM-JJ/);
  assert.deepEqual(errorsFor({ endDate: "2026-11-20", registrationDeadline: "2026-11-01" }), []);
  assert.match(errorsFor({ endDate: "2026-11-01" })[0], /avant la date de début/);
});

test("number of places must be a whole number", () => {
  assert.match(errorsFor({ places: "douze" })[0], /^Champ 10 /);
  assert.match(errorsFor({ places: 0 })[0], /^Champ 10 /);
});

test("draft must be true or false", () => {
  assert.deepEqual(errorsFor({ draft: true }), []);
  assert.match(errorsFor({ draft: "oui" })[0], /draft/);
});

test("markers are accepted locally and refused in production", () => {
  const draft = { startDate: "[DONNÉE À COMPLÉTER]", summary: "[DONNÉE À COMPLÉTER]" };
  assert.deepEqual(errorsFor(draft), []);
  const errors = errorsFor(draft, { production: true });
  assert.equal(errors.length, 2);
  assert.match(errors[0], /^Champ 4 « Date de début » : contient encore \[DONNÉE À COMPLÉTER\]/);
});

test("the error names the file and every problem", () => {
  assert.throws(
    () => assertValidActivity({ ...valid, title: "x".repeat(61), audience: "", page: { inputPath: "./src/activites/test.md" } }),
    (error) =>
      error.message.includes("La fiche activité « src/activites/test.md » n'est pas valide") &&
      error.message.includes("Champ 1 « Titre »") &&
      error.message.includes("Champ 3 « Pour qui »"),
  );
});

test("lists stay in sync with the shared site data", () => {
  assert.deepEqual(FUNDERS, site.funders.map((f) => f.name));
  assert.deepEqual(VENUES.slice(0, 2), [site.places.forum.formLabel, site.places.jourdan.formLabel]);
});
