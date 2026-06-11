/* screens-flow.jsx — Unlock, Achievements, Auth, Paywall.
   Auth & Paywall are onboarding screens — light-mode only (as in the app). */

// ── Khatam seal (achievements.tsx) ────────────────────────────
function KhatamSeal({ size, color, ring, strokeWidth = 1 }) {
  const C = 50, R = 33, side = R * Math.SQRT2, o = C - side / 2, sw = strokeWidth * (100 / size);
  return (
    <svg height={size} width={size} viewBox="0 0 100 100">
      {ring ? <circle cx={C} cy={C} r={46} fill="none" stroke={ring} strokeWidth={sw} /> : null}
      <g fill="none" stroke={color} strokeLinejoin="round" strokeWidth={sw}>
        <rect height={side} width={side} rx={1.5} x={o} y={o} />
        <rect height={side} width={side} rx={1.5} transform={`rotate(45 ${C} ${C})`} x={o} y={o} />
        <circle cx={C} cy={C} r={6.5} />
      </g>
    </svg>
  );
}

// MosquePodium — static recreation (mosque-podium.tsx, no animation)
function MosquePodium({ size = 176, color = BARAKAH_GREEN }) {
  const mosqueSize = size * 0.62, scale = mosqueSize / 24;
  const tx = (size - mosqueSize) / 2, ty = (size - mosqueSize) / 2 + 4;
  const paths = [
    "M3 22V19.5C3 17.4317 3.34533 17 5 17H17C18.6547 17 19 17.4317 19 19.5V22H3Z",
    "M2 22H22",
    "M17.5125 6C15.9698 4 18.3389 3 19 2C19.6611 3 22.0302 4 20.4875 6H17.5125Z",
    "M17.5 6L17 17M17 22H21L20.5 6",
    "M11.0006 8C12.984 10.25 16.9992 11 16.9992 17H5C5 11 9.01516 10.25 10.9986 8",
  ];
  return (
    <svg height={size} width={size}>
      <defs><radialGradient cx="50%" cy="50%" id="podiumHalo" r="50%">
        <stop offset="0" stopColor={color} stopOpacity="0.24" /><stop offset="0.5" stopColor={color} stopOpacity="0.08" /><stop offset="1" stopColor={color} stopOpacity="0" />
      </radialGradient></defs>
      <circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#podiumHalo)" />
      {[[0.22, 0.18], [0.78, 0.22], [0.34, 0.08], [0.66, 0.06]].map((s, i) => <circle key={i} cx={size * s[0]} cy={size * s[1]} r={1.2} fill={color} opacity={0.4} />)}
      <g transform={`translate(${tx} ${ty}) scale(${scale})`}>
        {paths.map((d, i) => <g key={i}><path d={d} fill={color} fillOpacity={0.06} /><path d={d} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5 / scale} /></g>)}
      </g>
    </svg>
  );
}

