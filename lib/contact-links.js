// Makes Belgian phone numbers and e-mail addresses in a plain text clickable.
// Used for texts typed in activity forms, such as a partner's details.
const CONTACT = /([^\s<>@()]+@[^\s<>@()]+\.[a-z]{2,})|(\b0\d(?:[ .]?\d{2,3}){3}\b)/gi;

const escapeHtml = (text) =>
  String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function telHref(phone) {
  return `tel:+32${phone.replace(/\D/g, "").replace(/^0/, "")}`;
}

export function linkContacts(text) {
  return escapeHtml(text ?? "").replace(CONTACT, (match, email, phone) =>
    email
      ? `<a href="mailto:${email}">${email}</a>`
      : `<a class="nowrap" href="${telHref(phone)}">${phone}</a>`,
  );
}
