// Image slots (content document, annex E). Files are added later, once
// converted to WebP with metadata removed and children's faces blurred.
// Until a file exists, pages show a neutral placeholder locally, and a
// production build fails. width/height are the planned file size.

const slot = (code, placement, alt, { width, height, format, caption = "" }) => ({
  code,
  placement,
  file: `/assets/images/${code.toLowerCase()}.webp`,
  alt,
  caption,
  width,
  height,
  format,
});

const illustration = { width: 1536, height: 1024, format: "Illustration 1 536 × 1 024 (3:2)" };
const typeDefault = {
  width: 1200,
  height: 630,
  format: "Recadrage 1 200 × 630, aussi utilisé comme image de partage",
};

const list = [
  slot("IA1", "Accueil, bandeau",
    "Illustration : dans une salle de classe colorée, des enfants font leurs devoirs avec un bénévole, une bénévole âgée aide une fillette, un ado travaille sur un ordinateur et deux mamans discutent près de la porte.",
    { ...illustration, format: "Illustration 1 536 × 1 024, léger agrandissement ; sur grand écran, bande centrale gardée, titre dans le tiers gauche" }),
  slot("IA3", "Accueil, cours de français",
    "Illustration : des adultes suivent un cours de français devant un tableau vert.", illustration),
  slot("IA4", "Accueil, Sport avec les mamans (aussi photo de la fiche)",
    "Illustration : quatre femmes marchent dans un parc, avec la Basilique de Koekelberg au loin.", illustration),
  slot("IA5", "Image par défaut « Atelier »",
    "Illustration : deux adultes travaillent sur un ordinateur portable pendant un atelier.", typeDefault),
  slot("IA6", "Image par défaut « Sortie »",
    "Illustration : une allée arborée mène à la Basilique de Koekelberg.", typeDefault),
  slot("IA7", "Image par défaut « Rencontre »",
    "Illustration : une salle lumineuse prête pour une rencontre, avec un goûter sur la table.", typeDefault),
  slot("IA8", "Image par défaut « Cours »",
    "Illustration : un coin de salle de classe avec un tableau vert et des livres.", typeDefault),
  slot("IA9", "Page Activités, en-tête",
    "Illustration : un sac à dos, des baskets, un jeu de société et un appareil photo devant un tableau d'affichage coloré.", illustration),
  slot("IA11", "Page Merci (décorative)", "", illustration),
  slot("IA12", "Page 404 (décorative)", "", illustration),

  slot("R1", "Accueil, carte École primaire",
    "Des enfants font leurs devoirs dans une salle de classe de l'école de devoirs.",
    { width: 1600, height: 1200, format: "Photo 4:3 (source R1.jpeg 2 048 × 1 536), recadrée pour retirer le fond, visages d'enfants floutés" }),
  slot("R2", "Accueil, carte École intergénérationnelle",
    "À Jourdan Village, des enfants partagent un goûter avec des résidents autour d'une table.",
    { width: 1200, height: 1600, format: "Photo 3:4 (source 1 536 × 2 048), visages des enfants floutés" }),
  slot("R3", "Accueil, carte École secondaire",
    "Un bénévole aide des jeunes de l'école de devoirs secondaire, dans une salle sous les toits.",
    { width: 1024, height: 768, format: "Photo 4:3 (1 024 × 768), GPS retiré, visage du jeune au fond flouté s'il est reconnaissable" }),
  slot("R4", "Accueil, ateliers pour les familles",
    "Des mamans discutent autour d'une table pendant un atelier.",
    { width: 1024, height: 768, format: "Photo 4:3 (1 024 × 768), GPS retiré" }),
  slot("R5", "Écoles de devoirs, ateliers sur l'intelligence artificielle (jamais près du groupe de parole)",
    "Des jeunes réunis autour d'un ordinateur portable pendant un atelier sur l'intelligence artificielle.",
    { width: 1024, height: 768, format: "Photo 4:3 (1 024 × 768), GPS retiré, visages des enfants floutés" }),
  slot("R6", "Écoles de devoirs, le mercredi",
    "Des enfants font une activité autour d'une table rouge.",
    { width: 568, height: 754, format: "Photo 3:4 (568 × 754), petit format, visages des enfants floutés" }),
  slot("R7", "Écoles de devoirs, pendant les vacances",
    "Pendant un stage, des enfants découvrent un véhicule de police.",
    { width: 1200, height: 1600, format: "Photo 3:4 (source R7.png 1 536 × 2 048), plaque et visage du policier floutés" }),
  slot("R8", "Écoles de devoirs, en famille",
    "Les familles et l'équipe réunies lors de la grande sortie annuelle.",
    { width: 1024, height: 768, format: "Photo 4:3 (1 024 × 768), visages des enfants floutés" }),
  slot("R9", "Contact, entrée de la rue Herkoliers 17",
    "Illustration de l'entrée du Forum Koekelbergeois, rue Herkoliers 17 : une porte vitrée entourée de panneaux colorés, avec le numéro 17.",
    { width: 1536, height: 1024, format: "Illustration 3:2 (1 536 × 1 024)", caption: "Illustration" }),
  slot("R10", "Contact, entrée de Jourdan Village",
    "Illustration de l'entrée de la résidence Jourdan Village : des bâtiments blancs autour d'un jardin, avec un totem à flèches vertes.",
    { width: 1536, height: 1024, format: "Illustration 3:2 (source R10.png, pas R10.webp)", caption: "Illustration" }),
  slot("R12", "Accueil, devenir volontaire",
    "Vue du dessus : un bénévole aide un jeune à faire ses exercices.",
    { width: 769, height: 1024, format: "Photo 3:4 (769 × 1 024), GPS retiré" }),
  slot("R13", "Écoles de devoirs, ateliers coup de pouce",
    "Vue du dessus : un bénévole et une jeune travaillent ensemble sur des feuilles d'exercices.",
    { width: 769, height: 1024, format: "Photo 3:4 (769 × 1 024), GPS retiré" }),
];

export default {
  byCode: Object.fromEntries(list.map((image) => [image.code, image])),
  list,
  // Default image of each activity type (annex A, field 18).
  typeDefaults: { Atelier: "IA5", Sortie: "IA6", Rencontre: "IA7", Cours: "IA8" },
};
