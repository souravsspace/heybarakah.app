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
  WelcomeIllust,
});
