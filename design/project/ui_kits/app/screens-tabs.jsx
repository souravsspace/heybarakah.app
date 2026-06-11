/* screens-tabs.jsx — Home, Dhikr, Locked, Progress, Profile.
   Direct translation of packages/app/app/(app)/(tabs)/*.tsx. */

// ── HOME ──────────────────────────────────────────────────────
const PRAYER_LABEL = { fajr: "Fajr", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha" };

function HomeScreen({ dark }) {
  const c = useColors(dark);
  const surface = dark ? "rgba(26,26,26,0.22)" : "rgba(255,255,255,0.12)";
  const activeSurface = dark ? "rgba(14,42,27,0.28)" : "rgba(232,240,234,0.18)";
  const rowSurface = dark ? "rgba(26,26,26,0.1)" : "rgba(255,255,255,0.06)";
  const cardBorder = dark ? c.border : "rgba(41,96,62,0.16)";

  const rows = [
    { p: "fajr", status: "on_time", range: "Begins 4:12 AM · ends 5:48 AM", time: "4:12 AM" },
    { p: "dhuhr", status: "on_time", range: "Begins 1:04 PM · ends 4:31 PM", time: "1:04 PM" },
    { p: "asr", status: null, active: true, range: "Begins 4:31 PM · ends 7:06 PM", time: "4:31 PM", progress: 0.42 },
    { p: "maghrib", status: null, range: "Begins 7:06 PM · ends 8:33 PM", time: "7:06 PM" },
    { p: "isha", status: null, range: "Begins 8:33 PM · ends 4:10 AM", time: "8:33 PM" },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, background: dark ? "#0E1311" : "#F8FAF8" }}>
      <Mesh name="home" dark={dark} />
      <Body dark={dark} padBottom={INSET_BOTTOM + 96}>
        {/* greeting */}
        <div style={{ padding: "10px 20px 0", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: c.inkMuted }}>Sat, 7 Jun  ·  21 Dhū al-Qaʿdah 1447</span>
            <div style={{ width: 36, height: 36, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", background: c.primary }}>
              <Icon name="trophy" size={18} color="#fff" sw={1.8} />
            </div>
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 26, lineHeight: "32px", color: c.ink }}>
            Assalāmu ʿalaykum,<br />Sarah.
          </div>
        </div>

        {/* focal card */}
        <div style={{ margin: "22px 20px 0", borderRadius: 20, border: `1px solid ${cardBorder}`, background: surface, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", right: -7, bottom: -10 }}>
            <MosqueMinaret size={132} color={dark ? "#FFFFFF" : BARAKAH_GREEN} opacity={dark ? 0.22 : 0.16} />
          </div>
          <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: c.primary }}>In progress</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <SourceChip dark={dark} />
                <span style={{ fontSize: 12, fontWeight: 600, color: c.inkSubtle, textDecoration: "underline" }}>London</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontFamily: SERIF, color: c.ink, fontSize: 48, lineHeight: "52px" }}>Asr</div>
              <div style={{ color: c.inkMuted, fontSize: 18, fontVariant: "tabular-nums" }}>4:31 PM</div>
            </div>
            <div style={{ display: "flex" }}>
              <div style={{ padding: "10px 18px", borderRadius: 999, border: `1px solid ${c.primary}`, whiteSpace: "nowrap" }}>
                <span style={{ color: c.primary, fontSize: 13, fontWeight: 700 }}>I prayed</span>
              </div>
            </div>
          </div>
        </div>

        {/* today ledger */}
        <div style={{ margin: "32px 20px 0", borderRadius: 20, border: `1px solid ${cardBorder}`, background: surface, padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: c.inkMuted }}>Today</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: c.inkSubtle, fontVariant: "tabular-nums" }}>2 of 5 logged</span>
          </div>
          <div>
            {rows.map((r, i) => (
              <div key={r.p}>
                <LedgerRow row={r} c={c} activeSurface={activeSurface} rowSurface={rowSurface} />
                {i < rows.length - 1 ? <div style={{ height: 1, margin: "8px 0", background: c.divider }} /> : null}
              </div>
            ))}
          </div>
        </div>

        <div style={{ margin: "24px 24px 0" }}>
          <span style={{ fontSize: 13, fontWeight: 700, lineHeight: "18px", color: c.inkMuted }}>
            "Remember Me; I will remember you", 2:152
          </span>
        </div>
      </Body>
    </div>
  );
}

