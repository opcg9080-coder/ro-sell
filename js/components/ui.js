// ============================================================================
// components/ui.js — shared formatting + DOM helpers
// ============================================================================

export function fmt(n) {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

export function escapeHtml(s = "") {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function timeAgo(iso) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function statusBadge(status) {
  const map = {
    pending: { cls: "badge-pending", label: "Pending" },
    approved: { cls: "badge-approved", label: "Approved" },
    rejected: { cls: "badge-rejected", label: "Rejected" },
    completed: { cls: "badge-approved", label: "Completed" },
    published: { cls: "badge-purple", label: "Published" },
  };
  const m = map[status] || { cls: "badge-neutral", label: status };
  return `<span class="badge ${m.cls}">${m.label}</span>`;
}

export function coinLabel(type) {
  return type === "gold" ? "Gold Coin" : "Purple Coin";
}

export function qs(root, sel) {
  return root.querySelector(sel);
}
export function qsa(root, sel) {
  return Array.from(root.querySelectorAll(sel));
}
