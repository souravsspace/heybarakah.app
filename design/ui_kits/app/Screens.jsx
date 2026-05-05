// Barakaah app — five core screens

// 1. ONBOARDING / WELCOME
function ScreenWelcome({ onNext }) {
  return (
    <div className="bk-screen-soft" style={{ display:"flex", flexDirection:"column", height:"100%", paddingTop: 50 }}>
      <Banner>Prayer lock · put Allah first</Banner>
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"40px 24px", gap:32 }}>
        <LockMark />
        <div style={{ textAlign:"center" }}>
          <div className="bk-display">Your salah,<br/>on time.</div>
          <p className="bk-meta" style={{ marginTop:14, fontSize:15, lineHeight:"22px" }}>
            Begin each day with intention. Barakaah gently guides you through your five daily prayers — quietly, without noise.
          </p>
        </div>
      </div>
      <div style={{ padding:"0 24px 28px" }} className="bk-stack-sm">
        <Button variant="primary" block onClick={onNext}>Begin · Free for 30 days</Button>
        <div style={{ textAlign:"center" }}>
          <button className="bk-btn bk-btn-link">I already have an account</button>
        </div>
      </div>
    </div>
  );
}

// 2. LOCATION SETUP
function ScreenLocation({ onNext, onBack }) {
  const [city, setCity] = React.useState("Phoenix, AZ");
  return (
    <div className="bk-screen" style={{ display:"flex", flexDirection:"column", height:"100%", paddingTop: 50 }}>
      <TopBar title="" left={<button className="bk-iconbtn" onClick={onBack}><Icon name="chevron-left" /></button>} />
      <div style={{ padding:"8px 24px 24px" }} className="bk-stack-md">
        <div>
          <Eyebrow>Step 1 of 3</Eyebrow>
          <h1 className="bk-display" style={{ marginTop:8 }}>Where do you pray?</h1>
          <p className="bk-meta" style={{ marginTop:10, fontSize:15, lineHeight:"22px" }}>
            We use your city to calculate accurate prayer times. You can change this anytime.
          </p>
        </div>
        <div className="bk-stack-sm">
          <label className="bk-meta" style={{ display:"block", color:"#000", fontWeight:500 }}>City</label>
          <input className="bk-input" value={city} onChange={e => setCity(e.target.value)} />
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            <Chip>Hanafi</Chip><Chip on>Shafi'i</Chip><Chip>Maliki</Chip><Chip>Hanbali</Chip>
          </div>
        </div>
      </div>
      <div style={{ flex:1 }}></div>
      <div style={{ padding:"0 24px 28px" }}>
        <Button variant="primary" block onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}

// 3. HOME — main dashboard
function ScreenHome({ onTab }) {
  return (
    <div className="bk-screen" style={{ display:"flex", flexDirection:"column", height:"100%", paddingTop: 50 }}>
      <Banner>Maghrib · 1 h 04 min</Banner>
      <div style={{ overflowY:"auto", flex:1, paddingBottom:14 }}>
        <TopBar
          title="As-salāmu ʿalaykum"
          left={<button className="bk-iconbtn"><Icon name="menu" /></button>}
          right={<button className="bk-iconbtn"><Icon name="bell" /></button>}
        />
        <div style={{ padding:"0 24px" }} className="bk-stack-md">
          <Card>
            <PrayerCountdown />
          </Card>

          <div>
            <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:8 }}>
              <h2 className="bk-h2">Today</h2>
              <span className="bk-meta">Wed, 6 May</span>
            </div>
            <Card style={{ padding:"4px 16px" }}>
              <PrayerRow name="Fajr" time="5:11 am" status="passed" />
              <PrayerRow name="Dhuhr" time="12:24 pm" status="passed" />
              <PrayerRow name="Asr" time="3:48 pm" status="passed" />
              <PrayerRow name="Maghrib" time="5:42 pm" status="now" />
              <PrayerRow name="Isha" time="7:11 pm" status="upcoming" />
            </Card>
          </div>

          <Card soft>
            <Eyebrow>Today's lesson</Eyebrow>
            <h3 className="bk-h2" style={{ marginTop:6, fontSize:20, lineHeight:"26px" }}>The meaning of Bismillah</h3>
            <p className="bk-meta" style={{ marginTop:6 }}>4 min read · Lesson 2 of 30</p>
            <div style={{ marginTop:14 }}>
              <Button variant="secondary">Open lesson</Button>
            </div>
          </Card>

          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <Chip soft>● 4-day streak</Chip>
            <Chip>Qibla</Chip>
            <Chip>Du'a</Chip>
            <Chip>Tasbih</Chip>
          </div>
        </div>
      </div>
      <TabBar active="home" onChange={onTab} />
    </div>
  );
}

