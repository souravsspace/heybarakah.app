/* frame.jsx — Barakah device shell, theme tokens, meshes, icon set.
   Faithful translation of the heybarakah.app Expo UI (packages/app).
   Theme values lifted verbatim from contexts/theme-context.tsx. */

// ── Theme tokens (exact from theme-context.tsx) ───────────────
const LIGHT = {
  bg: "#FFFFFF", bgElevated: "#FFFFFF", surface: "#FFFFFF", surfaceSoft: "#F6F6F4",
  card: "#FFFFFF", ink: "#0A0A0A", inkMuted: "#6B7280", inkSubtle: "#A1A1AA",
  primary: "#29603E", primaryDark: "#1B3F29", primarySoft: "#E8F0EA",
  border: "#EAEAEA", divider: "#F0F0F0", error: "#B42318", errorSoft: "#FBEAE8",
  neutralSoft: "#F4F4F2", chevron: "#A1A1AA", premium: "#C9A23A",
};
const DARK = {
  bg: "#000000", bgElevated: "#0E0E0E", surface: "#141414", surfaceSoft: "#171717",
  card: "#1A1A1A", ink: "#FFFFFF", inkMuted: "#8E8E93", inkSubtle: "#5E5E62",
  primary: "#00D26A", primaryDark: "#00A856", primarySoft: "#0E2A1B",
  border: "#262626", divider: "#222222", error: "#FF453A", errorSoft: "#2A1517",
  neutralSoft: "#1A1A1A", chevron: "#5E5E62", premium: "#E4C168",
};
const SERIF = '"Libre Baskerville", Georgia, serif';
const SANS = 'Inter, -apple-system, system-ui, sans-serif';
const BARAKAH_GREEN = "#29603E";

function useColors(dark) { return dark ? DARK : LIGHT; }

