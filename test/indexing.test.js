import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Builds the site with a given CONTEXT into a temporary folder. A production
// build may stop on blocking markers after writing its files: the files are
// what is checked here.
function build(context) {
  const output = mkdtempSync(join(tmpdir(), `site-${context}-`));
  spawnSync(process.execPath, ["node_modules/@11ty/eleventy/cmd.cjs", `--output=${output}`, "--quiet"], {
    env: { ...process.env, CONTEXT: context },
    encoding: "utf8",
  });
  const pages = readdirSync(output, { recursive: true })
    .filter((file) => file.endsWith(".html"))
    .map((file) => ({ url: `/${file.replace(/index\.html$/, "")}`, html: readFileSync(join(output, file), "utf8") }));
  const robots = readFileSync(join(output, "robots.txt"), "utf8");
  rmSync(output, { recursive: true, force: true });
  return { pages, robots };
}

const robotsMeta = (html) => html.match(/<meta name="robots" content="([^"]*)">/g) ?? [];

test("test versions (branch deploy): nothing can be indexed", () => {
  const { pages, robots } = build("branch-deploy");
  assert.ok(pages.length >= 9);
  for (const { url, html } of pages) {
    assert.deepEqual(robotsMeta(html), ['<meta name="robots" content="noindex, nofollow">'], url);
  }
  assert.equal(robots, "User-agent: *\nDisallow: /\n");
  assert.doesNotMatch(robots, /Sitemap/);
});

test("production: indexing allowed, noindex only on Merci and 404", () => {
  const { pages, robots } = build("production");
  assert.ok(pages.length >= 9);
  const noindex = pages.filter(({ html }) => robotsMeta(html).length).map(({ url, html }) => [url, robotsMeta(html)]);
  assert.deepEqual(noindex.sort(), [
    ["/404.html", ['<meta name="robots" content="noindex">']],
    ["/merci/", ['<meta name="robots" content="noindex">']],
  ]);
  assert.equal(robots, "User-agent: *\nAllow: /\n\nSitemap: https://www.forumkoekelbergeois.be/sitemap.xml\n");
});
