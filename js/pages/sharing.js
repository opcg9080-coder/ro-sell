// ============================================================================
// pages/sharing.js
// ============================================================================
import { icons } from "../icons.js";
import * as db from "../db.js";
import { state, refreshSession, toast } from "../store.js";
import { fmt, timeAgo, coinLabel } from "../components/ui.js";

let coinType = "gold";

export async function render(root) {
  const history = await db.transfers.listForUser(state.user.id);

  root.innerHTML = `
    <div class="page-head">
      <div>
        <span class="eyebrow">Peer to peer</span>
        <h1 class="page-title">Coin Sharing</h1>
      </div>
      <span class="badge badge-neutral">${icons.key} Your ID: ${state.user.handle}</span>
    </div>

    <div class="grid" style="grid-template-columns: 1fr 0.85fr; gap:20px;">
      <div class="card card-pad">
        <div class="segmented" id="coinToggle">
          <button type="button" data-coin="gold" class="is-active">${icons.coins} Gold Coin</button>
          <button type="button" data-coin="purple">${icons.coins} Purple Coin</button>
        </div>

        <form id="shareForm" class="flex-col gap-16 mt-24">
          <div class="field">
            <label for="receiverId">Receiver ID</label>
            <input class="input" id="receiverId" placeholder="e.g. OWEN-1180" required />
          </div>
          <div class="field">
            <label for="amount">Amount</label>
            <input class="input mono-num" id="amount" type="number" min="1" step="1" placeholder="0" required />
          </div>
          <div class="field">
            <label for="secretCode">Secret Code</label>
            <input class="input" id="secretCode" type="password" placeholder="Shared privately with the receiver" required />
            <span class="help-text">Ask the receiver for their secret code before sending.</span>
          </div>

          <div id="shareResult"></div>

          <button type="submit" class="btn btn-purple btn-block">${icons.send} Send Coins</button>
        </form>
      </div>

      <div class="card card-pad flex-col gap-14">
        <div class="flex items-center gap-12">
          <span class="stat-icon stat-icon--purple">${icons.info}</span>
          <div>
            <div class="row-title">How sharing works</div>
            <div class="row-sub">A quick checklist before you send</div>
          </div>
        </div>
        <ul class="flex-col gap-10" style="font-size:13px;color:var(--text-muted);">
          <li class="flex gap-10"><span style="color:var(--purple);">${icons.check}</span>Get the receiver's ID and secret code directly from them.</li>
          <li class="flex gap-10"><span style="color:var(--purple);">${icons.check}</span>Transfers are instant once verified — there's no admin approval step.</li>
          <li class="flex gap-10"><span style="color:var(--purple);">${icons.check}</span>Double-check the amount; coin transfers can't be undone.</li>
        </ul>
      </div>
    </div>

    <div class="section">
      <div class="page-head" style="margin-bottom:14px;"><h2 class="section-title">Sharing history</h2></div>
      <div class="card card-pad">
        ${history.length === 0 ? `<div class="empty-state">${icons.share}<h3>No transfers yet</h3><p>Coins you send or receive will appear here.</p></div>` : `<div class="row-list">${history.map((t) => historyRow(t)).join("")}</div>`}
      </div>
    </div>
  `;

  wire(root);
}

function historyRow(t) {
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
}

function wire(root) {
  const toggle = root.querySelector("#coinToggle");
  toggle.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      coinType = btn.dataset.coin;
      toggle.querySelectorAll("button").forEach((b) => b.classList.toggle("is-active", b === btn));
    });
  });

  const form = root.querySelector("#shareForm");
  const resultEl = root.querySelector("#shareResult");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    resultEl.innerHTML = "";
    const receiverHandle = root.querySelector("#receiverId").value;
    const amount = Number(root.querySelector("#amount").value);
    const secretCode = root.querySelector("#secretCode").value;

    if (!amount || amount <= 0) {
      resultEl.innerHTML = validationMsg(false, "Enter an amount greater than zero.");
      return;
    }

    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    const res = await db.transfers.send({ fromUserId: state.user.id, receiverHandle, coinType, amount, secretCode });
    submitBtn.disabled = false;

    if (!res.ok) {
      resultEl.innerHTML = validationMsg(false, res.error);
      return;
    }

    resultEl.innerHTML = validationMsg(true, `${fmt(amount)} ${coinLabel(coinType)} sent successfully.`);
    toast({ title: "Coins sent", body: `${fmt(amount)} ${coinLabel(coinType)} delivered.`, tone: "purple", icon: "check" });
    await refreshSession();
    form.reset();
    setTimeout(() => render(root), 900);
  });
}

function validationMsg(ok, text) {
  return `
    <div class="flex items-center gap-10" style="padding:12px 14px;border-radius:var(--radius-sm);background:${ok ? "var(--info-soft)" : "var(--danger-soft)"};color:${ok ? "var(--info)" : "var(--danger)"};font-size:13px;font-weight:600;">
      ${ok ? icons.check : icons.x}<span>${text}</span>
    </div>
  `;
}
