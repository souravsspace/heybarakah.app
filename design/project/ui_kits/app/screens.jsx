// Barakah app — onboarding screens (mirrors packages/app/app/(onboarding)/*)

const welcomeCards = [
  {
    title: "Eat with intention",
    detail: "Begin meals with gratitude and du'a",
    kind: "Daily adab",
  },
  {
    title: "Make Qur'an a daily habit",
    detail: "Pair screen breaks with recitation",
    kind: "Qur'an rhythm",
  },
  {
    title: "Choose what is halal",
    detail: "Quick lessons for mindful decisions",
    kind: "Halal choices",
  },
  {
    title: "Earn with barakah",
    detail: "Keep work aligned with worship",
    kind: "Halal income",
  },
  {
    title: "Keep your dhikr close",
    detail: "Replace idle scrolling with remembrance",
    kind: "Dhikr reset",
  },
];

// ─── 01 Welcome — swipe stack ──────────────────────────────────────────────
const WelcomeScreen = ({ onNext }) => {
  const [order, setOrder] = React.useState([0, 1, 2, 3, 4]);
  const advance = () => setOrder((o) => [...o.slice(1), o[0]]);
  const CARD_W = 240,
    CARD_H = 312;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: C.surface,
        padding: "8px 22px 16px",
      }}
    >
      <StatusBar />
      <div style={{ height: 28 }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          padding: "0 20px",
        }}
      >
        <Headline
          align="center"
          size="display"
          style={{ fontSize: 30, lineHeight: 1.18 }}
        >
          Learn the salah Allah made obligatory.
        </Headline>
        <Body align="center" size="sm" tone="muted">
          Just{" "}
          <strong style={{ fontWeight: 700, color: C.ink }}>5 minutes</strong> a
          day with prayer-lock lessons.
        </Body>
      </div>

      <div
        style={{
          position: "relative",
          height: CARD_H + 32,
          width: CARD_W + 28,
          margin: "12px auto 0",
        }}
      >
        {order.map((cardIdx, stackDepth) => {
          if (stackDepth >= 3) {
            return null;
          }
          const card = welcomeCards[cardIdx];
          const isTop = stackDepth === 0;
          return (
            <div
              key={cardIdx}
              onClick={isTop ? advance : undefined}
              style={{
                position: "absolute",
                top: stackDepth * 10,
                left: stackDepth * 8,
                right: stackDepth * 8,
                height: CARD_H,
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                boxShadow: isTop
                  ? "0 8px 18px rgba(11,23,16,0.08)"
                  : "0 4px 10px rgba(11,23,16,0.04)",
                transform: `rotate(${stackDepth * 0.5}deg)`,
                cursor: isTop ? "pointer" : "default",
                transition: "all 320ms ease-out",
                zIndex: 10 - stackDepth,
              }}
            >
              <div
                style={{
                  marginTop: 22,
                  height: 128,
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <WelcomeIllust height={128} kind={card.kind} />
              </div>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "0 16px 16px",
                  textAlign: "center",
                }}
              >
                <Headline align="center" size="h2" style={{ fontSize: 22 }}>
                  {card.title}
                </Headline>
                <Body
                  align="center"
                  size="caption"
                  style={{ marginTop: 6 }}
                  tone="muted"
                >
                  {card.detail}
                </Body>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: "0 4px 4px",
        }}
      >
        <Button label="Bismillah" onPress={onNext} />
        <div
          style={{ textAlign: "center", ...Sans, fontSize: 14, color: C.text }}
        >
          Already subscribed?{" "}
          <span style={{ color: C.ink, fontWeight: 700 }}>Log In</span>
        </div>
      </div>
    </div>
  );
};

