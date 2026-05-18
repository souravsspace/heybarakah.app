// Barakah app — atoms

const C = {
  primary: "#29603E",
  primarySoft: "#E8F0EA",
  cream: "#F5EBDB",
  creamSoft: "#FAF4E8",
  ink: "#0F1311",
  text: "#6B7280",
  textLight: "#4B5563",
  border: "#E5E7EB",
  divider: "#EFEFEF",
  neutralSoft: "#F4F2EE",
  surface: "#FFFFFF",
};

const Serif = {
  fontFamily: '"Libre Baskerville", Georgia, serif',
  fontWeight: 700,
  letterSpacing: 0,
};
const Sans = { fontFamily: '"Inter", -apple-system, sans-serif' };

const Headline = ({ children, size = "h2", align = "left", style }) => {
  const sizes = { display: 38, h1: 31, h2: 24, h3: 20 };
  const px = sizes[size] || 24;
  return (
    <div
      style={{
        ...Serif,
        fontSize: px,
        lineHeight: 1.18,
        color: C.ink,
        textAlign: align,
        whiteSpace: "pre-line",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Body = ({
  children,
  size = "sm",
  tone = "ink",
  align = "left",
  style,
}) => {
  const sizes = { lg: 18, md: 16, sm: 14, caption: 12 };
  const colors = { ink: C.ink, muted: C.text };
  return (
    <div
      style={{
        ...Sans,
        fontSize: sizes[size],
        lineHeight: 1.55,
        color: colors[tone] || C.ink,
        textAlign: align,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Caption = ({ children, tracked, color = C.text, style }) => (
  <span
    style={{
      ...Sans,
      fontSize: 12,
      color,
      lineHeight: 1.5,
      letterSpacing: tracked ? "0.067em" : 0,
      ...style,
    }}
  >
    {children}
  </span>
);

const Button = ({ label, onPress, disabled, height = 64 }) => {
  const [pressed, setPressed] = React.useState(false);
  return (
    <button
      disabled={disabled}
      onClick={disabled ? undefined : onPress}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseLeave={() => setPressed(false)}
      onMouseUp={() => setPressed(false)}
      style={{
        width: "100%",
        height,
        minHeight: height,
        background: disabled ? C.border : C.primary,
        color: disabled ? C.text : C.surface,
        border: 0,
        borderRadius: 16,
        ...Sans,
        fontSize: 24,
        fontWeight: 700,
        letterSpacing: 0.2,
        opacity: pressed && !disabled ? 0.92 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "opacity 160ms",
      }}
    >
      {label}
    </button>
  );
};

const ProgressBar = ({ progress }) => (
  <div
    style={{
      height: 6,
      background: C.border,
      borderRadius: 9999,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        height: "100%",
        background: C.primary,
        width: `${Math.max(2, progress * 100)}%`,
        borderRadius: 9999,
        transition: "width 250ms ease-out",
      }}
    />
  </div>
);

const OnboardingHeader = ({ progress, onBack }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      height: 48,
      paddingLeft: 16,
      paddingRight: 16,
    }}
  >
    <button
      onClick={onBack}
      style={{
        background: "transparent",
        border: 0,
        cursor: "pointer",
        padding: 0,
        color: C.ink,
      }}
    >
      <svg
        fill="none"
        height="26"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
        viewBox="0 0 24 24"
        width="26"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
    <div style={{ flex: 1 }}>
      <ProgressBar progress={progress} />
    </div>
    <div style={{ width: 26 }} />
  </div>
);

const StatusBar = ({ light = false }) => {
  const color = light ? "rgba(255,255,255,0.92)" : C.ink;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 22px",
        height: 28,
        ...Sans,
        fontSize: 14,
        fontWeight: 600,
        color,
      }}
    >
      <span>9:41</span>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <svg height="11" viewBox="0 0 18 12" width="17">
          <g fill={color}>
            <rect height="4" rx="0.5" width="3" x="0" y="8" />
            <rect height="6" rx="0.5" width="3" x="5" y="6" />
            <rect height="9" rx="0.5" width="3" x="10" y="3" />
            <rect height="12" rx="0.5" width="3" x="15" y="0" />
          </g>
        </svg>
        <svg
          fill="none"
          height="11"
          stroke={color}
          strokeWidth="1.4"
          viewBox="0 0 16 12"
          width="15"
        >
          <path d="M1 5 a10 10 0 0 1 14 0" />
          <path d="M3.5 7.5 a6 6 0 0 1 9 0" />
          <circle cx="8" cy="10.4" fill={color} r="1" />
        </svg>
        <svg height="11" viewBox="0 0 28 12" width="26">
          <rect
            fill="none"
            height="11"
            rx="3"
            stroke={color}
            strokeOpacity="0.5"
            width="23"
            x="0.5"
            y="0.5"
          />
          <rect fill={color} height="7" rx="1.5" width="19" x="2.5" y="2.5" />
          <rect
            fill={color}
            height="5"
            opacity="0.5"
            rx="1"
            width="2.5"
            x="24.5"
            y="3.5"
          />
        </svg>
      </div>
    </div>
  );
};

const OptionRow = ({ label, hint, selected, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      width: "100%",
      minHeight: 60,
      padding: "0 24px",
      background: selected ? C.primarySoft : C.surface,
      border: `1.5px solid ${selected ? C.primary : C.border}`,
      borderRadius: 8,
      cursor: "pointer",
      textAlign: "left",
      transition: "background 160ms ease-out, border-color 160ms ease-out",
    }}
  >
    <div style={{ flex: 1, padding: "14px 0" }}>
      <div
        style={{
          ...Sans,
          fontSize: 16,
          fontWeight: selected ? 600 : 500,
          color: selected ? C.primary : C.ink,
        }}
      >
        {label}
      </div>
      {hint && (
        <div style={{ ...Sans, fontSize: 14, color: C.text, marginTop: 2 }}>
          {hint}
        </div>
      )}
    </div>
    {selected ? (
      <svg fill={C.primary} height="22" viewBox="0 0 24 24" width="22">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.41 14.41L5.41 11.23l1.41-1.41 3.77 3.77 7.07-7.07 1.41 1.41-8.49 8.48z" />
      </svg>
    ) : (
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 9999,
          border: `1px solid ${C.border}`,
        }}
      />
    )}
  </button>
);

