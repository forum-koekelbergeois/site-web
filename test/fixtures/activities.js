// Test activities (task 4.4). They live here only, never in src/activites/.
// The three workshops mirror annex B, as written in the data-* attributes.
export const workshops = [
  { start: "2026-11-06", end: "", deadline: "", status: "Ouvert", registration: "Téléphone ou message" },
  { start: "2026-11-13", end: "", deadline: "", status: "Ouvert", registration: "Téléphone ou message" },
  { start: "2026-11-20", end: "", deadline: "", status: "Ouvert", registration: "Téléphone ou message" },
];

export const withDeadline = {
  start: "2026-12-10", end: "", deadline: "2026-12-01", status: "Ouvert", registration: "Téléphone ou message",
};

export const freeEntry = {
  start: "2026-12-10", end: "", deadline: "2026-12-01", status: "Ouvert", registration: "Entrée libre",
};

export const partner = {
  start: "2026-12-10", end: "", deadline: "2026-12-01", status: "Ouvert", registration: "Chez un partenaire",
};

export const multiDay = {
  start: "2026-11-02", end: "2026-11-30", deadline: "", status: "Complet avec liste d'attente", registration: "Téléphone ou message",
};
