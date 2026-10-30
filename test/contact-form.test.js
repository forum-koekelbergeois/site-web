import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import Eleventy from "@11ty/eleventy";
import { cleanActivity, prefill, validate, formBody, submit } from "../lib/contact-form.js";

// Minimal stand-ins for the contact page, enough for lib/contact-form.js.
function makeField({ name, type = "text", required = false, describedby, value = "" }) {
  const attributes = describedby ? { "aria-describedby": describedby } : {};
  const field = {
    name, type, value, required, checked: false, disabled: false, willValidate: type !== "hidden" && type !== "submit",
    dataset: {}, focused: false,
    get validity() {
      if (type === "checkbox") return { valid: !required || this.checked };
      if (required && !this.value) return { valid: false };
      if (type === "email" && this.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.value)) return { valid: false };
      return { valid: true };
    },
    validationMessage: type === "email" ? "Adresse e-mail incorrecte (message du navigateur)" : "",
    getAttribute: (key) => attributes[key] ?? null,
    setAttribute: (key, v) => { attributes[key] = String(v); },
    removeAttribute: (key) => { delete attributes[key]; },
    focus() { field.focused = true; },
  };
  return field;
}

const TOPICS = [
  ["Une activité", "activite"], ["L'école de devoirs", "ecole-de-devoirs"],
  ["Les cours de français", "cours-de-francais"], ["Devenir volontaire", "volontaire"], ["Autre question"],
];

function makePage() {
  const demande = makeField({ name: "demande", required: true, value: "" });
  demande.options = [{ value: "", dataset: {} }, ...TOPICS.map(([value, topic]) => ({ value, dataset: topic ? { topic } : {} }))];
  const fields = [
    makeField({ name: "form-name", type: "hidden", value: "contact" }),
    makeField({ name: "bot-field" }),
    makeField({ name: "nom", required: true }),
    makeField({ name: "telephone", type: "tel", required: true, describedby: "aide-telephone" }),
    makeField({ name: "email", type: "email", describedby: "aide-email" }),
    demande,
    makeField({ name: "activite", describedby: "aide-activite" }),
    makeField({ name: "prenom-enfant" }), makeField({ name: "age-enfant" }), makeField({ name: "message" }),
    makeField({ name: "consentement", type: "checkbox", required: true, describedby: "aide-consentement", value: "oui" }),
    makeField({ name: "", type: "submit" }),
  ];
  const elements = Object.assign([...fields], Object.fromEntries(fields.filter((f) => f.name).map((f) => [f.name, f])));
  const errors = Object.fromEntries(
    ["nom", "telephone", "email", "demande", "consentement"].map((name) => [
      `erreur-${name}`,
      { id: `erreur-${name}`, hidden: true, textContent: `TEXTE DE LA PAGE ${name}` },
    ]),
  );
  const alert = { children: [], replaceChildren(...nodes) { this.children = nodes; } };
  const button = { type: "submit", textContent: "Envoyer", disabled: false, dataset: { sending: "Envoi en cours…" } };
  const form = {
    elements,
    noValidate: false,
    getAttribute: (key) => (key === "action" ? "/merci/" : null),
    querySelector: (s) => (s === "[data-form-alert]" ? alert : s === "[type=submit]" ? button : null),
    listeners: {},
    addEventListener(type, fn) { this.listeners[type] = fn; },
  };
  const doc = {
    getElementById: (id) =>
      id === "formulaire" ? form
        : id === "formulaire-echec" ? { content: { cloneNode: () => "ÉCHEC" } }
        : errors[id] ?? null,
  };
  return { form, doc, alert, button, errors, f: elements };
}

function fill({ f }) {
  f.nom.value = "Awa Diallo";
  f.telephone.value = "02 000 00 00";
  f.demande.value = "Autre question";
  f.consentement.checked = true;
}

function makeWindow({ ok = true, reject = false } = {}) {
  const win = {
    calls: [], assigned: null,
    location: { search: "", assign: (url) => { win.assigned = url; } },
    fetch: async (url, options) => {
      win.calls.push({ url, options });
      if (reject) throw new TypeError("réseau coupé");
      return { ok, status: ok ? 200 : 500 };
    },
  };
  return win;
}

test("prefill: the four known topics select their option", () => {
  for (const [label, topic] of TOPICS.slice(0, 4)) {
    const page = makePage();
    prefill(page.form, `?demande=${topic}`);
    assert.equal(page.f.demande.value, label, topic);
  }
});

