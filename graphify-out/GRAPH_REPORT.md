# Graph Report - packages  (2026-05-20)

## Corpus Check
- Large corpus: 239 files · ~70,029 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 772 nodes · 770 edges · 38 communities detected
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 79 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Evaluate.ts|Evaluate.ts]]
- [[_COMMUNITY_View|View]]
- [[_COMMUNITY_Expo Project|Expo Project]]
- [[_COMMUNITY_Use Prayer Times.ts|Use Prayer Times.ts]]
- [[_COMMUNITY_Shared Store.swift|Shared Store.swift]]
- [[_COMMUNITY_Shield Action Extension|Shield Action Extension]]
- [[_COMMUNITY_Aladhan.ts|Aladhan.ts]]
- [[_COMMUNITY_Use Color Scheme()|Use Color Scheme()]]
- [[_COMMUNITY_Use Lock Activity Scheduler.ts|Use Lock Activity Scheduler.ts]]
- [[_COMMUNITY_Ayah Notification.ts|Ayah Notification.ts]]
- [[_COMMUNITY_.date()|.date()]]
- [[_COMMUNITY_App Blocker Device Activity Monitor|App Blocker Device Activity Monitor]]
- [[_COMMUNITY_A I Search Crawlers|A I Search Crawlers]]
- [[_COMMUNITY_Reset Db.ts|Reset Db.ts]]
- [[_COMMUNITY_Profile.tsx|Profile.tsx]]
- [[_COMMUNITY_Lifetime Early Access Plan|Lifetime Early Access Plan]]
- [[_COMMUNITY_Build O T P Verification|Build O T P Verification]]
- [[_COMMUNITY_Home.tsx|Home.tsx]]
- [[_COMMUNITY_Base()|Base()]]
- [[_COMMUNITY_Use Permissions.ts|Use Permissions.ts]]
- [[_COMMUNITY_Log Prayer.tsx|Log Prayer.tsx]]
- [[_COMMUNITY_Main Application.kt|Main Application.kt]]
- [[_COMMUNITY_Achievements.ts|Achievements.ts]]
- [[_COMMUNITY_Use Onboarding Nav()|Use Onboarding Nav()]]
- [[_COMMUNITY_Main Activity|Main Activity]]
- [[_COMMUNITY_Welcome Card Stack.ts|Welcome Card Stack.ts]]
- [[_COMMUNITY_Emails.ts|Emails.ts]]
- [[_COMMUNITY_Adhan Js.ts|Adhan Js.ts]]
- [[_COMMUNITY_Progress.tsx|Progress.tsx]]
- [[_COMMUNITY_Wrangler Generation|Wrangler Generation]]
- [[_COMMUNITY_Webhook.test.ts|Webhook.test.ts]]
- [[_COMMUNITY_Cache Key.ts|Cache Key.ts]]
- [[_COMMUNITY_Join Waitlist()|Join Waitlist()]]
- [[_COMMUNITY_Dhikr.ts|Dhikr.ts]]
- [[_COMMUNITY_Auth.tsx|Auth.tsx]]
- [[_COMMUNITY_Barakah Widgets Bundle|Barakah Widgets Bundle]]
- [[_COMMUNITY_Lock Now Control|Lock Now Control]]
- [[_COMMUNITY_Daily Ayah.ts|Daily Ayah.ts]]

