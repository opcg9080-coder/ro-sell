// ============================================================================
// pages/wallet.js
// ============================================================================
import { icons } from "../icons.js";
import { state } from "../store.js";
import { fmt } from "../components/ui.js";

export async function render(root) {
  root.innerHTML = `
    <div class="page-head">
      <div>
        <span class="eyebrow">Your balances</span>
        <h1 class="page-title">Wallet</h1>
      </div>
    </div>

    <div class="grid grid-2">
      <div class="card card-pad flex-col gap-16">
        <div class="flex items-center justify-between">
          <span class="coin-face coin-face--lg coin-face--gold">${icons.coins}</span>
          <span class="badge badge-neutral">Coin</span>
        </div>
        <div>
          <div class="wallet-balance-num ticker-flip" style="font-size:34px;">${fmt(state.wallet.gold)}</div>
          <div class="wallet-balance-label mt-8">Gold Coin Balance</div>
        </div>
      </div>

      <div class="card card-pad flex-col gap-16">
        <div class="flex items-center justify-between">
          <span class="coin-face coin-face--lg coin-face--purple">${icons.coins}</span>
          <span class="badge badge-purple">Coin</span>
        </div>
        <div>
          <div class="wallet-balance-num ticker-flip" style="font-size:34px;">${fmt(state.wallet.purple)}</div>
          <div class="wallet-balance-label mt-8">Purple Coin Balance</div>
        </div>
      </div>
    </div>

    <div class="card card-pad section flex items-center justify-between" style="flex-wrap:wrap;gap:16px;">
      <div class="flex items-center gap-12">
        <span class="stat-icon stat-icon--neutral" style="width:40px;height:40px;">${icons.info}</span>
        <div>
          <div class="row-title">Balances update automatically</div>
          <div class="row-sub">Your wallet reflects new totals the moment an admin approves a request.</div>
        </div>
      </div>
      <a href="#/exchange" class="btn btn-gold">${icons.exchange} Start an exchange</a>
    </div>
  `;
}
