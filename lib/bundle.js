// Turns lib/ modules into one dependency-free browser script: imports and
// "export" keywords removed, comments and indentation dropped.
import { readFileSync } from "node:fs";

export const libSource = (file) =>
  readFileSync(new URL(`./${file}`, import.meta.url), "utf8")
    .replace(/^import .*$/gm, "")
    .replace(/^export /gm, "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("//"))
    .join("\n");