test("prefill: an activity link fills both fields", () => {
  const page = makePage();
  prefill(page.form, "?demande=activite&activite=Inscription%20%3A%20L'IA%20et%20les%20devoirs%20de%20mes%20enfants%20(6%20novembre%202026)");
  assert.equal(page.f.demande.value, "Une activité");
  assert.equal(page.f.activite.value, "Inscription : L'IA et les devoirs de mes enfants (6 novembre 2026)");
});

test("prefill: an unknown topic is ignored", () => {
  for (const search of ["?demande=inconnu", "?demande=Autre%20question", "?demande=", "?demande=__proto__", "?nom=Test"]) {
    const page = makePage();
    prefill(page.form, search);
    assert.equal(page.f.demande.value, "", search);
    assert.equal(page.f.nom.value, "", search);
  }
});

test("prefill: HTML in « activite » stays plain text, control characters and length are cleaned", () => {
  const page = makePage();
  prefill(page.form, "?demande=inconnu&activite=%3Cb%3Etest%3C%2Fb%3E");
  assert.equal(page.f.activite.value, "<b>test</b>");
  assert.equal(page.f.demande.value, "");
  assert.equal(cleanActivity("a\u0000b\nc\u007Fd\u009Be"), "a b c d e");
  assert.equal(cleanActivity("x".repeat(500)).length, 200);
});

test("the prefill code never writes HTML", async () => {
  const source = (await import("node:fs")).readFileSync("lib/contact-form.js", "utf8");
  assert.doesNotMatch(source, /innerHTML|outerHTML|insertAdjacentHTML|document\.write/);
  assert.doesNotMatch(source, /validationMessage|setCustomValidity|reportValidity/, "browser messages are never used");
});

test("empty form: the four annex C messages show, focus goes to the name", async () => {
  const page = makePage();
  const result = await submit(page.form, page.doc, makeWindow());
  assert.equal(result, "invalid");
  assert.deepEqual(
    Object.entries(page.errors).filter(([, e]) => !e.hidden).map(([id]) => id),
    ["erreur-nom", "erreur-telephone", "erreur-demande", "erreur-consentement"],
  );
  assert.equal(page.errors["erreur-nom"].textContent, "TEXTE DE LA PAGE nom", "the message written in the page is kept");
  assert.equal(page.errors["erreur-consentement"].textContent, "TEXTE DE LA PAGE consentement");
  assert.equal(page.f.nom.focused, true);
  assert.equal(page.f.nom.getAttribute("aria-invalid"), "true");
  assert.equal(page.f.nom.getAttribute("aria-describedby"), "erreur-nom");
  assert.equal(page.f.telephone.getAttribute("aria-describedby"), "erreur-telephone aide-telephone");
  assert.equal(page.f.consentement.getAttribute("aria-describedby"), "erreur-consentement aide-consentement");
});

test("only the missing field is reported, and the message goes away once fixed", async () => {
  const page = makePage();
  fill(page);
  page.f.telephone.value = "";
  await submit(page.form, page.doc, makeWindow());
  assert.equal(page.errors["erreur-telephone"].hidden, false);
  assert.equal(page.errors["erreur-nom"].hidden, true);
  assert.equal(page.f.telephone.focused, true);
  page.f.telephone.value = "02 000 00 00";
  validate(page.form, page.doc);
  assert.equal(page.errors["erreur-telephone"].hidden, true);
  assert.equal(page.f.telephone.getAttribute("aria-invalid"), null);
  assert.equal(page.f.telephone.getAttribute("aria-describedby"), "aide-telephone");
});

test("a wrong e-mail shows the message written in the page, never the browser's", async () => {
  const page = makePage();
  fill(page);
  page.f.email.value = "pas-une-adresse";
  assert.equal(await submit(page.form, page.doc, makeWindow()), "invalid");
  assert.equal(page.errors["erreur-email"].hidden, false);
  assert.equal(page.errors["erreur-email"].textContent, "TEXTE DE LA PAGE email");
  assert.equal(page.f.email.focused, true);
});