// 4. PRAYER LOCK ACTIVE — full-screen reverent pause
function ScreenPrayerLock({ onDismiss }) {
  return (
    <div style={{ background:"#1B3F29", color:"#fff", height:"100%", display:"flex", flexDirection:"column", paddingTop: 50 }}>
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:"40px 24px", gap:28, textAlign:"center" }}>
        <div style={{ fontFamily:"var(--font-sans)", fontSize:11, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"#A8C7B2" }}>Prayer lock</div>
        <div style={{ fontFamily:"var(--font-serif)", fontSize:42, fontWeight:700, lineHeight:1.1 }}>
          Maghrib
        </div>
        <div style={{ width:120, height:1, background:"rgba(255,255,255,0.2)" }}></div>
        <p style={{ fontFamily:"var(--font-serif)", fontStyle:"italic", fontSize:18, lineHeight:"28px", maxWidth:280, color:"#E6EFEA", margin:0 }}>
          "Indeed, prayer prohibits immorality and wrongdoing."
        </p>
        <div style={{ fontFamily:"var(--font-sans)", fontSize:13, color:"#A8C7B2" }}>Qur'an · 29:45</div>
      </div>
      <div style={{ padding:"0 24px 40px", display:"flex", flexDirection:"column", gap:12 }}>
        <button className="bk-btn" style={{ background:"#fff", color:"#1B3F29", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", fontSize:13, padding:"18px 28px", borderRadius:9999, border:"none", boxShadow:"0 8px 24px rgba(0,0,0,0.2)" }} onClick={onDismiss}>
          I prayed
        </button>
        <button className="bk-btn bk-btn-link" style={{ color:"#A8C7B2" }} onClick={onDismiss}>Snooze 5 minutes</button>
      </div>
    </div>
  );
}

// 5. LESSON DETAIL
function ScreenLesson({ onBack }) {
  return (
    <div className="bk-screen" style={{ display:"flex", flexDirection:"column", height:"100%", paddingTop: 50 }}>
      <TopBar
        title=""
        left={<button className="bk-iconbtn" onClick={onBack}><Icon name="chevron-left" /></button>}
        right={<button className="bk-iconbtn"><Icon name="bookmark" /></button>}
      />
      <div style={{ overflowY:"auto", flex:1, padding:"4px 24px 24px" }} className="bk-stack-md">
        <div>
          <Eyebrow>Lesson 2 of 30 · 4 min</Eyebrow>
          <h1 className="bk-display" style={{ marginTop:10 }}>The meaning of Bismillah</h1>
          <p className="bk-meta" style={{ marginTop:10, fontSize:15 }}>By Sh. Idris Karim</p>
        </div>
        <div style={{ height:1, background:"#E5E7EB" }}></div>
        <p className="bk-body">
          To say <em>Bismillāh ir-Raḥmān ir-Raḥīm</em> is to begin every action by remembering Allah — the Most Gracious, the Most Merciful. It is a small phrase with weight far beyond its three words.
        </p>
        <div style={{ background:"#FAFAF7", borderLeft:"3px solid #29603E", padding:"16px 18px" }}>
          <p style={{ fontFamily:"var(--font-serif)", fontStyle:"italic", fontSize:18, lineHeight:"28px", color:"#000", margin:0 }}>
            "Every important matter that does not begin with the name of Allah is cut off."
          </p>
          <div className="bk-meta" style={{ marginTop:8, fontSize:12 }}>— Hadith, Ibn Hibban</div>
        </div>
        <p className="bk-body">
          The companions of the Prophet ﷺ began their meals, their travel, even their writing with this phrase. It is a reminder, not a ritual: that nothing in our day is truly ours alone.
        </p>
      </div>
      <div style={{ padding:"12px 24px 28px", borderTop:"1px solid #E5E7EB", background:"#fff", display:"flex", gap:12 }}>
        <Button variant="secondary">Mark as read</Button>
        <Button variant="primary" style={{ flex:1 }}>Next lesson</Button>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenWelcome, ScreenLocation, ScreenHome, ScreenPrayerLock, ScreenLesson });
