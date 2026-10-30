import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { fromDataset, listState, pageState, update } from "../lib/activity-browser.js";
import { todayInBrussels } from "../lib/activity-status.js";
import { workshops, withDeadline, freeEntry, partner, multiDay } from "./fixtures/activities.js";

const visibleCount = (datasets, today) =>
  listState(datasets.map(fromDataset), today).items.filter((i) => i.visible).length;

// Minimal stand-ins for the page, enough for update().
function listDoc(datasets) {
  const cards = datasets.map((dataset) => {
    const label = { textContent: "Inscriptions ouvertes", className: "status-label status-label--ouvert" };
    return { dataset, hidden: false, label, querySelector: (s) => (s === "[data-status-label]" ? label : null) };
  });
  const empty = { hidden: true };
  return {
    cards,
    empty,
    querySelectorAll: (s) => (s === "[data-activity-card]" ? cards : []),
    querySelector: (s) => (s === "[data-activity-empty]" ? empty : null),
    getElementById: () => null,
  };
}

function pageDoc(dataset) {
  const block = { content: "AS BUILT", replaceChildren(node) { this.content = node; } };
  const page = { dataset, querySelector: (s) => (s === "[data-registration]" ? block : null) };
  const templates = {
    "inscription-past": { content: { cloneNode: () => "TERMINÉE" } },
    "inscription-closed": { content: { cloneNode: () => "CLÔTURÉE" } },
  };
  return {
    block,
    querySelectorAll: () => [],
    querySelector: (s) => (s === "[data-activity-page]" ? page : null),
    getElementById: (id) => templates[id] ?? null,
  };
}

test("before 6 November: the three workshops are visible", () => {
  assert.equal(visibleCount(workshops, "2026-11-05"), 3);
  assert.equal(visibleCount(workshops, "2026-11-06"), 3);
});

test("7 November: two workshops left", () => {
  assert.equal(visibleCount(workshops, "2026-11-07"), 2);
});

test("14 November: one workshop left", () => {
  assert.equal(visibleCount(workshops, "2026-11-14"), 1);
});

test("21 November: no workshop left, the « Aucune activité ouverte » text shows", () => {
  const doc = listDoc(workshops);
  update(doc, "2026-11-21");
  assert.deepEqual(doc.cards.map((c) => c.hidden), [true, true, true]);
  assert.equal(doc.empty.hidden, false);
});

test("the text stays hidden while a card is visible", () => {
  const doc = listDoc(workshops);
  update(doc, "2026-11-14");
  assert.deepEqual(doc.cards.map((c) => c.hidden), [true, true, false]);
  assert.equal(doc.empty.hidden, true);
});

test("a multi-day activity stays visible until its end date", () => {
  assert.equal(visibleCount([multiDay], "2026-11-30"), 1);
  assert.equal(visibleCount([multiDay], "2026-12-01"), 0);
});

test("deadline passed: the card label becomes « Inscriptions clôturées »", () => {
  const doc = listDoc([withDeadline]);
  update(doc, "2026-12-01");
  assert.equal(doc.cards[0].label.textContent, "Inscriptions ouvertes");
  update(doc, "2026-12-02");
  assert.equal(doc.cards[0].label.textContent, "Inscriptions clôturées");
  assert.equal(doc.cards[0].label.className, "status-label status-label--cloture");
  assert.equal(doc.cards[0].hidden, false);
});

test("deadline passed: the activity page shows the closed text, without buttons", () => {
  const doc = pageDoc(withDeadline);
  update(doc, "2026-12-01");
  assert.equal(doc.block.content, "AS BUILT");
  update(doc, "2026-12-02");
  assert.equal(doc.block.content, "CLÔTURÉE");
});

test("past activity page: the « terminée » text replaces the registration block", () => {
  const doc = pageDoc(workshops[0]);
  update(doc, "2026-11-06");
  assert.equal(doc.block.content, "AS BUILT");
  update(doc, "2026-11-07");
  assert.equal(doc.block.content, "TERMINÉE");
});

test("free entry: never closed by a deadline, hidden once past", () => {
  assert.equal(pageState(fromDataset(freeEntry), "2026-12-05"), null);
  const doc = listDoc([freeEntry]);
  update(doc, "2026-12-05");
  assert.equal(doc.cards[0].label.textContent, "Inscriptions ouvertes");
  assert.equal(pageState(fromDataset(freeEntry), "2026-12-11"), "past");
});

test("partner registration: closed after the deadline, then past", () => {
  assert.equal(pageState(fromDataset(partner), "2026-12-01"), null);
  assert.equal(pageState(fromDataset(partner), "2026-12-02"), "closed");
  assert.equal(pageState(fromDataset(partner), "2026-12-11"), "past");
});

// The file actually sent to browsers, run in an isolated context.
async function bundle(context) {
  process.env.CONTEXT = context;
  const { default: Template } = await import(`../src/js/activites.11ty.js?context=${context}`);
  delete process.env.CONTEXT;
  return new Template().render();
}

function run(code, doc, search) {
  vm.runInNewContext(code, { document: doc, location: { search }, URLSearchParams, Intl });
}

test("bundled script: under 5 KB, no import or export left", async () => {
  for (const context of ["dev", "production"]) {
    const code = await bundle(context);
    assert.ok(Buffer.byteLength(code) < 5 * 1024, `${context}: ${Buffer.byteLength(code)} bytes`);
    assert.doesNotMatch(code, /^\s*(import|export)\s/m);
  }
});

test("bundled script, local preview: ?date-test simulates the day", async () => {
  const code = await bundle("dev");
  const doc = listDoc(workshops);
  run(code, doc, "?date-test=2026-11-21");
  assert.equal(doc.empty.hidden, false);
  const page = pageDoc(workshops[2]);
  run(code, page, "?date-test=2026-11-21");
  assert.equal(page.block.content, "TERMINÉE");
});

test("bundled script, production: no date-test, today's date in Brussels is used", async () => {
  const code = await bundle("production");
  assert.doesNotMatch(code, /date-test/);
  const doc = listDoc(workshops);
  run(code, doc, "?date-test=2026-11-21");
  const expected = visibleCount(workshops, todayInBrussels());
  assert.equal(doc.cards.filter((c) => !c.hidden).length, expected);
});
