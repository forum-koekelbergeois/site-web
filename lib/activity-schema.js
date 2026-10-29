// Activity form contract (annex A, 20 fields). Do not change without Aymeric's
// approval. Error messages are written for the person editing the activities.
import { STATUS, REGISTRATION, toIsoDate } from "./activity-status.js";
import { findBlockingMarkers } from "./markers.js";

export const TYPES = ["Atelier", "Sortie", "Rencontre", "Cours"];

export const VENUES = [
  "Forum Koekelbergeois (rue Herkoliers 17)",
  "Jourdan Village (rue François Delcoigne 39)",
  "Autre",
];
export const OTHER_VENUE = "Autre";

export const FUNDERS = [
  "COCOF",
  "Fédération Wallonie-Bruxelles",
  "urban.brussels (CQD)",
  "perspective.brussels",
  "Commune de Koekelberg",
];

export const DEFAULTS = {
  status: STATUS.OPEN,
  registration: REGISTRATION.PHONE,
};

// `key` is the front matter key; `field` is the number in annex A.
export const FIELDS = [
  { field: 1, key: "title", label: "Titre", kind: "text", required: true, maxLength: 60 },
  { field: 2, key: "type", label: "Type", kind: "choice", required: true, choices: TYPES },
  { field: 3, key: "audience", label: "Pour qui", kind: "text", required: true },
  { field: 4, key: "startDate", label: "Date de début", kind: "date", required: true },
  { field: 5, key: "endDate", label: "Date de fin", kind: "date" },
  { field: 6, key: "schedule", label: "Dates et horaires en détail", kind: "text", required: true },
  { field: 7, key: "venue", label: "Lieu", kind: "choice", required: true, choices: VENUES },
  {
    field: 8,
    key: "venueAddress",
    label: "Adresse, si « Autre »",
    kind: "text",
    requiredIf: (d) => d.venue === OTHER_VENUE,
    requiredIfText: "le lieu est « Autre »",
  },
  { field: 9, key: "free", label: "Prix (case « Gratuit »)", kind: "boolean" },
  { field: 9, key: "price", label: "Prix (montant)", kind: "text" },
  { field: 10, key: "places", label: "Nombre de places", kind: "count" },
  {
    field: 11,
    key: "status",
    label: "Statut",
    kind: "choice",
    required: true,
    choices: Object.values(STATUS),
  },
  {
    field: 12,
    key: "registration",
    label: "Inscription",
    kind: "choice",
    required: true,
    choices: Object.values(REGISTRATION),
  },
  {
    field: "13a",
    key: "registrationPartnerName",
    label: "Nom du partenaire d'inscription",
    kind: "text",
    requiredIf: (d) => d.registration === REGISTRATION.PARTNER,
    requiredIfText: "l'inscription est « Chez un partenaire »",
  },
  {
    field: "13b",
    key: "registrationPartnerContact",
    label: "Coordonnées du partenaire",
    kind: "text",
    requiredIf: (d) => d.registration === REGISTRATION.PARTNER,
    requiredIfText: "l'inscription est « Chez un partenaire »",
  },
  { field: 14, key: "registrationDeadline", label: "Date limite d'inscription", kind: "date" },
  { field: 15, key: "summary", label: "Description courte", kind: "text", required: true, maxLength: 155 },
  { field: 17, key: "organizedWith", label: "Organisé avec", kind: "text" },
  { field: 18, key: "photo", label: "Photo", kind: "text" },
  {
    field: 19,
    key: "photoAlt",
    label: "Texte alternatif de la photo",
    kind: "text",
    requiredIf: (d) => !isEmpty(d.photo),
    requiredIfText: "une photo est ajoutée",
  },
  { field: 20, key: "funders", label: "Avec le soutien de", kind: "multi", choices: FUNDERS },
];

