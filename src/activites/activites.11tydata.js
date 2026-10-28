import { DEFAULTS, assertValidActivity } from "../../lib/activity-schema.js";
import { isProduction } from "../../lib/markers.js";

// Activity pages are built in task 4.3; for now the files only feed the collection.
export default {
  ...DEFAULTS,
  tags: ["activities"],
  permalink: false,
  eleventyDataSchema(data) {
    assertValidActivity(data, { production: isProduction() });
  },
};
