// ============================================================================
// pages/admin.js — Admin Console: dashboard, requests, coins, users, rates
// ============================================================================
import { icons } from "../icons.js";
import * as db from "../db.js";
import { refreshSession, toast } from "../store.js";
import { fmt, timeAgo, statusBadge, escapeHtml } from "../components/ui.js";
import { openModal, closeModal } from "../components/modal.js";

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
export async function renderDashboard(root) {
  const [stats, allReqs, users] = await Promise.all([db.admin.stats(), db.requests.listAll(), db.users.list()]);
  const userMap = new Map(users.map((u) => [u.id, u]));
  const recent = allReqs.slice(0, 6);

  root.innerHTML = `
    <div class="page-head">
      <div><span class="eyebrow">Admin console</span><h1 class="page-title">Dashboard</h1></div>
      <a href="#/admin/requests" class="btn btn-gold">${icons.exchange} Review requests</a>
    </div>

    <div class="grid grid-4">
      ${statCard("users", "Total users", stats.totalUsers, "neutral")}
      ${statCard("clock", "Pending requests", stats.pending, "gold")}
      ${statCard("check", "Approved requests", stats.approved, "info")}
      ${statCard("x", "Rejected requests", stats.rejected, "neutral")}
    </div>

    <div class="grid grid-2 section">
      ${statCard("lock", "Pending coin unlocks", stats.pendingUnlocks, "purple", true)}
      ${statCard("trophy", "Coins published", stats.totalCoinsPublished, "purple", true)}
    </div>

    <div class="section">
      <div class="page-head" style="margin-bottom:14px;">
        <h2 class="section-title">Latest requests</h2>
        <a href="#/admin/requests" class="muted" style="font-size:13px;font-weight:650;">Manage all ${icons.chevronRight}</a>
      </div>
      <div class="card card-pad">
        ${recent.length === 0 ? `<div class="empty-state">${icons.exchange}<h3>No requests yet</h3></div>` : `<div class="row-list">${recent.map((r) => `
          <div class="row-item">
            <span class="coin-face coin-face--sm ${r.direction === "gold_to_purple" ? "coin-face--gold" : "coin-face--purple"}">${icons.exchange}</span>
            <div class="row-main">
              <div class="row-title">${userMap.get(r.userId)?.name || "Unknown"} · ${fmt(r.amountIn)} → ${fmt(r.amountOut)}</div>
              <div class="row-sub">${timeAgo(r.createdAt)}</div>
            </div>
            <div class="row-meta">${statusBadge(r.status)}</div>
          </div>
        `).join("")}</div>`}
      </div>
    </div>
  `;
}

