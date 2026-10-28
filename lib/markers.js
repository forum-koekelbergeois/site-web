// Content markers. Blocking markers must never reach a production build.
const BLOCKING = /\[(?:DONNÉE À COMPLÉTER|À VÉRIFIER)[^\]]*\]/g;

export function findBlockingMarkers(text) {
  if (typeof text !== "string") return [];
  return text.match(BLOCKING) ?? [];
}

export function isProduction() {
  return process.env.CONTEXT === "production";
}
