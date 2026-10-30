// Builds /js/activites.js: the status module and its browser side in one
// dependency-free file, so the browser runs the same code as the build.
import { libSource as source } from "../../lib/bundle.js";
import { isProduction } from "../../lib/markers.js";

// Outside production only: ?date-test=2026-11-21 simulates the date of the day.
const today = isProduction()
  ? "todayInBrussels()"
  : `(((t) => /^\\d{4}-\\d{2}-\\d{2}$/.test(t) ? t : todayInBrussels())(new URLSearchParams(location.search).get("date-test") || ""))`;

export default class {
  data() {
    return { permalink: "/js/activites.js", eleventyExcludeFromCollections: true };
  }

  render() {
    return `(() => {\n${source("activity-status.js")}\n${source("activity-browser.js")}\nupdate(document, ${today});\n})();\n`;
  }
}
