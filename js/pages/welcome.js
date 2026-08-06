// ============================================================================
// pages/welcome.js — entry screen. Collects the member's name so the admin
// can identify who's who, and offers a separate admin console sign-in.
// ============================================================================
import { icons } from "../icons.js";
import * as db from "../db.js";
import { refreshSession, toast } from "../store.js";

export async function render(root) {
  root.innerHTML = `
    <div class="auth-wrap">
      <div class="card auth-card">
        <div class="brand-mark" style="width:52px;height:52px;border-radius:16px;margin:0 auto 18px;"></div>
        <span class="eyebrow">Welcome to</span>
        <h1 class="page-title" style="margin-top:6px;">Coin Exchange</h1>
        <p class="muted mt-12" style="line-height:1.6;">
          A virtual coin management &amp; exchange game. Enter your name to open your wallet —
          this is how the admin desk will recognize you.
        </p>

        <form id="joinForm" class="flex-col gap-12 mt-24" style="text-align:left;">
          <div class="field">
            <label for="fullName">Your name</label>
            <input class="input" id="fullName" name="fullName" placeholder="e.g. Maya Chen" autocomplete="name" required />
            <span class="help-text" id="joinError"></span>
          </div>
          <button type="submit" class="btn btn-gold btn-block">
            ${icons.arrowUpRight} Enter Coin Exchange
          </button>
        </form>

        <button id="adminLinkBtn" class="btn btn-ghost btn-block mt-12">
          ${icons.shield} Sign in to Admin Console
        </button>

        <p class="faint mt-24" style="font-size:11.5px;">
          Not a gambling platform. All coins are virtual and hold no real-world value.
        </p>
      </div>
    </div>
  `;

  const form = root.querySelector("#joinForm");
  const errorEl = root.querySelector("#joinError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";
    const name = root.querySelector("#fullName").value;
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    const res = await db.auth.continueAsMember(name);
    btn.disabled = false;
    if (!res.ok) {
      errorEl.textContent = res.error;
      errorEl.classList.add("is-error");
      return;
    }
    await refreshSession();
    toast({ title: `Welcome, ${res.user.name.split(" ")[0]}`, body: "Your wallet is ready.", tone: "gold", icon: "sparkle" });
    location.hash = "#/home";
  });

  root.querySelector("#adminLinkBtn").addEventListener("click", () => {
    openAdminPrompt();
  });
}

function openAdminPrompt() {
  import("../components/modal.js").then(({ openModal, closeModal }) => {
    openModal({
      title: "Admin Console",
      bodyHTML: `
        <p class="muted" style="font-size:13.5px;line-height:1.6;margin-bottom:16px;">
          Enter the admin passcode to access the management dashboard.
        </p>
        <div class="field">
          <label for="passcode">Passcode</label>
          <input class="input" id="passcode" type="password" placeholder="Demo passcode: admin123" />
          <span class="help-text is-error" id="passErr"></span>
        </div>
        <button class="btn btn-purple btn-block mt-16" id="passSubmit">${icons.shield} Enter Console</button>
      `,
      onMount: (m) => {
        const submit = async () => {
          const val = m.querySelector("#passcode").value;
          const res = await db.auth.continueAsAdmin(val);
          if (!res.ok) {
            m.querySelector("#passErr").textContent = res.error;
            return;
          }
          await refreshSession();
          closeModal();
          location.hash = "#/admin";
        };
        m.querySelector("#passSubmit").addEventListener("click", submit);
        m.querySelector("#passcode").addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
      },
    });
  });
}