function statCard(iconName, label, value, tone, wide = false) {
  return `
    <div class="card stat-card ${wide ? "card-pad" : ""}">
      <div class="stat-card-top"><span class="stat-icon stat-icon--${tone}">${icons[iconName]}</span></div>
      <span class="stat-value">${fmt(value)}</span>
      <span class="stat-label">${label}</span>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Requests (exchange approvals + coin unlock approvals)
// ---------------------------------------------------------------------------
let requestsFilter = "pending";

export async function renderRequests(root) {
  const [allReqs, users, unlocks, coinsList] = await Promise.all([
    db.requests.listAll(), db.users.list(), db.unlockRequests.listAll(), db.coins.list(),
  ]);
  const userMap = new Map(users.map((u) => [u.id, u]));
  const coinMap = new Map(coinsList.map((c) => [c.id, c]));
  const filtered = requestsFilter === "all" ? allReqs : allReqs.filter((r) => r.status === requestsFilter);

  root.innerHTML = `
    <div class="page-head">
      <div><span class="eyebrow">Admin console</span><h1 class="page-title">Requests</h1></div>
      <div class="field" style="min-width:220px;">
        <input class="input" id="userSearch" placeholder="Search by user name or ID" />
      </div>
    </div>

    <div class="tabs" id="reqTabs">
      ${["pending", "approved", "rejected", "all"].map((s) => `
        <button class="tab-btn ${requestsFilter === s ? "is-active" : ""}" data-filter="${s}">
          ${s[0].toUpperCase() + s.slice(1)} <span class="count">${s === "all" ? allReqs.length : allReqs.filter((r) => r.status === s).length}</span>
        </button>
      `).join("")}
    </div>

    <div class="card">
      <div class="table-wrap">
        <table class="dtable" id="reqTable">
          <thead><tr><th>User</th><th>Direction</th><th>Amount</th><th>Requested</th><th>Status</th><th></th></tr></thead>
          <tbody>
            ${filtered.length === 0 ? `<tr><td colspan="6"><div class="empty-state">${icons.exchange}<h3>No requests here</h3></div></td></tr>` : filtered.map((r) => requestTr(r, userMap)).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="page-head" style="margin-bottom:14px;"><h2 class="section-title">Coin unlock requests</h2></div>
      <div class="card">
        <div class="table-wrap">
          <table class="dtable">
            <thead><tr><th>User</th><th>Coin</th><th>Requested</th><th>Status</th><th></th></tr></thead>
            <tbody>
              ${unlocks.length === 0 ? `<tr><td colspan="5"><div class="empty-state">${icons.lock}<h3>No unlock requests</h3></div></td></tr>` : unlocks.map((u) => unlockTr(u, userMap, coinMap)).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  root.querySelector("#reqTabs").querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => { requestsFilter = btn.dataset.filter; renderRequests(root); });
  });

  root.querySelectorAll("[data-approve]").forEach((btn) => btn.addEventListener("click", () => resolveRequest(root, btn.dataset.approve, "approved")));
  root.querySelectorAll("[data-reject]").forEach((btn) => btn.addEventListener("click", () => openRejectModal(root, btn.dataset.reject)));
  root.querySelectorAll("[data-unlock-approve]").forEach((btn) => btn.addEventListener("click", () => resolveUnlock(root, btn.dataset.unlockApprove, "approved")));
  root.querySelectorAll("[data-unlock-reject]").forEach((btn) => btn.addEventListener("click", () => resolveUnlock(root, btn.dataset.unlockReject, "rejected")));

  root.querySelector("#userSearch").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    root.querySelectorAll("#reqTable tbody tr[data-user]").forEach((tr) => {
      tr.style.display = tr.dataset.user.includes(q) ? "" : "none";
    });
  });
}

function requestTr(r, userMap) {
  const u = userMap.get(r.userId);
  const inLabel = r.direction === "gold_to_purple" ? "Gold" : "Purple";
  const outLabel = r.direction === "gold_to_purple" ? "Purple" : "Gold";
  return `
    <tr data-user="${(u ? `${u.name} ${u.handle}` : "").toLowerCase()}">
      <td><div class="row-title">${u ? u.name : "Unknown"}</div><div class="row-sub">${u ? u.handle : ""}</div></td>
      <td>${inLabel} → ${outLabel}</td>
      <td class="mono-num">${fmt(r.amountIn)} → ${fmt(r.amountOut)}</td>
      <td class="muted">${timeAgo(r.createdAt)}</td>
      <td>${statusBadge(r.status)}</td>
      <td>
        ${r.status === "pending" ? `
          <div class="flex gap-8">
            <button class="btn btn-sm btn-purple" data-approve="${r.id}">${icons.check} Approve</button>
            <button class="btn btn-sm btn-danger-ghost" data-reject="${r.id}">${icons.x} Reject</button>
          </div>
        ` : `<span class="faint" style="font-size:12px;">Resolved</span>`}
      </td>
    </tr>
  `;
}

function unlockTr(u, userMap, coinMap) {
  const usr = userMap.get(u.userId);
  const coin = coinMap.get(u.coinId);
  return `
    <tr>
      <td><div class="row-title">${usr ? usr.name : "Unknown"}</div><div class="row-sub">${usr ? usr.handle : ""}</div></td>
      <td>${coin ? coin.name : "Unknown coin"}</td>
      <td class="muted">${timeAgo(u.createdAt)}</td>
      <td>${statusBadge(u.status)}</td>
      <td>
        ${u.status === "pending" ? `
          <div class="flex gap-8">
            <button class="btn btn-sm btn-purple" data-unlock-approve="${u.id}">${icons.check} Approve</button>
            <button class="btn btn-sm btn-danger-ghost" data-unlock-reject="${u.id}">${icons.x} Reject</button>
          </div>
        ` : `<span class="faint" style="font-size:12px;">Resolved</span>`}
      </td>
    </tr>
  `;
}

