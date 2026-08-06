// ============================================================================
// app.js — entry point + hash router
// ============================================================================
import { state, subscribe, refreshSession, logout } from "./store.js";
import { shellHTML, wireChrome } from "./components/navbar.js";
import { icons } from "./icons.js";

import * as welcome from "./pages/welcome.js";
import * as home from "./pages/home.js";
import * as wallet from "./pages/wallet.js";
import * as exchange from "./pages/exchange.js";
import * as sharing from "./pages/sharing.js";
import * as coinsPage from "./pages/coins.js";
import * as notifications from "./pages/notifications.js";
import * as profile from "./pages/profile.js";
import * as admin from "./pages/admin.js";

const appEl = document.getElementById("app");
window.__icons = icons;

const USER_ROUTES = {
  "#/home": home.render,
  "#/wallet": wallet.render,
  "#/exchange": exchange.render,
  "#/sharing": sharing.render,
  "#/coins": coinsPage.render,
  "#/notifications": notifications.render,
  "#/profile": profile.render,
};

const ADMIN_ROUTES = {
  "#/admin": admin.renderDashboard,
  "#/admin/requests": admin.renderRequests,
  "#/admin/coins": admin.renderCoins,
  "#/admin/users": admin.renderUsers,
  "#/admin/settings": admin.renderSettings,
  "#/admin/profile": profile.render,
};

async function router() {
  let path = location.hash || "#/welcome";

  if (!state.ready) await refreshSession();

  if (!state.user) {
    if (path !== "#/welcome") {
      location.hash = "#/welcome";
      return;
    }
    appEl.innerHTML = "";
    await welcome.render(appEl);
    return;
  }

  if (path === "#/welcome") {
    location.hash = state.role === "admin" ? "#/admin" : "#/home";
    return;
  }

  const isAdminArea = path.startsWith("#/admin");
  if (isAdminArea && state.role !== "admin") {
    location.hash = "#/home";
    return;
  }
  if (!isAdminArea && state.role === "admin") {
    location.hash = "#/admin";
    return;
  }

  const routeMap = isAdminArea ? ADMIN_ROUTES : USER_ROUTES;
  const renderFn = routeMap[path] || routeMap[isAdminArea ? "#/admin" : "#/home"];

  appEl.innerHTML = shellHTML(state, path);
  wireChrome(appEl, async () => { await logout(); });

  const main = document.getElementById("mainContent");
  try {
    await renderFn(main);
  } catch (err) {
    console.error(err);
    main.innerHTML = `
      <div class="empty-state">
        ${icons.info}
        <h3>Something went wrong loading this page</h3>
        <p>${(err && err.message) || "Please try again."}</p>
      </div>
    `;
  }
}

subscribe(() => {});

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);

if (document.readyState !== "loading") router();
