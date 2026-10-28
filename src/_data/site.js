// Shared data used on several pages. Texts are copied word for word from the
// validated content document; change them here, not in the templates.

const osmSearch = (query) =>
  `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`;

// Single source for the homework school fee.
const homeworkFee = "15 € par trimestre";

const places = {
  forum: {
    name: "Forum Koekelbergeois",
    street: "17 rue Herkoliers",
    postcode: "1081",
    city: "Koekelberg",
    address: "17 rue Herkoliers, 1081 Koekelberg",
    // Label used in the activity form (annex A, field 7).
    formLabel: "Forum Koekelbergeois (rue Herkoliers 17)",
    mapUrl: osmSearch("17 rue Herkoliers, 1081 Koekelberg"),
  },
  jourdan: {
    name: "Jourdan Village",
    street: "39 rue François Delcoigne",
    postcode: "1081",
    city: "Koekelberg",
    address: "39 rue François Delcoigne, 1081 Koekelberg",
    formLabel: "Jourdan Village (rue François Delcoigne 39)",
    mapUrl: osmSearch("39 rue François Delcoigne, 1081 Koekelberg"),
  },
};

export default {
  url: "https://www.forumkoekelbergeois.be",
  name: "Forum Koekelbergeois",
  legalName: "Forum Koekelbergeois ASBL",
  companyNumber: "0874.744.614",
  companyRegister: "RPM Bruxelles (tribunal de l'entreprise francophone)",

  phone: {
    display: "02 435 68 45",
    href: "tel:+3224356845",
    hours: "du lundi au vendredi de 8h30 à 18h30",
  },

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

  // Logo files arrive in task 4.3; paths are placeholders until then.
  funders: [
    { name: "COCOF", logo: "/assets/logos/cocof.webp" },
    { name: "Fédération Wallonie-Bruxelles", logo: "/assets/logos/fwb.webp" },
    { name: "urban.brussels (CQD)", logo: "/assets/logos/urban-brussels.webp" },
    { name: "perspective.brussels", logo: "/assets/logos/perspective-brussels.webp" },
    { name: "Commune de Koekelberg", logo: "/assets/logos/commune-koekelberg.webp" },
  ],

  accreditation: {
    name: "ONE (Office de la Naissance et de l'Enfance)",
    logo: "/assets/logos/one.webp",
  },
};
