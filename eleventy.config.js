import { RenderPlugin } from "@11ty/eleventy";
import { describeStatus, todayInBrussels, toIsoDate } from "./lib/activity-status.js";
import { describeBlockingMarkers, findPlaceholders, isProduction } from "./lib/markers.js";
import { typographyHtml } from "./lib/typography.js";
import site from "./src/_data/site.js";

// Added after the typography pass, so it is written with typographic characters.
const MARKER_BANNER =
  '<div class="marker-banner" role="note">Aperçu local\u00A0: cette page contient des marqueurs [DONNÉE À COMPLÉTER] ou [À VÉRIFIER], ou des blocs provisoires. Elle ne pourra pas être publiée tant qu’ils restent.</div>';

const isHtml = (outputPath) => typeof outputPath === "string" && outputPath.endsWith(".html");

const frenchDate = new Intl.DateTimeFormat("fr-BE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default function (eleventyConfig) {
  const production = isProduction();
  const today = todayInBrussels();
  // Everything that blocks a production build, collected over all pages.
  const blocking = [];

  eleventyConfig.addPlugin(RenderPlugin);

  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy({
    "src/assets/favicon.ico": "favicon.ico",
    "src/robots.txt": "robots.txt",
  });
  eleventyConfig.ignores.add("src/assets-source/**");

  // Drafts (activities and test pages) are visible locally, never in production.
  eleventyConfig.addPreprocessor("drafts", "*", (data) => {
    if (data.draft && production) return false;
  });

  eleventyConfig.addGlobalData("today", today);

  eleventyConfig.addCollection("activitiesByDate", (collectionApi) =>
    collectionApi.getFilteredByTag("activities").sort((a, b) => {
      const da = toIsoDate(a.data.startDate) ?? "9999-12-31";
      const db = toIsoDate(b.data.startDate) ?? "9999-12-31";
      return da.localeCompare(db);
    }),
  );

  eleventyConfig.addFilter("activityStatus", (data, siteData) => describeStatus(data, today, siteData));
  eleventyConfig.addFilter("isoDate", toIsoDate);

  // "6 novembre 2026"; anything that is not a date (a marker) is returned as is.
  eleventyConfig.addFilter("frenchDate", (value) => {
    const iso = toIsoDate(value);
    return iso ? frenchDate.format(new Date(`${iso}T00:00:00Z`)) : value;
  });

  // "06/11/2026", as in annex A.
  eleventyConfig.addFilter("shortDate", (value) => {
    const iso = toIsoDate(value);
    return iso ? iso.split("-").reverse().join("/") : value;
  });

  // Venue of an activity (annex A, fields 7 and 8): name, address and map link.
  eleventyConfig.addFilter("activityPlace", (data) => {
    const place = Object.values(site.places).find((p) => p.formLabel === data.venue);
    if (place) return place;
    return {
      address: data.venueAddress,
      mapUrl: `https://www.openstreetmap.org/search?query=${encodeURIComponent(data.venueAddress ?? "")}`,
    };
  });

  eleventyConfig.addFilter("fundersByName", (names = []) =>
    site.funders.filter((funder) => names.includes(funder.name)),
  );

  eleventyConfig.addShortcode(
    "phoneLink",
    () => `<a class="nowrap" href="${site.phone.href}">${site.phone.display}</a>`,
  );

  // Logos keep a white background; files are 2x their display size.
  eleventyConfig.addShortcode("logoList", (logos = []) => {
    const items = logos.map(
      (logo) =>
        `<li><img src="${logo.logo}" width="${Math.round(logo.width / 2)}" height="${Math.round(logo.height / 2)}" alt="${logo.name}" loading="lazy"></li>`,
    );
    return `<ul class="logos">${items.join("")}</ul>`;
  });

  eleventyConfig.addShortcode(
    "comingPhoto",
    (loading = "lazy") =>
      `<img class="photo" src="/assets/placeholder.svg" width="1200" height="800" alt="" loading="${loading}">`,
  );

  eleventyConfig.addTransform("typography", function (content) {
    if (!isHtml(this.page.outputPath)) return content;
    return typographyHtml(content);
  });

  // Runs after typography: blocks production, shows a banner in local previews.
  eleventyConfig.addTransform("markers", function (content) {
    if (typeof content !== "string") return content;
    const found = [
      ...describeBlockingMarkers(content),
      ...findPlaceholders(content).map((p) => `bloc provisoire « ${p} »`),
    ];
    if (found.length === 0) return content;
    if (production) {
      blocking.push({ page: this.page.inputPath, found });
      return content;
    }
    if (!isHtml(this.page.outputPath)) return content;
    return content.replace(/<body([^>]*)>/, `<body$1>\n${MARKER_BANNER}`);
  });

  eleventyConfig.on("eleventy.after", () => {
    if (blocking.length === 0) return;
    const lines = blocking.flatMap(({ page, found }) => [
      `  ${page}`,
      ...found.map((item) => `    - ${item.replace(/\s+/g, " ")}`),
    ]);
    blocking.length = 0;
    throw new Error(
      "\n\nMise en ligne impossible : ces pages contiennent encore des marqueurs ou des blocs provisoires.\n" +
        `${lines.join("\n")}\n` +
        "Complétez ou retirez-les, puis relancez la construction.\n",
    );
  });
}

export const config = {
  dir: {
    input: "src",
    output: "_site",
  },
};
