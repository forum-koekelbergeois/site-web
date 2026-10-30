// Builds /js/contact.js from lib/contact-form.js (task 4.5).
import { libSource } from "../../lib/bundle.js";

export default class {
  data() {
    return { permalink: "/js/contact.js", eleventyExcludeFromCollections: true };
  }

  render() {
    return `(() => {\n${libSource("contact-form.js")}\ninit(document, window);\n})();\n`;
  }
}
