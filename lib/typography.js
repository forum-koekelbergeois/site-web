// French typography, applied to the text of HTML pages at build time.
// Dependency-free so the browser script (task 4.4) can reuse it.
const NBSP = "\u00A0";
const NNBSP = "\u202F";

// Elements whose content is never changed.
const SKIPPED_ELEMENTS = new Set(["script", "style", "code", "pre", "kbd", "samp", "textarea"]);

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "source", "track", "wbr",
]);

// Pieces of text left untouched: URLs, e-mail addresses and HTML entities.
const PROTECTED = /(?:https?:\/\/|www\.)[^\s<]+|[^\s<>@]+@[^\s<>@]+\.[a-z]{2,}|&(?:#\d+|#x[\da-f]+|[a-z]+\d*);/gi;

function fixPlainText(text, atStart) {
  let t = text
    .replace(/'/g, "’")
    .replace(/«[ \u00A0\u202F]*/g, `«${NBSP}`)
    .replace(/[ \u00A0\u202F]*»/g, `${NBSP}»`)
    // Existing spaces before ; ! ? and : become the right non-breaking space.
    .replace(/[ \u00A0\u202F]+([;!?])/g, `${NNBSP}$1`)
    .replace(/[ \u00A0\u202F]+:/g, `${NBSP}:`)
    // Missing spaces: only when the sign ends a word, to keep 8:30 or a?b intact.
    .replace(/([^\s\u00A0\u202F;:!?«(\[])([;!?]+)(?=[\s\u00A0»)\]]|$)/g, `$1${NNBSP}$2`)
    .replace(/([^\s\u00A0\u202F\d;:!?«(\[]):(?=[\s\u00A0»)\]]|$)/g, `$1${NBSP}:`);
  if (atStart) {
    t = t.replace(/^([;!?])/, `${NNBSP}$1`).replace(/^:(?=\s|$)/, `${NBSP}:`);
  }
  return t;
}

// Phone numbers shown in text (02 435 68 45, numbers typed in an activity
// file…): their groups are joined by no-break spaces so they never break
// across lines. Applies to Dutch text too; tel: links are attributes, untouched.
const PHONE = /(?<![\d+])0\d{1,3}(?:[ \u00A0\u202F]\d{2,3}){2,3}(?!\d)/g;

export function keepPhonesTogether(text) {
  return text.replace(PHONE, (number) => number.replace(/[ \u202F]/g, NBSP));
}

// Typography for a plain text string (no HTML).
export function typographyText(text, { atStart = false } = {}) {
  let out = "";
  let last = 0;
  for (const match of text.matchAll(PROTECTED)) {
    out += fixPlainText(text.slice(last, match.index), atStart && last === 0);
    out += match[0];
    last = match.index + match[0].length;
  }
  return out + fixPlainText(text.slice(last), atStart && last === 0);
}

const TOKEN = /<!--[\s\S]*?-->|<!doctype[^>]*>|<\/?([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/gi;
const LANG = /\blang\s*=\s*["']?([\w-]+)/i;

// Attributes read by people (screen readers, search results, link previews).
const TEXT_ATTRIBUTES = /(\s(?:alt|aria-label)\s*=\s*)(["'])([\s\S]*?)\2/gi;
const META_TEXT = /\s(?:name|property)\s*=\s*["'](?:description|og:title|og:description|og:image:alt)["']/i;
const CONTENT_ATTRIBUTE = /(\scontent\s*=\s*)(["'])([\s\S]*?)\2/i;

function decodeForTypography(text) {
  return text.replace(/&nbsp;/g, NBSP).replace(/&#39;|&#x27;|&apos;/g, "'");
}

function fixAttributes(tagSource, tag, attributes) {
  const fix = (_, prefix, quote, value) =>
    `${prefix}${quote}${typographyText(decodeForTypography(value))}${quote}`;
  let result = tagSource.replace(TEXT_ATTRIBUTES, fix);
  if (tag === "meta" && META_TEXT.test(attributes)) {
    result = result.replace(CONTENT_ATTRIBUTE, fix);
  }
  return result;
}

// Typography for an HTML document or fragment. Text nodes and human-readable
// attributes (alt, aria-label, meta description and Open Graph texts) are changed.
export function typographyHtml(html) {
  // Each open element records whether its content is skipped (French rules)
  // and whether it is code (left exactly as is, phone numbers included).
  const stack = [];
  const skipped = () => stack.length > 0 && stack[stack.length - 1].skip;
  const isCode = () => stack.some((e) => SKIPPED_ELEMENTS.has(e.tag));
  let out = "";
  let last = 0;
  let afterInlineTag = false;

  const flushText = (text) => {
    if (!text) return;
    if (isCode()) out += text;
    else if (skipped()) out += keepPhonesTogether(text);
    else out += keepPhonesTogether(typographyText(decodeForTypography(text), { atStart: afterInlineTag }));
  };

  for (const match of html.matchAll(TOKEN)) {
    flushText(html.slice(last, match.index));
    last = match.index + match[0].length;

    const tag = match[1]?.toLowerCase();
    if (!tag) {
      out += match[0];
      continue;
    }
    const isClosing = match[0].startsWith("</");
    const attributes = match[2] ?? "";
    afterInlineTag = true;

    if (isClosing) {
      out += match[0];
      const index = stack.map((e) => e.tag).lastIndexOf(tag);
      if (index !== -1) stack.length = index;
      continue;
    }

    const lang = attributes.match(LANG)?.[1]?.toLowerCase();
    const parentSkip = skipped();
    let skip = parentSkip || SKIPPED_ELEMENTS.has(tag);
    if (lang) skip = SKIPPED_ELEMENTS.has(tag) || lang === "nl" || lang.startsWith("nl-");
    if (parentSkip && SKIPPED_ELEMENTS.has(stack[stack.length - 1].tag)) skip = true;

    out += skip ? match[0] : fixAttributes(match[0], tag, attributes);
    if (VOID_ELEMENTS.has(tag) || attributes.trim().endsWith("/")) continue;
    stack.push({ tag, skip });
  }
  flushText(html.slice(last));
  return out;
}