// --- Brand-mark glyph (inline SVG version of barakah-mark) for illustrations ---
const BarakahMark = ({ size = 26, color = C.primary }) => (
  <img
    alt=""
    src="../../assets/barakah-mark.svg"
    style={{
      width: size,
      height: "auto",
      filter:
        color === C.primary
          ? ""
          : "brightness(0) saturate(100%) invert(40%) sepia(8%) saturate(380%) hue-rotate(180deg)",
    }}
  />
);

// --- Mosque-podium illustration (geometric placeholder matching the cream/green motif) ---
const MosquePodium = ({ size = 176 }) => (
  <svg fill="none" height={size * 0.78} viewBox="0 0 220 172" width={size}>
    {/* cream backdrop arch */}
    <path
      d="M30 140 V70 a80 80 0 0 1 160 0 V140 Z"
      fill={C.cream}
      opacity="0.85"
    />
    {/* central mosque silhouette: dome + arch */}
    <path d="M88 140 V92 a22 22 0 0 1 44 0 V140 Z" fill={C.primary} />
    <path
      d="M95 92 a15 15 0 0 1 30 0"
      fill="none"
      stroke={C.cream}
      strokeWidth="2"
    />
    {/* dome */}
    <path d="M92 92 a18 14 0 0 1 36 0" fill={C.primary} />
    <circle cx="110" cy="72" fill={C.primary} r="3" />
    <line
      stroke={C.primary}
      strokeWidth="2"
      x1="110"
      x2="110"
      y1="60"
      y2="72"
    />
    {/* flanking minarets */}
    <rect fill={C.primary} height="40" width="6" x="60" y="100" />
    <path d="M55 100 h16 l-3 -6 h-10 z" fill={C.primary} />
    <circle cx="63" cy="90" fill={C.primary} r="3" />
    <rect fill={C.primary} height="40" width="6" x="154" y="100" />
    <path d="M149 100 h16 l-3 -6 h-10 z" fill={C.primary} />
    <circle cx="157" cy="90" fill={C.primary} r="3" />
    {/* ground line */}
    <rect
      fill={C.primary}
      height="2"
      opacity="0.45"
      width="180"
      x="20"
      y="140"
    />
    <rect
      fill={C.primary}
      height="1"
      opacity="0.25"
      width="192"
      x="14"
      y="146"
    />
  </svg>
);

