import { toIsoDate } from "./activity-status.js";

// Activity URL: start date (field 4) + file name without its date, so monthly
// activities with the same title get one page per date, e.g.
// /activites/2026-12-01-sport-avec-les-mamans/.
export function activityPermalink(inputPath, startDate) {
  const name = inputPath.split("/").pop().replace(/\.md$/, "");
  const slug = name.replace(/^\d{4}-\d{2}-\d{2}-/, "");
  const date = toIsoDate(startDate) ?? "date-a-completer";
  return `/activites/${date}-${slug}/`;
}