// ── Mesh backgrounds (translated from components/meshes.tsx) ──
// SVG radialGradient r (objectBoundingBox) maps ~1:1 to CSS ellipse radius %.
function grad({ cx, cy, r, stops }) {
  const s = stops.map((x) => `${x[0]} ${Math.round(x[1] * 100)}%`).join(", ");
  return `radial-gradient(${r}% ${r}% at ${cx}% ${cy}%, ${s})`;
}
const G = BARAKAH_GREEN;
const MESHES = {
  home: {
    light: { base: "#F8FAF8", layers: [
      { cx: 14, cy: -4, r: 78, stops: [["rgba(250,247,240,0.95)", 0], ["rgba(250,247,240,0.32)", 0.55], ["rgba(250,247,240,0)", 1]] },
      { cx: 98, cy: -6, r: 62, stops: [["rgba(41,96,62,0.16)", 0], ["rgba(41,96,62,0.06)", 0.5], ["rgba(41,96,62,0)", 1]] },
      { cx: 2, cy: 106, r: 62, stops: [["rgba(41,96,62,0.16)", 0], ["rgba(41,96,62,0.06)", 0.5], ["rgba(41,96,62,0)", 1]] },
    ] },
    dark: { base: "#0E1311", layers: [
      { cx: 18, cy: 6, r: 72, stops: [["rgba(221,232,225,0.2)", 0], ["rgba(41,96,62,0.34)", 0.48], ["rgba(41,96,62,0)", 1]] },
      { cx: 92, cy: 0, r: 72, stops: [["rgba(247,249,247,0.04)", 0], ["rgba(41,96,62,0.2)", 0.5], ["rgba(41,96,62,0)", 1]] },
      { cx: 92, cy: 106, r: 78, stops: [["rgba(41,96,62,0.42)", 0], ["rgba(41,96,62,0.16)", 0.58], ["rgba(41,96,62,0)", 1]] },
      { cx: 0, cy: 88, r: 76, stops: [["rgba(17,24,22,0.28)", 0], ["rgba(17,24,22,0.12)", 0.6], ["rgba(255,255,255,0)", 1]] },
    ] },
  },
  profile: {
    light: { base: "#F8FAF8", layers: [
      { cx: 50, cy: -12, r: 82, stops: [["rgba(250,247,240,0.92)", 0], ["rgba(250,247,240,0.38)", 0.5], ["rgba(250,247,240,0)", 1]] },
      { cx: 0, cy: 108, r: 58, stops: [["rgba(41,96,62,0.14)", 0], ["rgba(41,96,62,0.05)", 0.5], ["rgba(41,96,62,0)", 1]] },
    ] },
    dark: { base: "#0B0E0C", layers: [
      { cx: 92, cy: -8, r: 74, stops: [["rgba(41,96,62,0.3)", 0], ["rgba(41,96,62,0.12)", 0.5], ["rgba(41,96,62,0)", 1]] },
      { cx: 6, cy: -4, r: 60, stops: [["rgba(221,232,225,0.07)", 0], ["rgba(221,232,225,0.03)", 0.5], ["rgba(221,232,225,0)", 1]] },
      { cx: 50, cy: 110, r: 70, stops: [["rgba(17,24,22,0.3)", 0], ["rgba(17,24,22,0.1)", 0.6], ["rgba(17,24,22,0)", 1]] },
    ] },
  },
  locked: {
    light: { base: "#F4F6F4", layers: [
      { cx: 50, cy: 28, r: 92, stops: [["rgba(255,255,255,0.85)", 0], ["rgba(250,247,240,0.32)", 0.5], ["rgba(250,247,240,0)", 1]] },
      { cx: 50, cy: 108, r: 80, stops: [["rgba(41,96,62,0.12)", 0], ["rgba(41,96,62,0.04)", 0.6], ["rgba(41,96,62,0)", 1]] },
    ] },
    dark: { base: "#0B0E0C", layers: [
      { cx: 50, cy: 20, r: 88, stops: [["rgba(200,210,204,0.08)", 0], ["rgba(200,210,204,0.03)", 0.5], ["rgba(200,210,204,0)", 1]] },
      { cx: 50, cy: 110, r: 80, stops: [["rgba(0,0,0,0.5)", 0], ["rgba(0,0,0,0)", 1]] },
    ] },
  },
  dhikr: {
    light: { base: "#F8FAF8", layers: [
      { cx: 50, cy: -6, r: 74, stops: [["rgba(250,247,240,0.92)", 0], ["rgba(250,247,240,0.34)", 0.55], ["rgba(250,247,240,0)", 1]] },
      { cx: 50, cy: 2, r: 38, stops: [["rgba(41,96,62,0.12)", 0], ["rgba(41,96,62,0.04)", 0.6], ["rgba(41,96,62,0)", 1]] },
    ] },
    dark: { base: "#0B0E0C", layers: [
      { cx: 50, cy: -4, r: 78, stops: [["rgba(221,232,225,0.08)", 0], ["rgba(221,232,225,0.02)", 0.6], ["rgba(221,232,225,0)", 1]] },
      { cx: 50, cy: 0, r: 58, stops: [["rgba(41,96,62,0.32)", 0], ["rgba(41,96,62,0.1)", 0.55], ["rgba(41,96,62,0)", 1]] },
    ] },
  },
  progress: {
    light: { base: "#F8FAF8", layers: [
      { cx: -8, cy: 112, r: 120, stops: [["rgba(250,247,240,0.88)", 0], ["rgba(250,247,240,0.28)", 0.5], ["rgba(250,247,240,0)", 1]] },
      { cx: 104, cy: -4, r: 50, stops: [["rgba(41,96,62,0.14)", 0], ["rgba(41,96,62,0.05)", 0.5], ["rgba(41,96,62,0)", 1]] },
    ] },
    dark: { base: "#0B0E0C", layers: [
      { cx: -8, cy: 112, r: 118, stops: [["rgba(41,96,62,0.32)", 0], ["rgba(41,96,62,0.1)", 0.4], ["rgba(41,96,62,0)", 1]] },
      { cx: 104, cy: -4, r: 46, stops: [["rgba(221,232,225,0.07)", 0], ["rgba(221,232,225,0.02)", 0.6], ["rgba(221,232,225,0)", 1]] },
    ] },
  },
  unlock: {
    light: { base: "#F8FAF8", layers: [
      { cx: 50, cy: 18, r: 76, stops: [["rgba(255,255,255,0.92)", 0], ["rgba(250,247,240,0.38)", 0.42], ["rgba(250,247,240,0)", 1]] },
      { cx: 8, cy: 96, r: 70, stops: [["rgba(41,96,62,0.14)", 0], ["rgba(41,96,62,0.05)", 0.55], ["rgba(41,96,62,0)", 1]] },
      { cx: 100, cy: 0, r: 58, stops: [["rgba(41,96,62,0.1)", 0], ["rgba(41,96,62,0.03)", 0.6], ["rgba(41,96,62,0)", 1]] },
    ] },
    dark: { base: "#0B0E0C", layers: [
      { cx: 50, cy: 18, r: 76, stops: [["rgba(221,232,225,0.1)", 0], ["rgba(41,96,62,0.2)", 0.42], ["rgba(41,96,62,0)", 1]] },
      { cx: 8, cy: 96, r: 70, stops: [["rgba(41,96,62,0.24)", 0], ["rgba(41,96,62,0.08)", 0.55], ["rgba(41,96,62,0)", 1]] },
      { cx: 100, cy: 0, r: 58, stops: [["rgba(221,232,225,0.07)", 0], ["rgba(221,232,225,0.02)", 0.6], ["rgba(221,232,225,0)", 1]] },
    ] },
  },
  achievements: {
    light: { base: "#F8F1E1", layers: [
      { cx: 50, cy: 0, r: 78, stops: [["rgba(250,247,240,0.7)", 0], ["rgba(250,247,240,0.22)", 0.55], ["rgba(250,247,240,0)", 1]] },
      { cx: 94, cy: -4, r: 68, stops: [["rgba(41,96,62,0.14)", 0], ["rgba(41,96,62,0.05)", 0.5], ["rgba(41,96,62,0)", 1]] },
      { cx: 6, cy: 106, r: 62, stops: [["rgba(41,96,62,0.08)", 0], ["rgba(41,96,62,0.03)", 0.55], ["rgba(41,96,62,0)", 1]] },
    ] },
    dark: { base: "#0E1311", layers: [
      { cx: 92, cy: -6, r: 72, stops: [["rgba(41,96,62,0.22)", 0], ["rgba(41,96,62,0.07)", 0.55], ["rgba(41,96,62,0)", 1]] },
      { cx: 6, cy: 106, r: 76, stops: [["rgba(245,235,219,0.05)", 0], ["rgba(245,235,219,0.02)", 0.6], ["rgba(245,235,219,0)", 1]] },
    ] },
  },
  auth: {
    light: { base: "#FFFFFF", layers: [] },
    dark: { base: "#000000", layers: [] },
  },
};

