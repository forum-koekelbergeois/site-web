import { DEFAULTS, assertValidActivity } from "../../lib/activity-schema.js";
import { isProduction } from "../../lib/markers.js";
import images from "../_data/images.js";
import { activityPermalink } from "../../lib/activity-url.js";

const typeImage = (data) => images.byCode[images.typeDefaults[data.type]];

export default {
  ...DEFAULTS,
  tags: ["activities"],
  layout: "activity.njk",
  permalink: (data) => activityPermalink(data.page.inputPath, data.startDate),
  eleventyComputed: {
    metaTitle: (data) => `${data.title} – Forum Koekelbergeois`,
    description: (data) => data.summary,
    // Share image: the activity photo, or the default image of its type.
    ogImage: (data) => data.photo || typeImage(data)?.share,
    ogImageAlt: (data) => (data.photo ? data.photoAlt : typeImage(data)?.alt),
  },
  eleventyDataSchema(data) {
    assertValidActivity(data, { production: isProduction() });
  },
};
