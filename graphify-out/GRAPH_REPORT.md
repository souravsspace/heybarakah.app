# Graph Report - heybarakah_app  (2026-06-09)

## Corpus Check
- 453 files · ~220,142 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1497 nodes · 1845 edges · 66 communities detected
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 368 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 106|Community 106]]
- [[_COMMUNITY_Community 107|Community 107]]
- [[_COMMUNITY_Community 108|Community 108]]
- [[_COMMUNITY_Community 109|Community 109]]
- [[_COMMUNITY_Community 125|Community 125]]

## God Nodes (most connected - your core abstractions)
1. `from()` - 41 edges
2. `createDatabase()` - 37 edges
3. `ExpoAppBlockerModule` - 33 edges
4. `AppBlockerPrefs` - 25 edges
5. `run()` - 25 edges
6. `requireUser()` - 23 edges
7. `parse()` - 18 edges
8. `ImageSlot` - 17 edges
9. `resolve()` - 16 edges
10. `AppBlockerDeviceActivityMonitor` - 14 edges

## Surprising Connections (you probably didn't know these)
- `WelcomeIllust()` --calls--> `from()`  [INFERRED]
  design/ui_kits/app/components.jsx → packages/core/convex/lib/polar.ts
- `applyMigrations()` --calls--> `run()`  [INFERRED]
  packages/api/src/middlewares/auth-session.test.ts → modules/expo-app-blocker/android/src/main/java/expo/modules/appblocker/AppBlockerService.kt
- `applyMigrations()` --calls--> `run()`  [INFERRED]
  packages/api/src/routes/webhooks/polar/polar.test.ts → modules/expo-app-blocker/android/src/main/java/expo/modules/appblocker/AppBlockerService.kt
- `LockPreviewScreen()` --calls--> `from()`  [INFERRED]
  design/ui_kits/app/screens.jsx → packages/core/convex/lib/polar.ts
- `endLockActivity()` --calls--> `resolve()`  [INFERRED]
  packages/app/lib/widgets-native.ts → modules/expo-app-blocker/plugin/src/index.js

