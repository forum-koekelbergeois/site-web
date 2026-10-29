import { DEFAULTS, assertValidActivity } from "../../lib/activity-schema.js";
import { isProduction } from "../../lib/markers.js";
import images from "../_data/images.js";

const typeImage = (data) => images.byCode[images.typeDefaults[data.type]];

export default {
  ...DEFAULTS,
  tags: ["activities"],
  layout: "activity.njk",
  // The full file name (date included) keeps monthly activities with the same title apart.
  permalink: (data) => `/activites/${data.page.inputPath.split("/").pop().replace(/\.md$/, "")}/`,
  eleventyComputed: {
    metaTitle: (data) => `${data.title} – Forum Koekelbergeois`,
    description: (data) => data.summary,
    // Share image: the activity photo, or the default image of its type.
    ogImage: (data) => data.photo || typeImage(data)?.file,
    ogImageAlt: (data) => (data.photo ? data.photoAlt : typeImage(data)?.alt),
  },
  eleventyDataSchema(data) {
    assertValidActivity(data, { production: isProduction() });
  },
};
