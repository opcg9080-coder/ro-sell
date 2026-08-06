// ============================================================================
// db.js — Data access layer
//
// Every method returns a Promise, mirroring the shape of a real backend SDK
// (Firebase/Supabase). Today it's backed by localStorage; swapping the
// storage engine later means rewriting the bodies of these functions only —
// nothing in pages/ or components/ needs to change.
// ============================================================================

const NS = "coinExchange:v1";
const LATENCY = 180; // ms — simulated network delay, keeps interactions feeling real

const delay = (v) => new Promise((res) => setTimeout(() => res(v), LATENCY));

function read() {
  const raw = localStorage.getItem(NS);
  if (raw) return JSON.parse(raw);
  const seeded = seed();
  localStorage.setItem(NS, JSON.stringify(seeded));
  return seeded;
}

function write(data) {
  localStorage.setItem(NS, JSON.stringify(data));
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function nowISO() {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Seed data — demo users, wallets, coin catalog, and a little history so the
// app doesn't feel empty on first load.
// ---------------------------------------------------------------------------
function seed() {
  const userId = "user_demo";
  const adminId = "admin_demo";

  return {
    session: { currentUserId: null, role: null }, // set on first Sign in — role: "user" | "admin"

    users: [
      { id: userId, name: "Maya Chen", handle: "MAYA-2291", email: "maya@example.com", role: "user", createdAt: "2026-05-02T09:00:00.000Z", avatarInitials: "MC" },
      { id: adminId, name: "Admin Desk", handle: "ADMIN-0001", email: "admin@coinexchange.app", role: "admin", createdAt: "2026-04-01T09:00:00.000Z", avatarInitials: "AD" },
      { id: "user_2", name: "Owen Park", handle: "OWEN-1180", email: "owen@example.com", role: "user", createdAt: "2026-05-10T09:00:00.000Z", avatarInitials: "OP" },
      { id: "user_3", name: "Sana Iyer", handle: "SANA-4471", email: "sana@example.com", role: "user", createdAt: "2026-05-14T09:00:00.000Z", avatarInitials: "SI" },
    ],

    wallets: {
      [userId]: { gold: 1240, purple: 86 },
      [adminId]: { gold: 5000, purple: 500 },
      user_2: { gold: 640, purple: 12 },
      user_3: { gold: 2110, purple: 240 },
    },

    // Admin-controlled conversion rates
    settings: {
      goldToPurpleRate: 12,  // 12 gold -> 1 purple
      purpleToGoldRate: 10,  // 1 purple -> 10 gold
      updatedAt: "2026-06-01T10:00:00.000Z",
    },

    // Exchange requests
    requests: [
      { id: "req_1", userId, direction: "gold_to_purple", amountIn: 120, amountOut: 10, status: "approved", createdAt: "2026-07-20T14:00:00.000Z", resolvedAt: "2026-07-20T15:30:00.000Z" },
      { id: "req_2", userId, direction: "purple_to_gold", amountIn: 5, amountOut: 50, status: "pending", createdAt: "2026-08-03T11:20:00.000Z", resolvedAt: null },
      { id: "req_3", userId: "user_2", direction: "gold_to_purple", amountIn: 240, amountOut: 20, status: "pending", createdAt: "2026-08-04T09:10:00.000Z", resolvedAt: null },
      { id: "req_4", userId: "user_3", direction: "purple_to_gold", amountIn: 8, amountOut: 80, status: "rejected", createdAt: "2026-07-28T08:00:00.000Z", resolvedAt: "2026-07-28T12:00:00.000Z", reason: "Amount exceeds daily limit" },
    ],

    // Peer-to-peer coin transfers (Coin Sharing)
    transfers: [
      { id: "tr_1", fromUserId: "user_2", toUserId: userId, coinType: "gold", amount: 50, createdAt: "2026-07-15T10:00:00.000Z", status: "completed" },
    ],

    // Coin catalog — new virtual coins published by admin
    coins: [
      {
        id: "coin_founder",
        name: "Founder's Coin",
        description: "A limited commemorative coin for early Coin Exchange members. Purely collectible — no trading utility.",
        requiredGold: 500,
        requiredPurple: 40,
        unlockRequirement: "Account age of 14+ days",
        status: "published",
        createdAt: "2026-05-20T09:00:00.000Z",
      },
      {
        id: "coin_summit",
        name: "Summit Badge Coin",
        description: "Awarded for reaching the Summit exchange tier. Displays on your profile.",
        requiredGold: 800,
        requiredPurple: 60,
        unlockRequirement: "Complete 5 approved exchanges",
        status: "published",
        createdAt: "2026-06-10T09:00:00.000Z",
      },
      {
        id: "coin_aurora",
        name: "Aurora Collector Coin",
        description: "A seasonal collector's coin with a soft gradient finish.",
        requiredGold: 300,
        requiredPurple: 25,
        unlockRequirement: "None — open to all members",
        status: "published",
        createdAt: "2026-07-01T09:00:00.000Z",
      },
    ],

    unlockRequests: [
      { id: "unlock_1", userId, coinId: "coin_aurora", status: "pending", createdAt: "2026-08-02T13:00:00.000Z" },
    ],

    notifications: [
      { id: "n1", userId, type: "exchange_approved", title: "Exchange approved", body: "Your request to convert 120 Gold to 10 Purple was approved.", read: true, createdAt: "2026-07-20T15:30:00.000Z" },
      { id: "n2", userId, type: "coin_received", title: "Coins received", body: "Owen Park sent you 50 Gold Coins.", read: true, createdAt: "2026-07-15T10:00:00.000Z" },
      { id: "n3", userId, type: "new_coin", title: "New coin available", body: "Aurora Collector Coin is now available to unlock.", read: false, createdAt: "2026-07-01T09:05:00.000Z" },
      { id: "n4", userId, type: "exchange_pending", title: "Exchange request submitted", body: "Your request to convert 5 Purple to 50 Gold is pending review.", read: false, createdAt: "2026-08-03T11:20:00.000Z" },
    ],
  };
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------
export const session = {
  async get() {
    const d = read();
    return delay({ ...d.session });
  },
  async logout() {
    const d = read();
    d.session = { currentUserId: null, role: null };
    write(d);
    return delay(true);
  },
};

// Demo passcode gate for the admin console. In a real backend this becomes a
// proper auth check (Firebase Auth custom claims / Supabase RLS role).
const ADMIN_PASSCODE = "admin123";

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("") || "U";
}

function handleFromName(name) {
  const base = name.trim().toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4) || "USER";
  return `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export const auth = {
  // Called from the "Continue" flow on the sign-in screen. If a member with
  // this exact name already exists, signs back into that account (so the
  // demo persists across visits) — otherwise creates a brand new member.
  async continueAsMember(name) {
    const trimmed = (name || "").trim();
    if (trimmed.length < 2) return delay({ ok: false, error: "Enter your full name to continue." });

    const d = read();
    let user = d.users.find((u) => u.role === "user" && u.name.toLowerCase() === trimmed.toLowerCase());

    if (!user) {
      user = {
        id: uid("user"),
        name: trimmed,
        handle: handleFromName(trimmed),
        email: "",
        role: "user",
        createdAt: nowISO(),
        avatarInitials: initials(trimmed),
      };
      d.users.push(user);
      d.wallets[user.id] = { gold: 500, purple: 50 }; // starter balance for new members
      d.notifications.unshift({
        id: uid("n"), userId: user.id, type: "new_coin",
        title: "Welcome to Coin Exchange", body: "Your wallet has been created with a starter balance of 500 Gold and 50 Purple Coins.",
        read: false, createdAt: nowISO(),
      });
    }

    d.session = { currentUserId: user.id, role: "user" };
    write(d);
    return delay({ ok: true, user });
  },

  async continueAsAdmin(passcode) {
    if (passcode !== ADMIN_PASSCODE) {
      return delay({ ok: false, error: "Incorrect passcode." });
    }
    const d = read();
    d.session = { currentUserId: "admin_demo", role: "admin" };
    write(d);
    return delay({ ok: true, user: d.users.find((u) => u.id === "admin_demo") });
  },
};

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export const users = {
  async current() {
    const d = read();
    const u = d.users.find((x) => x.id === d.session.currentUserId);
    return delay(u ? { ...u } : null);
  },
  async get(id) {
    const d = read();
    return delay(d.users.find((u) => u.id === id) || null);
  },
  async list() {
    const d = read();
    return delay([...d.users]);
  },
  async search(query) {
    const d = read();
    const q = query.trim().toLowerCase();
    if (!q) return delay([...d.users]);
    return delay(d.users.filter((u) => u.name.toLowerCase().includes(q) || u.handle.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
  },
};

// ---------------------------------------------------------------------------
// Wallets
// ---------------------------------------------------------------------------
export const wallets = {
  async get(userId) {
    const d = read();
    return delay(d.wallets[userId] || { gold: 0, purple: 0 });
  },
  async adjust(userId, deltaGold, deltaPurple) {
    const d = read();
    const w = d.wallets[userId] || { gold: 0, purple: 0 };
    w.gold = Math.max(0, w.gold + deltaGold);
    w.purple = Math.max(0, w.purple + deltaPurple);
    d.wallets[userId] = w;
    write(d);
    return delay({ ...w });
  },
};

// ---------------------------------------------------------------------------
// Settings (admin-controlled exchange rates)
// ---------------------------------------------------------------------------
export const settings = {
  async get() {
    const d = read();
    return delay({ ...d.settings });
  },
  async update(patch) {
    const d = read();
    d.settings = { ...d.settings, ...patch, updatedAt: nowISO() };
    write(d);
    return delay({ ...d.settings });
  },
};

// ---------------------------------------------------------------------------
// Exchange requests
// ---------------------------------------------------------------------------
export const requests = {
  async listForUser(userId) {
    const d = read();
    return delay(d.requests.filter((r) => r.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  },
  async listAll() {
    const d = read();
    return delay([...d.requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  },
  async create({ userId, direction, amountIn, amountOut }) {
    const d = read();
    const req = { id: uid("req"), userId, direction, amountIn, amountOut, status: "pending", createdAt: nowISO(), resolvedAt: null };
    d.requests.unshift(req);
    d.notifications.unshift({
      id: uid("n"), userId, type: "exchange_pending",
      title: "Exchange request submitted",
      body: `Your request to convert ${amountIn} ${direction === "gold_to_purple" ? "Gold" : "Purple"} to ${amountOut} ${direction === "gold_to_purple" ? "Purple" : "Gold"} is pending review.`,
      read: false, createdAt: nowISO(),
    });
    write(d);
    return delay(req);
  },
  async resolve(requestId, decision, reason) {
    const d = read();
    const req = d.requests.find((r) => r.id === requestId);
    if (!req) throw new Error("Request not found");
    req.status = decision; // "approved" | "rejected"
    req.resolvedAt = nowISO();
    if (reason) req.reason = reason;

    if (decision === "approved") {
      const w = d.wallets[req.userId] || { gold: 0, purple: 0 };
      if (req.direction === "gold_to_purple") {
        w.gold = Math.max(0, w.gold - req.amountIn);
        w.purple += req.amountOut;
      } else {
        w.purple = Math.max(0, w.purple - req.amountIn);
        w.gold += req.amountOut;
      }
      d.wallets[req.userId] = w;
    }

    d.notifications.unshift({
      id: uid("n"), userId: req.userId,
      type: decision === "approved" ? "exchange_approved" : "exchange_rejected",
      title: decision === "approved" ? "Exchange approved" : "Exchange rejected",
      body: decision === "approved"
        ? `Your request to convert ${req.amountIn} ${req.direction === "gold_to_purple" ? "Gold" : "Purple"} to ${req.amountOut} ${req.direction === "gold_to_purple" ? "Purple" : "Gold"} was approved.`
        : `Your request to convert ${req.amountIn} ${req.direction === "gold_to_purple" ? "Gold" : "Purple"} was rejected.${reason ? ` Reason: ${reason}` : ""}`,
      read: false, createdAt: nowISO(),
    });

    write(d);
    return delay(req);
  },
};

// ---------------------------------------------------------------------------
// Coin sharing (peer-to-peer transfers with a secret code)
// ---------------------------------------------------------------------------
export const transfers = {
  async listForUser(userId) {
    const d = read();
    return delay(d.transfers.filter((t) => t.fromUserId === userId || t.toUserId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  },
  // Demo secret code check: any 4+ character code works except "0000" (invalid on purpose, for testing the error state)
  async send({ fromUserId, receiverHandle, coinType, amount, secretCode }) {
    const d = read();

    if (!secretCode || secretCode.length < 4) {
      return delay({ ok: false, error: "Secret code must be at least 4 characters." });
    }
    if (secretCode === "0000") {
      return delay({ ok: false, error: "Incorrect secret code. Please check with the receiver and try again." });
    }

    const receiver = d.users.find((u) => u.handle.toLowerCase() === receiverHandle.trim().toLowerCase() || u.id === receiverHandle.trim());
    if (!receiver) {
      return delay({ ok: false, error: "No user found with that Receiver ID." });
    }
    if (receiver.id === fromUserId) {
      return delay({ ok: false, error: "You can't send coins to yourself." });
    }

    const senderWallet = d.wallets[fromUserId] || { gold: 0, purple: 0 };
    if (senderWallet[coinType] < amount) {
      return delay({ ok: false, error: `Insufficient ${coinType === "gold" ? "Gold" : "Purple"} Coin balance.` });
    }

    senderWallet[coinType] -= amount;
    const receiverWallet = d.wallets[receiver.id] || { gold: 0, purple: 0 };
    receiverWallet[coinType] = (receiverWallet[coinType] || 0) + amount;
    d.wallets[fromUserId] = senderWallet;
    d.wallets[receiver.id] = receiverWallet;

    const transfer = { id: uid("tr"), fromUserId, toUserId: receiver.id, coinType, amount, createdAt: nowISO(), status: "completed" };
    d.transfers.unshift(transfer);

    const sender = d.users.find((u) => u.id === fromUserId);
    d.notifications.unshift({
      id: uid("n"), userId: receiver.id, type: "coin_received",
      title: "Coins received",
      body: `${sender ? sender.name : "Someone"} sent you ${amount} ${coinType === "gold" ? "Gold" : "Purple"} Coins.`,
      read: false, createdAt: nowISO(),
    });
    d.notifications.unshift({
      id: uid("n"), userId: fromUserId, type: "coin_sent",
      title: "Coins sent",
      body: `You sent ${amount} ${coinType === "gold" ? "Gold" : "Purple"} Coins to ${receiver.name}.`,
      read: false, createdAt: nowISO(),
    });

    write(d);
    return delay({ ok: true, transfer });
  },
};

// ---------------------------------------------------------------------------
// Coin catalog + unlock requests
// ---------------------------------------------------------------------------
export const coins = {
  async list() {
    const d = read();
    return delay([...d.coins].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  },
  async publish({ name, description, requiredGold, requiredPurple, unlockRequirement }) {
    const d = read();
    const coin = { id: uid("coin"), name, description, requiredGold, requiredPurple, unlockRequirement, status: "published", createdAt: nowISO() };
    d.coins.unshift(coin);

    // Notify all users of the new coin
    d.users.filter((u) => u.role === "user").forEach((u) => {
      d.notifications.unshift({
        id: uid("n"), userId: u.id, type: "new_coin",
        title: "New coin available", body: `${name} is now available to unlock.`,
        read: false, createdAt: nowISO(),
      });
    });

    write(d);
    return delay(coin);
  },
  async update(coinId, patch) {
    const d = read();
    const c = d.coins.find((x) => x.id === coinId);
    if (!c) throw new Error("Coin not found");
    Object.assign(c, patch);
    write(d);
    return delay({ ...c });
  },
};

export const unlockRequests = {
  async listForUser(userId) {
    const d = read();
    return delay(d.unlockRequests.filter((r) => r.userId === userId));
  },
  async listAll() {
    const d = read();
    return delay([...d.unlockRequests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  },
  async create({ userId, coinId }) {
    const d = read();
    const existing = d.unlockRequests.find((r) => r.userId === userId && r.coinId === coinId && r.status === "pending");
    if (existing) return delay(existing);
    const req = { id: uid("unlock"), userId, coinId, status: "pending", createdAt: nowISO() };
    d.unlockRequests.unshift(req);
    write(d);
    return delay(req);
  },
  async resolve(id, decision) {
    const d = read();
    const req = d.unlockRequests.find((r) => r.id === id);
    if (!req) throw new Error("Unlock request not found");
    req.status = decision;
    const coin = d.coins.find((c) => c.id === req.coinId);
    if (decision === "approved" && coin) {
      const w = d.wallets[req.userId] || { gold: 0, purple: 0 };
      w.gold = Math.max(0, w.gold - coin.requiredGold);
      w.purple = Math.max(0, w.purple - coin.requiredPurple);
      d.wallets[req.userId] = w;
    }
    write(d);
    return delay(req);
  },
};

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
export const notifications = {
  async listForUser(userId) {
    const d = read();
    return delay(d.notifications.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  },
  async unreadCount(userId) {
    const d = read();
    return delay(d.notifications.filter((n) => n.userId === userId && !n.read).length);
  },
  async markRead(id) {
    const d = read();
    const n = d.notifications.find((x) => x.id === id);
    if (n) n.read = true;
    write(d);
    return delay(true);
  },
  async markAllRead(userId) {
    const d = read();
    d.notifications.filter((n) => n.userId === userId).forEach((n) => (n.read = true));
    write(d);
    return delay(true);
  },
};

// ---------------------------------------------------------------------------
// Admin stats
// ---------------------------------------------------------------------------
export const admin = {
  async stats() {
    const d = read();
    return delay({
      totalUsers: d.users.filter((u) => u.role === "user").length,
      pending: d.requests.filter((r) => r.status === "pending").length,
      approved: d.requests.filter((r) => r.status === "approved").length,
      rejected: d.requests.filter((r) => r.status === "rejected").length,
      pendingUnlocks: d.unlockRequests.filter((r) => r.status === "pending").length,
      totalCoinsPublished: d.coins.length,
    });
  },
  async resetDemoData() {
    localStorage.removeItem(NS);
    return delay(true);
  },
};
