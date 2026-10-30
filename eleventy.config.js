import { existsSync } from "node:fs";
import { RenderPlugin } from "@11ty/eleventy";
import { describeStatus, isPast, todayInBrussels, toIsoDate } from "./lib/activity-status.js";
import { describeBlockingMarkers, findPlaceholders, isProduction } from "./lib/markers.js";
import { typographyHtml } from "./lib/typography.js";
import { imageHtml, galleryHtml, findMissingImages, findMissingReferences } from "./lib/images.js";
import { linkContacts } from "./lib/contact-links.js";
import images from "./src/_data/images.js";
import site from "./src/_data/site.js";

// Added after the typography pass, so it is written with typographic characters.
const MARKER_BANNER =
  '<div class="marker-banner" role="note">Aperçu local\u00A0: cette page contient des marqueurs [DONNÉE À COMPLÉTER] ou [À VÉRIFIER], des blocs provisoires ou des images manquantes. Elle ne pourra pas être publiée tant qu’ils restent.</div>';

const fileExists = (publicPath) => existsSync(`src${publicPath}`);

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

  // Activities shown in the list: published, not past at build time, nearest first.
  // The browser script (/js/activites.js) hides the ones that pass afterwards.
  eleventyConfig.addCollection("upcomingActivities", (collectionApi) =>
    collectionApi
      .getFilteredByTag("activities")
      .filter((item) => !item.data.draft && !isPast(item.data, today))
      .sort((a, b) => toIsoDate(a.data.startDate).localeCompare(toIsoDate(b.data.startDate))),
  );

  eleventyConfig.addFilter("activityIsPast", (data) => isPast(data, today));

  // Prefill link of the contact form (annex C). Only the request type and the
  // activity title and date: never personal data.
  eleventyConfig.addFilter("contactUrl", (topic, activity) => {
    const params = new URLSearchParams({ demande: site.contactTopics[topic] });
    if (activity) {
      const iso = toIsoDate(activity.startDate);
      const date = iso ? frenchDate.format(new Date(`${iso}T00:00:00Z`)) : activity.startDate;
      params.set("activite", `Inscription : ${activity.title} (${date})`);
    }
    return `/contact/?${params.toString().replace(/\+/g, "%20")}#formulaire`;
  });

  eleventyConfig.addFilter("activityStatus", (data, siteData) => describeStatus(data, today, siteData));
  eleventyConfig.addFilter("isoDate", toIsoDate);

  // "6 novembre 2026"; anything that is not a date (a marker) is returned as is.
  eleventyConfig.addFilter("frenchDate", (value) => {
    const iso = toIsoDate(value);
    return iso ? frenchDate.format(new Date(`${iso}T00:00:00Z`)) : value;
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

  // Image slot by code (src/_data/images.js): placeholder until the file exists.
  eleventyConfig.addShortcode("image", (code, options = {}) => {
    const image = images.byCode[code];
    if (!image) throw new Error(`Image inconnue : ${code} (voir src/_data/images.js)`);
    return imageHtml(image, { ...options, exists: fileExists(image.file) });
  });

  eleventyConfig.addShortcode("gallery", (codes) =>
    galleryHtml(
      codes.map((code) => {
        if (!images.byCode[code]) throw new Error(`Image inconnue : ${code} (voir src/_data/images.js)`);
        return images.byCode[code];
      }),
      fileExists,
    ),
  );

  // Photo of an activity (fields 18 and 19), or the default image of its type.
  // On a card, the default image uses its lighter 1 200 × 630 version.
  eleventyConfig.addShortcode("activityImage", (data, options = {}) => {
    const known = images.list.find((i) => i.file === data.photo);
    const typeImage = images.byCode[images.typeDefaults[data.type]];
    const image = data.photo
      ? { ...(known ?? { code: "photo de la fiche", file: data.photo, width: 1536, height: 1024 }), alt: data.photoAlt }
      : options.card
        ? { ...typeImage, file: typeImage.share, width: 1200, height: 630 }
        : typeImage;
    return imageHtml(image, { ...options, exists: fileExists(image.file) });
  });

  eleventyConfig.addFilter("linkContacts", linkContacts);

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
      ...findMissingImages(content).map((i) => `image manquante ${i}`),
      ...findMissingReferences(content, fileExists)
        .filter((path) => !content.includes(`(${path})`))
        .map((path) => `image manquante (${path}), image de partage`),
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
      "\n\nMise en ligne impossible : ces pages contiennent encore des marqueurs, des blocs provisoires ou des images manquantes.\n" +
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
