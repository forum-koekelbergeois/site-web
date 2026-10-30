// Contact form (annex C), browser side: prefill from the address, error
// messages, background sending to Netlify. Bundled into /js/contact.js by
// src/js/contact.11ty.js. Without JavaScript the form works as plain HTML.

export const ACTIVITY_MAX_LENGTH = 200;
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F-\u009F]/g;

// Text of the "activite" parameter: plain text, one line, limited length.
export function cleanActivity(value) {
  return String(value).replace(CONTROL_CHARACTERS, " ").replace(/\s+/g, " ").trim().slice(0, ACTIVITY_MAX_LENGTH);
}

// Only "demande" (one of the topics carried by the options) and "activite"
// are read from the address; any other value is ignored.
export function prefill(form, search) {
  const params = new URLSearchParams(search);
  const topic = params.get("demande");
  const option = topic && [...form.elements.demande.options].find((o) => o.dataset.topic === topic);
  if (option) form.elements.demande.value = option.value;
  const activity = cleanActivity(params.get("activite") ?? "");
  if (activity) form.elements.activite.value = activity;
}

// Shows or hides the message under a field. Messages are written in the page
// (with French typography); fields without one use the browser's message.
export function setFieldError(field, doc, invalid) {
  const error = doc.getElementById(`erreur-${field.name}`);
  if (!error) return;
  const others = (field.getAttribute("aria-describedby") ?? "").split(" ").filter((id) => id && id !== error.id);
  if (invalid) {
    if (error.dataset.message === undefined) error.textContent = field.validationMessage;
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", [error.id, ...others].join(" "));
  } else {
    field.removeAttribute("aria-invalid");
    if (others.length) field.setAttribute("aria-describedby", others.join(" "));
    else field.removeAttribute("aria-describedby");
  }
  error.hidden = !invalid;
}

// Checks every field, shows the messages and returns the invalid fields.
export function validate(form, doc) {
  const invalid = [];
  for (const field of form.elements) {
    if (!field.name || !field.willValidate) continue;
    const ok = field.validity.valid;
    setFieldError(field, doc, !ok);
    if (!ok) invalid.push(field);
  }
  return invalid;
}

// Form data encoded as Netlify expects it (form-name and bot-field included).
export function formBody(form) {
  const params = new URLSearchParams();
  for (const field of form.elements) {
    if (!field.name || field.disabled || field.type === "submit") continue;
    if ((field.type === "checkbox" || field.type === "radio") && !field.checked) continue;
    params.append(field.name, field.value);
  }
  return params.toString();
}

export async function submit(form, doc, win) {
  const alert = form.querySelector("[data-form-alert]");
  alert.replaceChildren();
  const invalid = validate(form, doc);
  if (invalid.length) {
    invalid[0].focus();
    return "invalid";
  }
  const button = form.querySelector("[type=submit]");
  const label = button.textContent;
  button.disabled = true;
  button.textContent = button.dataset.sending;
  try {
    const response = await win.fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody(form),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    win.location.assign(form.getAttribute("action"));
    return "sent";
  } catch {
    alert.replaceChildren(doc.getElementById("formulaire-echec").content.cloneNode(true));
    button.disabled = false;
    button.textContent = label;
    return "failed";
  }
}

export function init(doc, win) {
  const form = doc.getElementById("formulaire");
  if (!form) return;
  prefill(form, win.location.search);
  form.noValidate = true;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submit(form, doc, win);
  });
  // A message disappears as soon as its field is corrected.
  const recheck = (event) => {
    const field = event.target;
    if (field.name && field.getAttribute("aria-invalid") === "true" && field.validity.valid) setFieldError(field, doc, false);
  };
  form.addEventListener("input", recheck);
  form.addEventListener("change", recheck);
}