function SourceChip({ dark }) {
  const c = useColors(dark);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 999, border: `1px solid ${c.border}` }}>
      <div style={{ width: 6, height: 6, borderRadius: 3, background: c.primary }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: c.inkSubtle, letterSpacing: 0.3 }}>GPS</span>
    </div>
  );
}

function LedgerRow({ row, c, activeSurface, rowSurface }) {
  const isActive = !!row.active;
  const nameColor = row.status === "missed" ? c.inkSubtle : isActive ? c.primary : c.ink;
  return (
    <div style={{ border: `1px solid ${isActive ? c.primary : c.border}`, borderRadius: 18,
      background: isActive ? activeSurface : rowSurface, padding: isActive ? "20px 18px" : "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
          <div style={{ fontFamily: SERIF, fontSize: isActive ? 30 : 22, lineHeight: isActive ? "36px" : "26px", color: nameColor }}>
            {PRAYER_LABEL[row.p]}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: c.inkMuted, fontVariant: "tabular-nums" }}>{row.range}</div>
            {isActive ? (
              <div style={{ height: 1, marginTop: 5, background: c.divider }}>
                <div style={{ height: 1, width: `${row.progress * 100}%`, background: c.primary }} />
              </div>
            ) : null}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: 96, paddingTop: 4 }}>
          {row.status === "on_time"
            ? <span style={{ color: c.primary, fontSize: 12, fontWeight: 700 }}>On time</span>
            : <span style={{ fontSize: isActive ? 24 : 18, fontFamily: isActive ? SERIF : SANS, fontWeight: 700, fontVariant: "tabular-nums", lineHeight: isActive ? "29px" : "24px", color: isActive ? c.primary : c.ink }}>{row.time}</span>}
        </div>
      </div>
    </div>
  );
}