const MosqueTwin = ({ size = 188 }) => (
  <svg fill="none" height={size * 0.65} viewBox="0 0 240 156" width={size}>
    <ellipse cx="120" cy="140" fill={C.cream} opacity="0.7" rx="100" ry="6" />
    {/* twin mosques */}
    {[60, 180].map((cx, i) => (
      <g key={i} opacity={i === 0 ? 1 : 0.55}>
        <rect fill={C.primary} height={36} width={56} x={cx - 28} y={100} />
        <path d={`M${cx - 28} 100 a28 24 0 0 1 56 0`} fill={C.primary} />
        <circle cx={cx} cy={82} fill={C.primary} r={3} />
        <line
          stroke={C.primary}
          strokeWidth="2"
          x1={cx}
          x2={cx}
          y1={72}
          y2={82}
        />
        <rect fill={C.primary} height={28} width={4} x={cx - 36} y={108} />
        <rect fill={C.primary} height={28} width={4} x={cx + 32} y={108} />
      </g>
    ))}
    {/* horizon stroke */}
    <line
      opacity="0.4"
      stroke={C.primary}
      strokeWidth="1"
      x1="20"
      x2="220"
      y1="138"
      y2="138"
    />
  </svg>
);

// Welcome card illustration placeholder (warm cream)
const WelcomeIllust = ({ kind, height }) => {
  // simple line-drawn placeholders for each welcome card topic
  const stroke = C.primary;
  const sw = 1.6;
  const draw = {
    "Daily adab": (
      <g>
        <ellipse cx="60" cy="80" fill={C.cream} rx="36" ry="6" />
        <path
          d="M40 76 q20 -22 40 0"
          fill="none"
          stroke={stroke}
          strokeWidth={sw}
        />
        <circle
          cx="60"
          cy="48"
          fill="none"
          r="9"
          stroke={stroke}
          strokeWidth={sw}
        />
        <path
          d="M52 56 q8 8 16 0"
          fill="none"
          stroke={stroke}
          strokeWidth={sw}
        />
      </g>
    ),
    "Qur'an rhythm": (
      <g>
        <rect
          fill={C.cream}
          height="40"
          rx="3"
          stroke={stroke}
          strokeWidth={sw}
          width="60"
          x="30"
          y="44"
        />
        <line
          stroke={stroke}
          strokeWidth={sw}
          x1="60"
          x2="60"
          y1="44"
          y2="84"
        />
        <line
          opacity="0.6"
          stroke={stroke}
          strokeWidth="1"
          x1="38"
          x2="55"
          y1="56"
          y2="56"
        />
        <line
          opacity="0.6"
          stroke={stroke}
          strokeWidth="1"
          x1="38"
          x2="52"
          y1="62"
          y2="62"
        />
        <line
          opacity="0.6"
          stroke={stroke}
          strokeWidth="1"
          x1="65"
          x2="82"
          y1="56"
          y2="56"
        />
        <line
          opacity="0.6"
          stroke={stroke}
          strokeWidth="1"
          x1="65"
          x2="78"
          y1="62"
          y2="62"
        />
      </g>
    ),
    "Halal choices": (
      <g>
        <circle
          cx="60"
          cy="64"
          fill={C.cream}
          r="22"
          stroke={stroke}
          strokeWidth={sw}
        />
        <path
          d="M48 64 l9 9 l15 -18"
          fill="none"
          stroke={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.2"
        />
      </g>
    ),
    "Halal income": (
      <g>
        <rect
          fill={C.cream}
          height="36"
          rx="3"
          stroke={stroke}
          strokeWidth={sw}
          width="60"
          x="30"
          y="50"
        />
        <circle
          cx="60"
          cy="68"
          fill="none"
          r="9"
          stroke={stroke}
          strokeWidth={sw}
        />
        <text
          fill={stroke}
          fontFamily="Libre Baskerville"
          fontSize="11"
          textAnchor="middle"
          x="60"
          y="72"
        >
          $
        </text>
      </g>
    ),
    "Dhikr reset": (
      <g>
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
          return (
            <circle
              cx={60 + Math.cos(a) * 22}
              cy={64 + Math.sin(a) * 22}
              fill={i === 0 ? stroke : "none"}
              key={i}
              r="3"
              stroke={stroke}
              strokeWidth="1"
            />
          );
        })}
      </g>
    ),
  };
  return (
    <svg
      height={height}
      style={{ display: "block" }}
      viewBox="0 0 120 128"
      width="120"
    >
      {draw[kind] || draw["Daily adab"]}
    </svg>
  );
};

