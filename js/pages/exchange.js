// ============================================================================
// pages/exchange.js
// ============================================================================
import { icons } from "../icons.js";
import * as db from "../db.js";
import { state, refreshSession, toast } from "../store.js";
import { fmt, timeAgo, statusBadge } from "../components/ui.js";

let direction = "gold_to_purple"; // or purple_to_gold

export async function render(root) {
  const [rates, myRequests] = await Promise.all([db.settings.get(), db.requests.listForUser(state.user.id)]);

  root.innerHTML = `
    <div class="page-head">
      <div>
        <span class="eyebrow">Convert coins</span>
        <h1 class="page-title">Exchange</h1>
      </div>
    </div>

    <div class="grid" style="grid-template-columns: 1.1fr 0.9fr; gap:20px;">
      <div class="card card-pad">
        <div class="segmented" id="directionToggle">
          <button type="button" data-dir="gold_to_purple" class="${direction === "gold_to_purple" ? "is-active" : ""}">
            ${icons.coins} Gold → Purple
          </button>
          <button type="button" data-dir="purple_to_gold" class="${direction === "purple_to_gold" ? "is-active" : ""}">
            ${icons.coins} Purple → Gold
          </button>
        </div>

        <form id="exchangeForm" class="mt-24">
          <div class="flex items-center gap-16" style="align-items:flex-end;flex-wrap:wrap;">
            <div class="field" style="flex:1;min-width:160px;">
              <label for="amountIn">You send</label>
              <input class="input mono-num" id="amountIn" type="number" min="1" step="1" placeholder="0" required />
              <span class="help-text" id="sendLabel"></span>
            </div>
            <div class="exchange-arrow">${icons.exchange}</div>
            <div class="field" style="flex:1;min-width:160px;">
              <label>You receive</label>
              <div class="input mono-num" id="amountOutPreview" style="background:var(--gold-tint);border-color:var(--border);color:var(--gold-strong);font-weight:700;">0</div>
              <span class="help-text" id="receiveLabel"></span>
            </div>
          </div>

          <div class="rate-note mt-16" id="rateNote"></div>

          <span class="help-text is-error" id="formError" style="display:block;margin-top:10px;"></span>

          <button type="submit" class="btn btn-gold btn-block mt-20">
            ${icons.send} Request Exchange
          </button>
        </form>
      </div>

      <div class="card card-pad flex-col gap-14">
        <div class="flex items-center gap-12">
          <span class="stat-icon stat-icon--gold">${icons.wallet}</span>
          <div>
            <div class="row-title">Current balances</div>
            <div class="row-sub">Available to convert right now</div>
          </div>
        </div>
        <div class="flex items-center justify-between" style="padding:10px 12px;background:var(--bg-sunken);border-radius:var(--radius-sm);">
          <span class="flex items-center gap-8"><span class="coin-face coin-face--sm coin-face--gold">${icons.coins}</span>Gold</span>
          <span class="mono-num">${fmt(state.wallet.gold)}</span>
        </div>
        <div class="flex items-center justify-between" style="padding:10px 12px;background:var(--bg-sunken);border-radius:var(--radius-sm);">
          <span class="flex items-center gap-8"><span class="coin-face coin-face--sm coin-face--purple">${icons.coins}</span>Purple</span>
          <span class="mono-num">${fmt(state.wallet.purple)}</span>
        </div>
        <hr class="divider" style="margin:6px 0;" />
        <p class="help-text">All requests are reviewed by the admin desk before your wallet updates. You'll get a notification either way.</p>
      </div>
    </div>

    <div class="section">
      <div class="page-head" style="margin-bottom:14px;">
        <h2 class="section-title">Request history</h2>
      </div>
      <div class="card card-pad">
        ${myRequests.length === 0 ? emptyState() : `<div class="row-list">${myRequests.map((r) => requestRow(r)).join("")}</div>`}
      </div>
    </div>
  `;

  wireForm(root, rates);
}

function emptyState() {
  return `<div class="empty-state">${icons.exchange}<h3>No exchange requests yet</h3><p>Submit your first request above.</p></div>`;
}

function requestRow(r) {
  const inLabel = r.direction === "gold_to_purple" ? "Gold" : "Purple";
  const outLabel = r.direction === "gold_to_purple" ? "Purple" : "Gold";
  return `
    <div class="row-item">
      <span class="coin-face coin-face--sm ${r.direction === "gold_to_purple" ? "coin-face--gold" : "coin-face--purple"}">${icons.exchange}</span>
      <div class="row-main">
        <div class="row-title">${fmt(r.amountIn)} ${inLabel} → ${fmt(r.amountOut)} ${outLabel}</div>
        <div class="row-sub">${timeAgo(r.createdAt)}${r.reason ? ` · ${r.reason}` : ""}</div>
      </div>
      <div class="row-meta">${statusBadge(r.status)}</div>
    </div>
  `;
}

function wireForm(root, rates) {
  const toggle = root.querySelector("#directionToggle");
  const amountIn = root.querySelector("#amountIn");
  const preview = root.querySelector("#amountOutPreview");
  const rateNote = root.querySelector("#rateNote");
  const sendLabel = root.querySelector("#sendLabel");
  const receiveLabel = root.querySelector("#receiveLabel");
  const formError = root.querySelector("#formError");

  function currentRate() {
    return direction === "gold_to_purple" ? rates.goldToPurpleRate : rates.purpleToGoldRate;
  }

  function updatePreview() {
    const val = Number(amountIn.value) || 0;
    const rate = currentRate();
    const out = direction === "gold_to_purple" ? Math.floor(val / rate) : Math.floor(val * rate);
    preview.textContent = fmt(out);
    const inName = direction === "gold_to_purple" ? "Gold" : "Purple";
    const outName = direction === "gold_to_purple" ? "Purple" : "Gold";
    sendLabel.textContent = `${inName} Coins`;
    receiveLabel.textContent = `${outName} Coins`;
    rateNote.innerHTML = `${icons.info} Current rate: ${direction === "gold_to_purple" ? `${rate} Gold = 1 Purple` : `1 Purple = ${rate} Gold`}`;
  }

  toggle.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      direction = btn.dataset.dir;
      toggle.querySelectorAll("button").forEach((b) => b.classList.toggle("is-active", b === btn));
      updatePreview();
    });
  });

  amountIn.addEventListener("input", updatePreview);
  updatePreview();

  root.querySelector("#exchangeForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    formError.textContent = "";
    const val = Number(amountIn.value);
    const balanceKey = direction === "gold_to_purple" ? "gold" : "purple";
    const balanceLabel = direction === "gold_to_purple" ? "Gold" : "Purple";

    if (!val || val <= 0) {
      formError.textContent = "Enter an amount greater than zero.";
      return;
    }
    if (val > state.wallet[balanceKey]) {
      formError.textContent = `You only have ${fmt(state.wallet[balanceKey])} ${balanceLabel} Coins available.`;
      return;
    }

    const rate = currentRate();
    const out = direction === "gold_to_purple" ? Math.floor(val / rate) : Math.floor(val * rate);
    if (out <= 0) {
      formError.textContent = "That amount is too small to convert at the current rate.";
      return;
    }

    const submitBtn = root.querySelector('#exchangeForm button[type=submit]');
    submitBtn.disabled = true;
    await db.requests.create({ userId: state.user.id, direction, amountIn: val, amountOut: out });
    submitBtn.disabled = false;

    toast({ title: "Exchange request sent", body: "The admin desk will review it shortly.", tone: "gold", icon: "send" });
    await refreshSession();
    render(root);
  });
}