// ── DHIKR ─────────────────────────────────────────────────────
function DhikrScreen({ dark }) {
  const c = useColors(dark);
  const count = 12, target = 33, progress = count / target;
  return (
    <div style={{ position: "absolute", inset: 0, background: c.bg }}>
      <Mesh name="dhikr" dark={dark} />
      {/* progress fill */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${progress * 100}%`, background: c.primarySoft }} />
      {/* header */}
      <div style={{ position: "absolute", top: INSET_TOP + 8, left: 0, right: 0, padding: "0 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.6, color: c.ink, textTransform: "uppercase" }}>Subhanallah</span>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.4, color: c.inkSubtle, textTransform: "uppercase" }}>· 1 of 4</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: c.inkMuted, fontVariant: "tabular-nums", letterSpacing: 0.6 }}>{count} / {target}</span>
      </div>
      {/* body */}
      <div style={{ position: "absolute", top: INSET_TOP + 56, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: `24px 24px ${INSET_BOTTOM + 88}px` }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 8 }}>
          <div style={{ fontSize: 32, lineHeight: "46px", color: c.ink, fontWeight: 500, direction: "rtl" }}>سُبْحَانَ ٱللَّٰه</div>
          <div style={{ fontSize: 18, lineHeight: "24px", color: c.ink, letterSpacing: 0.2, fontStyle: "italic", fontWeight: 500 }}>Sub-haa-nal-laah</div>
          <div style={{ fontSize: 12, color: c.inkMuted, letterSpacing: 0.4 }}>Glory be to Allah</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ fontFamily: SERIF, fontSize: 132, lineHeight: "140px", color: c.ink, fontVariant: "tabular-nums" }}>{count}</div>
          <div style={{ fontSize: 13, color: c.inkMuted, fontVariant: "tabular-nums", marginTop: -4 }}>of {target}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.8, color: c.inkSubtle, textTransform: "uppercase" }}>
            Lifetime · Subhan <span style={{ color: c.ink, fontVariant: "tabular-nums" }}>4,182</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ── LOCKED (iOS, permission granted, empty shield) ────────────
function LockedScreen({ dark }) {
  const c = useColors(dark);
  const cardSurface = dark ? "rgba(26,26,26,0.58)" : "rgba(255,255,255,0.42)";
  const cardBorder = dark ? "rgba(255,255,255,0.18)" : "rgba(41,96,62,0.16)";
  const hairline = dark ? "rgba(255,255,255,0.1)" : "rgba(41,96,62,0.1)";
  const iconSurface = dark ? "rgba(255,255,255,0.055)" : "rgba(41,96,62,0.06)";
  return (
    <div style={{ position: "absolute", inset: 0, background: c.bg }}>
      <Mesh name="locked" dark={dark} />
      <Body dark={dark} padBottom={INSET_BOTTOM + 96}>
        {/* hero */}
        <div style={{ padding: "10px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 36 }}>
            <span style={{ color: c.inkMuted, fontSize: 10, fontWeight: 700, letterSpacing: 2.4 }}>QUIET AT SALAH</span>
            <div style={{ width: 36, height: 36, borderRadius: 18, border: `1px solid ${c.border}`, background: c.surface, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: c.ink, fontSize: 20, lineHeight: "22px" }}>+</span>
            </div>
          </div>
          <div style={{ color: c.ink, fontFamily: SERIF, fontSize: 36, letterSpacing: -0.6, lineHeight: "42px", marginTop: 28 }}>Five times.</div>
          <div style={{ color: c.ink, fontFamily: SERIF, fontSize: 36, fontStyle: "italic", letterSpacing: -0.6, lineHeight: "42px" }}>Hands quiet.</div>
          <div style={{ color: c.inkMuted, fontSize: 14, lineHeight: "22px", marginTop: 16, maxWidth: 340 }}>
            Pick the apps that pull at you. Each will go quiet for 15 minutes at each prayer.
          </div>
        </div>

        {/* empty shield card */}
        <div style={{ padding: "40px 24px 0" }}>
          <div style={{ background: cardSurface, border: `1.5px solid ${cardBorder}`, borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "22px 22px 0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: c.inkMuted, fontSize: 11, fontWeight: 700, letterSpacing: 1.5 }}>SHIELD SETUP</span>
                <div style={{ width: 32, height: 32, borderRadius: 16, border: `1px solid ${cardBorder}`, background: iconSurface, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="add" size={19} color={c.primary} />
                </div>
              </div>
              <div style={{ color: c.ink, fontFamily: SERIF, fontSize: 22, letterSpacing: -0.2, lineHeight: "30px", marginTop: 18, maxWidth: 285 }}>
                Choose what should go quiet at salah.
              </div>
              <div style={{ color: c.inkMuted, fontSize: 13, lineHeight: "20px", margin: "10px 0 0", maxWidth: 294 }}>
                Pick the apps that pull at you. Barakah will hold them for 15 minutes at every salah.
              </div>
            </div>
            <div style={{ background: hairline, height: 1, marginTop: 24 }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px" }}>
              <div>
                <div style={{ color: c.ink, fontSize: 15, fontWeight: 700 }}>Add apps</div>
                <div style={{ color: c.inkMuted, fontSize: 12, lineHeight: "18px", marginTop: 2 }}>Choose apps, categories, or sites</div>
              </div>
              <Icon name="arrow-forward" size={18} color={c.inkMuted} />
            </div>
          </div>
        </div>
      </Body>
    </div>
  );
}

// ── PROGRESS ──────────────────────────────────────────────────
function ProgressScreen({ dark }) {
  const c = useColors(dark);
  const cardSurface = dark ? "rgba(20,26,23,0.55)" : "rgba(255,255,255,0.55)";
  const daily = [{ label: "Mo", value: 3 }, { label: "Tu", value: 5 }, { label: "We", value: 4 }, { label: "Th", value: 5 }, { label: "Fr", value: 2 }, { label: "Sa", value: 4 }, { label: "Su", value: 1 }];
  return (
    <div style={{ position: "absolute", inset: 0, background: c.bg }}>
      <Mesh name="progress" dark={dark} />
      <Body dark={dark} padBottom={140}>
        <div style={{ padding: "8px 20px 0", display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.4, color: c.inkMuted, textTransform: "uppercase" }}>This week</span>
          <span style={{ fontFamily: SERIF, fontSize: 28, lineHeight: "34px", color: c.ink }}>Mā shāʾ Allāh.</span>
          <span style={{ fontSize: 13, color: c.inkMuted, marginTop: 2 }}>Jun 2 – 8</span>
        </div>

        <div style={{ padding: "28px 20px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontFamily: SERIF, fontSize: 64, lineHeight: "68px", color: c.ink, fontVariant: "tabular-nums" }}>
            18<span style={{ color: c.inkSubtle }}>/35</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: c.inkMuted, textTransform: "uppercase", marginTop: 6 }}>On-time prayers</span>
        </div>

        <div style={{ height: 1, background: c.divider, margin: "0 20px" }} />

        <div style={{ margin: "24px 20px 0", borderRadius: 20, border: `1px solid ${c.border}`, background: cardSurface, padding: "16px 16px 8px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, padding: "0 4px" }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.6, color: c.inkMuted, textTransform: "uppercase" }}>Daily on-time</span>
            <span style={{ fontSize: 11, color: c.inkMuted }}>this week</span>
          </div>
          <AreaChart data={daily} max={5} color={c.primary} />
        </div>

        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14 }}>
          <span style={{ padding: "0 20px", fontSize: 10, fontWeight: 700, letterSpacing: 2.4, color: c.inkMuted, textTransform: "uppercase" }}>By prayer</span>
          <PrayerMatrix dark={dark} surface={cardSurface} />
        </div>
      </Body>
    </div>
  );
}

function AreaChart({ data, max, color }) {
  const W = 321, H = 180, PAD_X = 12, PAD_TOP = 12, PAD_BOTTOM = 24;
  const innerW = W - PAD_X * 2, innerH = H - PAD_TOP - PAD_BOTTOM;
  const step = innerW / (data.length - 1);
  const pts = data.map((d, i) => ({ x: PAD_X + step * i, y: PAD_TOP + innerH * (1 - d.value / max) }));
  const curve = (a, b) => { const cx = (a.x + b.x) / 2; return `C ${cx} ${a.y}, ${cx} ${b.y}, ${b.x} ${b.y}`; };
  let line = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) line += ` ${curve(pts[i - 1], pts[i])}`;
  const area = `${line} L ${pts[pts.length - 1].x} ${PAD_TOP + innerH} L ${pts[0].x} ${PAD_TOP + innerH} Z`;
  return (
    <div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs><linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.22" /><stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient></defs>
        <path d={area} fill="url(#areaFill)" />
        <path d={line} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill="#fff" stroke={color} strokeWidth="1.6" />)}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 12px", marginTop: -8 }}>
        {data.map((d, i) => <span key={i} style={{ fontSize: 10, color: "#6B7280", fontWeight: 600 }}>{d.label}</span>)}
      </div>
    </div>
  );
}

function PrayerMatrix({ dark, surface }) {
  const c = useColors(dark);
  const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  // sample status grid: o=on_time l=late q=qada m=missed .=none  (today = Sa)
  const grid = [
    ["o", "o", "o", "l", "o", "o", "."],
    ["o", "o", "l", "o", "o", "o", "."],
    ["o", "l", "o", "o", "m", "o", "."],
    ["o", "o", "o", "o", "o", "q", "."],
    ["o", "o", "o", "l", "o", ".", "."],
  ];
  const todayIdx = 5;
  const cell = (st, isPast, isToday) => {
    let s = { background: "transparent", borderColor: c.border, borderStyle: "solid", opacity: 1 };
    if (st === "o") s = { background: c.primary, borderColor: c.primary, borderStyle: "solid", opacity: 1 };
    else if (st === "l") s = { background: c.primarySoft, borderColor: c.primary, borderStyle: "solid", opacity: 1 };
    else if (st === "q") s = { background: "transparent", borderColor: c.primary, borderStyle: "dashed", opacity: 1 };
    else if (st === "m" || (isPast && st === ".")) s = { background: c.inkSubtle, borderColor: "transparent", borderStyle: "solid", opacity: 0.18 };
    if (isToday && st === ".") s.borderColor = c.primary;
    return s;
  };
  return (
    <div style={{ padding: "0 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 78, paddingRight: 14, marginBottom: 10 }}>
        {days.map((d, i) => (
          <div key={d} style={{ width: 28, textAlign: "center" }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.4, color: i === todayIdx ? c.primary : c.inkMuted, textTransform: "uppercase" }}>{d}</span>
          </div>
        ))}
      </div>
      <div style={{ borderRadius: 20, border: `1px solid ${c.border}`, background: surface, padding: "14px 14px" }}>
        {prayers.map((p, ri) => (
          <div key={p} style={{ display: "flex", alignItems: "center", padding: "8px 0", borderTop: ri === 0 ? "none" : `1px solid ${c.divider}` }}>
            <div style={{ width: 64 }}><span style={{ fontSize: 13, fontWeight: 600, color: c.ink }}>{p}</span></div>
            <div style={{ flex: 1, display: "flex", justifyContent: "space-between", gap: 6 }}>
              {grid[ri].map((st, ci) => {
                const s = cell(st, ci < todayIdx, ci === todayIdx);
                return <div key={ci} style={{ width: 32, height: 32, borderRadius: 6, borderWidth: 1, borderStyle: s.borderStyle, borderColor: s.borderColor, background: s.background, opacity: s.opacity }} />;
              })}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 12, padding: "0 4px" }}>
        <Legend c={c} color={c.primary} label="On time" />
        <Legend c={c} color={c.primarySoft} border={c.primary} label="Late" />
        <Legend c={c} color="transparent" border={c.primary} dashed label="Qaḍāʾ" />
        <Legend c={c} color={c.inkSubtle} opacity={0.18} label="Missed" />
      </div>
    </div>
  );
}
function Legend({ c, color, border, dashed, opacity, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 10, height: 10, borderRadius: 3, background: color, border: `1px ${dashed ? "dashed" : "solid"} ${border || "transparent"}`, opacity: opacity || 1 }} />
      <span style={{ fontSize: 11, color: c.inkMuted }}>{label}</span>
    </div>
  );
}

// ── PROFILE ───────────────────────────────────────────────────
function ProfileScreen({ dark }) {
  const c = useColors(dark);
  const cardSurface = dark ? "rgba(20,26,23,0.55)" : "rgba(255,255,255,0.55)";
  return (
    <div style={{ position: "absolute", inset: 0, background: c.bg }}>
      <Mesh name="profile" dark={dark} />
      <Body dark={dark} padBottom={140}>
        <div style={{ padding: "8px 20px 0" }}>
          <span style={{ fontFamily: SERIF, fontSize: 30, color: c.ink, letterSpacing: -0.5 }}>Profile</span>
        </div>

        <div style={{ padding: "0 20px", marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "center", padding: 14, borderRadius: 18, border: `1px solid ${c.border}`, background: cardSurface, gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, background: BARAKAH_GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 20, fontWeight: 700, letterSpacing: 0.5 }}>SA</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="person" size={12} color={c.inkMuted} fill sw={1.5} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: c.inkMuted, textTransform: "uppercase" }}>Free</span>
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 18, color: c.ink, marginTop: 2 }}>Sarah Ahmed</div>
              <div style={{ fontSize: 12, color: c.inkMuted, marginTop: 1 }}>sarah@example.com</div>
            </div>
            <Icon name="chevron-right" size={16} color={c.chevron} />
          </div>
        </div>

        <PSection c={c} title="Account">
          <PCard c={c} surface={cardSurface}>
            <PRow c={c} icon="crown" title="Subscription" value="Free" />
            <PDivider c={c} />
            <PRow c={c} icon="sliders" title="Preferences" value={dark ? "Dark" : "Light"} />
            <PDivider c={c} />
            <PRow c={c} icon="globe" title="Calculation Method" value="ISNA" />
          </PCard>
        </PSection>

        <PSection c={c} title="Permissions">
          <PCard c={c} surface={cardSurface}>
            <PPerm c={c} icon="location" title="Location" />
            <PDivider c={c} />
            <PPerm c={c} icon="bell" title="Notifications" />
          </PCard>
        </PSection>

        <PSection c={c} title="Support & Legal">
          <PCard c={c} surface={cardSurface}>
            <PRow c={c} icon="megaphone" title="Request a Feature" />
            <PDivider c={c} />
            <PRow c={c} icon="envelope" title="Support Email" />
            <PDivider c={c} />
            <PRow c={c} icon="doc" title="Terms and Conditions" />
            <PDivider c={c} />
            <PRow c={c} icon="shield" title="Privacy Policy" />
          </PCard>
        </PSection>

        <PSection c={c} title="Account Actions">
          <PCard c={c} surface={cardSurface}>
            <PRow c={c} icon="logout" title="Log out" />
            <PDivider c={c} />
            <PRow c={c} icon="trash" title="Delete Account" danger />
          </PCard>
        </PSection>
      </Body>
    </div>
  );
}
function PSection({ c, title, children }) {
  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ padding: "0 20px", fontSize: 11, fontWeight: 700, letterSpacing: 2, color: c.inkMuted, textTransform: "uppercase", marginBottom: 10 }}>{title}</div>
      <div style={{ padding: "0 20px" }}>{children}</div>
    </div>
  );
}
function PCard({ c, surface, children }) {
  return <div style={{ borderRadius: 16, border: `1px solid ${c.border}`, background: surface, overflow: "hidden" }}>{children}</div>;
}
function PDivider({ c }) { return <div style={{ height: 1, marginLeft: 70, background: c.divider }} />; }
function PRow({ c, icon, title, value, danger }) {
  const iconColor = danger ? c.error : c.ink;
  const iconBg = danger ? c.errorSoft : c.neutralSoft;
  const titleColor = danger ? c.error : c.ink;
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "14px 14px", gap: 12 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: iconBg }}>
        <Icon name={icon} size={22} color={iconColor} fill={icon === "crown" || icon === "trash"} sw={1.7} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: titleColor }}>{title}</div>
      </div>
      {value ? <span style={{ fontSize: 13, color: c.inkMuted, maxWidth: 140 }}>{value}</span> : null}
      <Icon name="chevron-right" size={14} color={c.chevron} />
    </div>
  );
}
function PPerm({ c, icon, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "14px 14px", gap: 12 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: c.neutralSoft }}>
        <Icon name={icon} size={22} color={c.ink} fill sw={1.7} />
      </div>
      <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: c.ink }}>{title}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 999, border: `1px solid ${c.primary}` }}>
        <div style={{ width: 6, height: 6, borderRadius: 3, background: c.primary }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: c.primary, letterSpacing: 0.4 }}>Enabled</span>
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, DhikrScreen, LockedScreen, ProgressScreen, ProfileScreen });
