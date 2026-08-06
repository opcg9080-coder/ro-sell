// ============================================================================
// pages/coins.js
// ============================================================================
import { icons } from "../icons.js";
import * as db from "../db.js";
import { state, refreshSession, toast } from "../store.js";
import { fmt } from "../components/ui.js";

export async function render(root) {
  const [catalog, myUnlocks] = await Promise.all([db.coins.list(), db.unlockRequests.listForUser(state.user.id)]);
  const unlockMap = new Map(myUnlocks.map((u) => [u.coinId, u.status]));

  root.innerHTML = `
    <div class="page-head">
      <div>
        <span class="eyebrow">Collectibles</span>
        <h1 class="page-title">Coin Catalog</h1>
      </div>
      <span class="badge badge-neutral">${icons.coins} ${catalog.length} coins published</span>
    </div>

    <div class="grid grid-3">
      ${catalog.map((c) => coinCard(c, unlockMap.get(c.id))).join("")}
    </div>
  `;

  root.querySelectorAll("[data-unlock]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const coinId = btn.dataset.unlock;
      const coin = catalog.find((c) => c.id === coinId);
      if (state.wallet.gold < coin.requiredGold || state.wallet.purple < coin.requiredPurple) {
        toast({ title: "Not enough coins yet", body: "Keep collecting to reach the requirement.", tone: "danger", icon: "x" });
        return;
      }
      btn.disabled = true;
      await db.unlockRequests.create({ userId: state.user.id, coinId });
      toast({ title: "Unlock request sent", body: `Waiting on admin approval for ${coin.name}.`, tone: "purple", icon: "send" });
      await refreshSession();
      render(root);
    });
  });
}

function coinCard(c, unlockStatus) {
  const goldPct = Math.min(100, Math.round((state.wallet.gold / Math.max(1, c.requiredGold)) * 100));
  const purplePct = Math.min(100, Math.round((state.wallet.purple / Math.max(1, c.requiredPurple)) * 100));
  const overall = Math.min(goldPct, purplePct);
  const eligible = state.wallet.gold >= c.requiredGold && state.wallet.purple >= c.requiredPurple;

  let actionHTML;
  if (unlockStatus === "pending") {
    actionHTML = `<span class="badge badge-pending" style="width:100%;justify-content:center;padding:10px;">${icons.clock} Request pending</span>`;
  } else if (unlockStatus === "approved") {
    actionHTML = `<span class="badge badge-approved" style="width:100%;justify-content:center;padding:10px;">${icons.check} Unlocked</span>`;
  } else {
    actionHTML = `<button class="btn ${eligible ? "btn-purple" : "btn-ghost"} btn-block" data-unlock="${c.id}" ${eligible ? "" : "disabled"}>
      ${icons.lock} ${eligible ? "Request Unlock" : "Requirement not met"}
    </button>`;
  }

  return `
    <div class="card coin-card">
      <div class="coin-card-top">
        <span class="coin-face coin-face--purple">${icons.trophy}</span>
        <div>
          <div class="coin-card-name">${c.name}</div>
          <div class="row-sub">${c.unlockRequirement}</div>
        </div>
      </div>
      <p class="coin-card-desc">${c.description}</p>
      <div class="coin-req-row">
        <span class="coin-req">${icons.coins} ${fmt(c.requiredGold)} Gold</span>
        <span class="coin-req">${icons.coins} ${fmt(c.requiredPurple)} Purple</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${overall}%;"></div></div>
      ${actionHTML}
    </div>
  `;
}