## God Nodes (most connected - your core abstractions)
1. `AI Search Crawlers` - 12 edges
2. `AppBlockerDeviceActivityMonitor` - 11 edges
3. `Lifetime Early Access Plan` - 11 edges
4. `base()` - 9 edges
5. `Expo Project` - 9 edges
6. `ShieldActionExtension` - 8 edges
7. `addDays()` - 7 edges
8. `utc()` - 7 edges
9. `scheduleDailyAyahNotification()` - 7 edges
10. `lockBoundsMinutes()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `usePrayerShield()` --calls--> `usePrayerTimes()`  [INFERRED]
  /Users/sourav/Workflows/saas/heybarakah_app/packages/app/hooks/usePrayerShield.ts → /Users/sourav/Workflows/saas/heybarakah_app/packages/app/hooks/usePrayerTimes.ts
- `fetchAndNormalize()` --calls--> `normalizeAlAdhanCalendarResponse()`  [INFERRED]
  /Users/sourav/Workflows/saas/heybarakah_app/packages/core/convex/lib/prayerTimes.ts → /Users/sourav/Workflows/saas/heybarakah_app/packages/core/src/prayer/aladhan.ts
- `fetchAndNormalize()` --calls--> `slicePrayerDays()`  [INFERRED]
  /Users/sourav/Workflows/saas/heybarakah_app/packages/core/convex/lib/prayerTimes.ts → /Users/sourav/Workflows/saas/heybarakah_app/packages/core/src/prayer/normalize.ts
- `main()` --calls--> `log()`  [INFERRED]
  /Users/sourav/Workflows/saas/heybarakah_app/packages/core/scripts/reset-db.ts → /Users/sourav/Workflows/saas/heybarakah_app/packages/core/src/achievements/evaluate.test.ts
- `buildDateMap()` --calls--> `GET()`  [INFERRED]
  /Users/sourav/Workflows/saas/heybarakah_app/packages/core/src/achievements/evaluate.ts → /Users/sourav/Workflows/saas/heybarakah_app/packages/marketing/src/pages/llms-full.txt.ts

## Hyperedges (group relationships)
- **App Widget Delivery Pattern** — app_widgets_ios_18, app_barakah_widgets_extension, app_expo_widget_bridge_module, app_widget_surfaces, app_shared_app_group_snapshot [EXTRACTED 1.00]
- **Early Access Pricing Plan Structure** — pricing_barakah_app, pricing_free_plan, pricing_lifetime_early_access_plan, pricing_polar_checkout [EXTRACTED 1.00]
- **AI Search Visibility Pattern** — robots_barakah_robots_txt, robots_ai_search_crawlers, robots_ai_citation_rationale, robots_sitemap [EXTRACTED 1.00]

## Communities

### Community 0 - "Evaluate.ts"
Cohesion: 0.06
Nodes (30): handleClose(), enumerateDates(), isInSacredMonth(), addDays(), buildDateMap(), buildOnTimeDateMap(), codesOfTier(), completeEval() (+22 more)

### Community 1 - "View"
Cohesion: 0.06
Nodes (26): AyahView, AyahWidget, DhikrView, DhikrWidget, LockComplicationsView, LockComplicationsWidget, DIExpandedBottom, DIExpandedLeading (+18 more)

### Community 2 - "Expo Project"
Cohesion: 0.05
Nodes (37): API Package, Cloudflare Worker, API Deploy Workflow, API Development Workflow, Android Emulator, Authenticated User Snapshot Flow, BarakahWidgets Extension, create-expo-app (+29 more)

### Community 3 - "Use Prayer Times.ts"
Cohesion: 0.09
Nodes (16): Index(), LoggingOut(), useSubscription(), useOnboardingState(), useDailyAyahNotification(), useLockActivityScheduler(), pad2(), pickNextPrayer() (+8 more)

### Community 4 - "Shared Store.swift"
Cohesion: 0.1
Nodes (17): ActivityAttributes, AppIntent, Codable, Hashable, IncrementDhikrIntent, BarakahLockAttributes, ContentState, Ayah (+9 more)

### Community 5 - "Shield Action Extension"
Cohesion: 0.1
Nodes (12): AppDelegate, ReactNativeDelegate, ExpoAppDelegate, ExpoReactNativeFactoryDelegate, async(), url(), State, current (+4 more)

### Community 6 - "Aladhan.ts"
Cohesion: 0.15
Nodes (18): buildAlAdhanQuery(), createAlAdhanCalendarUrl(), fetchAlAdhanCalendarByCoordinates(), fetchAlAdhanTimingsByCoordinates(), normalizeAlAdhanCalendarResponse(), normalizeAlAdhanDay(), parseAlAdhanDateToDateKey(), parseResponseJson() (+10 more)

### Community 7 - "Use Color Scheme()"
Cohesion: 0.1
Nodes (11): AchievementCard(), tierAccent(), AnimatedSplash(), SettingsLayout(), ParallaxScrollView(), ThemeProvider(), useTheme(), ThemedText() (+3 more)

### Community 8 - "Use Lock Activity Scheduler.ts"
Cohesion: 0.16
Nodes (16): lockBoundsMinutes(), midpointMinutesForPrayer(), adhanMinutes(), findActiveLock(), localISO(), nowMinutes(), pad2(), todayKey() (+8 more)

### Community 9 - "Ayah Notification.ts"
Cohesion: 0.17
Nodes (17): cancelDailyAyahNotification(), dateKey(), forbiddenRanges(), isInRanges(), loadStored(), parseHHmm(), pickRandomMinute(), saveStored() (+9 more)

### Community 10 - ".date()"
Cohesion: 0.16
Nodes (8): timerRange(), BarakahEntry, BarakahProvider, SamplePayload, ShieldConfigurationDataSource, ShieldConfigurationExtension, TimelineEntry, TimelineProvider

### Community 11 - "App Blocker Device Activity Monitor"
Cohesion: 0.16
Nodes (8): DeviceActivityMonitor, AppBlockerDeviceActivityMonitor, MonitorBlockConfig, MonitorBlockedItemInfo, MonitorBlockedItemType, app, category, webDomain

### Community 12 - "A I Search Crawlers"
Cohesion: 0.12
Nodes (18): Contact Information, https://heybarakah.app, Allow AI Search Crawlers so Barakah Can Be Cited, AI Search Crawlers, anthropic-ai, Applebot-Extended, Barakah robots.txt, CCBot (+10 more)

### Community 14 - "Reset Db.ts"
Cohesion: 0.21
Nodes (11): log(), createResetPlan(), isProductionDeployment(), listComponents(), listTables(), main(), parseConvexComponentNames(), parseConvexDataTables() (+3 more)

### Community 15 - "Profile.tsx"
Cohesion: 0.14
Nodes (5): onRestore(), openMail(), openUrl(), openSupport(), restore()

### Community 16 - "Lifetime Early Access Plan"
Cohesion: 0.15
Nodes (14): Barakah App, Prayer Times, Adhan, Qibla, and Core Prayer Lock, Family Sharing, Free Plan, All Future Updates, Lifetime Early Access Plan, $39.99 USD One-Time Price, iOS and Android Coming Soon (+6 more)

### Community 17 - "Build O T P Verification"
Cohesion: 0.22
Nodes (7): buildOTPVerificationEmail(), requireEnv(), sendEmail(), sendOTPVerification(), formatCode(), renderVerifyOtpEmail(), VerifyOtpEmail()

### Community 18 - "Home.tsx"
Cohesion: 0.27
Nodes (4): fmt12(), fmtRangeTime(), pad(), todayKey()

### Community 19 - "Base()"
Cohesion: 0.38
Nodes (9): ArrowRight(), base(), Bell(), Check(), ChevronDown(), Compass(), Lock(), Moon() (+1 more)

### Community 21 - "Use Permissions.ts"
Cohesion: 0.29
Nodes (3): allow(), requestLocationPermission(), requestNotificationPermission()

### Community 22 - "Log Prayer.tsx"
Cohesion: 0.48
Nodes (6): dismiss(), fmtRangeTime(), handleClear(), handlePick(), pad(), todayKey()

### Community 23 - "Main Application.kt"
Cohesion: 0.29
Nodes (1): MainApplication

### Community 24 - "Achievements.ts"
Cohesion: 0.47
Nodes (3): localToday(), pad2(), utcToday()

### Community 25 - "Use Onboarding Nav()"
Cohesion: 0.33
Nodes (3): LockPreview(), Promise(), useOnboardingNav()

### Community 27 - "Main Activity"
Cohesion: 0.33
Nodes (1): MainActivity

### Community 28 - "Welcome Card Stack.ts"
Cohesion: 0.4
Nodes (2): clearWelcomeCardDrag(), completeWelcomeCardSwipe()

### Community 29 - "Emails.ts"
Cohesion: 0.4
Nodes (3): formatMoney(), purchaseEmail(), renderPurchaseEmail()

### Community 30 - "Adhan Js.ts"
Cohesion: 0.6
Nodes (3): calculateAdhanJsPrayerDays(), getAdhanJsCalculationParameters(), isAdhanJsSupportedMethod()

### Community 31 - "Progress.tsx"
Cohesion: 0.6
Nodes (4): addDays(), dateKey(), mondayOf(), pad2()

### Community 32 - "Wrangler Generation"
Cohesion: 0.4
Nodes (5): CloudflareBindings, Cloudflare Wrangler Commands Documentation, Hono App, Synchronize Worker Configuration Types, Wrangler Type Generation

### Community 33 - "Webhook.test.ts"
Cohesion: 0.5
Nodes (1): MockWebhookVerificationError

### Community 35 - "Cache Key.ts"
Cohesion: 0.67
Nodes (2): createPrayerTimesCacheKey(), roundCoordinate()

### Community 39 - "Join Waitlist()"
Cohesion: 0.5
Nodes (2): joinWaitlist(), onSubmit()

### Community 40 - "Dhikr.ts"
Cohesion: 1.0
Nodes (2): sumDhikrDaily(), updateDhikrAggregate()

### Community 41 - "Auth.tsx"
Cohesion: 1.0
Nodes (2): fillDefaultsIfWelcome(), pick()

### Community 46 - "Barakah Widgets Bundle"
Cohesion: 0.67
Nodes (2): BarakahWidgetsBundle, WidgetBundle

### Community 47 - "Lock Now Control"
Cohesion: 0.67
Nodes (2): ControlWidget, LockNowControl

### Community 56 - "Daily Ayah.ts"
Cohesion: 1.0
Nodes (2): hashDateKey(), pickDailyAyah()

## Knowledge Gaps
- **60 isolated node(s):** `SamplePayload`, `BarakahColor`, `BarakahMetric`, `past`, `upcoming` (+55 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Main Application.kt`** (7 nodes): `MainApplication.kt`, `getJSMainModuleName()`, `getPackages()`, `getUseDeveloperSupport()`, `MainApplication`, `.onConfigurationChanged()`, `.onCreate()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Main Activity`** (6 nodes): `MainActivity.kt`, `MainActivity`, `.createReactActivityDelegate()`, `.getMainComponentName()`, `.invokeDefaultOnBackPressed()`, `.onCreate()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Welcome Card Stack.ts`** (6 nodes): `welcome-card-stack.ts`, `clearWelcomeCardDrag()`, `completeWelcomeCardSwipe()`, `createWelcomeCardStackState()`, `startWelcomeCardDrag()`, `startWelcomeCardExit()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Webhook.test.ts`** (4 nodes): `webhook.test.ts`, `mockValidate()`, `MockWebhookVerificationError`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cache Key.ts`** (4 nodes): `createPrayerTimesCacheKey()`, `createUserPrayerTimesCacheKey()`, `roundCoordinate()`, `cache-key.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Join Waitlist()`** (4 nodes): `joinWaitlist()`, `WaitlistForm.tsx`, `convex.ts`, `onSubmit()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dhikr.ts`** (3 nodes): `dhikr.ts`, `sumDhikrDaily()`, `updateDhikrAggregate()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Auth.tsx`** (3 nodes): `auth.tsx`, `fillDefaultsIfWelcome()`, `pick()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Barakah Widgets Bundle`** (3 nodes): `BarakahWidgetsBundle.swift`, `BarakahWidgetsBundle`, `WidgetBundle`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Lock Now Control`** (3 nodes): `LockNowControl.swift`, `ControlWidget`, `LockNowControl`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Daily Ayah.ts`** (3 nodes): `daily-ayah.ts`, `hashDateKey()`, `pickDailyAyah()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GET()` connect `Evaluate.ts` to `Shield Action Extension`, `Aladhan.ts`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `parseResponseJson()` connect `Aladhan.ts` to `Evaluate.ts`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `SamplePayload`, `BarakahColor`, `BarakahMetric` to the rest of the system?**
  _60 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Evaluate.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `View` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Expo Project` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Use Prayer Times.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._