// ============================================================================
// store.js — tiny app-wide state + pub/sub (no framework needed)
// ============================================================================
import * as db from "./db.js";

const listeners = new Set();

export const state = {
  ready: false,
  user: null,       // current logged-in user record
  role: null,        // "user" | "admin"
  wallet: { gold: 0, purple: 0 },
  unread: 0,
};

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  listeners.forEach((fn) => fn(state));
}

export async function refreshSession() {
  const s = await db.session.get();
  state.role = s.role;
  if (!s.currentUserId) {
    state.user = null;
    state.wallet = { gold: 0, purple: 0 };
    state.unread = 0;
    state.ready = true;
    emit();
    return;
  }
  const [user, wallet, unread] = await Promise.all([
    db.users.get(s.currentUserId),
    db.wallets.get(s.currentUserId),
    db.notifications.unreadCount(s.currentUserId),
  ]);
  state.user = user;
  state.wallet = wallet;
  state.unread = unread;
  state.ready = true;
  emit();
}

export async function logout() {
  await db.session.logout();
  await refreshSession();
  location.hash = "#/welcome";
}

// ---- Toasts -----------------------------------------------------------
let toastRoot;
export function toast({ title, body, tone = "gold", icon = "check" }) {
  if (!toastRoot) toastRoot = document.getElementById("toast-root");
  const el = document.createElement("div");
  el.className = `toast is-${tone}`;
  el.innerHTML = `
    <span data-icon="${icon}"></span>
    <span>
      <strong style="display:block;margin-bottom:2px;">${title}</strong>
      ${body ? `<span style="opacity:.82;">${body}</span>` : ""}
    </span>
  `;
  toastRoot.appendChild(el);
  // fill icon after import to avoid circular import overhead
  import("./icons.js").then(({ icons }) => {
    const holder = el.querySelector("[data-icon]");
    if (holder) holder.innerHTML = icons[icon] || icons.check;
  });
  setTimeout(() => {
    el.style.transition = "opacity .25s ease, transform .25s ease";
    el.style.opacity = "0";
    el.style.transform = "translateX(16px)";
    setTimeout(() => el.remove(), 260);
  }, 3600);
}
