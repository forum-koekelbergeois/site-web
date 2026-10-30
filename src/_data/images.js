// Image slots (content document, annex E). Files are WebP, converted outside
// the repository (orientation, sRGB, faces blurred where decided, no metadata)
// and validated by Aymeric on 30/10/2026 (R61 to R81: missions 4.0b and 4.0c). If a file
// is missing, pages show a neutral placeholder locally and a production build
// fails.

// Size of each file in src/assets/images/ (2x the display size, never enlarged
// beyond the original except IA1).
const FILE_SIZES = {
  IA1: [1920, 1280], IA3: [800, 533], IA4: [800, 533], IA5: [1536, 1024],
  IA6: [1536, 1024], IA7: [1536, 1024], IA8: [1536, 1024], IA9: [1536, 1024],
  IA11: [768, 512], IA12: [768, 512],
  R1: [720, 540], R2: [720, 960], R3: [720, 540], R4: [800, 600], R5: [1024, 768],
  R6: [568, 754], R7: [704, 939], R8: [1024, 768], R9: [920, 613], R10: [920, 613],
  R12: [740, 985], R13: [704, 937],
  // Gallery photos: short side 480 px at most, never enlarged.
  R61: [640, 480], R63: [556, 480], R64: [511, 384], R65: [522, 480],
  R66: [496, 480], R67: [469, 625], R68: [216, 162],
  R71: [480, 639], R72: [208, 157], R73: [480, 639], R75: [221, 166],
  R76: [162, 217], R77: [847, 319], R78: [154, 204], R81: [640, 480],
  IA13: [768, 512], IA14: [768, 512], IA15: [768, 512],
};

const slot = (code, placement, alt, { format, caption = "", share = false }) => ({
  code,
  placement,
  file: `/assets/images/${code.toLowerCase()}.webp`,
  alt,
  caption,
  width: FILE_SIZES[code][0],
  height: FILE_SIZES[code][1],
  format,
  // Share image (Open Graph), 1 200 × 630.
  ...(share && { share: `/assets/images/${code.toLowerCase()}-partage.webp` }),
});

const illustration = { format: "Illustration 3:2" };
const gallery = { format: "Photo de galerie, recadrée en 4:3 à l'affichage" };
const pending = "[DONNÉE À COMPLÉTER]";
const typeDefault = {
  format: "Illustration 3:2 pour l'en-tête, et recadrage 1 200 × 630 pour le partage",
  share: true,
};