async function resolveRequest(root, id, decision, reason) {
  await db.requests.resolve(id, decision, reason);
  await refreshSession();
  toast({ title: decision === "approved" ? "Request approved" : "Request rejected", tone: decision === "approved" ? "purple" : "danger", icon: decision === "approved" ? "check" : "x" });
  renderRequests(root);
}

async function resolveUnlock(root, id, decision) {
  await db.unlockRequests.resolve(id, decision);
  await refreshSession();
  toast({ title: decision === "approved" ? "Unlock approved" : "Unlock rejected", tone: decision === "approved" ? "purple" : "danger", icon: decision === "approved" ? "check" : "x" });
  renderRequests(root);
}

function openRejectModal(root, id) {
  openModal({
    title: "Reject exchange request",
    bodyHTML: `
      <div class="field">
        <label for="reasonInput">Reason (shown to the user)</label>
        <input class="input" id="reasonInput" placeholder="e.g. Amount exceeds daily limit" />
      </div>
      <button class="btn btn-danger-ghost btn-block mt-16" id="confirmReject">${icons.x} Confirm rejection</button>
    `,
    onMount: (m) => {
      m.querySelector("#confirmReject").addEventListener("click", async () => {
        const reason = m.querySelector("#reasonInput").value.trim();
        closeModal();
        await resolveRequest(root, id, "rejected", reason || undefined);
      });
    },
  });
}

// ---------------------------------------------------------------------------
// Coin management
// ---------------------------------------------------------------------------
export async function renderCoins(root) {
  const catalog = await db.coins.list();

  root.innerHTML = `
    <div class="page-head">
      <div><span class="eyebrow">Admin console</span><h1 class="page-title">Coin Management</h1></div>
      <button class="btn btn-gold" id="newCoinBtn">${icons.plus} Publish New Coin</button>
    </div>

    <div class="grid grid-3">
      ${catalog.map((c) => `
        <div class="card coin-card">
          <div class="coin-card-top">
            <span class="coin-face coin-face--purple">${icons.trophy}</span>
            <div><div class="coin-card-name">${c.name}</div><div class="row-sub">${timeAgo(c.createdAt)}</div></div>
          </div>
          <p class="coin-card-desc">${c.description}</p>
          <div class="coin-req-row">
            <span class="coin-req">${icons.coins} ${fmt(c.requiredGold)} Gold</span>
            <span class="coin-req">${icons.coins} ${fmt(c.requiredPurple)} Purple</span>
          </div>
          <div class="row-sub">${icons.lock} ${c.unlockRequirement}</div>
        </div>
      `).join("")}
    </div>
  `;

  root.querySelector("#newCoinBtn").addEventListener("click", () => openPublishModal(root));
}