// ── UNLOCK ────────────────────────────────────────────────────
function UnlockScreen({ dark }) {
  const c = useColors(dark);
  const canMark = true;
  return (
    <div style={{ position: "absolute", inset: 0, background: c.bg }}>
      <Mesh name="unlock" dark={dark} />
      <Body dark={dark} padTop={Math.max(INSET_TOP - 16, 4)} padBottom={INSET_BOTTOM + 16} style={{ display: "flex", flexDirection: "column", padding: `${Math.max(INSET_TOP - 16, 4)}px 20px ${INSET_BOTTOM + 16}px` }}>
        <div style={{ paddingTop: 8 }}>
          <div style={{ color: c.ink, fontFamily: SERIF, fontSize: 28, lineHeight: "34px" }}>Keep the quiet.</div>
          <div style={{ color: c.ink, fontFamily: SERIF, fontSize: 28, lineHeight: "34px" }}>Return with intention.</div>
          <div style={{ color: c.inkMuted, fontSize: 14, lineHeight: "22px", marginTop: 10, maxWidth: 340 }}>Your phone is at rest. Stay, or take a brief unlock.</div>
        </div>

        <div style={{ border: `1px solid ${c.border}`, borderRadius: 24, marginTop: 16, overflow: "hidden" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: dark ? "rgba(20,20,20,0.38)" : "rgba(41,96,62,0.82)", padding: "18px 24px" }}>
            <QuietGate c={c} dark={dark} />
            <div style={{ color: dark ? c.ink : "#fff", fontFamily: SERIF, fontSize: 22, lineHeight: "28px", marginTop: 12, textAlign: "center" }}>A pause before Allah.</div>
          </div>
          <div style={{ background: dark ? "rgba(20,26,23,0.38)" : "rgba(255,255,255,0.7)", padding: 6 }}>
            <div style={{ display: "flex", alignItems: "center", borderRadius: 14, padding: "14px 12px" }}>
              <div style={{ width: 34, height: 34, borderRadius: 999, background: c.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                <Icon name="timer" size={17} color={c.primary} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: c.ink, fontSize: 14, fontWeight: 600 }}>Temporary unlock</div>
                <div style={{ color: c.inkMuted, fontSize: 12, fontWeight: 500, marginTop: 2 }}>5 minutes</div>
              </div>
              <Icon name="chevron-forward" size={18} color={c.inkMuted} />
            </div>
            <div style={{ background: c.divider, height: 1, margin: "0 12px" }} />
            <div style={{ padding: "14px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 999, background: c.primarySoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="lock-closed" size={17} color={c.primary} />
                  </div>
                  <span style={{ color: c.ink, fontSize: 14, fontWeight: 600 }}>Prayer-lock</span>
                </div>
                <span style={{ color: c.inkMuted, fontSize: 13, fontWeight: 500 }}>continues after</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 16 }} />

        <div style={{ width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 60, borderRadius: 18, borderWidth: 1.5, borderStyle: "solid", background: canMark ? (dark ? "#29603E" : c.primary) : "transparent", borderColor: canMark ? (dark ? "#29603E" : c.primary) : c.border }}>
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: 1.6, textTransform: "uppercase" }}>I prayed</span>
          </div>
          <div style={{ height: 10 }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 52 }}>
            <span style={{ color: c.inkMuted, fontSize: 15, fontWeight: 600 }}>Continue with quiet</span>
          </div>
        </div>
      </Body>
    </div>
  );
}
function QuietGate({ c, dark }) {
  const line = dark ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.3)";
  const ink = dark ? c.primary : "#fff";
  return (
    <div style={{ position: "relative", width: 112, height: 112, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", width: 112, height: 112, borderRadius: 999, border: `1px solid ${line}` }} />
      <div style={{ position: "absolute", width: 82, height: 82, borderRadius: 999, border: `1px solid ${line}` }} />
      <div style={{ width: 58, height: 76, borderRadius: 34, borderTopLeftRadius: 46, borderTopRightRadius: 46, border: `1px solid ${dark ? c.primary : "rgba(255,255,255,0.38)"}`, background: dark ? c.primarySoft : "rgba(255,255,255,0.14)", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 18, overflow: "hidden" }}>
        <div style={{ width: 6, height: 6, borderRadius: 999, background: ink, opacity: dark ? 1 : 0.9 }} />
      </div>
    </div>
  );
}

// ── ACHIEVEMENTS ──────────────────────────────────────────────
function AchievementsScreen({ dark }) {
  const c = useColors(dark);
  const sealRing = dark ? "rgba(0,210,106,0.28)" : "rgba(41,96,62,0.26)";
  const ruleColor = dark ? "rgba(245,235,219,0.12)" : "rgba(94,75,40,0.16)";
  const sections = [
    { cat: "Beginnings", unlocked: 2, total: 3, items: [
      { title: "First Light", icon: "sunrise", tier: "gold", unlocked: true, at: "Jun 3" },
      { title: "The Intention", icon: "heart", tier: "bronze", unlocked: true, at: "Jun 3" },
      { title: "Seven Days", icon: "leaf", tier: "silver", unlocked: false, progress: { current: 4, target: 7, unit: "4 of 7 days logged" } },
    ] },
    { cat: "Salah", unlocked: 1, total: 4, items: [
      { title: "On Time, Once", icon: "star", tier: "bronze", unlocked: true, at: "Jun 4" },
      { title: "Five in a Day", icon: "moon", tier: "silver", unlocked: false, progress: { current: 3, target: 5, unit: "3 of 5 today" } },
      { title: "Perfect Week", icon: "trophy", tier: "gold", unlocked: false, progress: { current: 18, target: 35, unit: "18 of 35 on time" } },
      { title: "Forty Days", icon: "flame", tier: "gold", unlocked: false },
    ] },
    { cat: "Continuity", unlocked: 0, total: 3, items: [
      { title: "Streak of Three", icon: "flame", tier: "bronze", unlocked: false, progress: { current: 2, target: 3, unit: "2 day streak" } },
      { title: "Thirty Strong", icon: "leaf", tier: "silver", unlocked: false },
      { title: "The Hundred", icon: "book", tier: "gold", unlocked: false },
    ] },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, background: dark ? "#0E1311" : "#F8F1E1" }}>
      <Mesh name="achievements" dark={dark} />
      <Body dark={dark} padTop={INSET_TOP + 6} padBottom={INSET_BOTTOM + 24}>
        <div style={{ padding: "0 16px 4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ width: 36, height: 36, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="chevron-back" size={22} color={c.ink} /></div>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.6, color: c.inkSubtle }}>YOUR LEDGER</span>
          <div style={{ width: 36 }} />
        </div>

        <div style={{ padding: "30px 32px 8px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <KhatamSeal color={c.primary} ring={sealRing} size={74} strokeWidth={1} />
          <div style={{ marginTop: 24, fontFamily: SERIF, fontSize: 33, lineHeight: "40px", letterSpacing: -0.4, color: c.ink, textAlign: "center" }}>First Light</div>
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 14, height: 1, background: ruleColor }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.6, color: c.primary, fontVariant: "tabular-nums" }}>JUN 3 · 2026</span>
            <div style={{ width: 14, height: 1, background: ruleColor }} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", paddingTop: 18, paddingBottom: 8 }}>
          <span style={{ fontSize: 11, color: c.inkSubtle, fontVariant: "tabular-nums", letterSpacing: 0.4 }}>3 of 10 unlocked</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 34, paddingTop: 26 }}>
          {sections.map((sec, si) => (
            <div key={sec.cat} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ padding: "0 24px" }}>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <KhatamSeal color={c.primary} size={14} strokeWidth={0.9} />
                    <span style={{ fontFamily: SERIF, fontSize: 22, lineHeight: "26px", fontStyle: "italic", color: c.ink }}>{sec.cat}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: c.inkSubtle, fontVariant: "tabular-nums", paddingBottom: 3 }}>{sec.unlocked} / {sec.total}</span>
                </div>
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12 }}>
                  <BeadRow c={c} total={sec.total} unlocked={sec.unlocked} />
                  <div style={{ flex: 1, height: 1, background: c.divider }} />
                </div>
              </div>
              <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: si === 0 ? 10 : 8 }}>
                {sec.items.map((it, i) => <AchievementCard key={i} dark={dark} {...it} />)}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 44, gap: 14 }}>
          <KhatamSeal color={c.inkSubtle} size={26} strokeWidth={0.9} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.8, color: c.inkSubtle }}>IN SHĀʾ ALLĀH</span>
        </div>
      </Body>
    </div>
  );
}
function BeadRow({ c, total, unlocked }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      {Array.from({ length: total }, (_, i) => i < unlocked).map((on, i) => (
        <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: on ? c.primary : "transparent", border: on ? "none" : `1px solid ${c.border}` }} />
      ))}
    </div>
  );
}
function AchievementCard({ dark, title, icon, unlocked, tier, at, progress }) {
  const c = useColors(dark);
  const tierAccent = tier === "gold" ? c.primary : tier === "silver" ? c.inkMuted : c.inkSubtle;
  const isGold = unlocked && tier === "gold";
  let surface, borderColor, titleColor, metaColor, unitColor, discBorder, glyphColor, stampColor, stampRing, track, fill;
  if (isGold) {
    surface = c.primary; borderColor = c.primary; titleColor = "#fff"; metaColor = "rgba(255,255,255,0.78)"; unitColor = "rgba(255,255,255,0.62)";
    discBorder = "rgba(255,255,255,0.7)"; glyphColor = "#fff"; stampColor = "#fff"; stampRing = c.primary; track = "rgba(255,255,255,0.2)"; fill = "#fff";
  } else if (unlocked) {
    surface = dark ? "rgba(245,235,219,0.05)" : "#FAF4E8"; borderColor = dark ? "rgba(245,235,219,0.16)" : "rgba(94,75,40,0.18)";
    titleColor = c.ink; metaColor = c.inkMuted; unitColor = c.inkSubtle; discBorder = tierAccent; glyphColor = tierAccent; stampColor = c.primary; stampRing = dark ? "#1A1A1A" : "#FAF4E8"; track = c.divider; fill = c.primary;
  } else {
    surface = dark ? "rgba(20,20,20,0.55)" : "#fff"; borderColor = c.border; titleColor = c.inkMuted; metaColor = c.inkSubtle; unitColor = c.inkSubtle; discBorder = c.border; glyphColor = c.inkSubtle; stampColor = null; track = c.divider; fill = c.primary;
  }
  const showProgress = !unlocked && progress;
  const rightMeta = unlocked && at ? at : showProgress ? `${progress.current} / ${progress.target}` : "Locked";
  return (
    <div style={{ borderRadius: 18, border: `1px solid ${borderColor}`, background: surface, padding: "14px 16px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ position: "relative" }}>
          <div style={{ width: 38, height: 38, borderRadius: 19, border: `1px solid ${discBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name={icon} size={18} color={glyphColor} sw={1.7} />
          </div>
          {stampColor ? <div style={{ position: "absolute", top: -1, right: -1, width: 10, height: 10, borderRadius: 5, background: stampColor, border: `1.5px solid ${stampRing}` }} /> : null}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: SERIF, fontSize: 15, lineHeight: "20px", color: titleColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
          {showProgress ? <div style={{ marginTop: 2, fontSize: 11, fontWeight: 500, color: unitColor, fontVariant: "tabular-nums" }}>{progress.unit}</div> : null}
        </div>
        <span style={{ fontSize: 11, fontStyle: unlocked && !isGold ? "italic" : "normal", fontWeight: 600, color: metaColor, fontVariant: "tabular-nums", letterSpacing: 0.3 }}>{rightMeta}</span>
      </div>
      {showProgress ? <div style={{ marginTop: 12, height: 1, background: track, overflow: "hidden" }}><div style={{ height: 1, width: `${Math.min(1, progress.current / progress.target) * 100}%`, background: fill }} /></div> : null}
    </div>
  );
}

// ── AUTH (onboarding, light only) ─────────────────────────────
const ONB_INK = "#0F1311", ONB_PRIMARY = "#29603E", ONB_BORDER = "#E5E7EB", ONB_TERTIARY = "#6B7280";
function AuthScreen() {
  const providers = [
    { id: "apple", label: "Continue with Apple", icon: "logo-apple" },
    { id: "google", label: "Continue with Google", icon: "logo-google" },
    { id: "email", label: "Continue with Email", icon: "mail" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff" }}>
      <Body dark={false} style={{ display: "flex", flexDirection: "column", padding: `${INSET_TOP}px 24px ${INSET_BOTTOM}px` }}>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}><BarakahMark size={64} color={ONB_PRIMARY} /></div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 28, gap: 8, padding: "0 14px" }}>
          <div style={{ fontFamily: SERIF, fontSize: 31, lineHeight: "38px", color: ONB_INK, textAlign: "center" }}>Welcome back.</div>
          <div style={{ fontSize: 14, lineHeight: "21px", color: ONB_TERTIARY, textAlign: "center" }}>Sign in to sync your trial across devices.</div>
        </div>
        <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 14 }}>
          {providers.map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 60, borderRadius: 18, border: `1.5px solid ${ONB_BORDER}`, background: "#fff" }}>
              <span style={{ marginRight: 12, display: "flex" }}><Icon name={p.icon} size={22} color={ONB_INK} sw={1.8} /></span>
              <span style={{ fontSize: 16, fontWeight: 600, color: ONB_INK }}>{p.label}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "auto", paddingBottom: 16, display: "flex", justifyContent: "center" }}>
          <div style={{ fontSize: 12, lineHeight: "18px", color: ONB_TERTIARY, textAlign: "center", maxWidth: 300 }}>
            By continuing you agree to the <span style={{ color: ONB_INK, fontWeight: 600, textDecoration: "underline" }}>Terms</span> and <span style={{ color: ONB_INK, fontWeight: 600, textDecoration: "underline" }}>Privacy Policy</span>.
          </div>
        </div>
      </Body>
    </div>
  );
}

// ── PAYWALL PLANS (onboarding, light only) ────────────────────
const PLAN_COPY = {
  yearly: { name: "Yearly", strike: "$239.88", leftSub: "12 mo · $39.99", right: "≈ $3.33 / mo", badge: "7 DAY FREE TRIAL", badgeBg: ONB_PRIMARY },
  monthly: { name: "Monthly", strike: "$19.99", leftSub: "1 mo · $7.99", right: "$7.99 / mo", badge: null },
  family: { name: "Family", strike: "$119.76", leftSub: "12 mo · $59.88", right: "$4.99 / mo", badge: "UP TO 6 MEMBERS", badgeBg: "#0F1311" },
};
function PaywallScreen() {
  const selected = "yearly";
  const plans = ["yearly", "monthly", "family"];
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff" }}>
      <Body dark={false} style={{ display: "flex", flexDirection: "column", padding: `${INSET_TOP - 8}px 24px 0` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BarakahMark size={26} color="#4B5563" />
            <span style={{ fontFamily: SERIF, fontSize: 20, letterSpacing: 0.4, color: "#4B5563" }}>Barakah</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["Terms", "Privacy", "Subscribed?"].map((t) => (
              <div key={t} style={{ background: "#F4F4F2", borderRadius: 999, padding: "5px 14px" }}>
                <span style={{ fontSize: 12, color: ONB_TERTIARY }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}><MosquePodium size={176} /></div>

        <div style={{ padding: "0 14px", marginTop: 8 }}>
          <div style={{ fontFamily: SERIF, fontSize: 31, lineHeight: "38px", color: ONB_INK, textAlign: "center" }}>Lock in your five.<br />Begin the return.</div>
        </div>

        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 22 }}>
          {plans.map((id) => <PlanOption key={id} id={id} selected={selected === id} />)}
        </div>

        {/* footer */}
        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14, paddingBottom: INSET_BOTTOM + 8 }}>
          <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", height: 64, borderRadius: 16, background: ONB_PRIMARY }}>
            <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: 0.2, color: "#fff" }}>TRY FOR $0.00</span>
          </div>
          <div style={{ textAlign: "center", fontSize: 14, color: ONB_TERTIARY }}>7 days free, then $39.99 per year.</div>
          <div style={{ textAlign: "center", padding: "8px 0" }}><span style={{ fontSize: 16, fontWeight: 600, letterSpacing: 0.6, color: ONB_TERTIARY }}>VIEW ALL PLANS</span></div>
          <div style={{ textAlign: "center" }}><span style={{ fontSize: 12, color: ONB_TERTIARY }}>Restore purchases</span></div>
        </div>
      </Body>
    </div>
  );
}
function PlanOption({ id, selected }) {
  const cp = PLAN_COPY[id];
  return (
    <div style={{ position: "relative" }}>
      {cp.badge ? <div style={{ position: "absolute", zIndex: 10, top: -10, left: 16, borderRadius: 999, padding: "3px 14px", background: cp.badgeBg }}>
        <span style={{ fontSize: 12, letterSpacing: 0.6, fontWeight: 700, color: "#fff" }}>{cp.badge}</span></div> : null}
      {selected ? <div style={{ position: "absolute", zIndex: 10, top: -8, right: 12, width: 22, height: 22, borderRadius: 11, background: ONB_PRIMARY, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="checkmark" size={14} color="#F4EDDF" /></div> : null}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 16, padding: "24px", borderWidth: 2.5, borderStyle: "solid", borderColor: selected ? ONB_PRIMARY : ONB_BORDER, background: selected ? "#fff" : "#F4F2EE" }}>
        <div style={{ flex: 1, paddingRight: 14 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: ONB_INK }}>{cp.name}</span>
            <span style={{ fontSize: 15, fontWeight: 500, color: ONB_TERTIARY, textDecoration: "line-through" }}>{cp.strike}</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: ONB_TERTIARY, marginTop: 4 }}>{cp.leftSub}</div>
        </div>
        <span style={{ fontSize: 17, fontWeight: 700, color: ONB_INK }}>{cp.right}</span>
      </div>
    </div>
  );
}

Object.assign(window, { UnlockScreen, AchievementsScreen, AuthScreen, PaywallScreen, KhatamSeal, MosquePodium });
