// Activity status logic (annex A, A2 and "Activités" page).
// Dependency-free: runs at build time (Node) and in the browser (task 4.4).
// Dates are "YYYY-MM-DD" strings, compared in the Europe/Brussels time zone.

export const STATUS = {
  OPEN: "Ouvert",
  WAITLIST: "Complet avec liste d'attente",
  CLOSED: "Clôturé",
};

export const REGISTRATION = {
  PHONE: "Téléphone ou message",
  PARTNER: "Chez un partenaire",
  FREE_ENTRY: "Entrée libre",
};

// Effective status shown when registration is "Entrée libre".
export const FREE_ENTRY = "Entrée libre";

const CARD_LABELS = {
  [STATUS.OPEN]: "Inscriptions ouvertes",
  [STATUS.WAITLIST]: "Complet, liste d'attente",
  [STATUS.CLOSED]: "Inscriptions clôturées",
  [FREE_ENTRY]: "Entrée libre",
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Front matter dates arrive as Date objects (UTC midnight) or as strings.
export function toIsoDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && ISO_DATE.test(value.trim())) {
    return value.trim();
  }
  return null;
}

const brusselsDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Brussels",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function todayInBrussels(now = new Date()) {
  return brusselsDate.format(now);
}

export function isPast(activity, today) {
  const lastDay = toIsoDate(activity.endDate) ?? toIsoDate(activity.startDate);
  return lastDay !== null && today > lastDay;
}

export function effectiveStatus(activity, today) {
  if (activity.registration === REGISTRATION.FREE_ENTRY) return FREE_ENTRY;
  const deadline = toIsoDate(activity.registrationDeadline);
  if (deadline !== null && today > deadline) return STATUS.CLOSED;
  return activity.status;
}

export function cardLabel(status) {
  return CARD_LABELS[status];
}

// Annex A2 texts. `site` provides the phone and reply delay (src/_data/site.js).
export function registrationText(activity, today, site) {
  const status = effectiveStatus(activity, today);
  if (status === FREE_ENTRY) {
    return "Entrée libre, sans inscription.";
  }
  if (status === STATUS.CLOSED) {
    return "Les inscriptions sont clôturées. Découvrez nos autres activités.";
  }
  if (activity.registration === REGISTRATION.PARTNER) {
    const partner = activity.registrationPartner ?? {};
    return `Les inscriptions se font auprès de ${partner.name} : ${partner.contact}.`;
  }
  if (status === STATUS.WAITLIST) {
    return "Cette activité est complète. Appelez-nous ou laissez-nous un message : nous vous inscrivons sur la liste d'attente et nous vous prévenons dès qu'une place se libère.";
  }
  return `Pour vous inscrire, appelez-nous au ${site.phone.display}, ${site.phone.hours}, ou laissez-nous un message. Nous vous répondons ${site.email.replyDelay}.`;
}

export function describeStatus(activity, today, site) {
  const status = effectiveStatus(activity, today);
  return {
    past: isPast(activity, today),
    status,
    label: cardLabel(status),
    text: registrationText(activity, today, site),
  };
}
