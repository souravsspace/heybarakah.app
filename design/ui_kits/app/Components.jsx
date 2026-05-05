// Barakah app components — small, modular, copy-paste friendly
// Exposed to window at the bottom for cross-script use.

const { useEffect: bkUseEffect } = React;

// ---------- Atoms ----------

function Banner({ children = "Prayer lock · enabled" }) {
  return <div className="bk-banner">{children}</div>;
}

function Button({ variant = "primary", block, children, onClick, style }) {
  const cls = `bk-btn bk-btn-${variant} ${block ? "bk-btn-block" : ""}`;
  return <button className={cls} onClick={onClick} style={style}>{children}</button>;
}

function Card({ soft, children, style }) {
  return <div className={soft ? "bk-card-soft" : "bk-card"} style={style}>{children}</div>;
}

function Chip({ on, soft, children }) {
  const cls = on ? "bk-chip bk-chip-on" : soft ? "bk-chip bk-chip-soft" : "bk-chip";
  return <span className={cls}>{children}</span>;
}

function Eyebrow({ children }) { return <div className="bk-eyebrow">{children}</div>; }

// ---------- Lucide icon helper ----------
function Icon({ name, size = 20, stroke = 1.75, color = "currentColor" }) {
  const ref = React.useRef(null);
  bkUseEffect(() => {
    if (window.lucide && ref.current) {
      ref.current.setAttribute("data-lucide", name);
      ref.current.innerHTML = "";
      window.lucide.createIcons({ icons: window.lucide.icons, attrs: { width: size, height: size, "stroke-width": stroke, stroke: color }, nameAttr: "data-lucide" });
    }
  }, [name, size, stroke, color]);
  return <i ref={ref} data-lucide={name} style={{ width: size, height: size, display: "inline-flex" }}></i>;
}

// ---------- Top bar ----------
function TopBar({ title, left, right }) {
  return (
    <div className="bk-topbar">
      <div style={{ width: 40 }}>{left}</div>
      <div className="title">{title}</div>
      <div style={{ width: 40, display: "flex", justifyContent: "flex-end" }}>{right}</div>
    </div>
  );
}

// ---------- Tab bar ----------
function TabBar({ active, onChange }) {
  const tabs = [
    { id: "home", label: "Home", icon: "moon" },
    { id: "prayers", label: "Prayers", icon: "clock" },
    { id: "learn", label: "Learn", icon: "book-open" },
    { id: "you", label: "You", icon: "user" },
  ];
  return (
    <div className="bk-tabbar">
      {tabs.map(t => (
        <button key={t.id} className={`bk-tab ${active === t.id ? "active" : ""}`} onClick={() => onChange(t.id)}>
          <Icon name={t.icon} size={22} />
          <div className="label">{t.label}</div>
        </button>
      ))}
    </div>
  );
}

// ---------- Prayer row ----------
function PrayerRow({ name, time, status }) {
  // status: 'passed' | 'now' | 'upcoming'
  const initial = name[0];
  return (
    <div className={`bk-row ${status === "now" ? "now" : ""} ${status === "passed" ? "passed" : ""}`}>
      <div className={`bk-row-icon ${status === "passed" ? "solid" : ""}`}>{initial}</div>
      <div className="bk-name">{name}{status === "now" ? <span style={{ color: "#29603E", fontWeight: 500 }}> · now</span> : null}</div>
      <div className="bk-time">{time}</div>
    </div>
  );
}

// ---------- Lock visual ----------
function LockMark() {
  return (
    <div className="bk-lockwrap">
      <div className="bk-lockring"></div>
      <div className="bk-lockring r2"></div>
      <div className="bk-lockring r3"></div>
      <img className="bk-locklogo" src="../../assets/barakah-logo.svg" alt="" />
    </div>
  );
}

// ---------- Countdown ring (next prayer) ----------
function PrayerCountdown({ name = "Maghrib", remaining = "1 h 04 min", time = "5:42 pm", progress = 0.62 }) {
  const r = 64, c = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg className="bk-ring" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="#EAF2EC" strokeWidth="4" />
        <circle cx="72" cy="72" r={r} fill="none" stroke="#29603E" strokeWidth="4"
          strokeDasharray={c} strokeDashoffset={c * (1 - progress)} strokeLinecap="round"
          transform="rotate(-90 72 72)" />
        <text x="72" y="68" textAnchor="middle" fontFamily="Libre Baskerville" fontWeight="700" fontSize="22" fill="#000">{name}</text>
        <text x="72" y="92" textAnchor="middle" fontFamily="ui-monospace,Menlo,monospace" fontSize="13" fill="#6B7280">{time}</text>
      </svg>
      <div>
        <Eyebrow>Next prayer</Eyebrow>
        <div className="bk-h2" style={{ marginTop: 4 }}>in {remaining}</div>
        <div className="bk-meta" style={{ marginTop: 6 }}>Phoenix, AZ · Hanafi method</div>
      </div>
    </div>
  );
}

// ---------- iOS status bar substitute ----------
function FakeStatusBar() {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", padding:"14px 28px 4px", fontFamily:"-apple-system", fontWeight:600, fontSize:14, color:"#000" }}>
      <span>9:41</span>
      <span style={{ display:"flex", gap:6, alignItems:"center" }}>
        <span style={{ fontSize:11 }}>●●●●</span>
        <span style={{ fontSize:11 }}>5G</span>
        <span style={{ display:"inline-block", width:24, height:11, border:"1px solid #000", borderRadius:3, position:"relative" }}>
          <span style={{ position:"absolute", inset:1, background:"#000", borderRadius:1, width:"80%" }}></span>
        </span>
      </span>
    </div>
  );
}

Object.assign(window, {
  Banner, Button, Card, Chip, Eyebrow, Icon, TopBar, TabBar, PrayerRow, LockMark, PrayerCountdown, FakeStatusBar
});
