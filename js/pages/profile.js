// ============================================================================
// pages/profile.js
// ============================================================================
import { icons } from "../icons.js";
import * as db from "../db.js";
import { state } from "../store.js";
import { fmt, timeAgo, statusBadge, coinLabel } from "../components/ui.js";

export async function render(root) {
  const [reqs, transfers] = await Promise.all([
    db.requests.listForUser(state.user.id),
    db.transfers.listForUser(state.user.id),
  ]);

  root.innerHTML = `
    <div class="page-head">
      <div>
        <span class="eyebrow">Your account</span>
        <h1 class="page-title">Profile</h1>
      </div>
    </div>

    <div class="card card-pad flex items-center gap-20" style="flex-wrap:wrap;">
      <span class="avatar" style="width:64px;height:64px;font-size:22px;">${state.user.avatarInitials}</span>
      <div style="flex:1;min-width:200px;">
        <div class="section-title">${state.user.name}</div>
        <div class="muted mt-8">${icons.key} ${state.user.handle}</div>
        <div class="faint mt-8" style="font-size:12.5px;">Member since ${new Date(state.user.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</div>
      </div>
      <div class="flex gap-20">
        <div class="text-right">
          <div class="mono-num" style="font-size:20px;">${fmt(state.wallet.gold)}</div>
          <div class="row-sub">Gold</div>
        </div>
        <div class="text-right">
          <div class="mono-num" style="font-size:20px;">${fmt(state.wallet.purple)}</div>
          <div class="row-sub">Purple</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="tabs" id="profileTabs">
        <button class="tab-btn is-active" data-tab="exchange">Exchange history <span class="count">${reqs.length}</span></button>
        <button class="tab-btn" data-tab="sharing">Shared coins <span class="count">${transfers.length}</span></button>
      </div>
      <div class="card card-pad" id="tabPanel">
        ${exchangePanel(reqs)}
      </div>
    </div>
  `;

  const tabs = root.querySelector("#profileTabs");
  const panel = root.querySelector("#tabPanel");
  tabs.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("is-active", b === btn));
      panel.innerHTML = btn.dataset.tab === "exchange" ? exchangePanel(reqs) : sharingPanel(transfers);
    });
  });
}

function exchangePanel(reqs) {
  if (reqs.length === 0) return `<div class="empty-state">${icons.exchange}<h3>No exchange history</h3><p>Your requests will appear here.</p></div>`;
  return `<div class="row-list">${reqs.map((r) => `
    <div class="row-item">
      <span class="coin-face coin-face--sm ${r.direction === "gold_to_purple" ? "coin-face--gold" : "coin-face--purple"}">${icons.exchange}</span>
      <div class="row-main">
        <div class="row-title">${fmt(r.amountIn)} ${r.direction === "gold_to_purple" ? "Gold" : "Purple"} → ${fmt(r.amountOut)} ${r.direction === "gold_to_purple" ? "Purple" : "Gold"}</div>
        <div class="row-sub">${timeAgo(r.createdAt)}</div>
      </div>
      <div class="row-meta">${statusBadge(r.status)}</div>
    </div>
  `).join("")}</div>`;
}

function sharingPanel(transfers) {
  if (transfers.length === 0) return `<div class="empty-state">${icons.share}<h3>No shared coins</h3><p>Transfers you send or receive will appear here.</p></div>`;
  return `<div class="row-list">${transfers.map((t) => {
    const incoming = t.toUserId === state.user.id;
    return `
    <div class="row-item">
      <span class="coin-face coin-face--sm ${t.coinType === "gold" ? "coin-face--gold" : "coin-face--purple"}">${icons[incoming ? "arrowDownLeft" : "arrowUpRight"]}</span>
      <div class="row-main">
        <div class="row-title">${incoming ? "Received" : "Sent"} ${fmt(t.amount)} ${coinLabel(t.coinType)}</div>
        <div class="row-sub">${timeAgo(t.createdAt)}</div>
      </div>
      <div class="row-meta"><span class="badge badge-approved">Completed</span></div>
    </div>
  `;
  }).join("")}</div>`;
}