// --- Mosque-minaret silhouette (used as a corner motif on the home focal card) ---
const MosqueMinaret = ({ size = 132, color = C.primary, opacity = 0.16 }) => (
  <svg
    fill="none"
    height={size}
    style={{ opacity }}
    viewBox="0 0 132 132"
    width={size}
  >
    {/* minaret shaft */}
    <rect fill={color} height="78" width="6" x="30" y="46" />
    <path d="M27 46 h12 l-2 -5 h-8 z" fill={color} />
    <path d="M28 41 h10 a5 4 0 0 0 -10 0 z" fill={color} />
    <circle cx="33" cy="28" fill={color} r="2.4" />
    <line stroke={color} strokeWidth="1.4" x1="33" x2="33" y1="20" y2="28" />
    {/* main mosque block */}
    <rect fill={color} height="42" width="78" x="46" y="82" />
    <path d="M46 82 a39 32 0 0 1 78 0" fill={color} />
    {/* dome */}
    <path d="M68 58 a17 14 0 0 1 34 0 v8 h-34 z" fill={color} />
    <circle cx="85" cy="42" fill={color} r="2.6" />
    <line stroke={color} strokeWidth="1.4" x1="85" x2="85" y1="32" y2="42" />
    {/* arch cutout */}
    <path
      d="M75 124 v-20 a10 10 0 0 1 20 0 v20"
      fill="none"
      opacity="0.9"
      stroke={C.surface}
      strokeWidth="1.4"
    />
  </svg>
);

// --- Inline app-icon glyph (placeholder for social-app row) ---
const AppGlyph = ({ label, color = C.primary, size = 44 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 12,
      background: color,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...Serif,
      fontSize: size * 0.42,
      letterSpacing: 0.2,
    }}
  >
    {label}
  </div>
);

// --- A coloured square that wraps an inline SVG icon (used in profile rows) ---
const IconBox = ({ children, bg = C.neutralSoft, size = 44 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 12,
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    {children}
  </div>
);

// --- A faint mesh-like radial gradient background; varies per screen ---
const MeshBg = ({ tone = "home" }) => {
  const gradients = {
    home: "radial-gradient(60% 38% at 18% 12%, rgba(41,96,62,0.07), transparent 70%), radial-gradient(46% 30% at 92% 6%, rgba(245,235,219,0.55), transparent 70%), radial-gradient(70% 40% at 88% 96%, rgba(41,96,62,0.05), transparent 75%)",
    progress:
      "radial-gradient(55% 32% at 10% 8%, rgba(245,235,219,0.6), transparent 70%), radial-gradient(50% 30% at 95% 30%, rgba(41,96,62,0.06), transparent 70%)",
    dhikr:
      "radial-gradient(58% 40% at 50% 12%, rgba(245,235,219,0.55), transparent 70%)",
    locked:
      "radial-gradient(50% 30% at 85% 8%, rgba(41,96,62,0.06), transparent 70%), radial-gradient(60% 36% at 6% 94%, rgba(245,235,219,0.55), transparent 75%)",
    profile:
      "radial-gradient(46% 28% at 14% 6%, rgba(41,96,62,0.07), transparent 70%), radial-gradient(56% 32% at 96% 10%, rgba(245,235,219,0.6), transparent 70%)",
  };
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: gradients[tone] || gradients.home,
      }}
    />
  );
};

