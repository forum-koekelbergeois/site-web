import { test } from "node:test";
import assert from "node:assert/strict";
import { activityPermalink } from "../lib/activity-url.js";

test("monthly activity: one URL per date, built from the start date", () => {
  assert.equal(
    activityPermalink("./src/activites/sport-avec-les-mamans.md", new Date("2026-12-01T00:00:00Z")),
    "/activites/2026-12-01-sport-avec-les-mamans/",
  );
  assert.equal(
    activityPermalink("./src/activites/2027-01-05-sport-avec-les-mamans.md", "2027-01-05"),
    "/activites/2027-01-05-sport-avec-les-mamans/",
  );
});

test("the three workshops keep their URL", () => {
  assert.equal(activityPermalink("./src/activites/2026-11-06-ia-devoirs.md", "2026-11-06"), "/activites/2026-11-06-ia-devoirs/");
  assert.equal(activityPermalink("./src/activites/2026-11-13-ia-papiers.md", "2026-11-13"), "/activites/2026-11-13-ia-papiers/");
  assert.equal(activityPermalink("./src/activites/2026-11-20-ia-quotidien.md", "2026-11-20"), "/activites/2026-11-20-ia-quotidien/");
});

test("a missing date shows in the local URL", () => {
  assert.equal(
    activityPermalink("./src/activites/sport-avec-les-mamans.md", "[DONNÉE À COMPLÉTER]"),
    "/activites/date-a-completer-sport-avec-les-mamans/",
  );
});
