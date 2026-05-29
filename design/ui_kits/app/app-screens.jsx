// Barakah — main-app screens (mirrors packages/app/app/(app)/*)

// Shared chrome — a faint mesh + scroll-blur header band + tab bar.
const AppScaffold = ({ children, tone = 'home', activeTab = 'home', bg = '#F8FAF8' }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: bg, position: 'relative', overflow: 'hidden' }}>
    <MeshBg tone={tone}/>
    <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <StatusBar/>
      {children}
    </div>
    <TabBar active={activeTab}/>
  </div>
);

const SectionEyebrow = ({ children, style }) => (
  <div style={{
    ...Sans, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.22em',
    textTransform: 'uppercase', color: C.text, ...style,
  }}>{children}</div>
);

// ─── 06 Home ───────────────────────────────────────────────────────────────
const HomeScreen = () => {
  const dateLine = 'Mon, Apr 12  ·  11 Ramaḍān 1446';
  const prayers = [
    { name: 'Fajr',    range: 'Begins 4:38a · ends 6:02a',  time: '4:38 AM',  status: 'on_time', state: 'past' },
    { name: 'Dhuhr',   range: 'Begins 12:14p · ends 3:42p', time: '12:14 PM', status: 'late',    state: 'past' },
    { name: 'Asr',     range: 'Begins 3:42p · ends 6:47p',  time: '3:42 PM',  status: null,      state: 'active', progress: 0.42 },
    { name: 'Maghrib', range: 'Begins 6:47p · ends 8:11p',  time: '6:47 PM',  status: null,      state: 'future' },
    { name: 'Isha',    range: 'Begins 8:11p · ends 4:38a',  time: '8:11 PM',  status: null,      state: 'future' },
  ];

  return (
    <AppScaffold tone="home" activeTab="home">
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '4px 20px 110px' }}>
        {/* Greeting */}
        <div style={{ paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ ...Sans, fontSize: 11, fontWeight: 600, color: C.text }}>{dateLine}</div>
          <div style={{ ...Serif, fontSize: 26, lineHeight: '32px', color: C.ink, whiteSpace: 'pre-line' }}>
            {"Assalāmu ʿalaykum,\nLayla."}
          </div>
        </div>

        {/* Focal card — next prayer */}
        <div style={{
          marginTop: 22, borderRadius: 20,
          border: '1px solid rgba(41,96,62,0.16)',
          background: 'rgba(255,255,255,0.45)',
          padding: 22, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: -7, bottom: -10 }}>
            <MosqueMinaret size={132} color={C.primary} opacity={0.16}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ ...Sans, fontSize: 12, fontWeight: 600, color: C.primary }}>In progress</span>
            <span style={{ ...Sans, fontSize: 12, fontWeight: 600, color: C.textLight }}>Brooklyn, NY</span>
          </div>
          <div style={{ marginTop: 14, ...Serif, fontSize: 48, lineHeight: '52px', color: C.ink }}>Asr</div>
          <div style={{ ...Sans, fontSize: 18, color: C.text, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>3:42 PM</div>
          <div style={{ marginTop: 14, display: 'inline-flex' }}>
            <span style={{
              padding: '8px 16px', borderRadius: 9999,
              border: `1px solid ${C.primary}`, background: 'transparent',
              ...Sans, fontSize: 13, fontWeight: 700, color: C.primary,
            }}>I prayed</span>
          </div>
        </div>

        {/* Today ledger */}
        <div style={{
          marginTop: 18, borderRadius: 20,
          border: '1px solid rgba(41,96,62,0.16)',
          background: 'rgba(255,255,255,0.55)',
          padding: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <span style={{ ...Sans, fontSize: 13, fontWeight: 700, color: C.text }}>Today</span>
            <span style={{ ...Sans, fontSize: 12, fontWeight: 600, color: C.textLight, fontVariantNumeric: 'tabular-nums' }}>2 of 5 logged</span>
          </div>

          {prayers.map((p, i) => (
            <React.Fragment key={p.name}>
              <PrayerRow {...p}/>
              {i < prayers.length - 1 && <div style={{ height: 1, background: C.divider, margin: '8px 0' }}/>}
            </React.Fragment>
          ))}
        </div>

        <div style={{ marginTop: 18, ...Sans, fontSize: 13, fontWeight: 700, color: C.text, lineHeight: '18px' }}>
          "Remember Me; I will remember you", 2:152
        </div>
      </div>
    </AppScaffold>
  );
};

const PrayerRow = ({ name, range, time, status, state, progress }) => {
  const isActive = state === 'active';
  const isMissed = status === 'missed';
  const nameColor = isMissed ? C.textLight : (isActive ? C.primary : C.ink);
  const nameSize = isActive ? 30 : 22;

  let right;
  if (!status) {
    right = (
      <span style={{
        ...Sans, fontSize: isActive ? 24 : 18, fontWeight: 700,
        fontFamily: isActive ? '"Libre Baskerville", Georgia, serif' : '"Inter", sans-serif',
        color: isActive ? C.primary : (state === 'past' ? C.textLight : C.ink),
        fontVariantNumeric: 'tabular-nums',
      }}>{time}</span>
    );
  } else {
    const label = { on_time: 'On time', late: 'Late', qada: 'Qadā', missed: 'Missed' }[status];
    const color = status === 'on_time' ? C.primary : C.text;
    right = <span style={{ ...Sans, fontSize: 12, fontWeight: 700, color }}>{label}</span>;
  }

  return (
    <div style={{
      borderRadius: 18,
      border: `1px solid ${isActive ? C.primary : 'transparent'}`,
      background: isActive ? 'rgba(232,240,234,0.45)' : 'transparent',
      padding: isActive ? '18px 14px' : '6px 4px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ ...Serif, fontSize: nameSize, lineHeight: `${nameSize + 4}px`, color: nameColor }}>{name}</span>
          <div>
            <span style={{ ...Sans, fontSize: 11, fontWeight: 600, color: C.text, fontVariantNumeric: 'tabular-nums' }}>{range}</span>
            {isActive && (
              <div style={{ height: 1, background: C.divider, marginTop: 6 }}>
                <div style={{ height: 1, background: C.primary, width: `${(progress || 0) * 100}%` }}/>
              </div>
            )}
          </div>
        </div>
        <div style={{ minWidth: 96, textAlign: 'right', paddingTop: 6 }}>{right}</div>
      </div>
    </div>
  );
};

// ─── 07 Progress ───────────────────────────────────────────────────────────
const ProgressScreen = () => {
  const dailyOnTime = [
    { label: 'Mo', v: 5 },
    { label: 'Tu', v: 3 },
    { label: 'We', v: 4 },
    { label: 'Th', v: 5 },
    { label: 'Fr', v: 1 },
    { label: 'Sa', v: 0 },
    { label: 'Su', v: 0 },
  ];
  const cellSurface = 'rgba(255,255,255,0.55)';

  return (
    <AppScaffold tone="progress" activeTab="progress">
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '4px 0 110px' }}>
        <div style={{ padding: '10px 20px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <SectionEyebrow>This week</SectionEyebrow>
          <div style={{ ...Serif, fontSize: 28, lineHeight: '34px', color: C.ink }}>Mā shāʾ Allāh.</div>
          <div style={{ ...Sans, fontSize: 13, color: C.text, marginTop: 2 }}>Apr 8 – 14</div>
        </div>

        {/* Hero count */}
        <div style={{ padding: '28px 20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ ...Serif, fontSize: 64, lineHeight: '68px', color: C.ink, fontVariantNumeric: 'tabular-nums' }}>
            18<span style={{ color: C.textLight }}>/35</span>
          </div>
          <SectionEyebrow style={{ marginTop: 6 }}>On-time prayers</SectionEyebrow>
        </div>

        <div style={{ height: 1, background: C.divider, margin: '0 20px' }}/>

        {/* Daily area chart */}
        <div style={{
          margin: '24px 20px 0', padding: 16, paddingBottom: 8,
          borderRadius: 20, border: `1px solid ${C.border}`, background: cellSurface,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', marginBottom: 6 }}>
            <SectionEyebrow style={{ letterSpacing: '0.16em', fontSize: 10 }}>Daily on-time</SectionEyebrow>
            <span style={{ ...Sans, fontSize: 11, color: C.text }}>this week</span>
          </div>
          <AreaChart data={dailyOnTime} max={5}/>
        </div>

        {/* Matrix */}
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SectionEyebrow style={{ padding: '0 20px', fontSize: 10 }}>By prayer</SectionEyebrow>
          <PrayerMatrix surface={cellSurface}/>
        </div>
      </div>
    </AppScaffold>
  );
};

const AreaChart = ({ data, max = 5 }) => {
  const W = 280, H = 96, gap = 14;
  const stepX = (W - gap * 2) / (data.length - 1);
  const points = data.map((d, i) => {
    const x = gap + i * stepX;
    const y = gap + (H - gap * 2) * (1 - d.v / max);
    return [x, y];
  });
  const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const fillPath = `${path} L${points.at(-1)[0]} ${H - gap} L${points[0][0]} ${H - gap} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="none" style={{ display: 'block', height: 96 }}>
        <defs>
          <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.primary} stopOpacity="0.32"/>
            <stop offset="100%" stopColor={C.primary} stopOpacity="0.02"/>
          </linearGradient>
        </defs>
        <path d={fillPath} fill="url(#area-fill)"/>
        <path d={path} fill="none" stroke={C.primary} strokeWidth="1.6" strokeLinejoin="round"/>
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={data[i].v === 0 ? 1.2 : 2.4}
            fill={data[i].v === 0 ? C.border : C.primary}/>
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px 0' }}>
        {data.map((d, i) => (
          <span key={i} style={{ ...Sans, fontSize: 10, fontWeight: 600, color: C.text, letterSpacing: 0.4 }}>{d.label}</span>
        ))}
      </div>
    </div>
  );
};

const PrayerMatrix = ({ surface }) => {
  // 5 prayers × 7 days. 0 = none, 1 = on-time, 2 = late, 3 = qada/missed
  const rows = [
    { name: 'Fajr',    cells: [1, 1, 2, 1, 0, 0, 0] },
    { name: 'Dhuhr',   cells: [1, 2, 1, 1, 1, 0, 0] },
    { name: 'Asr',     cells: [1, 0, 1, 1, 0, 0, 0] },
    { name: 'Maghrib', cells: [1, 1, 1, 1, 0, 0, 0] },
    { name: 'Isha',    cells: [1, 0, 0, 1, 0, 0, 0] },
  ];
  const labels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const color = (s, isToday) => {
    if (s === 1) return { bg: C.primary,     border: C.primary };
    if (s === 2) return { bg: 'transparent', border: C.primary };
    if (s === 3) return { bg: C.border,      border: C.border };
    return { bg: isToday ? 'rgba(41,96,62,0.08)' : 'transparent', border: C.divider };
  };
  return (
    <div style={{
      margin: '0 20px', padding: '14px 14px 12px',
      borderRadius: 20, border: `1px solid ${C.border}`, background: surface,
    }}>
      {/* day labels */}
      <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
        <span/>
        {labels.map((l, i) => (
          <span key={i} style={{ ...Sans, fontSize: 10, fontWeight: 600, color: C.text, textAlign: 'center', letterSpacing: 0.4 }}>{l}</span>
        ))}
      </div>
      {rows.map((r, ri) => (
        <div key={r.name} style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', gap: 6, marginBottom: ri === rows.length - 1 ? 0 : 6, alignItems: 'center' }}>
          <span style={{ ...Sans, fontSize: 11, fontWeight: 600, color: C.ink }}>{r.name}</span>
          {r.cells.map((s, ci) => {
            const isToday = ci === 4; // Friday
            const c = color(s, isToday);
            return (
              <div key={ci} style={{
                aspectRatio: '1 / 1',
                borderRadius: 6,
                border: `1px solid ${c.border}`,
                background: c.bg,
                position: 'relative',
              }}>
                {s === 2 && (
                  <div style={{
                    position: 'absolute', inset: 3, borderRadius: 4,
                    background: 'repeating-linear-gradient(45deg, rgba(41,96,62,0.18) 0 2px, transparent 2px 4px)',
                  }}/>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ─── 08 Dhikr ─────────────────────────────────────────────────────────────
const DhikrScreen = () => {
  const active = {
    name: 'Subhanallah',
    arabic: 'سُبْحَانَ ٱللَّٰه',
    phonetic: 'Sub-haa-nal-laah',
    meaning: 'Glory be to Allah',
    target: 33,
    short: 'Subhan',
  };
  const count = 23;
  const progress = count / active.target;
  const lifetime = 1247;

  return (
    <AppScaffold tone="dhikr" activeTab="dhikr">
      {/* Rising fill from bottom */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: `${progress * 100}%`, background: C.primarySoft, pointerEvents: 'none',
      }}/>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 20px 110px', position: 'relative' }}>
        {/* Top dhikr selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ ...Sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: C.ink, textTransform: 'uppercase' }}>{active.name}</span>
            <span style={{ ...Sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', color: C.textLight, textTransform: 'uppercase' }}>· 1 of 4</span>
          </div>
          <span style={{ ...Sans, fontSize: 12, fontWeight: 700, color: C.text, fontVariantNumeric: 'tabular-nums', letterSpacing: 0.6 }}>{count} / {active.target}</span>
        </div>

        {/* Arabic + phonetic + meaning */}
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ ...Sans, fontSize: 32, lineHeight: '46px', color: C.ink, fontWeight: 500, textAlign: 'center' }}>{active.arabic}</div>
          <div style={{ ...Sans, fontSize: 18, lineHeight: '24px', color: C.ink, fontStyle: 'italic', fontWeight: 500, letterSpacing: 0.2, textAlign: 'center' }}>{active.phonetic}</div>
          <div style={{ ...Sans, fontSize: 12, color: C.text, letterSpacing: 0.4, textAlign: 'center' }}>{active.meaning}</div>
        </div>

        {/* Big count */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...Serif, fontSize: 132, lineHeight: '140px', color: C.ink, fontVariantNumeric: 'tabular-nums' }}>{count}</div>
          <div style={{ ...Sans, fontSize: 13, color: C.text, fontVariantNumeric: 'tabular-nums', marginTop: -4 }}>of {active.target}</div>
        </div>

        {/* Lifetime */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span style={{ ...Sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.20em', color: C.textLight, textTransform: 'uppercase' }}>
            Lifetime · {active.short} <span style={{ color: C.ink, fontVariantNumeric: 'tabular-nums' }}>{lifetime.toLocaleString()}</span>
          </span>
        </div>
      </div>
    </AppScaffold>
  );
};

// ─── 09 Locked ─────────────────────────────────────────────────────────────
const LockedScreen = () => {
  const apps = [
    { id: 'ig', label: 'IG', color: '#E1306C', name: 'Instagram', selected: true },
    { id: 'tt', label: 'TT', color: '#0F1311', name: 'TikTok',    selected: true },
    { id: 'x',  label: 'X',  color: '#0F1311', name: 'X',         selected: false },
    { id: 'yt', label: 'YT', color: '#C8302F', name: 'YouTube',   selected: true },
    { id: 'rd', label: 'rd', color: '#FF4500', name: 'Reddit',    selected: false },
  ];
  const allApps = [
    { name: 'Slack',     mono: 'SL' },
    { name: 'Discord',   mono: 'DC' },
    { name: 'Snapchat',  mono: 'SC', on: true },
    { name: 'Telegram',  mono: 'TG' },
    { name: 'WhatsApp',  mono: 'WA' },
  ];
  const count = apps.filter(a => a.selected).length;

  return (
    <AppScaffold tone="locked" activeTab="locked">
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '4px 0 110px' }}>
        {/* Hero */}
        <div style={{ padding: '8px 24px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ ...Sans, fontSize: 13, color: C.text }}>Quiet at salah</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ ...Sans, fontSize: 14, fontWeight: 600, color: C.ink }}>6:47 PM</div>
              <div style={{ ...Sans, fontSize: 12, color: C.text, marginTop: 2 }}>Next · Maghrib</div>
            </div>
          </div>

          <div style={{ ...Serif, fontSize: 36, lineHeight: '42px', color: C.ink, letterSpacing: '-0.018em', marginTop: 28 }}>Five times.</div>
          <div style={{ ...Serif, fontSize: 36, lineHeight: '42px', color: C.ink, letterSpacing: '-0.018em', fontStyle: 'italic' }}>Hands quiet.</div>

          <div style={{ ...Sans, fontSize: 14, lineHeight: '22px', color: C.text, marginTop: 16, maxWidth: 280 }}>
            {count} apps go quiet for 15 minutes at each prayer.
          </div>
        </div>

        {/* Suggested */}
        <div style={{ padding: '40px 24px 0' }}>
          <div style={{ ...Serif, fontSize: 18, color: C.ink }}>Suggested</div>
          <div style={{ ...Sans, fontSize: 13, color: C.text, marginTop: 4 }}>Tap any to open the picker.</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
            {apps.map(a => (
              <div key={a.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 56 }}>
                <div style={{ position: 'relative', padding: 4, borderRadius: 14, border: `1.5px solid ${a.selected ? C.primary : 'transparent'}` }}>
                  <AppGlyph label={a.label} color={a.color} size={44}/>
                  {a.selected && (
                    <div style={{
                      position: 'absolute', top: -3, right: -3,
                      width: 18, height: 18, borderRadius: 9999,
                      background: C.primary, border: `2px solid ${C.surface}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name="check" size={10} color="#fff" strokeWidth={2.4}/>
                    </div>
                  )}
                </div>
                <span style={{ ...Sans, fontSize: 11, fontWeight: a.selected ? 600 : 400, color: a.selected ? C.ink : C.text, marginTop: 8 }}>{a.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* All apps */}
        <div style={{ padding: '36px 24px 0' }}>
          <div style={{ ...Serif, fontSize: 18, color: C.ink }}>All apps</div>
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
            <Icon name="search" size={16} color={C.text}/>
            <span style={{ ...Sans, fontSize: 15, color: C.text }}>Search apps</span>
          </div>
          {allApps.map((a, i) => (
            <div key={a.name} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
              borderBottom: i < allApps.length - 1 ? `1px solid ${C.divider}` : 0,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, border: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                ...Serif, fontSize: 14, color: C.ink,
              }}>{a.mono}</div>
              <span style={{ flex: 1, ...Sans, fontSize: 15, fontWeight: 500, color: C.ink }}>{a.name}</span>
              <div style={{
                width: 22, height: 22, borderRadius: 9999,
                border: `1px solid ${a.on ? C.primary : C.border}`,
                background: a.on ? C.primary : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {a.on && <Icon name="check" size={12} color="#fff" strokeWidth={2.4}/>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppScaffold>
  );
};

// ─── 10 Profile ───────────────────────────────────────────────────────────
const ProfileScreen = () => {
  const cardSurface = 'rgba(255,255,255,0.55)';

  const Row = ({ icon, title, value, danger, last }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      borderBottom: last ? 0 : `1px solid ${C.divider}`,
    }}>
      <IconBox bg={danger ? '#FBEAE9' : C.neutralSoft}>
        <Icon name={icon} size={18} color={danger ? '#B42318' : C.ink}/>
      </IconBox>
      <span style={{ flex: 1, ...Sans, fontSize: 15, fontWeight: 600, color: danger ? '#B42318' : C.ink }}>{title}</span>
      {value && <span style={{ ...Sans, fontSize: 13, color: C.text, maxWidth: 140 }}>{value}</span>}
      <Icon name="chevron" size={14} color={C.textLight}/>
    </div>
  );

  const Section = ({ title, children }) => (
    <div style={{ marginTop: 28 }}>
      <SectionEyebrow style={{ padding: '0 20px', marginBottom: 10, letterSpacing: '0.20em' }}>{title}</SectionEyebrow>
      <div style={{ padding: '0 20px' }}>
        <div style={{ borderRadius: 16, border: `1px solid ${C.border}`, background: cardSurface, overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <AppScaffold tone="profile" activeTab="profile">
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '8px 0 110px' }}>
        <div style={{ padding: '0 20px' }}>
          <div style={{ ...Serif, fontSize: 30, color: C.ink, letterSpacing: '-0.02em' }}>Profile</div>
        </div>

        {/* Header card */}
        <div style={{ padding: '18px 20px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: 14,
            borderRadius: 18, border: `1px solid ${C.border}`, background: cardSurface,
          }}>
            <GradientAvatar initials="LM" size={56}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="crown" size={11} color="#B97A0B" strokeWidth={1.9}/>
                <span style={{ ...Sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: '#B97A0B', textTransform: 'uppercase' }}>Premium</span>
              </div>
              <div style={{ ...Serif, fontSize: 18, color: C.ink, marginTop: 2 }}>Layla Mohamed</div>
              <div style={{ ...Sans, fontSize: 12, color: C.text, marginTop: 1 }}>layla@heybarakah.app</div>
            </div>
            <Icon name="chevron" size={14} color={C.textLight}/>
          </div>
        </div>

        <Section title="Account">
          <Row icon="crown" title="Subscription" value="Premium"/>
          <Row icon="sliders" title="Preferences" value="Light"/>
          <Row icon="globe" title="Calculation Method" value="ISNA" last/>
        </Section>

        <Section title="Permissions">
          <PermissionRow icon="pin" title="Location" granted/>
          <PermissionRow icon="bell" title="Notifications" granted last/>
        </Section>

        <Section title="Support & Legal">
          <Row icon="megaphone" title="Request a Feature"/>
          <Row icon="envelope" title="Support Email"/>
          <Row icon="doc" title="Terms and Conditions"/>
          <Row icon="shield" title="Privacy Policy" last/>
        </Section>

        <Section title="Account Actions">
          <Row icon="logout" title="Logout"/>
          <Row icon="trash" title="Delete Account" danger last/>
        </Section>
      </div>
    </AppScaffold>
  );
};

const PermissionRow = ({ icon, title, granted, last }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 14px',
    borderBottom: last ? 0 : `1px solid ${C.divider}`,
  }}>
    <IconBox bg={C.neutralSoft}>
      <Icon name={icon} size={18} color={C.ink}/>
    </IconBox>
    <span style={{ flex: 1, ...Sans, fontSize: 15, fontWeight: 600, color: C.ink }}>{title}</span>
    {granted ? (
      <span style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 10px', borderRadius: 9999,
        border: `1px solid ${C.primary}`,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: 9999, background: C.primary }}/>
        <span style={{ ...Sans, fontSize: 11, fontWeight: 700, color: C.primary, letterSpacing: 0.4 }}>ENABLED</span>
      </span>
    ) : (
      <span style={{
        padding: '6px 12px', borderRadius: 9999,
        border: `1px solid ${C.primary}`,
        ...Sans, fontSize: 12, fontWeight: 700, color: C.primary, letterSpacing: 0.4,
      }}>Enable</span>
    )}
  </div>
);

Object.assign(window, { HomeScreen, ProgressScreen, DhikrScreen, LockedScreen, ProfileScreen });
