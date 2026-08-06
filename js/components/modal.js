// ============================================================================
// components/modal.js — a minimal, promise-free modal helper
// ============================================================================
import { icons } from "../icons.js";

let activeBackdrop = null;

export function closeModal() {
  if (activeBackdrop) {
    activeBackdrop.remove();
    activeBackdrop = null;
    document.removeEventListener("keydown", escHandler);
  }
}

function escHandler(e) {
  if (e.key === "Escape") closeModal();
}

/**
 * openModal({ title, bodyHTML, onMount(root) })
 * onMount receives the modal root element so callers can wire form/buttons.
 */
export function openModal({ title, bodyHTML, onMount }) {
  closeModal();
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="${title || ""}">
      <div class="modal-head">
        <h3 class="section-title">${title || ""}</h3>
        <button class="modal-close" data-close aria-label="Close">${icons.x}</button>
      </div>
      <div class="modal-body">${bodyHTML || ""}</div>
    </div>
  `;
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });
  backdrop.querySelector("[data-close]").addEventListener("click", closeModal);
  document.body.appendChild(backdrop);
  document.addEventListener("keydown", escHandler);
  activeBackdrop = backdrop;
  if (onMount) onMount(backdrop);
  return backdrop;
}