function openPublishModal(root) {
  openModal({
    title: "Publish a new coin",
    bodyHTML: `
      <div class="flex-col gap-14">
        <div class="field"><label for="coinName">Coin name</label><input class="input" id="coinName" placeholder="e.g. Pioneer Coin" /></div>
        <div class="field"><label for="coinDesc">Description</label><input class="input" id="coinDesc" placeholder="What makes this coin special" /></div>
        <div class="flex gap-12">
          <div class="field" style="flex:1;"><label for="reqGold">Required Gold</label><input class="input mono-num" id="reqGold" type="number" min="0" value="0" /></div>
          <div class="field" style="flex:1;"><label for="reqPurple">Required Purple</label><input class="input mono-num" id="reqPurple" type="number" min="0" value="0" /></div>
        </div>
        <div class="field"><label for="unlockReq">Unlock requirement</label><input class="input" id="unlockReq" placeholder="e.g. None — open to all members" /></div>
        <span class="help-text is-error" id="publishErr"></span>
        <button class="btn btn-gold btn-block" id="publishBtn">${icons.plus} Publish Coin</button>
      </div>
    `,
    onMount: (m) => {
      m.querySelector("#publishBtn").addEventListener("click", async () => {
        const name = m.querySelector("#coinName").value.trim();
        const description = m.querySelector("#coinDesc").value.trim();
        const requiredGold = Number(m.querySelector("#reqGold").value) || 0;
        const requiredPurple = Number(m.querySelector("#reqPurple").value) || 0;
        const unlockRequirement = m.querySelector("#unlockReq").value.trim() || "None — open to all members";

        if (!name || !description) {
          m.querySelector("#publishErr").textContent = "Name and description are required.";
          return;
        }
        await db.coins.publish({ name, description, requiredGold, requiredPurple, unlockRequirement });
        closeModal();
        toast({ title: "Coin published", body: `${name} is now live in the catalog.`, tone: "gold", icon: "trophy" });
        renderCoins(root);
      });
    },
  });
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export async function renderUsers(root) {
  const [users, wallets] = await Promise.all([db.users.list(), loadAllWallets()]);
  const members = users.filter((u) => u.role === "user");

  root.innerHTML = `
    <div class="page-head">
      <div><span class="eyebrow">Admin console</span><h1 class="page-title">Users</h1></div>
      <div class="field" style="min-width:240px;"><input class="input" id="userSearch2" placeholder="Search users" /></div>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table class="dtable" id="usersTable">
          <thead><tr><th>Name</th><th>Member ID</th><th>Gold</th><th>Purple</th><th>Joined</th></tr></thead>
          <tbody>
            ${members.map((u) => `
              <tr data-user="${(u.name + " " + u.handle).toLowerCase()}">
                <td><div class="flex items-center gap-10"><span class="avatar" style="width:30px;height:30px;font-size:11.5px;">${u.avatarInitials}</span>${u.name}</div></td>
                <td class="mono-num">${u.handle}</td>
                <td class="mono-num">${fmt(wallets[u.id]?.gold || 0)}</td>
                <td class="mono-num">${fmt(wallets[u.id]?.purple || 0)}</td>
                <td class="muted">${timeAgo(u.createdAt)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;

  root.querySelector("#userSearch2").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    root.querySelectorAll("#usersTable tbody tr").forEach((tr) => { tr.style.display = tr.dataset.user.includes(q) ? "" : "none"; });
  });
}

async function loadAllWallets() {
  const users = await db.users.list();
  const out = {};
  for (const u of users) out[u.id] = await db.wallets.get(u.id);
  return out;
}

// ---------------------------------------------------------------------------
// Exchange rate settings
// ---------------------------------------------------------------------------
export async function renderSettings(root) {
  const rates = await db.settings.get();

  root.innerHTML = `
    <div class="page-head">
      <div><span class="eyebrow">Admin console</span><h1 class="page-title">Exchange Rate Management</h1></div>
    </div>

    <div class="grid grid-2">
      <div class="card card-pad">
        <div class="flex items-center gap-12 mb-16">
          <span class="stat-icon stat-icon--gold">${icons.coins}</span>
          <div class="row-title">Gold → Purple</div>
        </div>
        <div class="field">
          <label for="g2p">Gold Coins required per 1 Purple Coin</label>
          <input class="input mono-num" id="g2p" type="number" min="1" value="${rates.goldToPurpleRate}" />
        </div>
      </div>
      <div class="card card-pad">
        <div class="flex items-center gap-12 mb-16">
          <span class="stat-icon stat-icon--purple">${icons.coins}</span>
          <div class="row-title">Purple → Gold</div>
        </div>
        <div class="field">
          <label for="p2g">Gold Coins granted per 1 Purple Coin</label>
          <input class="input mono-num" id="p2g" type="number" min="1" value="${rates.purpleToGoldRate}" />
        </div>
      </div>
    </div>

    <div class="card card-pad section flex items-center justify-between" style="flex-wrap:wrap;gap:16px;">
      <p class="help-text">Last updated ${timeAgo(rates.updatedAt)}. Changes apply to new exchange requests immediately.</p>
      <button class="btn btn-gold" id="saveRatesBtn">${icons.check} Save Rates</button>
    </div>
  `;

  root.querySelector("#saveRatesBtn").addEventListener("click", async () => {
    const goldToPurpleRate = Number(root.querySelector("#g2p").value) || rates.goldToPurpleRate;
    const purpleToGoldRate = Number(root.querySelector("#p2g").value) || rates.purpleToGoldRate;
    await db.settings.update({ goldToPurpleRate, purpleToGoldRate });
    toast({ title: "Exchange rates updated", tone: "gold", icon: "check" });
    renderSettings(root);
  });
}
