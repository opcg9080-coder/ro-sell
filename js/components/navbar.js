// ============================================================================
// components/navbar.js — app chrome: top nav + mobile tab bar
// ============================================================================
import { icons } from "../icons.js";
import { fmt } from "./ui.js";

const USER_LINKS = [
  { path: "#/home", label: "Home", icon: "home" },
  { path: "#/wallet", label: "Wallet", icon: "wallet" },
  { path: "#/exchange", label: "Exchange", icon: "exchange" },
  { path: "#/sharing", label: "Share", icon: "share" },
  { path: "#/coins", label: "Coins", icon: "coins" },
];

const ADMIN_LINKS = [
  { path: "#/admin", label: "Dashboard", icon: "home" },
  { path: "#/admin/requests", label: "Requests", icon: "exchange" },
  { path: "#/admin/coins", label: "Coins", icon: "coins" },
  { path: "#/admin/users", label: "Users", icon: "users" },
  { path: "#/admin/settings", label: "Rates", icon: "settings" },
];

export function shellHTML(state, activePath) {
  const links = state.role === "admin" ? ADMIN_LINKS : USER_LINKS;
  const isAdmin = state.role === "admin";

  const navLinks = links.map((l) => `
    <a href="${l.path}" class="nav-link ${activePath === l.path ? "is-active" : ""}">
      ${icons[l.icon]}<span>${l.label}</span>
    </a>
  `).join("");

  const tabLinks = links.slice(0, 5).map((l) => `
    <a href="${l.path}" class="tabbar-link ${activePath === l.path ? "is-active" : ""}">
      ${icons[l.icon]}<span>${l.label}</span>
    </a>
  `).join("");

  return `
    <header class="topnav">
      <div class="topnav-inner">
        <a href="${isAdmin ? "#/admin" : "#/home"}" class="brand">
          <span class="brand-mark"></span><span class="brand-word">Coin Exchange</span>
        </a>

        <nav class="nav-links">${navLinks}</nav>

        <div class="nav-right">
          ${!isAdmin ? `
            <div class="pill-balance" title="Your balance">
              <span class="pill-balance-item"><span class="coin-dot coin-dot--gold">${icons.coins}</span>${fmt(state.wallet.gold)}</span>
              <span class="pill-balance-item"><span class="coin-dot coin-dot--purple">${icons.coins}</span>${fmt(state.wallet.purple)}</span>
            </div>
          ` : `<span class="badge badge-purple"><span></span>Admin Console</span>`}

          ${!isAdmin ? `
            <a href="#/notifications" class="icon-btn" aria-label="Notifications">
              ${icons.bell}
              ${state.unread > 0 ? `<span class="dot-badge"></span>` : ""}
            </a>
          ` : ""}

          <a href="${isAdmin ? "#/admin/profile" : "#/profile"}" class="avatar" title="${state.user ? state.user.name : ""}">
            ${state.user ? state.user.avatarInitials : "?"}
          </a>

          <button class="icon-btn" id="logoutBtn" aria-label="Sign out" title="Sign out">${icons.logout}</button>
        </div>
      </div>
    </header>

    <main class="main" id="mainContent"></main>

    <nav class="tabbar">
      <div class="tabbar-inner">${tabLinks}</div>
    </nav>
  `;
}

export function wireChrome(root, onLogout) {
  const btn = root.querySelector("#logoutBtn");
  if (btn) btn.addEventListener("click", onLogout);
}
