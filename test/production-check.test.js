// Final checks on the production build (task 4.7): links, phone numbers and
// e-mails, sitemap, and what must never reach the public site.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { buildSite } from "./helpers/build.js";
import siteData from "../src/_data/site.js";

const site = buildSite("production");
after(() => site.remove());

const SITE_URL = "https://www.forumkoekelbergeois.be";
const textOf = (html) => html.replace(/<(script|style|template)[\s\S]*?<\/\1>/g, "").replace(/<[^>]+>/g, " ");

// Every URL of a page: href, src, srcset, and the site's own absolute URLs.
function urls(html) {
  const found = [...html.matchAll(/\s(?:href|src|content)="([^"]+)"/g)].map((m) => m[1]);
  for (const [, set] of html.matchAll(/\ssrcset="([^"]+)"/g)) found.push(...set.split(",").map((s) => s.trim().split(" ")[0]));
  return found;
}

function target(path) {
  const clean = decodeURI(path.split("#")[0].split("?")[0]);
  if (clean.endsWith("/")) return `${clean}index.html`;
  return clean;
}

test("production build: no blocker, except the privacy page date while it is empty", () => {
  const items = [...new Set(site.log.split("\n").filter((line) => /^\[11ty\]\s+- /.test(line)))];
  if (siteData.privacyUpdated) {
    assert.deepEqual(items, []);
    assert.doesNotMatch(site.log, /Mise en ligne impossible/);
  } else {
    assert.equal(items.length, 1, items.join("\n"));
    assert.match(items[0], /DONNÉE À COMPLÉTER.*Dernière mise à jour/);
  }
});

test("every internal link, image and anchor points to something that exists", () => {
  const ids = Object.fromEntries(site.pages.map((p) => [p.url, new Set([...p.html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]));
  const broken = [];
  for (const page of site.pages) {
    for (const raw of urls(page.html)) {
      let url = raw;
      if (url.startsWith(SITE_URL)) url = url.slice(SITE_URL.length) || "/";
      if (url.startsWith("#")) url = page.url + url;
      if (!url.startsWith("/")) continue;
      const file = target(url);
      if (!site.has(file)) broken.push(`${page.url} -> ${raw}`);
      const anchor = url.split("#")[1];
      if (anchor) {
        const pageUrl = url.split("#")[0].split("?")[0];
        if (!ids[pageUrl]?.has(anchor)) broken.push(`${page.url} -> ${raw} (ancre absente)`);
      }
    }
  }
  assert.deepEqual(broken, []);
});

test("external links: https only, new tab links are protected", () => {
  for (const page of site.pages) {
    for (const [tag] of page.html.matchAll(/<a [^>]*href="(?:https?:)?\/\/[^"]*"[^>]*>/g)) {
      if (tag.includes(SITE_URL)) continue;
      assert.match(tag, /href="https:\/\//, `${page.url}: ${tag}`);
      if (tag.includes('target="_blank"')) assert.match(tag, /rel="[^"]*noopener/, `${page.url}: ${tag}`);
    }
  }
});

test("every phone number and e-mail address shown is a tel: or mailto: link", () => {
  const PHONE = /\b0\d{1,3}(?:[   ]\d{2,3}){2,3}\b/g;
  const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
  const missing = [];
  for (const page of site.pages) {
    const body = page.html.slice(page.html.indexOf("<body"));
    const linked = [...body.matchAll(/<a [^>]*href="(?:tel|mailto):[^"]*"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => m[1].replace(/<[^>]+>/g, ""));
    const outside = textOf(body.replace(/<a [^>]*href="(?:tel|mailto):[^"]*"[^>]*>[\s\S]*?<\/a>/g, " "));
    for (const match of outside.match(PHONE) ?? []) missing.push(`${page.url}: ${match}`);
    for (const match of outside.match(EMAIL) ?? []) missing.push(`${page.url}: ${match}`);
    for (const text of linked) assert.ok(text.trim(), `${page.url}: empty contact link`);
    // A phone number never breaks across two lines: no-break spaces in the text…
    for (const number of textOf(body).match(/\b0\d{1,3}(?:[ \u00A0\u202F]\d{2,3}){2,3}\b/g) ?? []) {
      assert.doesNotMatch(number, /[ \u202F]/, `${page.url}: « ${number} » contains a breaking space`);
    }
    // …and the nowrap class on links.
    for (const [tag] of body.matchAll(/<a [^>]*href="tel:[^"]*"[^>]*>/g)) assert.match(tag, /class="[^"]*\bnowrap\b/, `${page.url}: ${tag}`);
  }
  assert.deepEqual(missing, []);
});

test("nothing forbidden in the public site: « EDD », numbers in 04, test tools", () => {
  const texts = site.files.filter((f) => /\.(html|js|css|xml|txt)$/.test(f)).map((f) => [f, site.read(f)]);
  for (const [file, content] of texts) {
    assert.doesNotMatch(content, /\bEDD\b/, file);
    assert.doesNotMatch(content, /(?:\b04\d{2}[   ]?\d{2}|\+32[ ]?4\d{2})/, file);
    assert.doesNotMatch(content, /date-test/, file);
    assert.doesNotMatch(content, /test-composants/, file);
  }
  assert.equal(site.has("test-composants/index.html"), false);
});

test("sitemap: published pages only, robots.txt allows indexing", () => {
  const sitemap = site.read("sitemap.xml");
  const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE_URL, ""));
  assert.ok(listed.length >= 8, listed.join(" "));
  for (const url of listed) {
    assert.ok(site.has(target(url)), `${url} exists`);
    const page = site.pages.find((p) => p.url === url);
    assert.doesNotMatch(page.html, /name="robots"/, `${url} indexable`);
  }
  for (const excluded of ["/merci/", "/404.html", "/test-composants/"]) assert.ok(!listed.includes(excluded), excluded);
  assert.ok(!listed.some((url) => url.includes("date-a-completer")), "no draft activity");
  // Activities in the sitemap are not over on the build day.
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Brussels" }).format(new Date());
  for (const url of listed.filter((u) => /^\/activites\/\d{4}-/.test(u))) {
    const page = site.pages.find((p) => p.url === url);
    const end = page.html.match(/data-end="([^"]*)"/)[1] || page.html.match(/data-start="([^"]*)"/)[1];
    assert.ok(end >= today, `${url} ended ${end}`);
  }
  assert.equal(site.robots, `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
});
