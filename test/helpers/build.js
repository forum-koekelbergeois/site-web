// Builds the site with a given CONTEXT into a temporary folder and returns its
// pages. A production build may stop on blocking markers after writing its
// files: the files are what the tests check.
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function buildSite(context) {
  const output = mkdtempSync(join(tmpdir(), `site-${context}-`));
  const result = spawnSync(process.execPath, ["node_modules/@11ty/eleventy/cmd.cjs", `--output=${output}`, "--quiet"], {
    env: { ...process.env, CONTEXT: context },
    encoding: "utf8",
  });
  const files = readdirSync(output, { recursive: true }).map(String);
  const pages = files
    .filter((file) => file.endsWith(".html"))
    .map((file) => ({ url: `/${file.replace(/index\.html$/, "")}`, html: readFileSync(join(output, file), "utf8") }));
  const read = (file) => readFileSync(join(output, file), "utf8");
  const has = (path) => existsSync(join(output, path));
  const site = { pages, files, read, has, log: result.stderr + result.stdout };
  return { ...site, robots: read("robots.txt"), remove: () => rmSync(output, { recursive: true, force: true }) };
}