function Mesh({ name, dark }) {
  const m = MESHES[name][dark ? "dark" : "light"];
  const bg = [...m.layers.map(grad), m.base].join(", ");
  return <div style={{ position: "absolute", inset: 0, background: bg }} />;
}

// ── Icons (inline SVG; approximations of SF Symbols + Ionicons) ─
function Icon({ name, size = 24, color = "#000", fill = false, sw = 2 }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: color, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" };
  const S = (children, extra = {}) => <svg {...p} {...extra}>{children}</svg>;
  switch (name) {
    case "house": return S(fill
      ? <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill={color} stroke="none" />
      : <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-4v-6H9v6H4a1 1 0 0 1-1-1z" />);
    case "hexagongrid": {
      const hex = (cx, cy, r) => { const pts = []; for (let i = 0; i < 6; i++){ const a = Math.PI/180*(60*i-30); pts.push(`${(cx+r*Math.cos(a)).toFixed(1)},${(cy+r*Math.sin(a)).toFixed(1)}`);} return pts.join(" "); };
      return S(<g>{[[12,5.2],[6.4,8.6],[17.6,8.6],[6.4,15.4],[17.6,15.4],[12,18.8]].map((c,i)=><polygon key={i} points={hex(c[0],c[1],2.6)} fill={fill?color:"none"} />)}</g>);
    }
    case "lock": return S(<g><rect x="5" y="11" width="14" height="9" rx="2" fill={fill?color:"none"} stroke={color} /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></g>);
    case "chart": return S(<g><path d="M4 4v16h16" /><path d="M7 14l3.5-4 3 2.5L20 6" /></g>);
    case "person-circle": return S(<g><circle cx="12" cy="12" r="9" fill={fill?color:"none"} stroke={color} /><circle cx="12" cy="9.8" r="2.8" fill={fill?"#fff":"none"} stroke={fill?"none":color} /><path d="M6.5 18.5a6 6 0 0 1 11 0" fill={fill?"#fff":"none"} stroke={fill?"none":color} /></g>);
    case "person": return S(<g><circle cx="12" cy="8" r="3.6" fill={fill?color:"none"} stroke={color} /><path d="M5 20a7 7 0 0 1 14 0" fill={fill?color:"none"} stroke={color} /></g>);
    case "trophy": return S(<g><path d="M7 4h10v4a5 5 0 0 1-10 0z" /><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" /><path d="M12 13v3M9 20h6M10 20v-1.5a2 2 0 0 1 4 0V20" /></g>);
    case "plus": case "add": return S(<path d="M12 5v14M5 12h14" />);
    case "arrow-forward": return S(<path d="M5 12h14M13 6l6 6-6 6" />);
    case "chevron-right": return S(<path d="M9 5l7 7-7 7" />);
    case "chevron-back": return S(<path d="M15 5l-7 7 7 7" />);
    case "chevron-forward": return S(<path d="M9 5l7 7-7 7" />);
    case "checkmark": return S(<path d="M5 13l4 4L19 7" />);
    case "timer": return S(<g><circle cx="12" cy="13" r="7.5" /><path d="M12 13V9M9.5 2h5" /></g>);
    case "lock-closed": return S(<g><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></g>);
    case "location": return S(<g><path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11z" fill={fill?color:"none"} stroke={color} /><circle cx="12" cy="10" r="2.5" fill={fill?"#fff":"none"} stroke={fill?"none":color} /></g>);
    case "bell": return S(<path d="M6 16V10a6 6 0 0 1 12 0v6l2 2H4zM9.5 21a2.5 2.5 0 0 0 5 0" fill={fill?color:"none"} stroke={color} />);
    case "crown": return S(<path d="M4 18h16M4 18l-1.5-9 5 4L12 6l4.5 7 5-4L20 18" fill={fill?color:"none"} stroke={color} strokeWidth={fill?0:sw} />);
    case "sliders": return S(<g><path d="M4 8h10M18 8h2M4 16h2M10 16h10" /><circle cx="16" cy="8" r="2.2" fill="none" /><circle cx="8" cy="16" r="2.2" fill="none" /></g>);
    case "globe": return S(<g><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" /></g>);
    case "megaphone": return S(<path d="M3 10v4a1 1 0 0 0 1 1h2l9 4V5L6 9H4a1 1 0 0 0-1 1zM18 9a3 3 0 0 1 0 6" fill={fill?color:"none"} stroke={color} />);
    case "envelope": return S(<g><rect x="3" y="5" width="18" height="14" rx="2" fill={fill?color:"none"} stroke={color} /><path d="M4 7l8 6 8-6" stroke={fill?"#fff":color} /></g>);
    case "doc": return S(<g><path d="M6 3h8l4 4v14H6z" fill={fill?color:"none"} stroke={color} /><path d="M14 3v4h4M9 12h6M9 16h6" stroke={fill?"#fff":color} /></g>);
    case "shield": return S(<g><path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z" fill={fill?color:"none"} stroke={color} /><path d="M9 12l2 2 4-4" stroke={fill?"#fff":color} /></g>);
    case "logout": return S(<g><path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" /><path d="M9 12h11M16 8l4 4-4 4" /></g>);
    case "trash": return S(<g><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" fill={fill?color:"none"} stroke={color} /></g>);
    case "logo-apple": return S(<path d="M16 13c0-3 2.5-3.5 2.5-3.5-1.3-2-3.4-2-4-2-1.7-.2-3.3 1-4 1s-2-1-3.4-1C5 7.6 3 9.3 3 13c0 3.5 2.5 8 4.5 8 1 0 1.8-.7 3-.7s1.8.7 3 .7c2 0 4-4.5 4-4.5s-1.5-.6-1.5-3.5z" fill={color} stroke="none" />, { });
    case "logo-google": return <svg width={size} height={size} viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.4 3-4.1 5.6-4.1z"/></svg>;
    case "mail": return S(<g><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M4 7l8 6 8-6" /></g>);
    case "moon": return S(<path d="M20 14a8 8 0 0 1-10-10 8 8 0 1 0 10 10z" fill={fill?color:"none"} stroke={color} />);
    case "star": return S(<path d="M12 3.5l2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.4 6.9 19l1-5.6-4.1-4 5.7-.8z" fill={fill?color:"none"} stroke={color} />);
    case "leaf": return S(<path d="M5 19c0-8 6-13 14-13 0 8-5 14-13 14-1 0-1-1-1-1zM6 18C10 14 13 11 17 9" fill={fill?color:"none"} stroke={color} />);
    case "sunrise": return S(<g><path d="M12 3v4M5 11a7 7 0 0 1 14 0M3 16h18M3 20h18M8 8l-1.5-1.5M16 8l1.5-1.5" /></g>);
    case "book": return S(<path d="M4 5a2 2 0 0 1 2-2h6v17H6a2 2 0 0 0-2 2zM20 5a2 2 0 0 0-2-2h-6v17h6a2 2 0 0 1 2 2z" fill={fill?color:"none"} stroke={color} />);
    case "heart": return S(<path d="M12 20s-7-4.5-7-9.5A4 4 0 0 1 12 7a4 4 0 0 1 7 3.5C19 15.5 12 20 12 20z" fill={fill?color:"none"} stroke={color} />);
    case "flame": return S(<path d="M12 3c1 4 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 1 1 2 2 2 0-3-1-5 1-7z" fill={fill?color:"none"} stroke={color} />);
    case "sun": return S(<g><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" /></g>);
    default: return S(<circle cx="12" cy="12" r="8" />);
  }
}

// ── Brand mark (exact SVG paths from barakah-mark.tsx) ────────
const BARAKAH_PATHS = [
  "M20.1605 485.23C19.8705 483.25 19.3505 476.95 18.9905 471.31C16.6505 432.2 28.5805 402.32 58.2505 373.53C79.4905 352.95 100.66 339.84 154.12 314.35C174.92 304.46 190.45 296.33 202.09 289.3C207.95 285.71 209.12 285.27 209.49 286.3C210.66 289.3 211.83 307.91 211.83 322.63C211.9 366.14 201.65 403.86 180.56 438.35C173.53 449.78 166.13 459.22 155.58 470.06C145.62 480.39 134.71 489.91 135.8 487.42C144.66 466.55 151.84 436.74 154.48 410.22C155.73 397.33 155.14 366.57 153.53 365.03C153.02 364.44 118.15 379.82 104.31 386.71C76.7005 400.48 59.4105 412.93 46.5205 428.46C32.9705 444.72 25.2805 461.13 22.1305 480.46C20.7405 488.81 20.7405 488.88 20.1505 485.22L20.1605 485.23Z",
  "M0.310503 424.44C-2.5495 369.14 14.3005 325.49 52.8205 288.21C77.8705 263.97 102.041 249.17 161.071 221.93C185.171 210.8 194.831 205.96 207.291 198.79C240.251 179.97 261.711 161.66 276.581 139.76C285.741 126.28 292.551 110.54 294.451 98.16C295.481 91.35 295.621 90.84 296.501 90.84C298.331 90.84 300.531 113.25 299.941 125.63C298.041 165.33 283.24 196.75 252.55 226.78C231.46 247.43 201.65 265.23 148.62 288.96C105.85 308.08 80.9405 322.14 58.4605 339.86C48.8705 347.48 34.7305 361.69 28.3605 370.18C16.5705 385.93 7.3405 406.22 2.8705 426.28L0.890505 435.44L0.300509 424.45L0.310503 424.44Z",
  "M132.141 209.99C131.551 208.38 129.581 196.73 128.481 188.24C126.871 176.37 126.211 148.98 127.311 137.26C128.411 125.39 130.461 113.75 133.241 102.91C139.831 77.2 155.361 48.05 174.551 25.27C182.311 16.11 198.651 0 200.261 0H201.801L200.481 6.45C196.451 26.45 197.111 48.2 202.381 71.42C204.941 82.55 206.991 89.36 213.441 108.04C219.151 124.52 225.671 145.83 225.161 146.35C224.061 147.45 206.411 132.65 201.141 126.21C196.531 120.57 190.301 110.83 187.081 104.16C185.621 101.23 184.441 99.62 183.641 99.62C182.471 99.62 182.321 100.72 182.321 111.92C182.321 130.52 184.441 149.86 188.841 171.61C191.181 183.18 191.481 182.16 184.591 186.4C173.971 192.77 132.591 211.38 132.151 209.98L132.141 209.99Z",
];
function BarakahMark({ size = 26, color = "#9CA3AF" }) {
  return (
    <svg height={size} width={size * (301 / 488)} viewBox="0 0 301 488">
      {BARAKAH_PATHS.map((d, i) => <path d={d} fill={color} key={i} />)}
    </svg>
  );
}

// Mosque minaret line illustration (mosque-minaret.tsx)
function MosqueMinaret({ size = 120, color = "#FFFFFF", opacity = 1 }) {
  const sp = { fill: "none", stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5 };
  return (
    <svg height={size} width={size} viewBox="0 0 24 24" style={{ opacity }}>
      <path d="M3 22V19.5C3 17.4317 3.34533 17 5 17H17C18.6547 17 19 17.4317 19 19.5V22H3Z" {...sp} />
      <path d="M2 22H22" {...sp} />
      <path d="M17.5125 6C15.9698 4 18.3389 3 19 2C19.6611 3 22.0302 4 20.4875 6H17.5125Z" {...sp} />
      <path d="M17.5 6L17 17M17 22H21L20.5 6" {...sp} />
      <path d="M11.0006 8C12.984 10.25 16.9992 11 16.9992 17H5C5 11 9.01516 10.25 10.9986 8" {...sp} />
    </svg>
  );
}

// ── Device chrome ─────────────────────────────────────────────
const DEVICE_W = 393, DEVICE_H = 852, INSET_TOP = 59, INSET_BOTTOM = 34;

function StatusBar({ dark, time = "9:41" }) {
  const c = dark ? "#fff" : "#000";
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: INSET_TOP, zIndex: 30,
      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px 0 36px", boxSizing: "border-box" }}>
      <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 16.5, color: c, letterSpacing: -0.2, marginTop: 8 }}>{time}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 8 }}>
        <svg width="18" height="11" viewBox="0 0 18 11"><g fill={c}>
          <rect x="0" y="7" width="3" height="4" rx="0.7" /><rect x="4.5" y="4.6" width="3" height="6.4" rx="0.7" />
          <rect x="9" y="2.2" width="3" height="8.8" rx="0.7" /><rect x="13.5" y="0" width="3" height="11" rx="0.7" /></g></svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><path d="M8 3c2.1 0 4 .8 5.4 2.1l1-1.1A9 9 0 0 0 8 1.4 9 9 0 0 0 1.6 4l1 1.1C4 3.8 5.9 3 8 3z" fill={c}/><path d="M8 6.3c1.2 0 2.3.5 3.1 1.2l1-1.1A6 6 0 0 0 8 4.7 6 6 0 0 0 3.9 6.4l1 1.1C5.7 6.8 6.8 6.3 8 6.3z" fill={c}/><circle cx="8" cy="9.6" r="1.3" fill={c}/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke={c} strokeOpacity="0.35" fill="none"/><rect x="2" y="2" width="16" height="8" rx="1.6" fill={c}/><path d="M23 4v4c.8-.3 1.3-1 1.3-2S23.8 4.3 23 4z" fill={c} fillOpacity="0.5"/></svg>
      </div>
    </div>
  );
}

const TABS = [
  { id: "home", label: "Home", icon: "house" },
  { id: "dhikr", label: "Dhikr", icon: "hexagongrid" },
  { id: "locked", label: "Locked", icon: "lock" },
  { id: "progress", label: "Progress", icon: "chart" },
  { id: "profile", label: "Profile", icon: "person-circle" },
];
const TAB_SELECTED = "#00D26A"; // PRIMARY_BRIGHT — iOS selected content

function TabBar({ active, dark }) {
  const c = useColors(dark);
  const bg = dark ? "#0A0A0A" : "#FFFFFF";
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 25, background: bg,
      borderTop: `0.5px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
      paddingBottom: INSET_BOTTOM - 8, paddingTop: 8, display: "flex" }}>
      {TABS.map((t) => {
        const on = t.id === active;
        const col = on ? TAB_SELECTED : c.inkMuted;
        return (
          <div key={t.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <Icon name={t.icon} size={27} color={col} fill={on && t.id !== "chart"} sw={on ? 2 : 1.8} />
            <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: on ? 600 : 500, color: col }}>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Phone shell. `tab` shows native tab bar; pass null for full-screen flows.
function Phone({ children, dark, tab = null, time, scale = 1 }) {
  return (
    <div style={{ width: DEVICE_W * scale, height: DEVICE_H * scale }}>
    <div style={{ width: DEVICE_W, height: DEVICE_H, transform: `scale(${scale})`, transformOrigin: "top left",
      borderRadius: 54, position: "relative", overflow: "hidden",
      background: dark ? "#000" : "#fff",
      boxShadow: "0 40px 90px rgba(11,23,16,0.22), 0 0 0 1px rgba(0,0,0,0.10)",
      fontFamily: SANS, WebkitFontSmoothing: "antialiased" }}>
      {/* dynamic island */}
      <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
        width: 124, height: 36, borderRadius: 22, background: "#000", zIndex: 40 }} />
      <StatusBar dark={dark} time={time} />
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>{children}</div>
      {tab ? <TabBar active={tab} dark={dark} /> : null}
      {/* home indicator */}
      <div style={{ position: "absolute", bottom: 9, left: "50%", transform: "translateX(-50%)", zIndex: 45,
        width: 134, height: 5, borderRadius: 100, background: dark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.32)" }} />
    </div>
    </div>
  );
}

// Scroll body — content area that scrolls under the status bar, padded for insets.
function Body({ children, dark, padTop = INSET_TOP, padBottom = INSET_BOTTOM, style = {} }) {
  return (
    <div className="bk-scroll" style={{ position: "absolute", inset: 0, overflowY: "auto",
      paddingTop: padTop, paddingBottom: padBottom, ...style }}>
      {children}
    </div>
  );
}

Object.assign(window, {
  LIGHT, DARK, SERIF, SANS, BARAKAH_GREEN, useColors,
  Mesh, Icon, BarakahMark, MosqueMinaret,
  Phone, Body, StatusBar, TabBar,
  DEVICE_W, DEVICE_H, INSET_TOP, INSET_BOTTOM,
});
