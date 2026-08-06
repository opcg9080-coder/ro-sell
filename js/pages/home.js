// ============================================================================
// pages/home.js
// ============================================================================
import { icons } from "../icons.js";
import * as db from "../db.js";
import { state } from "../store.js";
import { fmt, timeAgo, statusBadge } from "../components/ui.js";

export async function render(root) {
  const [reqs, transfers, coinsList] = await Promise.all([
    db.requests.listForUser(state.user.id),
    db.transfers.listForUser(state.user.id),
    db.coins.list(),
  ]);

  const pendingCount = reqs.filter((r) => r.status === "pending").length;
  const approvedCount = reqs.filter((r) => r.status === "approved").length;

  const activity = [
    ...reqs.slice(0, 4).map((r) => ({
      kind: "exchange", createdAt: r.createdAt, status: r.status,
      title: `${r.direction === "gold_to_purple" ? "Gold → Purple" : "Purple → Gold"}`,
      sub: `${fmt(r.amountIn)} → ${fmt(r.amountOut)} · ${r.status}`,
    })),
    ...transfers.slice(0, 4).map((t) => ({
      kind: "transfer", createdAt: t.createdAt, status: "completed",
      title: t.toUserId === state.user.id ? "Coins received" : "Coins sent",
      sub: `${fmt(t.amount)} ${t.coinType === "gold" ? "Gold" : "Purple"} Coins`,
    })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  root.innerHTML = `
    <div class="page-head">
      <div>
        <span class="eyebrow">Good to see you</span>
        <h1 class="page-title">${state.user.name.split(" ")[0]}'s Overview</h1>
      </div>
      <span class="badge badge-neutral">${icons.clock} Member since ${new Date(state.user.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span>
    </div>

    <div class="wallet-hero">
      <div class="wallet-balance-row">
        <div class="wallet-balance">
          <span class="coin-face coin-face--lg coin-face--gold">${icons.coins}</span>
          <div>
            <div class="wallet-balance-num ticker-flip">${fmt(state.wallet.gold)}</div>
            <div class="wallet-balance-label">Gold Coins</div>
          </div>
        </div>
        <div class="wallet-balance">
          <span class="coin-face coin-face--lg coin-face--purple">${icons.coins}</span>
          <div>
            <div class="wallet-balance-num ticker-flip">${fmt(state.wallet.purple)}</div>
            <div class="wallet-balance-label">Purple Coins</div>
          </div>
        </div>
      </div>
      <div class="flex gap-10">
        <a href="#/exchange" class="btn btn-gold">${icons.exchange} Exchange</a>
        <a href="#/sharing" class="btn btn-ghost">${icons.share} Share Coins</a>
      </div>
    </div>

    <div class="grid grid-4 section">
      <div class="card stat-card">
        <div class="stat-card-top"><span class="stat-icon stat-icon--gold">${icons.clock}</span></div>
        <span class="stat-value">${pendingCount}</span>
        <span class="stat-label">Pending requests</span>
      </div>
      <div class="card stat-card">
        <div class="stat-card-top"><span class="stat-icon stat-icon--info">${icons.check}</span></div>
        <span class="stat-value">${approvedCount}</span>
        <span class="stat-label">Approved exchanges</span>
      </div>
      <div class="card stat-card">
        <div class="stat-card-top"><span class="stat-icon stat-icon--purple">${icons.coins}</span></div>
        <span class="stat-value">${coinsList.length}</span>
        <span class="stat-label">Coins in catalog</span>
      </div>
      <div class="card stat-card">
        <div class="stat-card-top"><span class="stat-icon stat-icon--neutral">${icons.trophy}</span></div>
        <span class="stat-value">${fmt(state.wallet.gold + state.wallet.purple)}</span>
        <span class="stat-label">Total coin holdings</span>
      </div>
    </div>

    <div class="section">
      <div class="page-head" style="margin-bottom:14px;">
        <h2 class="section-title">Recent activity</h2>
        <a href="#/profile" class="muted" style="font-size:13px;font-weight:650;">View all ${icons.chevronRight}</a>
      </div>
      <div class="card card-pad">
        ${activity.length === 0 ? emptyActivity() : `<div class="row-list">${activity.map(activityRow).join("")}</div>`}
      </div>
    </div>

    <div class="section">
      <div class="page-head" style="margin-bottom:14px;">
        <h2 class="section-title">Discover coins</h2>
        <a href="#/coins" class="muted" style="font-size:13px;font-weight:650;">Browse catalog ${icons.chevronRight}</a>
      </div>
      <div class="grid grid-3">
        ${coinsList.slice(0, 3).map((c) => `
          <div class="card coin-card">
            <div class="coin-card-top">
              <span class="coin-face coin-face--purple">${icons.trophy}</span>
              <span class="coin-card-name">${c.name}</span>
            </div>
            <p class="coin-card-desc">${c.description}</p>
            <div class="coin-req-row">
              <span class="coin-req">${icons.coins} ${fmt(c.requiredGold)} Gold</span>
              <span class="coin-req">${icons.coins} ${fmt(c.requiredPurple)} Purple</span>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function activityRow(a) {
  const icon = a.kind === "exchange" ? "exchange" : (a.title === "Coins received" ? "arrowDownLeft" : "arrowUpRight");
  return `
    <div class="row-item">
      <span class="coin-face coin-face--sm ${a.kind === "exchange" ? "coin-face--gold" : "coin-face--purple"}">${icons[icon]}</span>
      <div class="row-main">
        <div class="row-title">${a.title}</div>
        <div class="row-sub">${a.sub} · ${timeAgo(a.createdAt)}</div>
      </div>
      <div class="row-meta">${statusBadge(a.status)}</div>
    </div>
  `;
}

function emptyActivity() {
  return `
    <div class="empty-state">
      ${icons.sparkle}
      <h3>No activity yet</h3>
      <p>Your exchanges and coin transfers will show up here.</p>
    </div>
  `;
}