const list = [
  slot("IA1", "Accueil, bandeau",
    "Illustration : dans une salle de classe colorée, des enfants font leurs devoirs avec un bénévole, une bénévole âgée aide une fillette, un ado travaille sur un ordinateur et deux mamans discutent près de la porte.",
    { format: "Illustration 1 920 × 1 280 (léger agrandissement) ; sur grand écran, bande centrale gardée, titre dans le tiers gauche" }),
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
  slot("IA13", "Écoles de devoirs, bloc École primaire",
    "Illustration : dans une salle de classe lumineuse, des enfants font leurs devoirs, aidés par deux bénévoles.", illustration),
  slot("IA14", "Écoles de devoirs, bloc École intergénérationnelle",
    "Illustration : à Jourdan Village, des enfants font leurs devoirs et jouent avec des résidents autour de tables rondes.", illustration),
  slot("IA15", "Écoles de devoirs, bloc École secondaire",
    "Illustration : des adolescents travaillent sur des ordinateurs portables et dans leurs cahiers, avec l'aide d'un animateur.", illustration),

  slot("R1", "Accueil, carte École primaire",
    "Des enfants font leurs devoirs dans une salle de classe de l'école de devoirs.",
    { format: "Photo 4:3 (source R1.jpeg 2 048 × 1 536), recadrée pour retirer le fond, visages d'enfants floutés" }),
  slot("R2", "Accueil, carte École intergénérationnelle",
    "À Jourdan Village, des enfants partagent un goûter avec des résidents autour d'une table.",
    { format: "Photo 3:4 (source 1 536 × 2 048), visages des enfants floutés" }),
  slot("R3", "Accueil, carte École secondaire",
    "Un bénévole aide des jeunes de l'école de devoirs secondaire, dans une salle sous les toits.",
    { format: "Photo 4:3 (1 024 × 768), GPS retiré, visage du jeune au fond flouté s'il est reconnaissable" }),
  slot("R4", "Accueil, ateliers pour les familles",
    "Des mamans discutent autour d'une table pendant un atelier.",
    { format: "Photo 4:3 (1 024 × 768), GPS retiré" }),
  slot("R5", "Écoles de devoirs, ateliers sur l'intelligence artificielle (jamais près du groupe de parole)",
    "Des jeunes réunis autour d'un ordinateur portable pendant un atelier sur l'intelligence artificielle.",
    { format: "Photo 4:3 (1 024 × 768), GPS retiré, visages des enfants floutés" }),
  slot("R6", "Écoles de devoirs, le mercredi",
    "Des enfants font une activité autour d'une table rouge.",
    { format: "Photo 3:4 (568 × 754), petit format, visages des enfants floutés" }),
  slot("R7", "Écoles de devoirs, pendant les vacances",
    "Pendant un stage, des enfants découvrent un véhicule de police.",
    { format: "Photo 3:4 (source R7.png 1 536 × 2 048), plaque et visage du policier floutés" }),
  slot("R8", "Écoles de devoirs, en famille",
    "Les familles et l'équipe réunies lors de la grande sortie annuelle.",
    { format: "Photo 4:3 (1 024 × 768), visages des enfants floutés" }),
  slot("R61", "Écoles de devoirs, galerie du mercredi",
    "Des jeunes teignent des tissus avec des flacons de couleur, autour de tables couvertes de nappes.", gallery),
  slot("R63", "Écoles de devoirs, galerie du mercredi",
    "Des enfants font des exercices d'étirement sur une pelouse, les mains au sol.", gallery),
  slot("R64", "Écoles de devoirs, galerie du mercredi",
    "Des enfants jouent dans la neige, dans une cour entre deux bâtiments.", gallery),
  slot("R65", "Écoles de devoirs, galerie du mercredi",
    "Des enfants jouent à un jeu de société avec un homme âgé, autour d'une table en plein air.", gallery),
  slot("R66", "Écoles de devoirs, galerie du mercredi",
    "Des jeunes portant un casque jouent sur des ordinateurs alignés dans une salle de jeux vidéo.", gallery),
  slot("R67", "Écoles de devoirs, galerie du mercredi",
    "Un groupe d'enfants pose dans un musée, devant un grand portrait peint.", gallery),
  slot("R68", "Écoles de devoirs, galerie du mercredi",
    "Deux enfants discutent sous un arbre, dans un parc.", gallery),
  slot("R71", "Écoles de devoirs, galerie des vacances",
    "Les yeux bandés et vêtus de capes, des enfants avancent en file pendant un jeu, guidés par une adulte.", gallery),
  slot("R72", "Écoles de devoirs, galerie des vacances",
    "Des enfants en gilet jaune visitent un atelier d'entretien des bus de la STIB.", gallery),
  slot("R73", "Écoles de devoirs, galerie des vacances",
    "Un enfant avance sur un parcours suspendu dans les arbres, observé par un autre resté au sol.", gallery),
  slot("R75", "Écoles de devoirs, galerie des vacances",
    "Des enfants visitent une exposition de grandes sculptures en ballons colorés.", gallery),
  slot("R76", "Écoles de devoirs, galerie des vacances",
    "Un enfant prépare une pâte au chocolat dans un grand saladier.", gallery),
  slot("R77", "Écoles de devoirs, galerie des vacances",
    "Des enfants assis sur un banc dans un vestiaire de football, sous des maillots rouges numérotés.", gallery),
  slot("R78", "Écoles de devoirs, galerie des vacances",
    "Une télécabine passe au-dessus d'une rivière et d'une ville.", gallery),
  slot("R81", "Écoles de devoirs, galerie en famille",
    "Un grand groupe de familles pose devant l'entrée d'un parc animalier, autour d'une fontaine sculptée.", gallery),
  slot("R9", "Contact, entrée de la rue Herkoliers 17",
    "Illustration de l'entrée du Forum Koekelbergeois, rue Herkoliers 17 : une porte vitrée entourée de panneaux colorés, avec le numéro 17.",
    { format: "Illustration 3:2 (1 536 × 1 024)", caption: "Illustration" }),
  slot("R10", "Contact, entrée de Jourdan Village",
    "Illustration de l'entrée de la résidence Jourdan Village : des bâtiments blancs autour d'un jardin, avec un totem à flèches vertes.",
    { format: "Illustration 3:2 (source R10.png, pas R10.webp)", caption: "Illustration" }),
  slot("R12", "Accueil, devenir volontaire",
    "Vue du dessus : un bénévole aide un jeune à faire ses exercices.",
    { format: "Photo 3:4 (769 × 1 024), GPS retiré" }),
  slot("R13", "Écoles de devoirs, ateliers coup de pouce",
    "Vue du dessus : un bénévole et une jeune travaillent ensemble sur des feuilles d'exercices.",
    { format: "Photo 3:4 (769 × 1 024), GPS retiré" }),
];

export default {
  // Slots whose file has not been supplied yet (placeholder, production blocked).
  pending: list.filter((image) => image.alt === pending).map((image) => image.code),
  byCode: Object.fromEntries(list.map((image) => [image.code, image])),
  list,
  // Default image of each activity type (annex A, field 18).
  typeDefaults: { Atelier: "IA5", Sortie: "IA6", Rencontre: "IA7", Cours: "IA8" },
};
