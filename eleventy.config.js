import { describeStatus, todayInBrussels, toIsoDate } from "./lib/activity-status.js";
import { findBlockingMarkers, isProduction } from "./lib/markers.js";
import { typographyHtml } from "./lib/typography.js";

// Added after the typography pass, so it is written with typographic characters.
const MARKER_BANNER =
  '<div class="marker-banner" role="note">Aperçu local\u00A0: cette page contient des marqueurs [DONNÉE À COMPLÉTER] ou [À VÉRIFIER]. Elle ne pourra pas être publiée tant qu’ils restent.</div>';

const isHtml = (outputPath) => typeof outputPath === "string" && outputPath.endsWith(".html");

export default function (eleventyConfig) {
  const production = isProduction();
  const today = todayInBrussels();

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

  eleventyConfig.addFilter("activityStatus", (data, site) => describeStatus(data, today, site));
  eleventyConfig.addFilter("isoDate", toIsoDate);

  eleventyConfig.addTransform("typography", function (content) {
    if (!isHtml(this.page.outputPath)) return content;
    return typographyHtml(content);
  });

  // Runs after typography: blocks production, shows a banner in local previews.
  eleventyConfig.addTransform("markers", function (content) {
    if (typeof content !== "string") return content;
    const markers = findBlockingMarkers(content);
    if (markers.length === 0) return content;
    if (production) {
      throw new Error(
        `\n\nLa page ${this.page.inputPath} contient encore ${[...new Set(markers)].join(", ")}.\n` +
          "Complétez ou retirez ces marqueurs avant la mise en ligne.\n",
      );
    }
    if (!isHtml(this.page.outputPath)) return content;
    return content.replace(/<body([^>]*)>/, `<body$1>\n${MARKER_BANNER}`);
  });
}

export const config = {
  dir: {
    input: "src",
    output: "_site",
  },
};
