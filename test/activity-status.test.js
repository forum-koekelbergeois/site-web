import { test } from "node:test";
import assert from "node:assert/strict";
import {
  showsForumButtons,
  STATUS,
  REGISTRATION,
  FREE_ENTRY,
  toIsoDate,
  todayInBrussels,
  isPast,
  effectiveStatus,
  cardLabel,
  registrationText,
  describeStatus,
} from "../lib/activity-status.js";
import site from "../src/_data/site.js";

const workshop = {
  startDate: new Date("2026-11-06T00:00:00Z"),
  status: STATUS.OPEN,
  registration: REGISTRATION.PHONE,
};

test("toIsoDate accepts YAML dates and ISO strings only", () => {
  assert.equal(toIsoDate(new Date("2026-11-06T00:00:00Z")), "2026-11-06");
  assert.equal(toIsoDate("2026-11-06"), "2026-11-06");
  assert.equal(toIsoDate("06/11/2026"), null);
  assert.equal(toIsoDate("[DONNÉE À COMPLÉTER]"), null);
  assert.equal(toIsoDate(undefined), null);
});

test("today in Brussels switches at local midnight in winter (UTC+1)", () => {
  assert.equal(todayInBrussels(new Date("2026-11-06T22:59:59Z")), "2026-11-06");
  assert.equal(todayInBrussels(new Date("2026-11-06T23:00:00Z")), "2026-11-07");
});

test("today in Brussels switches at local midnight in summer (UTC+2)", () => {
  assert.equal(todayInBrussels(new Date("2026-07-14T21:59:59Z")), "2026-07-14");
  assert.equal(todayInBrussels(new Date("2026-07-14T22:00:00Z")), "2026-07-15");
});

test("today in Brussels around daylight saving changes", () => {
  // 25 October 2026: clocks go back at 03:00 CEST.
  assert.equal(todayInBrussels(new Date("2026-10-24T21:59:59Z")), "2026-10-24");
  assert.equal(todayInBrussels(new Date("2026-10-24T22:00:00Z")), "2026-10-25");
  assert.equal(todayInBrussels(new Date("2026-10-25T22:59:59Z")), "2026-10-25");
  assert.equal(todayInBrussels(new Date("2026-10-25T23:00:00Z")), "2026-10-26");
  // 29 March 2026: clocks go forward at 02:00 CET.
  assert.equal(todayInBrussels(new Date("2026-03-28T22:59:59Z")), "2026-03-28");
  assert.equal(todayInBrussels(new Date("2026-03-29T22:00:00Z")), "2026-03-30");
});

test("an activity without end date is past the day after its start date", () => {
  assert.equal(isPast(workshop, "2026-11-05"), false);
  assert.equal(isPast(workshop, "2026-11-06"), false);
  assert.equal(isPast(workshop, "2026-11-07"), true);
});

test("an activity with an end date is past the day after its end date", () => {
  const multiDay = { ...workshop, endDate: "2026-11-20" };
  assert.equal(isPast(multiDay, "2026-11-07"), false);
  assert.equal(isPast(multiDay, "2026-11-20"), false);
  assert.equal(isPast(multiDay, "2026-11-21"), true);
});

test("an activity is hidden from midnight, Brussels time", () => {
  const before = todayInBrussels(new Date("2026-11-06T22:59:59Z"));
  const after = todayInBrussels(new Date("2026-11-06T23:00:00Z"));
  assert.equal(isPast(workshop, before), false);
  assert.equal(isPast(workshop, after), true);
});

test("an activity without a readable date is never past", () => {
  assert.equal(isPast({ startDate: "[DONNÉE À COMPLÉTER]" }, "2030-01-01"), false);
});

test("effective status follows the activity status", () => {
  for (const status of Object.values(STATUS)) {
    assert.equal(effectiveStatus({ ...workshop, status }, "2026-11-01"), status);
  }
});

test("free entry overrides the status", () => {
  const free = { ...workshop, status: STATUS.CLOSED, registration: REGISTRATION.FREE_ENTRY };
  assert.equal(effectiveStatus(free, "2026-11-01"), FREE_ENTRY);
  const freeWithDeadline = { ...free, registrationDeadline: "2026-10-01" };
  assert.equal(effectiveStatus(freeWithDeadline, "2026-11-01"), FREE_ENTRY);
});

test("registration closes the day after the deadline, even when open or full", () => {
  const open = { ...workshop, registrationDeadline: "2026-11-03" };
  assert.equal(effectiveStatus(open, "2026-11-03"), STATUS.OPEN);
  assert.equal(effectiveStatus(open, "2026-11-04"), STATUS.CLOSED);
  const full = { ...open, status: STATUS.WAITLIST };
  assert.equal(effectiveStatus(full, "2026-11-04"), STATUS.CLOSED);
});