## Hyperedges (group relationships)
- **App Widget Delivery Pattern** — app_widgets_ios_18, app_barakah_widgets_extension, app_expo_widget_bridge_module, app_widget_surfaces, app_shared_app_group_snapshot [EXTRACTED 1.00]
- **Early Access Pricing Plan Structure** — pricing_barakah_app, pricing_free_plan, pricing_lifetime_early_access_plan, pricing_polar_checkout [EXTRACTED 1.00]
- **AI Search Visibility Pattern** — robots_barakah_robots_txt, robots_ai_search_crawlers, robots_ai_citation_rationale, robots_sitemap [EXTRACTED 1.00]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (22): Equatable, BlockConfig, BlockedAppsContentView, BlockedAppsView, BlockedAppsViewModel, BlockedItemInfo, BlockedItemRendering, ExpoAppBlockerModule (+14 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (50): counterProgress(), dhikrTotalForUser(), latestTimezone(), listForMe(), listUnseen(), localToday(), markSeen(), pad2() (+42 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (49): onClose(), listForMe(), listUnseen(), markSeen(), getAppConfig(), requireUser(), pick(), pickMadhab() (+41 more)

### Community 3 - "Community 3"
Cohesion: 0.03
Nodes (24): applyMigration(), applyMigration(), applyMigration(), applyMigration(), AppBlockerService, run(), applyMigrations(), applyMigration() (+16 more)

### Community 4 - "Community 4"
Cohesion: 0.05
Nodes (41): cancelDailyAyahNotification(), forbiddenRanges(), isInRanges(), loadStored(), parseHHmm(), pickRandomMinute(), saveStored(), scheduleDailyAyahNotification() (+33 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (34): handleClose(), parseResponseJson(), enumerateDates(), isInSacredMonth(), configureOpenAPI(), addDays(), bool(), buildDateMap() (+26 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (37): buildAlAdhanQuery(), createAlAdhanCalendarUrl(), fetchAlAdhanCalendarByCoordinates(), fetchAlAdhanTimingsByCoordinates(), normalizeAlAdhanCalendarResponse(), normalizeAlAdhanDay(), parseAlAdhanDateToDateKey(), pickRequiredTimings() (+29 more)

### Community 7 - "Community 7"
Cohesion: 0.04
Nodes (4): AppBlockerPrefs, configureAndroid(), getPermissionStatus(), requestPermissions()

### Community 8 - "Community 8"
Cohesion: 0.06
Nodes (27): ForceUpdateGate(), parseJson(), enqueueMutation(), load(), persist(), removeMutation(), useOfflineReplay(), loadShieldSchedule() (+19 more)

### Community 9 - "Community 9"
Cohesion: 0.06
Nodes (23): authSession(), applyMigrations(), buildApp(), applyMiddleware(), createApp(), createTestApp(), appWithPing(), createRouter() (+15 more)

### Community 10 - "Community 10"
Cohesion: 0.05
Nodes (37): API Package, Cloudflare Worker, API Deploy Workflow, API Development Workflow, Android Emulator, Authenticated User Snapshot Flow, BarakahWidgets Extension, create-expo-app (+29 more)

### Community 11 - "Community 11"
Cohesion: 0.08
Nodes (20): getInstalledApps(), getPermissionStatus(), presentFamilyActivityPicker(), relockApps(), removeBlockedItem(), requestPermissions(), setBlockConfiguration(), temporaryUnlock() (+12 more)

### Community 12 - "Community 12"
Cohesion: 0.07
Nodes (17): DevResetOnboarding(), DiscountPaywall(), Index(), LockPreview(), LoggingOut(), Promise(), SubscriptionProvider(), useSubscription() (+9 more)

### Community 13 - "Community 13"
Cohesion: 0.08
Nodes (23): isTruthyFlag(), parseEnv(), buildRevenueCatSubscriptionDoc(), buildSocialProviders(), buildTrustedOrigins(), createAuth(), resolveProductId(), joinWaitlist() (+15 more)

### Community 14 - "Community 14"
Cohesion: 0.11
Nodes (12): close(), clampS(), getSlot(), ImageSlot, load(), save(), setSlot(), toDataUrl() (+4 more)

### Community 15 - "Community 15"
Cohesion: 0.14
Nodes (23): applyHighLatitudeRule(), applyPolarCircleResolution(), applyTune(), calculateAdhanJsPrayerDays(), formatHijriDate(), getAdhanJsCalculationParameters(), isAdhanJsSupportedMethod(), pad2() (+15 more)

### Community 16 - "Community 16"
Cohesion: 0.19
Nodes (18): activePrayerNow(), fmt12(), fmtRangeTime(), formatDateLine(), formatHijri(), pad(), todayKey(), useCountdown() (+10 more)

### Community 17 - "Community 17"
Cohesion: 0.16
Nodes (8): DeviceActivityMonitor, AppBlockerDeviceActivityMonitor, MonitorBlockConfig, MonitorBlockedItemInfo, MonitorBlockedItemType, app, category, webDomain

### Community 18 - "Community 18"
Cohesion: 0.1
Nodes (1): WelcomeIllust()

### Community 19 - "Community 19"
Cohesion: 0.14
Nodes (7): AppDelegate, ReactNativeDelegate, ExpoAppDelegate, ExpoReactNativeFactoryDelegate, url(), ShieldActionDelegate, ShieldActionExtension

### Community 20 - "Community 20"
Cohesion: 0.12
Nodes (10): AchievementCard(), tierAccent(), SettingsLayout(), ParallaxScrollView(), ThemeProvider(), useTheme(), ThemedText(), ThemedView() (+2 more)

### Community 21 - "Community 21"
Cohesion: 0.19
Nodes (13): log(), buildClearStatements(), createResetPlan(), isProductionDeployment(), listComponents(), listTables(), main(), parseConvexComponentNames() (+5 more)

### Community 22 - "Community 22"
Cohesion: 0.12
Nodes (18): Contact Information, https://heybarakah.app, Allow AI Search Crawlers so Barakah Can Be Cited, AI Search Crawlers, anthropic-ai, Applebot-Extended, Barakah robots.txt, CCBot (+10 more)

### Community 23 - "Community 23"
Cohesion: 0.22
Nodes (10): confirmDelete(), go(), handleLogout(), openMail(), openSettings(), openUrl(), manage(), openFamilyHelp() (+2 more)

### Community 24 - "Community 24"
Cohesion: 0.24
Nodes (12): configureRevenueCatAnonymous(), getApiKey(), getCustomerInfo(), getOfferings(), hasRevenueCatApiKey(), isRevenueCatSupported(), linkRevenueCatToUser(), logOutRevenueCat() (+4 more)

### Community 25 - "Community 25"
Cohesion: 0.21
Nodes (11): avatarKey(), getAvatar(), isAllowedImageType(), putAvatar(), deleteMyAccount(), getAvatarObject(), getProfile(), purgeUserData() (+3 more)

### Community 26 - "Community 26"
Cohesion: 0.15
Nodes (14): Barakah App, Prayer Times, Adhan, Qibla, and Core Prayer Lock, Family Sharing, Free Plan, All Future Updates, Lifetime Early Access Plan, $39.99 USD One-Time Price, iOS and Android Coming Soon (+6 more)

### Community 27 - "Community 27"
Cohesion: 0.28
Nodes (11): AppScaffold(), AreaChart(), DhikrScreen(), HomeScreen(), LockedScreen(), PermissionRow(), PrayerMatrix(), PrayerRow() (+3 more)

### Community 28 - "Community 28"
Cohesion: 0.17
Nodes (1): OverlayManager

### Community 29 - "Community 29"
Cohesion: 0.27
Nodes (7): addFromGps(), allow(), skip(), getCurrentLocation(), requestLocationPermission(), requestNotificationPermission(), reverseGeocodeLocation()

### Community 31 - "Community 31"
Cohesion: 0.36
Nodes (7): isFiniteNumber(), isValidEntry(), isValidLocation(), isValidTimingsArray(), pruneOldest(), readPrayerStorage(), writePrayerEntry()

### Community 32 - "Community 32"
Cohesion: 0.22
Nodes (5): DhikrWidget, LockComplications, SalahArcWidget, StreakWidget, Widget

### Community 34 - "Community 34"
Cohesion: 0.54
Nodes (5): formatToday(), nextPrayerIndex(), nextPrayerIndexFor(), parseMinutes(), toPrayerRows()

### Community 35 - "Community 35"
Cohesion: 0.36
Nodes (2): ShieldConfigurationDataSource, ShieldConfigurationExtension

### Community 36 - "Community 36"
Cohesion: 0.57
Nodes (4): addDays(), dateKey(), mondayOf(), pad2()

### Community 37 - "Community 37"
Cohesion: 0.38
Nodes (3): localToday(), pad2(), utcToday()

### Community 38 - "Community 38"
Cohesion: 0.4
Nodes (3): formatMoney(), purchaseEmail(), renderPurchaseEmail()

### Community 39 - "Community 39"
Cohesion: 0.33
Nodes (1): MainActivity

### Community 40 - "Community 40"
Cohesion: 0.6
Nodes (3): DhikrLayout(), DhikrProvider(), useDhikr()

### Community 42 - "Community 42"
Cohesion: 0.6
Nodes (3): requestOtp(), resendCode(), sendCode()

### Community 43 - "Community 43"
Cohesion: 0.6
Nodes (3): base64ToBytes(), bytesToBase64(), verifyResendSignature()

### Community 44 - "Community 44"
Cohesion: 0.4
Nodes (5): CloudflareBindings, Cloudflare Wrangler Commands Documentation, Hono App, Synchronize Worker Configuration Types, Wrangler Type Generation

### Community 45 - "Community 45"
Cohesion: 0.83
Nodes (3): AchievementsScreen(), palette(), UnlockScreen()

### Community 46 - "Community 46"
Cohesion: 0.5
Nodes (1): randInt()

### Community 47 - "Community 47"
Cohesion: 0.5
Nodes (1): onLayout()

### Community 48 - "Community 48"
Cohesion: 0.5
Nodes (1): cellStyle()

### Community 49 - "Community 49"
Cohesion: 0.67
Nodes (2): capitalize(), fmt12()

### Community 50 - "Community 50"
Cohesion: 0.67
Nodes (2): sumDhikrDaily(), updateDhikrAggregate()

### Community 51 - "Community 51"
Cohesion: 0.5
Nodes (1): MockWebhookVerificationError

### Community 54 - "Community 54"
Cohesion: 0.5
Nodes (1): MainApplication

### Community 55 - "Community 55"
Cohesion: 0.5
Nodes (2): jsonContent(), jsonContentRequired()

### Community 56 - "Community 56"
Cohesion: 0.5
Nodes (2): joinWaitlist(), onSubmit()

### Community 57 - "Community 57"
Cohesion: 0.67
Nodes (1): close()

### Community 58 - "Community 58"
Cohesion: 0.67
Nodes (1): Rule()

### Community 59 - "Community 59"
Cohesion: 1.0
Nodes (2): fillDefaultsIfWelcome(), pick()

### Community 62 - "Community 62"
Cohesion: 1.0
Nodes (2): rate(), requestStoreReview()

### Community 63 - "Community 63"
Cohesion: 0.67
Nodes (2): ExportWidgets0, WidgetBundle

### Community 71 - "Community 71"
Cohesion: 1.0
Nodes (2): iso(), makeSnapshot()

### Community 72 - "Community 72"
Cohesion: 1.0
Nodes (2): hashDateKey(), pickDailyAyah()

### Community 74 - "Community 74"
Cohesion: 1.0
Nodes (2): buildOTPEmail(), sendOTPEmail()

### Community 76 - "Community 76"
Cohesion: 0.67
Nodes (1): BootReceiver

### Community 106 - "Community 106"
Cohesion: 1.0
Nodes (1): StreakWidgetProvider

### Community 107 - "Community 107"
Cohesion: 1.0
Nodes (1): SalahArcWidgetProvider

### Community 108 - "Community 108"
Cohesion: 1.0
Nodes (1): LockComplicationsProvider

### Community 109 - "Community 109"
Cohesion: 1.0
Nodes (1): DhikrWidgetProvider

### Community 125 - "Community 125"
Cohesion: 1.0
Nodes (1): ExpoAppBlockerConfig

## Knowledge Gaps
- **62 isolated node(s):** `app`, `category`, `webDomain`, `StreakWidgetProvider`, `SalahArcWidgetProvider` (+57 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 18`** (20 nodes): `AppGlyph()`, `BarakahMark()`, `Body()`, `Button()`, `Caption()`, `GradientAvatar()`, `Headline()`, `Icon()`, `IconBox()`, `MeshBg()`, `MosqueMinaret()`, `MosquePodium()`, `MosqueTwin()`, `OnboardingHeader()`, `OptionRow()`, `ProgressBar()`, `StatusBar()`, `TabBar()`, `WelcomeIllust()`, `components.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (12 nodes): `OverlayManager.kt`, `OverlayManager`, `.bringAppToFront()`, `.buildLayoutParams()`, `.buildOverlayView()`, `.getAppScheme()`, `.hide()`, `.navigateToApp()`, `.parseColorOrDefault()`, `.parseColorOrNull()`, `.resolveAppName()`, `.show()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (8 nodes): `ShieldConfigurationExtension.swift`, `ShieldConfigurationExtension.swift`, `ShieldConfigurationDataSource`, `ShieldConfigurationExtension`, `.configuration()`, `.getBlockedAppCount()`, `.isTemporarilyUnlocked()`, `.makeConfig()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (6 nodes): `MainActivity`, `.createReactActivityDelegate()`, `.getMainComponentName()`, `.invokeDefaultOnBackPressed()`, `.onCreate()`, `MainActivity.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (4 nodes): `stats.tsx`, `stats.tsx`, `stats.tsx`, `randInt()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (4 nodes): `onLayout()`, `area-chart.tsx`, `area-chart.tsx`, `area-chart.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (4 nodes): `prayer-matrix.tsx`, `prayer-matrix.tsx`, `prayer-matrix.tsx`, `cellStyle()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (4 nodes): `locked.tsx`, `locked.tsx`, `capitalize()`, `fmt12()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (4 nodes): `isValidDateKey()`, `sumDhikrDaily()`, `updateDhikrAggregate()`, `dhikr.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (4 nodes): `webhook.test.ts`, `mockValidate()`, `MockWebhookVerificationError`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (4 nodes): `MainApplication`, `.onConfigurationChanged()`, `.onCreate()`, `MainApplication.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (4 nodes): `jsonContent()`, `jsonContentRequired()`, `json-content-required.ts`, `json-content.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (4 nodes): `joinWaitlist()`, `WaitlistForm.tsx`, `convex.ts`, `onSubmit()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (3 nodes): `record.tsx`, `record.tsx`, `close()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (3 nodes): `testimonial.tsx`, `testimonial.tsx`, `Rule()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (3 nodes): `fillDefaultsIfWelcome()`, `pick()`, `auth.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (3 nodes): `rating-prompt.tsx`, `rate()`, `requestStoreReview()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (3 nodes): `ExportWidgets0`, `index.swift`, `WidgetBundle`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 71`** (3 nodes): `widget-derive.test.ts`, `iso()`, `makeSnapshot()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (3 nodes): `hashDateKey()`, `pickDailyAyah()`, `daily-ayah.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (3 nodes): `send-otp.ts`, `buildOTPEmail()`, `sendOTPEmail()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (3 nodes): `BootReceiver`, `.onReceive()`, `BootReceiver.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 106`** (2 nodes): `StreakWidgetProvider.kt`, `StreakWidgetProvider`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 107`** (2 nodes): `SalahArcWidgetProvider.kt`, `SalahArcWidgetProvider`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 108`** (2 nodes): `LockComplicationsProvider`, `LockComplicationsProvider.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 109`** (2 nodes): `DhikrWidgetProvider`, `DhikrWidgetProvider.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 125`** (2 nodes): `ExpoAppBlockerConfig`, `ExpoAppBlockerConfig.swift`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `parse()` connect `Community 8` to `Community 2`, `Community 4`, `Community 5`, `Community 12`, `Community 13`, `Community 21`, `Community 31`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Why does `from()` connect `Community 1` to `Community 2`, `Community 5`, `Community 6`, `Community 9`, `Community 13`, `Community 15`, `Community 16`, `Community 18`, `Community 25`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `parseResponseJson()` connect `Community 5` to `Community 8`, `Community 6`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Are the 40 inferred relationships involving `from()` (e.g. with `WelcomeIllust()` and `LockPreviewScreen()`) actually correct?**
  _`from()` has 40 INFERRED edges - model-reasoned connections that need verification._
- **Are the 36 inferred relationships involving `createDatabase()` (e.g. with `handleScheduled()` and `getToday()`) actually correct?**
  _`createDatabase()` has 36 INFERRED edges - model-reasoned connections that need verification._
- **Are the 24 inferred relationships involving `run()` (e.g. with `applyMigrations()` and `applyMigrations()`) actually correct?**
  _`run()` has 24 INFERRED edges - model-reasoned connections that need verification._
- **What connects `app`, `category`, `webDomain` to the rest of the system?**
  _62 weakly-connected nodes found - possible documentation gaps or missing edges._