// ─── 02 Promise — "Locks you out during salah." ────────────────────────────
const PromiseScreen = ({ onNext, onBack }) => {
  const steps = [
    { label: "Adhan begins", detail: "Phone enters salah lock instantly." },
    { label: "During salah", detail: "Notifications silenced. Apps held." },
    { label: "After salam", detail: "Phone returns with a dhikr nudge." },
  ];
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: C.surface,
      }}
    >
      <StatusBar />
      <OnboardingHeader onBack={onBack} progress={0.1} />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "16px 24px 0",
          gap: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Headline align="center" size="h1">
            {"Locks you out\nduring salah."}
          </Headline>
          <Body align="center" size="sm" tone="muted">
            Five firm pauses a day — silent, automatic, merciful.
          </Body>
        </div>

        <div
          style={{
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            background: C.surface,
            padding: "14px 16px 16px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <MosqueTwin size={188} />
          </div>
          <div
            style={{
              height: 1,
              background: C.border,
              marginTop: 10,
              marginBottom: 14,
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Caption
              style={{ letterSpacing: "0.067em", textTransform: "none" }}
              tracked
            >
              <span style={{ letterSpacing: "0.067em" }}>HOW IT WORKS</span>
            </Caption>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 9999,
                  background: C.primary,
                  display: "inline-block",
                }}
              />
              <Caption>Auto, all five</Caption>
            </div>
          </div>
          {steps.map((s, i) => (
            <div
              key={s.label}
              style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
            >
              <div
                style={{
                  width: 24,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 9999,
                    border: `1px solid ${C.primary}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      ...Serif,
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.primary,
                    }}
                  >
                    {i + 1}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    style={{
                      width: 1,
                      flex: 1,
                      minHeight: 24,
                      marginTop: 4,
                      background: C.border,
                    }}
                  />
                )}
              </div>
              <div
                style={{
                  flex: 1,
                  paddingBottom: i < steps.length - 1 ? 18 : 0,
                }}
              >
                <div
                  style={{
                    ...Serif,
                    fontSize: 15,
                    lineHeight: "20px",
                    color: C.ink,
                  }}
                >
                  {s.label}
                </div>
                <Caption style={{ display: "block", marginTop: 1 }}>
                  {s.detail}
                </Caption>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 8,
          }}
        >
          <div
            style={{
              width: 28,
              height: 1,
              background: C.primary,
              marginBottom: 12,
            }}
          />
          <span
            style={{
              ...Sans,
              fontSize: 10,
              letterSpacing: "0.2em",
              fontWeight: 700,
              color: C.text,
            }}
          >
            THE PROMISE
          </span>
          <div
            style={{
              ...Serif,
              fontSize: 18,
              lineHeight: "24px",
              color: C.ink,
              marginTop: 8,
            }}
          >
            You stay in control.
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginTop: 8,
            }}
          >
            <Caption>Emergency calls pass</Caption>
            <span
              style={{
                width: 3,
                height: 3,
                borderRadius: 2,
                background: C.border,
              }}
            />
            <Caption>Disable any time</Caption>
          </div>
        </div>
      </div>
      <div style={{ padding: "12px 24px 16px" }}>
        <Button label="Show me how" onPress={onNext} />
      </div>
    </div>
  );
};

// ─── 03 Lock preview — device in green ────────────────────────────────────
const LockPreviewScreen = ({ onNext, onBack }) => (
  <div
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      background: C.surface,
    }}
  >
    <StatusBar />
    <OnboardingHeader onBack={onBack} progress={0.16} />
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px 24px 0",
        gap: 22,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <Headline align="center" size="h1">
          {"This is what\nsalah looks like."}
        </Headline>
        <Body align="center" size="sm" style={{ marginTop: 4 }} tone="muted">
          During prayer, your home screen disappears.
        </Body>
      </div>

      <div
        style={{
          width: 230,
          height: 410,
          padding: 8,
          background: C.ink,
          borderRadius: 36,
          boxShadow: "0 12px 28px rgba(11,23,16,0.18)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 28,
            overflow: "hidden",
            background: C.primary,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 50% 42%, rgba(255,255,255,0.10), transparent 60%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 16,
              right: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "#fff",
              ...Sans,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <span>5:42</span>
            <span
              style={{
                display: "flex",
                gap: 5,
                alignItems: "center",
                opacity: 0.92,
              }}
            >
              <svg fill="#fff" height="10" viewBox="0 0 16 10" width="16">
                <circle cx="2" cy="8" r="1.4" />
                <circle cx="5.5" cy="8" r="1.4" />
                <circle cx="9" cy="8" r="1.4" />
                <circle cx="12.5" cy="8" r="1.4" />
              </svg>
              <svg
                fill="none"
                height="10"
                stroke="#fff"
                strokeWidth="1.1"
                viewBox="0 0 13 10"
                width="13"
              >
                <path d="M0.5 4 a8 8 0 0 1 12 0" />
                <path d="M2.5 6 a5 5 0 0 1 8 0" />
                <circle cx="6.5" cy="8.4" fill="#fff" r="0.8" />
              </svg>
              <svg height="11" viewBox="0 0 22 11" width="22">
                <rect
                  fill="none"
                  height="10"
                  rx="2.5"
                  stroke="#fff"
                  strokeOpacity="0.55"
                  width="18"
                  x="0.5"
                  y="0.5"
                />
                <rect fill="#fff" height="7" rx="1.5" width="15" x="2" y="2" />
                <rect
                  fill="#fff"
                  height="5"
                  opacity="0.55"
                  rx="1"
                  width="2"
                  x="19"
                  y="3"
                />
              </svg>
            </span>
          </div>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 32,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 18,
                  height: 1,
                  background: "rgba(255,255,255,0.35)",
                }}
              />
              <span
                style={{
                  ...Sans,
                  fontSize: 9,
                  letterSpacing: "0.27em",
                  color: "#fff",
                  opacity: 0.85,
                  fontWeight: 700,
                }}
              >
                MAGHRIB
              </span>
              <span
                style={{
                  width: 18,
                  height: 1,
                  background: "rgba(255,255,255,0.35)",
                }}
              />
            </div>
            {/* countdown ring */}
            <div
              style={{
                marginTop: 18,
                position: "relative",
                width: 130,
                height: 130,
              }}
            >
              <svg height="130" viewBox="0 0 130 130" width="130">
                {Array.from({ length: 60 }).map((_, i) => {
                  const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
                  const inner = 60,
                    outer = 64;
                  const x = 65 + Math.cos(a) * ((inner + outer) / 2);
                  const y = 65 + Math.sin(a) * ((inner + outer) / 2);
                  const big = i % 5 === 0;
                  return (
                    <circle
                      cx={x}
                      cy={y}
                      fill="#fff"
                      key={i}
                      opacity={big ? 0.55 : 0.22}
                      r={big ? 0.9 : 0.5}
                    />
                  );
                })}
                <circle
                  cx="65"
                  cy="65"
                  fill="none"
                  r="58"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="2.5"
                />
                <circle
                  cx="65"
                  cy="65"
                  fill="none"
                  r="58"
                  stroke="#fff"
                  strokeDasharray={2 * Math.PI * 58}
                  strokeDashoffset={2 * Math.PI * 58 * (1 - 0.62)}
                  strokeLinecap="round"
                  strokeWidth="2.5"
                  transform="rotate(-90 65 65)"
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                <span
                  style={{
                    ...Sans,
                    fontSize: 8.5,
                    letterSpacing: "0.19em",
                    opacity: 0.65,
                    fontWeight: 700,
                  }}
                >
                  UNLOCKS IN
                </span>
                <span
                  style={{
                    ...Serif,
                    fontSize: 28,
                    lineHeight: "30px",
                    marginTop: 2,
                  }}
                >
                  18:42
                </span>
                <span
                  style={{
                    ...Sans,
                    fontSize: 8.5,
                    letterSpacing: "0.19em",
                    opacity: 0.55,
                    fontWeight: 700,
                    marginTop: 2,
                  }}
                >
                  MIN · SEC
                </span>
              </div>
            </div>
            <div
              style={{
                ...Serif,
                fontSize: 22,
                lineHeight: "26px",
                color: "#fff",
                marginTop: 18,
                textAlign: "center",
                whiteSpace: "pre-line",
              }}
            >
              {"Return to\nAllah"}
            </div>
            <div
              style={{
                width: 32,
                height: 1,
                background: "rgba(255,255,255,0.3)",
                marginTop: 14,
              }}
            />
            <div
              style={{
                ...Sans,
                fontSize: 12,
                color: "#fff",
                opacity: 0.78,
                marginTop: 8,
                direction: "rtl",
                textAlign: "center",
              }}
            >
              إِنَّ ٱلصَّلَوٰةَ تَنْهَىٰ عَنِ ٱلْفَحْشَآءِ
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 14,
              left: 0,
              right: 0,
              textAlign: "center",
              ...Sans,
              fontSize: 9,
              letterSpacing: "0.22em",
              fontWeight: 700,
              color: "#fff",
              opacity: 0.45,
            }}
          >
            BARAKAH
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          gap: 6,
          paddingBottom: 8,
        }}
      >
        <svg
          fill="none"
          height="12"
          stroke={C.text}
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="12"
        >
          <rect height="9" rx="2" width="14" x="5" y="11" />
          <path d="M8 11V8 a4 4 0 0 1 8 0v3" />
        </svg>
        <Caption style={{ letterSpacing: "0.033em" }}>
          Lock applies only inside salah windows.
        </Caption>
      </div>
    </div>
    <div style={{ padding: "12px 24px 16px" }}>
      <Button label="I want this" onPress={onNext} />
    </div>
  </div>
);

// ─── 04 Madhab quiz ───────────────────────────────────────────────────────
const MadhabScreen = ({ onNext, onBack }) => {
  const [pick, setPick] = React.useState(null);
  const opts = [
    { v: "hanafi", label: "Hanafi" },
    { v: "shafii", label: "Shafi'i" },
    { v: "maliki", label: "Maliki" },
    { v: "hanbali", label: "Hanbali" },
    { v: "none", label: "Just Muslim" },
  ];
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: C.surface,
      }}
    >
      <StatusBar />
      <OnboardingHeader onBack={onBack} progress={0.3} />
      <div
        style={{
          flex: 1,
          padding: "16px 24px 0",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Headline size="h2">Which fiqh do you follow?</Headline>
          <Body size="sm" tone="muted">
            This affects asr time and prayer length defaults.
          </Body>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginTop: 4,
          }}
        >
          {opts.map((o) => (
            <OptionRow
              key={o.v}
              label={o.label}
              onClick={() => setPick(o.v)}
              selected={pick === o.v}
            />
          ))}
        </div>
      </div>
      <div style={{ padding: "12px 24px 16px" }}>
        <Button disabled={!pick} label="Continue" onPress={onNext} />
      </div>
    </div>
  );
};

// ─── 05 Paywall plans ─────────────────────────────────────────────────────
const PaywallScreen = ({ onNext, onBack }) => {
  const [plan, setPlan] = React.useState("yearly");
  const [showAll, setShowAll] = React.useState(false);

  const plans = [
    {
      id: "yearly",
      name: "Yearly",
      strike: "$239.88",
      leftSub: "12 mo · $39.99",
      right: "≈ $3.33 / mo",
      badge: { text: "7 DAY FREE TRIAL", bg: C.primary },
    },
    {
      id: "monthly",
      name: "Monthly",
      strike: "$19.99",
      leftSub: "1 mo · $7.99",
      right: "$7.99 / mo",
      badge: null,
    },
    {
      id: "family",
      name: "Family",
      strike: "$119.76",
      leftSub: "12 mo · $59.88",
      right: "$4.99 / mo",
      badge: { text: "UP TO 5 MEMBERS", bg: C.ink },
    },
  ];
  const visible = showAll ? plans : plans.filter((p) => p.id !== "family");
  const ctaLabels = {
    yearly: "TRY FOR $0.00",
    monthly: "START MONTHLY · $7.99/MO",
    family: "START FAMILY · $4.99/MO",
  };
  const footers = {
    yearly: "7 days free, then $39.99 per year.",
    monthly: "$7.99 per month. Cancel anytime.",
    family: "$59.88 per year. Up to 5 members.",
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: C.surface,
      }}
    >
      <StatusBar />
      <div
        style={{
          flex: 1,
          padding: "12px 24px 0",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          overflow: "auto",
        }}
      >
        {/* Header lockup */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 4,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img
              alt=""
              src="../../assets/barakah-mark.svg"
              style={{ width: 22, height: "auto", opacity: 0.65 }}
            />
            <span
              style={{
                ...Serif,
                fontSize: 20,
                letterSpacing: 0.4,
                color: C.textLight,
              }}
            >
              Barakah
            </span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <span
              style={{
                background: C.neutralSoft,
                borderRadius: 9999,
                padding: "5px 10px",
                ...Sans,
                fontSize: 12,
                color: C.text,
              }}
            >
              T&Cs · Privacy
            </span>
            <span
              style={{
                background: C.neutralSoft,
                borderRadius: 9999,
                padding: "5px 10px",
                ...Sans,
                fontSize: 12,
                color: C.text,
              }}
            >
              Subscribed?
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: showAll ? 4 : 12,
          }}
        >
          <MosquePodium size={showAll ? 132 : 176} />
        </div>

        <div style={{ padding: "0 8px", marginTop: showAll ? 4 : 8 }}>
          <Headline size="h2">
            {"Lock in your five.\nBegin the return."}
          </Headline>
        </div>

        <div
          style={{
            marginTop: showAll ? 18 : 12,
            display: "flex",
            flexDirection: "column",
            gap: 22,
            paddingBottom: 8,
          }}
        >
          {visible.map((p) => {
            const selected = plan === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setPlan(p.id)}
                style={{ position: "relative" }}
              >
                {p.badge && (
                  <span
                    style={{
                      position: "absolute",
                      top: -10,
                      left: 16,
                      zIndex: 2,
                      background: p.badge.bg,
                      color: "#fff",
                      borderRadius: 9999,
                      padding: "3px 12px",
                      ...Sans,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: 0.6,
                    }}
                  >
                    {p.badge.text}
                  </span>
                )}
                {selected && (
                  <span
                    style={{
                      position: "absolute",
                      top: -8,
                      right: 12,
                      zIndex: 2,
                      width: 22,
                      height: 22,
                      borderRadius: 9999,
                      background: C.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      fill="none"
                      height="14"
                      stroke="#F4EDDF"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      width="14"
                    >
                      <polyline points="5 13 10 18 19 7" />
                    </svg>
                  </span>
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 16,
                    padding: "16px 16px",
                    border: `2.5px solid ${selected ? C.primary : C.border}`,
                    background: selected ? C.surface : C.neutralSoft,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ flex: 1, paddingRight: 10 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          ...Sans,
                          fontSize: 18,
                          fontWeight: 700,
                          color: C.ink,
                        }}
                      >
                        {p.name}
                      </span>
                      <span
                        style={{
                          ...Sans,
                          fontSize: 15,
                          fontWeight: 500,
                          color: C.text,
                          textDecoration: "line-through",
                        }}
                      >
                        {p.strike}
                      </span>
                    </div>
                    <div
                      style={{
                        ...Sans,
                        fontSize: 14,
                        fontWeight: 500,
                        color: C.text,
                        marginTop: 4,
                      }}
                    >
                      {p.leftSub}
                    </div>
                  </div>
                  <div
                    style={{
                      ...Sans,
                      fontSize: 17,
                      fontWeight: 700,
                      color: C.ink,
                    }}
                  >
                    {p.right}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          padding: "12px 24px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <Button label={ctaLabels[plan]} onPress={onNext} />
        {showAll ? (
          <div
            style={{
              textAlign: "center",
              ...Sans,
              fontSize: 14,
              color: C.text,
            }}
          >
            {footers[plan]}
          </div>
        ) : (
          <div
            onClick={() => setShowAll(true)}
            style={{ textAlign: "center", padding: "6px 0", cursor: "pointer" }}
          >
            <span
              style={{
                ...Sans,
                fontSize: 14,
                fontWeight: 600,
                color: C.text,
                letterSpacing: 0.6,
              }}
            >
              VIEW ALL PLANS
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, {
  WelcomeScreen,
  PromiseScreen,
  LockPreviewScreen,
  MadhabScreen,
  PaywallScreen,
});
