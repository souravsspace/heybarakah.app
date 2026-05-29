// Barakah app — new surfaces (mirrors packages/app/app/(app)/{achievements,unlock}.tsx)
// Each screen accepts a `dark` prop. The kit's host passes it in from the dark-mode toggle.

// Dark palette mirror of theme-context.tsx DARK
const CD = {
  primary:     '#00D26A',
  primarySoft: '#0E2A1B',
  ink:         '#FFFFFF',
  text:        '#8E8E93',
  textLight:   '#5E5E62',
  border:      '#262626',
  divider:     '#222222',
  surface:     '#141414',
  card:        '#1A1A1A',
  premium:     '#E4C168',
};
const CL = {
  primary:     '#29603E',
  primarySoft: '#E8F0EA',
  ink:         '#0A0A0A',
  text:        '#6B7280',
  textLight:   '#9CA3AF',
  border:      '#EAEAEA',
  divider:     '#F0F0F0',
  surface:     '#FFFFFF',
  card:        '#FFFFFF',
  premium:     '#C9A23A',
};
const palette = (dark) => dark ? CD : CL;

// ─── Achievements ─────────────────────────────────────────────────────────
const AchievementsScreen = ({ dark = false }) => {
  const P = palette(dark);
  const bg = dark ? '#0E1311' : '#F8F1E1';
  const heroTrack = dark ? 'rgba(255,255,255,0.14)' : 'rgba(41,96,62,0.22)';
  const cardSurface = dark ? 'rgba(26,26,26,0.58)' : 'rgba(255,255,255,0.55)';
  const cardBorder = dark ? 'rgba(255,255,255,0.18)' : 'rgba(41,96,62,0.16)';

  const recent = {
    title: 'First fajr\nafter sunrise',
    stamp: 'MAR 14 · 2026',
  };

  const sections = [
    { name: 'Beginnings',  count: '3 / 8',  beads: [1,1,1,0,0,0,0,0] },
    { name: 'Salah',       count: '4 / 12', beads: [1,1,1,1,0,0,0,0,0,0,0,0] },
    { name: 'Continuity',  count: '1 / 10', beads: [1,0,0,0,0,0,0,0,0,0] },
  ];

  const tiles = [
    { tier: 'BRONZE', name: 'Seven days, on time',   desc: 'Pray every fard on time for a week.',         unlocked: true,  icon: '✓' },
    { tier: 'SILVER', name: 'Bismillah every dawn',  desc: 'Wake for fajr ten mornings in a row.',         unlocked: false, icon: '·' },
    { tier: 'GOLD',   name: 'One hundred dhikr',     desc: 'Lifetime · across any preset.',                unlocked: false, icon: '·' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: bg, position: 'relative', overflow: 'hidden' }}>
      <MeshBg tone="achievements" dark={dark}/>
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <StatusBar light={dark}/>

        {/* Header: back · "Your ledger" · spacer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 16px 4px' }}>
          <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chevronLeft" size={22} color={P.ink}/>
          </div>
          <span style={{ ...Sans, fontSize: 11, fontStyle: 'italic', color: P.textLight }}>Your ledger</span>
          <div style={{ width: 36 }}/>
        </div>

        {/* Hero */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 32px 8px' }}>
          {/* Rosette: line · dot · line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 180 }}>
            <div style={{ flex: 1, height: 1, background: heroTrack }}/>
            <div style={{ width: 5, height: 5, borderRadius: 2.5, background: P.primary }}/>
            <div style={{ flex: 1, height: 1, background: heroTrack }}/>
          </div>
          <div style={{ marginTop: 22, ...Serif, fontSize: 26, lineHeight: '31px', color: P.ink, textAlign: 'center', whiteSpace: 'pre-line', letterSpacing: '-0.005em' }}>
            {recent.title}
          </div>
          <div style={{ marginTop: 12, ...Sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: P.primary, fontVariantNumeric: 'tabular-nums' }}>
            {recent.stamp}
          </div>
        </div>

        {/* Count */}
        <div style={{ textAlign: 'center', padding: '18px 0 8px' }}>
          <span style={{ ...Sans, fontSize: 11, color: P.textLight, fontVariantNumeric: 'tabular-nums', letterSpacing: 0.4 }}>
            12 of 64 unlocked
          </span>
        </div>

        {/* Sections — scroll area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0 110px', display: 'flex', flexDirection: 'column', gap: 28 }}>
          {sections.map((sec, sIdx) => (
            <div key={sec.name} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '0 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <span style={{ ...Serif, fontStyle: 'italic', fontSize: 22, color: P.ink }}>{sec.name}</span>
                  <span style={{ ...Sans, fontSize: 11, fontWeight: 600, color: P.textLight, fontVariantNumeric: 'tabular-nums', paddingBottom: 3, letterSpacing: 0.3 }}>{sec.count}</span>
                </div>
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    {sec.beads.map((on, i) => (
                      <span key={i} style={{
                        width: 6, height: 6, borderRadius: 3, display: 'inline-block',
                        background: on ? P.primary : 'transparent',
                        border: on ? '0' : `1px solid ${P.border}`,
                      }}/>
                    ))}
                  </div>
                  <div style={{ flex: 1, height: 1, background: P.divider }}/>
                </div>
              </div>

              {/* Cards — show only on first section to keep the kit dense */}
              {sIdx === 0 && (
                <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {tiles.map(t => (
                    <div key={t.name} style={{
                      borderRadius: 14,
                      background: cardSurface,
                      border: `1px solid ${cardBorder}`,
                      padding: '12px 14px',
                      display: 'flex', alignItems: 'center', gap: 12,
                      opacity: t.unlocked ? 1 : 0.62,
                    }}>
                      {/* Tier glyph */}
                      <div style={{
                        width: 38, height: 38, borderRadius: 12,
                        border: `1px solid ${P.border}`,
                        background: t.unlocked ? P.primarySoft : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: t.unlocked ? P.primary : P.textLight,
                        ...Serif, fontSize: 18, lineHeight: 1,
                      }}>{t.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ ...Sans, fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: t.tier === 'GOLD' ? P.premium : P.textLight }}>{t.tier}</div>
                        <div style={{ ...Serif, fontSize: 14, lineHeight: '18px', color: P.ink, marginTop: 2 }}>{t.name}</div>
                        <div style={{ ...Sans, fontSize: 11, color: P.text, marginTop: 2, lineHeight: 1.4 }}>{t.desc}</div>
                      </div>
                      {t.unlocked && (
                        <div style={{ width: 18, height: 18, borderRadius: 9, background: P.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="check" size={11} color="#fff" strokeWidth={2.6}/>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Closing rosette */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 100 }}>
              <div style={{ flex: 1, height: 1, background: P.divider }}/>
              <div style={{ width: 4, height: 4, borderRadius: 2, background: P.textLight }}/>
              <div style={{ flex: 1, height: 1, background: P.divider }}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Unlock ───────────────────────────────────────────────────────────────
const UnlockScreen = ({ dark = false }) => {
  const P = palette(dark);
  const bg = dark ? '#0B0E0C' : '#F8FAF8';
  const sheetBg = dark ? 'rgba(26,26,26,0.58)' : 'rgba(255,255,255,0.42)';
  const sheetBorder = dark ? 'rgba(255,255,255,0.18)' : 'rgba(41,96,62,0.16)';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: bg, position: 'relative', overflow: 'hidden' }}>
      <MeshBg tone="unlock" dark={dark}/>
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <StatusBar light={dark}/>

        {/* Header eyebrow */}
        <div style={{ textAlign: 'center', padding: '10px 24px 0' }}>
          <span style={{ ...Sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.24em', color: P.text, textTransform: 'uppercase' }}>
            Quietly unlock
          </span>
        </div>

        {/* Hero copy */}
        <div style={{ padding: '38px 28px 0', textAlign: 'center' }}>
          <div style={{ ...Serif, fontSize: 30, lineHeight: '36px', color: P.ink, letterSpacing: '-0.018em' }}>Step out,</div>
          <div style={{ ...Serif, fontStyle: 'italic', fontSize: 30, lineHeight: '36px', color: P.ink, letterSpacing: '-0.012em' }}>just briefly.</div>
        </div>

        {/* Body */}
        <div style={{ padding: '14px 36px 0', textAlign: 'center' }}>
          <div style={{ ...Sans, fontSize: 13, lineHeight: 1.55, color: P.text }}>
            Five minutes. Your shield stays armed; we'll bring it back when the time's up.
          </div>
        </div>

        {/* Countdown */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
          {/* Ring + numerals */}
          <div style={{ position: 'relative', width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 220 220" width="220" height="220" style={{ position: 'absolute', inset: 0 }}>
              <circle cx="110" cy="110" r="100" fill="none" stroke={P.divider} strokeWidth="1"/>
              <circle cx="110" cy="110" r="100" fill="none" stroke={P.primary} strokeWidth="1.5"
                strokeDasharray={`${2 * Math.PI * 100 * 0.62} ${2 * Math.PI * 100}`}
                strokeDashoffset={2 * Math.PI * 100 * 0.25}
                transform="rotate(-90 110 110)"
                strokeLinecap="round"/>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{ ...Serif, fontSize: 56, lineHeight: 1, color: P.primary, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>04:48</div>
              <div style={{ ...Sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.24em', color: P.textLight, textTransform: 'uppercase' }}>Remaining</div>
            </div>
          </div>
        </div>

        {/* Sheet */}
        <div style={{ padding: '0 18px 28px' }}>
          <div style={{
            borderRadius: 18,
            background: sheetBg,
            border: `1px solid ${sheetBorder}`,
            padding: '16px 18px',
            backdropFilter: 'blur(14px) saturate(120%)',
            WebkitBackdropFilter: 'blur(14px) saturate(120%)',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ ...Sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', color: P.text, textTransform: 'uppercase' }}>
                3 apps held
              </span>
              <span style={{ ...Sans, fontSize: 11, fontWeight: 600, color: P.textLight, fontVariantNumeric: 'tabular-nums' }}>
                Re-locks 9:46 PM
              </span>
            </div>
            <div style={{
              width: '100%', height: 42, borderRadius: 14,
              background: P.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              ...Sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.18em',
              color: '#FFFFFF', textTransform: 'uppercase',
            }}>
              Re-lock now
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { AchievementsScreen, UnlockScreen });
