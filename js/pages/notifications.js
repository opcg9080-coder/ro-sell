// ============================================================================
// pages/notifications.js
// ============================================================================
import { icons } from "../icons.js";
import * as db from "../db.js";
import { state, refreshSession } from "../store.js";
import { timeAgo } from "../components/ui.js";

const TYPE_ICON = {
  exchange_approved: { icon: "check", cls: "stat-icon--info" },
  exchange_rejected: { icon: "x", cls: "stat-icon--neutral" },
  exchange_pending: { icon: "clock", cls: "stat-icon--gold" },
  new_coin: { icon: "trophy", cls: "stat-icon--purple" },
  coin_received: { icon: "arrowDownLeft", cls: "stat-icon--gold" },
  coin_sent: { icon: "arrowUpRight", cls: "stat-icon--purple" },
};

export async function render(root) {
  const items = await db.notifications.listForUser(state.user.id);

  root.innerHTML = `
    <div class="page-head">
      <div>
        <span class="eyebrow">Stay in the loop</span>
        <h1 class="page-title">Notifications</h1>
      </div>
      ${items.some((n) => !n.read) ? `<button class="btn btn-ghost btn-sm" id="markAllBtn">${icons.check} Mark all as read</button>` : ""}
    </div>

    <div class="card card-pad">
      ${items.length === 0 ? `<div class="empty-state">${icons.bell}<h3>You're all caught up</h3><p>New updates will show up here.</p></div>` : items.map(notifRow).join("")}
    </div>
  `;

  const markAllBtn = root.querySelector("#markAllBtn");
  if (markAllBtn) {
    markAllBtn.addEventListener("click", async () => {
      await db.notifications.markAllRead(state.user.id);
      await refreshSession();
      render(root);
    });
  }

  root.querySelectorAll("[data-notif]").forEach((el) => {
    el.addEventListener("click", async () => {
      await db.notifications.markRead(el.dataset.notif);
      await refreshSession();
      el.classList.remove("is-unread");
    });
  });
}

function notifRow(n) {
  const meta = TYPE_ICON[n.type] || { icon: "info", cls: "stat-icon--neutral" };
  return `
    <div class="notif-item ${!n.read ? "is-unread" : ""}" data-notif="${n.id}" style="cursor:pointer;">
      <span class="stat-icon ${meta.cls}">${icons[meta.icon]}</span>
      <div class="row-main">
        <div class="row-title">${n.title}</div>
        <div class="row-sub">${n.body}</div>
        <div class="faint mt-8" style="font-size:11.5px;">${timeAgo(n.createdAt)}</div>
      </div>
    </div>
  `;
}
