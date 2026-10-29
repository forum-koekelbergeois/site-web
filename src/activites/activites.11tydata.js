import { DEFAULTS, assertValidActivity } from "../../lib/activity-schema.js";
import { isProduction } from "../../lib/markers.js";

export default {
  ...DEFAULTS,
  tags: ["activities"],
  layout: "activity.njk",
  // The full file name (date included) keeps monthly activities with the same title apart.
  permalink: (data) => `/activites/${data.page.inputPath.split("/").pop().replace(/\.md$/, "")}/`,
  eleventyComputed: {
    metaTitle: (data) => `${data.title} – Forum Koekelbergeois`,
    description: (data) => data.summary,
  },
  eleventyDataSchema(data) {
    assertValidActivity(data, { production: isProduction() });
  },
};
