// Browser side of the activity statuses (task 4.4). Bundled with
// activity-status.js into /js/activites.js by src/js/activites.11ty.js.
import { STATUS, effectiveStatus, cardLabel, isPast } from "./activity-status.js";

// Activity data written by the templates in data-* attributes.
export function fromDataset(d) {
  return {
    startDate: d.start,
    endDate: d.end || undefined,
    registrationDeadline: d.deadline || undefined,
    status: d.status,
    registration: d.registration,
  };
}

// List page: which cards stay visible, which become closed, and whether the
// "no activity" text must show.
export function listState(activities, today) {
  const items = activities.map((a) => ({
    visible: !isPast(a, today),
    closed: effectiveStatus(a, today) === STATUS.CLOSED,
  }));
  return { items, empty: !items.some((i) => i.visible) };
}

// Activity page: "past", "closed" or null (the page stays as built).
export function pageState(activity, today) {
  if (isPast(activity, today)) return "past";
  if (effectiveStatus(activity, today) === STATUS.CLOSED) return "closed";
  return null;
}

export function update(doc, today) {
  const cards = [...doc.querySelectorAll("[data-activity-card]")];
  const empty = doc.querySelector("[data-activity-empty]");
  if (empty) {
    const state = listState(cards.map((c) => fromDataset(c.dataset)), today);
    cards.forEach((card, i) => {
      card.hidden = !state.items[i].visible;
      const label = card.querySelector("[data-status-label]");
      if (label && state.items[i].closed) {
        label.textContent = cardLabel(STATUS.CLOSED);
        label.className = "status-label status-label--cloture";
      }
    });
    empty.hidden = !state.empty;
  }

  const page = doc.querySelector("[data-activity-page]");
  if (page) {
    const state = pageState(fromDataset(page.dataset), today);
    const block = page.querySelector("[data-registration]");
    const template = state && doc.getElementById(`inscription-${state}`);
    if (block && template) block.replaceChildren(template.content.cloneNode(true));
  }
}