// --- Small line-art SF-symbol-style icons (used in profile rows + dhikr + locked) ---
const Icon = ({ name, size = 20, color = C.ink, strokeWidth = 1.8 }) => {
  const paths = {
    crown: (
      <path
        d="M3 8 l4 5 l5 -8 l5 8 l4 -5 v9 H3 z M3 19 H21"
        fill="none"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    ),
    sliders: (
      <g
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      >
        <line x1="4" x2="20" y1="6" y2="6" />
        <line x1="4" x2="20" y1="12" y2="12" />
        <line x1="4" x2="20" y1="18" y2="18" />
        <circle cx="14" cy="6" r="2" />
        <circle cx="9" cy="12" r="2" />
        <circle cx="16" cy="18" r="2" />
      </g>
    ),
    globe: (
      <g fill="none" stroke={color} strokeWidth={strokeWidth}>
        <circle cx="12" cy="12" r="8" />
        <path d="M4 12 h16" />
        <path d="M12 4 a12 10 0 0 1 0 16 a12 10 0 0 1 0 -16" />
      </g>
    ),
    pin: (
      <g
        fill="none"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <path d="M12 2 a7 7 0 0 1 7 7 c0 5 -7 13 -7 13 s-7 -8 -7 -13 a7 7 0 0 1 7 -7 z" />
        <circle cx="12" cy="9" r="2.5" />
      </g>
    ),
    bell: (
      <g
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <path d="M6 16 V11 a6 6 0 0 1 12 0 v5 l2 2 H4 z" />
        <path d="M10 21 a2.5 2 0 0 0 4 0" />
      </g>
    ),
    megaphone: (
      <g
        fill="none"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <path d="M4 10 v4 l11 5 V5 z" />
        <path d="M15 8 a4 4 0 0 1 0 8" />
        <path d="M6 14 v4 l3 1 v-3" />
      </g>
    ),
    envelope: (
      <g
        fill="none"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <rect height="13" rx="1.5" width="18" x="3" y="6" />
        <path d="M3 8 l9 6 l9 -6" />
      </g>
    ),
    doc: (
      <g
        fill="none"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <path d="M6 3 h9 l4 4 v14 H6 z" />
        <path d="M15 3 v4 h4" />
        <path d="M9 13 h6 M9 17 h6" />
      </g>
    ),
    shield: (
      <g
        fill="none"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <path d="M12 3 l8 3 v6 c0 5 -5 8 -8 9 c-3 -1 -8 -4 -8 -9 V6 z" />
        <path d="M9 12 l2 2 l4 -4" />
      </g>
    ),
    logout: (
      <g
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <path d="M10 4 H5 v16 h5" />
        <path d="M14 8 l4 4 l-4 4" />
        <path d="M9 12 H18" />
      </g>
    ),
    trash: (
      <g
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <path d="M4 7 h16" />
        <path d="M9 7 V4 h6 v3" />
        <path d="M6 7 l1.4 13 h9.2 L18 7" />
        <path d="M10 11 v6 M14 11 v6" />
      </g>
    ),
    chevron: (
      <polyline
        fill="none"
        points="9 6 15 12 9 18"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    ),
    chevronLeft: (
      <polyline
        fill="none"
        points="15 6 9 12 15 18"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    ),
    lockClosed: (
      <g fill="none" stroke={color} strokeWidth={strokeWidth}>
        <rect height="9" rx="2" width="14" x="5" y="11" />
        <path d="M8 11 V8 a4 4 0 0 1 8 0 v3" />
      </g>
    ),
    search: (
      <g
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      >
        <circle cx="11" cy="11" r="6" />
        <line x1="20" x2="15.5" y1="20" y2="15.5" />
      </g>
    ),
    check: (
      <polyline
        fill="none"
        points="5 13 10 18 19 7"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth + 0.4}
      />
    ),
    plus: (
      <g
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      >
        <line x1="12" x2="12" y1="5" y2="19" />
        <line x1="5" x2="19" y1="12" y2="12" />
      </g>
    ),
  };
  return (
    <svg height={size} viewBox="0 0 24 24" width={size}>
      {paths[name] || paths.chevron}
    </svg>
  );
};

