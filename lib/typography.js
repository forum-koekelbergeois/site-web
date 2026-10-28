// French typography, applied to the text of HTML pages at build time.
// Dependency-free so the browser script (task 4.4) can reuse it.
const NBSP = " ";
const NNBSP = " ";

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
    .replace(/«[   ]*/g, `«${NBSP}`)
    .replace(/[   ]*»/g, `${NBSP}»`)
    // Existing spaces before ; ! ? and : become the right non-breaking space.
    .replace(/[   ]+([;!?])/g, `${NNBSP}$1`)
    .replace(/[   ]+:/g, `${NBSP}:`)
    // Missing spaces: only when the sign ends a word, to keep 8:30 or a?b intact.
    .replace(/([^\s  ;:!?«(\[])([;!?]+)(?=[\s »)\]]|$)/g, `$1${NNBSP}$2`)
    .replace(/([^\s  \d;:!?«(\[]):(?=[\s »)\]]|$)/g, `$1${NBSP}:`);
  if (atStart) {
    t = t.replace(/^([;!?])/, `${NNBSP}$1`).replace(/^:(?=\s|$)/, `${NBSP}:`);
  }
  return t;
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

// Typography for an HTML document or fragment. Only text nodes are changed.
export function typographyHtml(html) {
  // Each open element records whether its content is skipped.
  const stack = [];
  const skipped = () => stack.length > 0 && stack[stack.length - 1].skip;
  let out = "";
  let last = 0;
  let afterInlineTag = false;

  const flushText = (text) => {
    if (!text) return;
    if (skipped()) {
      out += text;
    } else {
      const decoded = text.replace(/&nbsp;/g, NBSP).replace(/&#39;|&#x27;|&apos;/g, "'");
      out += typographyText(decoded, { atStart: afterInlineTag });
    }
  };

  for (const match of html.matchAll(TOKEN)) {
    flushText(html.slice(last, match.index));
    out += match[0];
    last = match.index + match[0].length;

    const tag = match[1]?.toLowerCase();
    if (!tag) continue;
    const isClosing = match[0].startsWith("</");
    const attributes = match[2] ?? "";
    afterInlineTag = true;

    if (isClosing) {
      const index = stack.map((e) => e.tag).lastIndexOf(tag);
      if (index !== -1) stack.length = index;
      continue;
    }
    if (VOID_ELEMENTS.has(tag) || attributes.trim().endsWith("/")) continue;

    const lang = attributes.match(LANG)?.[1]?.toLowerCase();
    const parentSkip = skipped();
    let skip = parentSkip || SKIPPED_ELEMENTS.has(tag);
    if (lang) skip = SKIPPED_ELEMENTS.has(tag) || lang === "nl" || lang.startsWith("nl-");
    if (parentSkip && SKIPPED_ELEMENTS.has(stack[stack.length - 1].tag)) skip = true;
    stack.push({ tag, skip });
  }
  flushText(html.slice(last));
  return out;
}