test("valid form: posted to Netlify in the background, then /merci/", async () => {
  const page = makePage();
  fill(page);
  page.f.activite.value = "Inscription : Atelier (6 novembre 2026)";
  const win = makeWindow();
  assert.equal(await submit(page.form, page.doc, win), "sent");
  assert.equal(win.calls.length, 1);
  assert.equal(win.calls[0].url, "/");
  assert.equal(win.calls[0].options.method, "POST");
  assert.equal(win.calls[0].options.headers["Content-Type"], "application/x-www-form-urlencoded");
  const body = new URLSearchParams(win.calls[0].options.body);
  assert.equal(body.get("form-name"), "contact");
  assert.equal(body.get("bot-field"), "");
  assert.equal(body.get("nom"), "Awa Diallo");
  assert.equal(body.get("demande"), "Autre question");
  assert.equal(body.get("activite"), "Inscription : Atelier (6 novembre 2026)");
  assert.equal(body.get("consentement"), "oui");
  assert.equal(win.assigned, "/merci/");
  assert.equal(page.button.disabled, true);
  assert.equal(page.button.textContent, "Envoi en cours…");
});

test("an unchecked box is not sent", () => {
  const page = makePage();
  assert.equal(new URLSearchParams(formBody(page.form)).has("consentement"), false);
});

for (const [label, options] of [["server error", { ok: false }], ["network failure", { reject: true }]]) {
  test(`sending fails (${label}): error text, button back, nothing lost`, async () => {
    const page = makePage();
    fill(page);
    page.f.message.value = "Bonjour, je voudrais des informations.";
    const win = makeWindow(options);
    assert.equal(await submit(page.form, page.doc, win), "failed");
    assert.deepEqual(page.alert.children, ["ÉCHEC"]);
    assert.equal(page.button.disabled, false);
    assert.equal(page.button.textContent, "Envoyer");
    assert.equal(win.assigned, null);
    assert.equal(page.f.nom.value, "Awa Diallo");
    assert.equal(page.f.message.value, "Bonjour, je voudrais des informations.");
    // A second try clears the old error first.
    await submit(page.form, page.doc, makeWindow());
    assert.deepEqual(page.alert.children, []);
  });
}

test("bundled /js/contact.js runs on its own: prefill and native validation turned off", async () => {
  const { default: Template } = await import("../src/js/contact.11ty.js");
  const code = new Template().render();
  assert.doesNotMatch(code, /^\s*(import|export)\s/m);
  assert.ok(Buffer.byteLength(code) < 5 * 1024, `${Buffer.byteLength(code)} bytes`);
  const page = makePage();
  const win = makeWindow();
  win.location.search = "?demande=volontaire";
  vm.runInNewContext(code, { document: page.doc, window: win, URLSearchParams });
  assert.equal(page.f.demande.value, "Devenir volontaire");
  assert.equal(page.form.noValidate, true);
  assert.equal(typeof page.form.listeners.submit, "function");
});

// The built contact page, as Netlify will read it at deploy time.
const built = (async () => {
  const pages = await new Eleventy("src", "_site", { quietMode: true, configPath: "eleventy.config.js" }).toJSON();
  return pages.find((p) => p.url === "/contact/").content;
})();

test("built page: a Netlify form with honeypot and form-name, posting to /merci/", async () => {
  const html = await built;
  const form = html.match(/<form [^>]*>/)[0];
  for (const part of ['id="formulaire"', 'name="contact"', 'method="POST"', 'action="/merci/"', 'data-netlify="true"', 'netlify-honeypot="bot-field"']) {
    assert.ok(form.includes(part), part);
  }
  assert.match(html, /<input type="hidden" name="form-name" value="contact">/);
  assert.match(html, /<p class="form-trap" aria-hidden="true"><label>[^<]*<input type="text" name="bot-field" tabindex="-1" autocomplete="off"><\/label><\/p>/);
  assert.match(html, /<script src="\/js\/contact\.js" defer><\/script>/);
  assert.doesNotMatch(html, /data-placeholder/);
});

