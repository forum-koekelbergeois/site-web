// Builds /js/activites.js: the status module and its browser side in one
// dependency-free file, so the browser runs the same code as the build.
import { readFileSync } from "node:fs";
import { isProduction } from "../../lib/markers.js";

const source = (file) =>
  readFileSync(new URL(`../../lib/${file}`, import.meta.url), "utf8")
    .replace(/^import .*$/gm, "")
    .replace(/^export /gm, "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("//"))
    .join("\n");

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
