import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSite } from "./helpers/build.js";

function build(context) {
  const site = buildSite(context);
  site.remove();
  return site;
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
