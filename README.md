# Coin Exchange

A premium, game-like virtual coin management and exchange app. **Not gambling. Not real money.** Two in-game currencies — Gold Coin and Purple Coin — that members exchange, share, and collect.

Built as a plain HTML/CSS/JS site (no build step, no framework) so it runs immediately in any browser and deploys to GitHub Pages as-is.

---

## 1. Run it locally

Browsers block ES module imports on `file://` pages, so you need a tiny local server (this is normal for any modern web app — GitHub Pages, Firebase Hosting, etc. all serve over `http(s)://` too).

**Option A — VS Code:** install the **Live Server** extension, right-click `index.html` → *Open with Live Server*.

**Option B — Python** (already on most machines):
```bash
cd coin-exchange
python3 -m http.server 8080
```
Then open `http://localhost:8080` in your browser.

**Option C — Node:**
```bash
npx serve coin-exchange
```

### Try it out
- Enter any name on the welcome screen to create a member account (this is how the admin will identify you).
- To open the admin console, click **"Sign in to Admin Console"** and use the demo passcode: **`admin123`**
- All data (users, wallets, requests, notifications) is stored in your browser's `localStorage`, seeded with demo data on first load. Nothing leaves your machine yet — see Section 3 to connect a real backend.
- To wipe demo data and start fresh, open the browser console and run: `localStorage.removeItem('coinExchange:v1')`, then refresh.

---

## 2. Deploy to GitHub Pages (get a live link)

1. Create a new GitHub repository, e.g. `coin-exchange`.
2. Push everything in this folder to the repo root:
   ```bash
   git init
   git add .
   git commit -m "Coin Exchange"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/coin-exchange.git
   git push -u origin main
   ```
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Branch: `main`, folder: `/ (root)`. Click **Save**.
6. Wait 1–2 minutes. Your live link will appear at the top of that page:
   `https://YOUR-USERNAME.github.io/coin-exchange/`

No build step, no `npm install` required — GitHub Pages just serves the static files directly.

---

## 3. Connect a real backend (Firebase or Supabase)

Right now all data access goes through **one file**: `js/db.js`. Every function in it already returns a `Promise`, shaped exactly like a real backend SDK call — that's intentional, so swapping the storage engine doesn't require touching any page or component.

To connect Firebase (or Supabase), in your code editor:

1. Add the Firebase SDK `<script type="module">` config to `index.html` (or `npm install firebase` if you introduce a bundler later).
2. In `js/db.js`, replace the body of each exported function (`users.get`, `wallets.adjust`, `requests.create`, etc.) with the equivalent Firestore/Supabase call — keep the same function names and return shapes.
   - Example: `read()`/`write()` (localStorage) → Firestore `getDoc`/`setDoc`/`onSnapshot`.
   - Example: `session` → Firebase Authentication (`onAuthStateChanged`, `signInWithEmailAndPassword`, custom claims for the admin role instead of the demo passcode).
3. Everything else — `app.js`, `store.js`, and all files in `js/pages/` and `js/components/` — stays untouched, because they only ever call functions from `db.js`, never touch storage directly.
4. Push the change to GitHub; Pages redeploys automatically on every push to `main`.

---

## Project structure

```
coin-exchange/
├── index.html                # entry point, loads fonts + app.js
├── css/
│   └── styles.css            # full design system (tokens, components, responsive)
├── js/
│   ├── app.js                 # hash router + auth guard, mounts pages into the shell
│   ├── store.js                # session/wallet cache, toast notifications, pub-sub
│   ├── db.js                   # ★ data layer — swap this file to go live with a real backend
│   ├── icons.js                 # outline icon set (inline SVG, no external deps)
│   ├── components/
│   │   ├── navbar.js            # top nav + mobile tab bar
│   │   ├── modal.js             # reusable modal dialog
│   │   └── ui.js                 # formatting helpers (numbers, dates, badges)
│   └── pages/
│       ├── welcome.js            # sign-in (name entry + admin passcode)
│       ├── home.js                # wallet hero, stats, recent activity
│       ├── wallet.js               # Gold / Purple balances
│       ├── exchange.js              # Gold ⇄ Purple conversion requests
│       ├── sharing.js                # peer-to-peer transfer via Receiver ID + Secret Code
│       ├── coins.js                   # coin catalog + unlock requests
│       ├── notifications.js            # notification center
│       ├── profile.js                   # profile + history
│       └── admin.js                      # dashboard, requests, coin mgmt, users, rates
└── README.md
```

## Design notes

- **Light theme only.** Warm soft white background, pure white cards, golden yellow for reward/importance, royal purple for value/premium/collection. Blue/purple used for "success" states instead of green.
- **Typography:** Fraunces (display headings) + Inter (UI/body) + IBM Plex Mono for all coin numbers — tabular figures give balances a "trading terminal" feel, which is the app's signature visual detail.
- **Icons:** a small hand-built outline icon set (`js/icons.js`), no emoji, no external icon library.
- Fully responsive: a horizontal top nav on desktop/tablet, a bottom tab bar on mobile.