test("built page: the annex C fields, in order, with labels and required ones", async () => {
  const html = await built;
  const form = html.slice(html.indexOf("<form "), html.indexOf("</form>"));
  const names = [...form.matchAll(/<(?:input|select|textarea) [^>]*name="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(names, ["form-name", "bot-field", "nom", "telephone", "email", "demande", "activite", "prenom-enfant", "age-enfant", "message", "consentement"]);
  const required = [...form.matchAll(/<(?:input|select|textarea) [^>]*name="([^"]+)"[^>]*\srequired/g)].map((m) => m[1]);
  assert.deepEqual(required, ["nom", "telephone", "demande", "consentement"]);
  assert.match(form, /<input id="email" name="email" type="email"/);
  for (const name of names.slice(2)) {
    assert.match(form, new RegExp(`<label for="${name}">`), `label of ${name}`);
    assert.match(form, new RegExp(`name="${name}"[^>]*maxlength="\\d+"|name="${name}" type="checkbox"|name="${name}" required>`), `limit of ${name}`);
  }
  for (const id of [...form.matchAll(/aria-describedby="([^"]+)"/g)].map((m) => m[1])) {
    assert.match(form, new RegExp(`id="${id}"`), id);
  }
  assert.deepEqual([...form.matchAll(/<option value="([^"]*)"/g)].map((m) => m[1]),
    ["", "Une activité", "L'école de devoirs", "Les cours de français", "Devenir volontaire", "Autre question"]);
  assert.match(form, /<button class="button" type="submit" data-sending="Envoi en cours…">Envoyer<\/button>/);
});

// Annex C messages, with the French typography applied to the page; the e-mail
// one is a [PROPOSITION À VALIDER] (NOTES-CONTENU.md, point 37).
const NBSP = "\u00A0";
const MESSAGES = {
  nom: "Merci d’indiquer votre nom.",
  telephone: "Merci d’indiquer un numéro de téléphone pour que nous puissions vous répondre.",
  demande: "Merci d’indiquer l’objet de votre demande.",
  consentement: `Merci de cocher la case${NBSP}: sans votre accord, nous ne pouvons pas vous répondre.`,
  email: "Cette adresse e-mail semble incomplète. Vérifiez-la, ou laissez ce champ vide.",
};

test("messages shown by the real /js/contact.js are exactly the annex C texts", async () => {
  const html = await built;
  const { default: Template } = await import("../src/js/contact.11ty.js");
  const code = new Template().render();
  const decode = (t) => t.replace(/&nbsp;/g, NBSP).replace(/&#39;/g, "'").replace(/&amp;/g, "&");
  const shown = (page) => Object.values(page.errors).filter((e) => !e.hidden).map((e) => e.textContent);
  const run = async (prepare) => {
    const page = makePage();
    for (const error of Object.values(page.errors)) {
      const match = html.match(new RegExp(`<p class="field-error" id="${error.id}" hidden>([^<]*)</p>`));
      assert.ok(match, `${error.id} written in the page`);
      error.textContent = decode(match[1]);
    }
    prepare(page);
    vm.runInNewContext(code, { document: page.doc, window: makeWindow(), URLSearchParams });
    page.form.listeners.submit({ preventDefault() {} });
    await new Promise((resolve) => setImmediate(resolve));
    return page;
  };
  const empty = await run(() => {});
  assert.deepEqual(shown(empty), [MESSAGES.nom, MESSAGES.telephone, MESSAGES.demande, MESSAGES.consentement]);
  const noTopic = await run((page) => { fill(page); page.f.demande.value = ""; });
  assert.deepEqual(shown(noTopic), [MESSAGES.demande]);
  const wrongEmail = await run((page) => { fill(page); page.f.email.value = "julie@"; });
  assert.deepEqual(shown(wrongEmail), [MESSAGES.email]);
});

test("built page: nothing chosen by default in « Votre demande concerne », and the field is required", async () => {
  const html = await built;
  const select = html.match(/<select [^>]*name="demande"[^>]*>([\s\S]*?)<\/select>/);
  assert.ok(select, "select demande");
  assert.match(select[0], /^<select [^>]*\srequired[\s>]/, "required on the select");
  const options = [...select[1].matchAll(/<option ([^>]*)>([^<]*)<\/option>/g)];
  assert.equal(options[0][0], '<option value="" disabled selected>Choisissez dans la liste</option>');
  assert.deepEqual(options.filter(([, attributes]) => /\bselected\b/.test(attributes)).length, 1, "only the first line is selected");
  assert.deepEqual(options.filter(([, attributes]) => /\bdisabled\b/.test(attributes)).length, 1);
});

test("built page: no address or health field", async () => {
  const html = await built;
  const form = html.slice(html.indexOf("<form "), html.indexOf("</form>"));
  assert.doesNotMatch(form, /name="[^"]*(adresse|rue|address|street|postal|sante|santé|medic|allerg)/i);
  assert.doesNotMatch(form, /autocomplete="(street-address|address|postal-code|bday)/);
});