test("deadline closes at midnight, Brussels time", () => {
  const open = { ...workshop, registrationDeadline: new Date("2026-11-03T00:00:00Z") };
  assert.equal(effectiveStatus(open, todayInBrussels(new Date("2026-11-03T22:59:59Z"))), STATUS.OPEN);
  assert.equal(effectiveStatus(open, todayInBrussels(new Date("2026-11-03T23:00:00Z"))), STATUS.CLOSED);
});

test("card labels match the Activités page table", () => {
  assert.equal(cardLabel(STATUS.OPEN), "Inscriptions ouvertes");
  assert.equal(cardLabel(STATUS.WAITLIST), "Complet, liste d'attente");
  assert.equal(cardLabel(STATUS.CLOSED), "Inscriptions clôturées");
  assert.equal(cardLabel(FREE_ENTRY), "Entrée libre");
});

test("annex A2 texts, word for word", () => {
  const today = "2026-11-01";
  assert.equal(
    registrationText(workshop, today, site),
    "Pour vous inscrire, appelez-nous au 02 435 68 45, du lundi au vendredi de 8h30 à 18h30, ou laissez-nous un message. Nous vous répondons dans les 3 jours ouvrables.",
  );
  assert.equal(
    registrationText({ ...workshop, status: STATUS.WAITLIST }, today, site),
    "Cette activité est complète. Appelez-nous ou laissez-nous un message : nous vous inscrivons sur la liste d'attente et nous vous prévenons dès qu'une place se libère.",
  );
  assert.equal(
    registrationText({ ...workshop, status: STATUS.CLOSED }, today, site),
    "Les inscriptions sont clôturées. Découvrez nos autres activités.",
  );
  assert.equal(
    registrationText({ ...workshop, registration: REGISTRATION.FREE_ENTRY }, today, site),
    "Entrée libre, sans inscription.",
  );
});

test("the closed text replaces the open text once the deadline is past", () => {
  const open = { ...workshop, registrationDeadline: "2026-11-03" };
  assert.match(registrationText(open, "2026-11-03", site), /^Pour vous inscrire/);
  assert.equal(
    registrationText(open, "2026-11-04", site),
    "Les inscriptions sont clôturées. Découvrez nos autres activités.",
  );
});

test("describeStatus combines everything for a template", () => {
  assert.deepEqual(describeStatus(workshop, "2026-11-07", site), {
    past: true,
    status: STATUS.OPEN,
    label: "Inscriptions ouvertes",
    text: registrationText(workshop, "2026-11-07", site),
    buttons: true,
  });
});

const partnerActivity = {
  ...workshop,
  registration: REGISTRATION.PARTNER,
  registrationPartnerName: "Le Troisième Œil",
  registrationPartnerContact: "02 427 75 42 ou info@3oeil.be",
};

test("partner registration, status Ouvert", () => {
  assert.equal(
    registrationText(partnerActivity, "2026-11-01", site),
    "Les inscriptions se font auprès de notre partenaire, Le Troisième Œil : 02 427 75 42 ou info@3oeil.be.",
  );
  assert.equal(describeStatus(partnerActivity, "2026-11-01", site).label, "Inscriptions ouvertes");
});

test("partner registration, status Complet", () => {
  const full = { ...partnerActivity, status: STATUS.WAITLIST };
  assert.equal(
    registrationText(full, "2026-11-01", site),
    "Cette activité est complète. Pour la liste d'attente, contactez notre partenaire, Le Troisième Œil : 02 427 75 42 ou info@3oeil.be.",
  );
  assert.equal(describeStatus(full, "2026-11-01", site).label, "Complet, liste d'attente");
});

test("partner registration, status Clôturé or deadline past: closed text without details", () => {
  const closedText = "Les inscriptions sont clôturées. Découvrez nos autres activités.";
  assert.equal(registrationText({ ...partnerActivity, status: STATUS.CLOSED }, "2026-11-01", site), closedText);
  const deadline = { ...partnerActivity, registrationDeadline: "2026-10-31" };
  assert.equal(registrationText(deadline, "2026-11-01", site), closedText);
});

test("Forum buttons: phone or message registration, open or full only", () => {
  const today = "2026-11-01";
  assert.equal(showsForumButtons(workshop, today), true);
  assert.equal(showsForumButtons({ ...workshop, status: STATUS.WAITLIST }, today), true);
  assert.equal(showsForumButtons({ ...workshop, status: STATUS.CLOSED }, today), false);
  assert.equal(showsForumButtons({ ...workshop, registrationDeadline: "2026-10-31" }, today), false);
  assert.equal(showsForumButtons({ ...workshop, registration: REGISTRATION.FREE_ENTRY }, today), false);
  for (const status of Object.values(STATUS)) {
    assert.equal(showsForumButtons({ ...partnerActivity, status }, today), false, status);
  }
});
