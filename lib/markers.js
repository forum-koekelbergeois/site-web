// Content markers. Blocking markers must never reach a production build.
const BLOCKING = /\[(?:DONNÉE À COMPLÉTER|À VÉRIFIER)[^\]]*\]/g;

// Temporary blocks waiting for a later task, e.g. data-placeholder="Formulaire : tâche 4.5".
const PLACEHOLDER = /data-placeholder="([^"]*)"/g;

export function findBlockingMarkers(text) {
  if (typeof text !== "string") return [];
  return text.match(BLOCKING) ?? [];
}

// Each blocking marker with a hint of where it is: the visible text just
// before it, or "métadonnées" when it sits inside a tag (meta description…).
export function describeBlockingMarkers(html) {
  if (typeof html !== "string") return [];
  return [...html.matchAll(BLOCKING)].map((match) => {
    const before = html.slice(0, match.index);
    if (before.lastIndexOf("<") > before.lastIndexOf(">")) {
      if (/\balt="[^"]*$/.test(before)) {
        const code = html.slice(match.index).match(/^[^>]*data-image="([^"]+)"/)?.[1];
        return `${match[0]} (texte alternatif${code ? ` de l’image ${code}` : ""})`;
      }
      const attribute = before.slice(before.lastIndexOf("<")).match(/(?:name|property)="([^"]+)"/)?.[1];
      return `${match[0]} (métadonnées${attribute ? ` : ${attribute}` : ""})`;
    }
    const text = before.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(-45);
    return `${match[0]} (après « …${text} »)`;
  });
}

export function findPlaceholders(html) {
  if (typeof html !== "string") return [];
  return [...html.matchAll(PLACEHOLDER)].map((match) => match[1]);
}

export function isProduction() {
  return process.env.CONTEXT === "production";
}
