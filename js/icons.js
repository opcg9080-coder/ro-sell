// Minimal outline icon set — consistent 1.6px stroke, 24x24 viewbox.
// Kept as raw SVG strings so pages can inline them with no extra dependency.

const S = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';

export const icons = {
  home: `<svg viewBox="0 0 24 24" ${S}><path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h3.5v-5.5h3V20H17a1 1 0 0 0 1-1v-9"/></svg>`,
  wallet: `<svg viewBox="0 0 24 24" ${S}><path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h13A1.5 1.5 0 0 1 19 7.5V8H4.5A1.5 1.5 0 0 0 3 9.5v9A1.5 1.5 0 0 0 4.5 20h14a1.5 1.5 0 0 0 1.5-1.5V11a1.5 1.5 0 0 0-1.5-1.5H16a1.75 1.75 0 1 0 0 3.5"/></svg>`,
  exchange: `<svg viewBox="0 0 24 24" ${S}><path d="M4 8h13"/><path d="M14 4.5 17.5 8 14 11.5"/><path d="M20 16H7"/><path d="M10 12.5 6.5 16 10 19.5"/></svg>`,
  share: `<svg viewBox="0 0 24 24" ${S}><circle cx="18" cy="5" r="2.4"/><circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="19" r="2.4"/><path d="M8.2 10.7 15.8 6.3M8.2 13.3l7.6 4.4"/></svg>`,
  coins: `<svg viewBox="0 0 24 24" ${S}><ellipse cx="9" cy="6.5" rx="5.5" ry="2.5"/><path d="M3.5 6.5V15c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5V6.5"/><path d="M3.5 10.8c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5"/><ellipse cx="15.5" cy="11" rx="5" ry="2.2"/><path d="M10.5 11v6.7c0 1.2 2.2 2.2 5 2.2s5-1 5-2.2V11"/><path d="M10.5 14.6c0 1.2 2.2 2.2 5 2.2s5-1 5-2.2"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" ${S}><path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.2 1.5 5.8H4.5C4.5 15.2 6 14 6 10Z"/><path d="M10 18.5a2 2 0 0 0 4 0"/></svg>`,
  user: `<svg viewBox="0 0 24 24" ${S}><circle cx="12" cy="8.2" r="3.4"/><path d="M4.8 19.5c1.1-3.4 3.8-5.3 7.2-5.3s6.1 1.9 7.2 5.3"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" ${S}><path d="M12 3.5 5 6v5.5c0 4.4 3 7.3 7 9 4-1.7 7-4.6 7-9V6l-7-2.5Z"/><path d="M9 12l2 2 4-4"/></svg>`,
  check: `<svg viewBox="0 0 24 24" ${S}><path d="M5 12.5 9.5 17 19 7"/></svg>`,
  x: `<svg viewBox="0 0 24 24" ${S}><path d="M6 6l12 12M18 6 6 18"/></svg>`,
  chevronRight: `<svg viewBox="0 0 24 24" ${S}><path d="M9 5.5 15.5 12 9 18.5"/></svg>`,
  chevronDown: `<svg viewBox="0 0 24 24" ${S}><path d="M5.5 9 12 15.5 18.5 9"/></svg>`,
  search: `<svg viewBox="0 0 24 24" ${S}><circle cx="10.5" cy="10.5" r="6.5"/><path d="m19.5 19.5-4-4"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" ${S}><path d="M12 5v14M5 12h14"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" ${S}><rect x="5" y="10.5" width="14" height="9" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>`,
  key: `<svg viewBox="0 0 24 24" ${S}><circle cx="8" cy="15" r="3.2"/><path d="M10.3 12.7 18 5m0 0v3.2M18 5h-3.2"/></svg>`,
  send: `<svg viewBox="0 0 24 24" ${S}><path d="m4 4 16 8-16 8 3.5-8L4 4Z"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" ${S}><circle cx="12" cy="12" r="8"/><path d="M12 8v4.3l3 1.7"/></svg>`,
  arrowUpRight: `<svg viewBox="0 0 24 24" ${S}><path d="M7 17 17 7M8.5 7H17v8.5"/></svg>`,
  arrowDownLeft: `<svg viewBox="0 0 24 24" ${S}><path d="M17 7 7 17M15.5 17H7V8.5"/></svg>`,
  sparkle: `<svg viewBox="0 0 24 24" ${S}><path d="M12 4v3.2M12 16.8V20M4 12h3.2M16.8 12H20M6.5 6.5l2.2 2.2M15.3 15.3l2.2 2.2M6.5 17.5l2.2-2.2M15.3 8.7l2.2-2.2"/></svg>`,
  trophy: `<svg viewBox="0 0 24 24" ${S}><path d="M8 5h8v4.5a4 4 0 0 1-8 0V5Z"/><path d="M8 6H5.5A1.5 1.5 0 0 0 4 7.5v.5C4 9.9 5.6 11 7.5 11M16 6h2.5A1.5 1.5 0 0 1 20 7.5v.5c0 1.4-1.6 2.5-3.5 2.5"/><path d="M12 13.5V17M8.5 20h7l-1-3h-5l-1 3Z"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" ${S}><circle cx="12" cy="12" r="2.8"/><path d="M19.4 13.6a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H4.5a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H10a1.6 1.6 0 0 0 1-1.5V4.5a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" ${S}><path d="M9 4.5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 19.5h3"/><path d="M13.5 8.5 17.5 12l-4 3.5M17.5 12h-10"/></svg>`,
  filter: `<svg viewBox="0 0 24 24" ${S}><path d="M4 6h16M7.5 12h9M10.5 18h3"/></svg>`,
  info: `<svg viewBox="0 0 24 24" ${S}><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.2M12 8v.1"/></svg>`,
  gift: `<svg viewBox="0 0 24 24" ${S}><rect x="4" y="9.5" width="16" height="4" rx="1"/><path d="M6 13.5V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-5.5M12 9.5V20"/><path d="M12 9.5c-1-3.2-3-4.5-4.3-3.7C6.4 6.6 6.8 9.5 9 9.5m3 0c1-3.2 3-4.5 4.3-3.7 1.3.8.9 3.7-1.3 3.7"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" ${S}><path d="M13.5 5.5 18.5 10.5 8 21H3v-5L13.5 5.5Z"/><path d="M11.8 7.2 16.8 12.2"/></svg>`,
  users: `<svg viewBox="0 0 24 24" ${S}><circle cx="9" cy="8.2" r="3"/><path d="M3.3 19c1-2.9 3.1-4.5 5.7-4.5s4.7 1.6 5.7 4.5"/><circle cx="17" cy="8.5" r="2.4"/><path d="M15.5 14.7c1.9.4 3.3 1.8 4.1 4.3"/></svg>`,
};

export function icon(name, cls = "") {
  const svg = icons[name] || "";
  if (!cls) return svg;
  return svg.replace("<svg ", `<svg class="${cls}" `);
}