// --- Tab bar — the dark floating pill at the bottom of every main-app screen ---
const TabBar = ({ active = "home" }) => {
  const tabs = [
    {
      id: "home",
      label: "Home",
      icon: (c) => (
        <path
          d="M3 11 l9 -8 l9 8 v10 h-6 v-6 h-6 v6 H3 z"
          fill="none"
          stroke={c}
          strokeLinejoin="round"
          strokeWidth="1.7"
        />
      ),
    },
    {
      id: "progress",
      label: "Progress",
      icon: (c) => (
        <g fill="none" stroke={c} strokeLinecap="round" strokeWidth="1.7">
          <polyline points="4 16 9 11 13 14 20 7" />
          <polyline points="14 7 20 7 20 13" />
        </g>
      ),
    },
    {
      id: "dhikr",
      label: "Dhikr",
      icon: (c) => (
        <g fill="none" stroke={c} strokeWidth="1.7">
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="4" fill={c} r="1.6" />
        </g>
      ),
    },
    {
      id: "locked",
      label: "Lock",
      icon: (c) => (
        <g fill="none" stroke={c} strokeWidth="1.7">
          <rect height="9" rx="2" width="14" x="5" y="11" />
          <path d="M8 11 V8 a4 4 0 0 1 8 0 v3" />
        </g>
      ),
    },
    {
      id: "profile",
      label: "You",
      icon: (c) => (
        <g fill="none" stroke={c} strokeWidth="1.7">
          <circle cx="12" cy="8" r="3.6" />
          <path d="M5 20 a7 7 0 0 1 14 0" />
        </g>
      ),
    },
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: 14,
        right: 14,
        bottom: 18,
        borderRadius: 9999,
        padding: "8px 10px",
        background: "rgba(15,19,17,0.92)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        boxShadow: "0 12px 28px rgba(11,23,16,0.22)",
        backdropFilter: "blur(8px)",
      }}
    >
      {tabs.map((t) => {
        const isActive = t.id === active;
        const c = isActive ? "#fff" : "rgba(255,255,255,0.55)";
        return (
          <div
            key={t.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              padding: "4px 8px",
              borderRadius: 9999,
              background: isActive ? "rgba(255,255,255,0.10)" : "transparent",
            }}
          >
            <svg height="20" viewBox="0 0 24 24" width="20">
              {t.icon(c)}
            </svg>
            <span
              style={{
                ...Sans,
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: 0.3,
                color: c,
              }}
            >
              {t.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// --- Gradient avatar circle with initials, used on the profile header card ---
const GradientAvatar = ({ initials = "LM", size = 56 }) => (
  <div
    style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
  >
    <svg height={size} viewBox={`0 0 ${size} ${size}`} width={size}>
      <defs>
        <linearGradient id="avatar-grad" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#00E5A0" />
          <stop offset="100%" stopColor="#00A98F" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        fill="url(#avatar-grad)"
        r={size / 2}
      />
    </svg>
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        ...Sans,
        fontWeight: 700,
        fontSize: size * 0.36,
        letterSpacing: 0.5,
      }}
    >
      {initials}
    </div>
  </div>
);

Object.assign(window, {
  C,
  Serif,
  Sans,
  Headline,
  Body,
  Caption,
  Button,
  ProgressBar,
  OnboardingHeader,
  StatusBar,
  OptionRow,
  BarakahMark,
  MosquePodium,
  MosqueTwin,
  MosqueMinaret,
  WelcomeIllust,
  AppGlyph,
  IconBox,
  MeshBg,
  Icon,
  TabBar,
  GradientAvatar,
});