function isEmpty(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

const quote = (s) => `« ${s} »`;
const list = (choices) => choices.map(quote).join(", ");
const name = (f) => `Champ ${f.field} ${quote(f.label)}`;
const length = (s) => [...s.trim()].length;

function containsMarker(value) {
  return JSON.stringify(value ?? null).match(/\[(?:DONNÉE À COMPLÉTER|À VÉRIFIER)/) !== null;
}

function checkValue(f, value) {
  switch (f.kind) {
    case "text":
      if (typeof value !== "string") return "ce champ doit contenir du texte.";
      if (f.maxLength && length(value) > f.maxLength) {
        const n = length(value);
        return `${n} caractères, alors que ${f.maxLength} au maximum sont permis. Retirez ${n - f.maxLength} caractère${n - f.maxLength > 1 ? "s" : ""}.`;
      }
      return null;
    case "choice":
      if (!f.choices.includes(value)) {
        return `la valeur ${quote(value)} n'est pas permise. Choisissez parmi : ${list(f.choices)}.`;
      }
      return null;
    case "date":
      if (toIsoDate(value) === null) {
        return `la date ${quote(value)} n'est pas lisible. Écrivez-la sous la forme AAAA-MM-JJ, par exemple 2026-11-06.`;
      }
      return null;
    case "boolean":
      if (typeof value !== "boolean") return "la case doit valoir true (cochée) ou false (non cochée).";
      return null;
    case "count":
      if (!Number.isInteger(value) || value < 1) return "indiquez un nombre entier, par exemple 12.";
      return null;
    case "multi": {
      const values = Array.isArray(value) ? value : [value];
      const wrong = values.filter((v) => !f.choices.includes(v));
      if (wrong.length) {
        return `${list(wrong)} ne fait pas partie de la liste. Choisissez parmi : ${list(f.choices)}.`;
      }
      return null;
    }
  }
  return null;
}

// Returns a list of French error messages (empty when the activity is valid).
// In production, any blocking marker is an error, since the page would be published.
export function validateActivity(data, { production = false } = {}) {
  const errors = [];

  for (const f of FIELDS) {
    const value = data[f.key];
    if (isEmpty(value)) {
      if (f.required) errors.push(`${name(f)} : ce champ est obligatoire et il est vide.`);
      else if (f.requiredIf?.(data)) {
        errors.push(`${name(f)} : ce champ est obligatoire quand ${f.requiredIfText}, et il est vide.`);
      }
      continue;
    }
    if (containsMarker(value)) {
      if (production) {
        errors.push(`${name(f)} : contient encore ${findBlockingMarkers(JSON.stringify(value)).join(", ")}. Complétez-le avant la mise en ligne.`);
      }
      continue;
    }
    const problem = checkValue(f, value);
    if (problem) errors.push(`${name(f)} : ${problem}`);
  }

  const free = data.free === true;
  const hasPrice = !isEmpty(data.price);
  if (!free && !hasPrice) {
    errors.push("Champ 9 « Prix » : ce champ est obligatoire. Cochez « Gratuit » (free: true) ou indiquez un montant (price).");
  } else if (free && hasPrice) {
    errors.push("Champ 9 « Prix » : choisissez soit « Gratuit », soit un montant, pas les deux.");
  }

  const start = toIsoDate(data.startDate);
  const end = toIsoDate(data.endDate);
  if (start && end && end < start) {
    errors.push("Champ 5 « Date de fin » : elle tombe avant la date de début (champ 4).");
  }

  if (data.draft !== undefined && typeof data.draft !== "boolean") {
    errors.push("Champ technique « draft » : il doit valoir true (brouillon) ou false.");
  }

  return errors;
}

export function assertValidActivity(data, options) {
  const errors = validateActivity(data, options);
  if (errors.length) {
    const file = data.page?.inputPath?.replace(/^\.\//, "") ?? "fiche inconnue";
    throw new Error(
      `\n\nLa fiche activité ${quote(file)} n'est pas valide :\n` +
        errors.map((e) => `  - ${e}`).join("\n") +
        "\n\nCorrigez la fiche puis relancez la construction du site.\n",
    );
  }
}
