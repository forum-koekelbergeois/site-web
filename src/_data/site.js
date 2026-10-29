// Shared data used on several pages. Texts are copied word for word from the
// validated content document; change them here, not in the templates.

const osmSearch = (query) =>
  `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`;

// Single source for the homework school fee.
const homeworkFee = "15 € par trimestre";

// Belgian address format: number after the street. "Line" variants start an
// address line (capital letter); the others are used inside a sentence.
const place = ({ name, street, formLabel }) => {
  const streetLine = street[0].toUpperCase() + street.slice(1);
  return {
    name,
    street,
    streetLine,
    postcode: "1081",
    city: "Koekelberg",
    address: `${street}, 1081 Koekelberg`,
    addressLine: `${streetLine}, 1081 Koekelberg`,
    // Label used in the activity form (annex A, field 7).
    formLabel,
    mapUrl: osmSearch(`${streetLine}, 1081 Koekelberg`),
  };
};

const places = {
  forum: place({
    name: "Forum Koekelbergeois",
    street: "rue Herkoliers 17",
    formLabel: "Forum Koekelbergeois (rue Herkoliers 17)",
  }),
  jourdan: place({
    name: "Jourdan Village",
    street: "rue François Delcoigne 39",
    formLabel: "Jourdan Village (rue François Delcoigne 39)",
  }),
};

const phone = {
  display: "02 435 68 45",
  href: "tel:+3224356845",
  hours: "du lundi au vendredi de 8h30 à 18h30",
};

export default {
  url: "https://www.forumkoekelbergeois.be",
  name: "Forum Koekelbergeois",
  legalName: "Forum Koekelbergeois ASBL",
  companyNumber: "0874.744.614",
  companyRegister: "RPM Bruxelles (tribunal de l'entreprise francophone)",

  phone,

  email: {
    address: "fkoekelbergeois@koekelberg.brussels",
    replyDelay: "dans les 3 jours ouvrables",
  },

  instagram: {
    handle: "@forumkoekelbergeois",
    url: "https://www.instagram.com/forumkoekelbergeois/",
  },

  places,

  homeworkFee,

  homeworkSchools: [
    {
      id: "primaire",
      name: "École de devoirs primaire",
      audience: "les enfants de la 1re à la 6e primaire",
      audienceShort: "De la 1re à la 6e primaire",
      places: 15,
      schedule: "le lundi, le mardi et le jeudi de 16h à 18h, le mercredi de 14h à 17h",
      place: "forum",
      fee: homeworkFee,
    },
    {
      id: "intergenerationnelle",
      name: "École de devoirs intergénérationnelle",
      audience: "les enfants de la 1re à la 6e primaire",
      audienceShort: "De la 1re à la 6e primaire",
      places: 15,
      schedule: "le lundi, le mardi et le jeudi de 16h à 18h, le mercredi de 14h à 17h",
      place: "jourdan",
      fee: "gratuite",
    },
    {
      id: "secondaire",
      name: "École de devoirs secondaire",
      audience: "les jeunes de 1re et 2e secondaire",
      audienceShort: "1re et 2e secondaire",
      places: 10,
      schedule:
        "le mardi de 16h à 18h, le mercredi de 14h à 17h, le jeudi de 16h à 18h, le vendredi de 16h30 à 18h30",
      place: "forum",
      fee: homeworkFee,
    },
  ],

  // Logos: WebP files at 2x display size (scripts/process_logos.py). The alt
  // text is the name, as written on the home page. width/height are the file size.
  funders: [
    { name: "COCOF", logo: "/assets/logos/cocof.webp", width: 252, height: 140 },
    { name: "Fédération Wallonie-Bruxelles", logo: "/assets/logos/fwb.webp", width: 128, height: 128 },
    { name: "urban.brussels (CQD)", logo: "/assets/logos/urban-brussels.webp", width: 229, height: 128 },
    { name: "perspective.brussels", logo: "/assets/logos/perspective-brussels.webp", width: 476, height: 112 },
    { name: "Commune de Koekelberg", logo: "/assets/logos/commune-koekelberg.webp", width: 168, height: 196 },
  ],

  accreditation: {
    name: "ONE (Office de la Naissance et de l'Enfance)",
    logo: "/assets/logos/one.webp",
    width: 182,
    height: 128,
  },

  // Topics of the contact form (annex C), used in prefill links (task 4.5).
  contactTopics: {
    activity: "activite",
    homework: "ecole-de-devoirs",
    frenchClasses: "cours-de-francais",
    volunteer: "volontaire",
  },

  // Technical texts (content document, "Textes techniques").
  ui: {
    skipLink: "Aller au contenu",
    headerLogoAlt: "Forum Koekelbergeois, page d'accueil",
    menuOpen: "Menu",
    menuClose: "Fermer le menu",
    mapLink: "Voir sur la carte",
    mapLinkHint: " (ouvre OpenStreetMap dans un nouvel onglet)",
    instagramLabel: "Instagram du Forum Koekelbergeois (nouvel onglet)",
    imageCaption: "Illustration",
  },

  // Contact form texts, used in task 4.5.
  form: {
    sending: "Envoi en cours…",
    error: `Votre message n'a pas pu être envoyé. Réessayez ou appelez-nous au ${phone.display}.`,
  },

  // "Dernière mise à jour" of the privacy page, e.g. "15 novembre 2026".
  // Empty until the site goes live: the page then shows a blocking marker.
  privacyUpdated: "",
};
