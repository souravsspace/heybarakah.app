# Graph Report - heybarakah_app  (2026-08-05)

## Corpus Check
- 503 files · ~187,177 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1520 nodes · 1744 edges · 56 communities detected
- Extraction: 79% EXTRACTED · 21% INFERRED · 0% AMBIGUOUS · INFERRED: 372 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 105|Community 105]]
- [[_COMMUNITY_Community 135|Community 135]]

## God Nodes (most connected - your core abstractions)
1. `createDatabase()` - 41 edges
2. `ExpoAppBlockerModule` - 40 edges
3. `AppBlockerPrefs` - 25 edges
4. `requireUser()` - 24 edges
5. `hapticSelection()` - 21 edges
6. `parse()` - 21 edges
7. `AppBlockerDeviceActivityMonitor` - 15 edges
8. `resolve()` - 13 edges
9. `FamilyActivityPickerView` - 13 edges
10. `SyncSocket` - 12 edges

## Surprising Connections (you probably didn't know these)
- `reloadTimelines()` --calls--> `resolve()`  [INFERRED]
  packages/app/lib/widgets-native.ts → modules/expo-app-blocker/plugin/src/index.js
- `getPermissionStatus()` --calls--> `resolve()`  [INFERRED]
  packages/app/lib/app-blocker.ts → modules/expo-app-blocker/plugin/src/index.js
- `requestPermissions()` --calls--> `resolve()`  [INFERRED]
  packages/app/lib/app-blocker.ts → modules/expo-app-blocker/plugin/src/index.js
- `getInstalledApps()` --calls--> `resolve()`  [INFERRED]
  packages/app/lib/app-blocker.ts → modules/expo-app-blocker/plugin/src/index.js
- `setBlockConfiguration()` --calls--> `resolve()`  [INFERRED]
  packages/app/lib/app-blocker.ts → modules/expo-app-blocker/plugin/src/index.js

## Hyperedges (group relationships)
- **App Widget Delivery Pattern** — app_widgets_ios_18, app_barakah_widgets_extension, app_expo_widget_bridge_module, app_widget_surfaces, app_shared_app_group_snapshot [EXTRACTED 1.00]
- **Early Access Pricing Plan Structure** — pricing_barakah_app, pricing_free_plan, pricing_lifetime_early_access_plan, pricing_polar_checkout [EXTRACTED 1.00]
- **AI Search Visibility Pattern** — robots_barakah_robots_txt, robots_ai_search_crawlers, robots_ai_citation_rationale, robots_sitemap [EXTRACTED 1.00]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.04
Nodes (60): handleClose(), onPrimary(), onClose(), onNext(), listForMe(), listUnseen(), markSeen(), getAppConfig() (+52 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (29): isSnapshot(), readEntitlementSnapshot(), log(), ForceUpdateGate(), parseJson(), enqueueMutation(), load(), persist() (+21 more)

### Community 2 - "Community 2"
Cohesion: 0.04
Nodes (6): AppBlockerPrefs, addPendingUnlockListener(), configureAndroid(), getPermissionStatus(), requestPermissions(), addListener()

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (43): applyHighLatitudeRule(), applyPolarCircleResolution(), applyTune(), calculateAdhanJsPrayerDays(), formatHijriDate(), getAdhanJsCalculationParameters(), isAdhanJsSupportedMethod(), pad2() (+35 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (31): dateKey(), fmtRangeTime(), pad2(), fmt12(), addDays(), buildCounterWrite(), clearPrayer(), findLog() (+23 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (10): Equatable, BlockConfig, BlockedItemInfo, BlockedItemRendering, ExpoAppBlockerModule, ScheduleInfo, async(), Identifiable (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.05
Nodes (25): captureError(), captureEvent(), resetAnalytics(), main(), readDocs(), finish(), createMessageObjectSchema(), BlockedItemType (+17 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (22): authSession(), buildApp(), configureOpenAPI(), appWithDocs(), applyMiddleware(), createApp(), createTestApp(), appWithPing() (+14 more)

### Community 8 - "Community 8"
Cohesion: 0.06
Nodes (21): DevResetOnboarding(), DhikrProvider(), readMap(), useDhikr(), DiscountPaywall(), Index(), RealtimeSync(), LoggingOut() (+13 more)

### Community 9 - "Community 9"
Cohesion: 0.08
Nodes (28): enumerateDates(), isInSacredMonth(), addDays(), bool(), buildDateMap(), buildOnTimeDateMap(), codesOfTier(), completeEval() (+20 more)

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (26): fillDefaultsIfWelcome(), pick(), requestOtp(), resendCode(), sendCode(), verify(), getHapticsEnabled(), hapticNotification() (+18 more)

### Community 11 - "Community 11"
Cohesion: 0.08
Nodes (21): getInstalledApps(), getPermissionStatus(), presentFamilyActivityPicker(), relockApps(), removeBlockedItem(), requestPermissions(), setBlockConfiguration(), temporaryUnlock() (+13 more)

### Community 12 - "Community 12"
Cohesion: 0.08
Nodes (25): counterProgress(), dhikrTotalForUser(), latestTimezone(), listForMe(), localToday(), pad2(), runEvaluate(), utcToday() (+17 more)

### Community 13 - "Community 13"
Cohesion: 0.05
Nodes (37): API Package, Cloudflare Worker, API Deploy Workflow, API Development Workflow, Android Emulator, Authenticated User Snapshot Flow, BarakahWidgets Extension, create-expo-app (+29 more)

### Community 14 - "Community 14"
Cohesion: 0.08
Nodes (24): isTruthyFlag(), parseEnv(), buildRevenueCatSubscriptionDoc(), buildSocialProviders(), buildTrustedOrigins(), createAuth(), randomOtp(), resolveProductId() (+16 more)

### Community 15 - "Community 15"
Cohesion: 0.11
Nodes (8): close(), temporaryUnlock(), broadcastToUser(), SyncHub, SyncSocket, toWsUrl(), onContinueQuiet(), onUnlockFiveMin()

### Community 16 - "Community 16"
Cohesion: 0.13
Nodes (20): cancelDailyAyahNotification(), forbiddenRanges(), isInRanges(), loadStored(), parseHHmm(), pickRandomMinute(), saveStored(), scheduleDailyAyahNotification() (+12 more)

### Community 17 - "Community 17"
Cohesion: 0.11
Nodes (11): BlockedAppsContentView, BlockedAppsView, BlockedAppsViewModel, ExpoAppBlockerPickerModule, FamilyActivityPickerNativeView, FamilyActivityPickerViewModel, InlinePickerContentView, ExpoView (+3 more)

### Community 18 - "Community 18"
Cohesion: 0.17
Nodes (8): DeviceActivityMonitor, AppBlockerDeviceActivityMonitor, MonitorBlockConfig, MonitorBlockedItemInfo, MonitorBlockedItemType, app, category, webDomain

### Community 19 - "Community 19"
Cohesion: 0.14
Nodes (7): AppDelegate, ReactNativeDelegate, ExpoAppDelegate, ExpoReactNativeFactoryDelegate, url(), ShieldActionDelegate, ShieldActionExtension

### Community 20 - "Community 20"
Cohesion: 0.12
Nodes (10): AchievementCard(), tierAccent(), SettingsLayout(), ParallaxScrollView(), ThemeProvider(), useTheme(), ThemedText(), ThemedView() (+2 more)

### Community 21 - "Community 21"
Cohesion: 0.12
Nodes (18): Contact Information, https://heybarakah.app, Allow AI Search Crawlers so Barakah Can Be Cited, AI Search Crawlers, anthropic-ai, Applebot-Extended, Barakah robots.txt, CCBot (+10 more)

### Community 22 - "Community 22"
Cohesion: 0.24
Nodes (12): configureRevenueCatAnonymous(), getApiKey(), getCustomerInfo(), getOfferings(), hasRevenueCatApiKey(), isRevenueCatSupported(), linkRevenueCatToUser(), logOutRevenueCat() (+4 more)

### Community 23 - "Community 23"
Cohesion: 0.13
Nodes (1): AppBlockerService

### Community 24 - "Community 24"
Cohesion: 0.15
Nodes (14): Barakah App, Prayer Times, Adhan, Qibla, and Core Prayer Lock, Family Sharing, Free Plan, All Future Updates, Lifetime Early Access Plan, $39.99 USD One-Time Price, iOS and Android Coming Soon (+6 more)

### Community 25 - "Community 25"
Cohesion: 0.23
Nodes (8): escapeHtml(), buildPolarSubscriptionWrite(), buildPurchaseEmail(), findSub(), recordPaidOrder(), resolveExistingPolarSub(), buildOTPEmail(), sendOTPEmail()

### Community 26 - "Community 26"
Cohesion: 0.36
Nodes (11): badInput(), create(), getOwned(), getProfile(), listMine(), remove(), rename(), setActive() (+3 more)

### Community 27 - "Community 27"
Cohesion: 0.17
Nodes (1): OverlayManager

### Community 28 - "Community 28"
Cohesion: 0.31
Nodes (8): celestialTone(), derivePrayerState(), formatCountdown(), formatHM(), hex(), lerpHex(), parseSnapshotISO(), snapshotISOFor()

### Community 29 - "Community 29"
Cohesion: 0.29
Nodes (7): addFromGps(), allow(), getCurrentLocation(), requestLocationPermission(), requestNotificationPermission(), reverseGeocodeLocation(), withTimeout()

### Community 31 - "Community 31"
Cohesion: 0.36
Nodes (7): isFiniteNumber(), isValidEntry(), isValidLocation(), isValidTimingsArray(), pruneOldest(), readPrayerStorage(), writePrayerEntry()

### Community 32 - "Community 32"
Cohesion: 0.22
Nodes (5): DhikrWidget, LockComplications, SalahArcWidget, StreakWidget, Widget

### Community 33 - "Community 33"
Cohesion: 0.36
Nodes (2): ShieldConfigurationDataSource, ShieldConfigurationExtension

### Community 34 - "Community 34"
Cohesion: 0.36
Nodes (6): useClearMutate(), useClearPrayer(), useLogMutate(), useLogPrayer(), useWeekData(), useWeekLogs()

### Community 35 - "Community 35"
Cohesion: 0.43
Nodes (4): findMine(), getMine(), setEnabled(), setWindows()

### Community 36 - "Community 36"
Cohesion: 0.4
Nodes (4): buildOTPVerificationEmail(), formatCode(), renderVerifyOtpEmail(), VerifyOtpEmail()

### Community 38 - "Community 38"
Cohesion: 0.33
Nodes (1): MainActivity

### Community 39 - "Community 39"
Cohesion: 0.4
Nodes (2): clearWelcomeCardDrag(), completeWelcomeCardSwipe()

### Community 40 - "Community 40"
Cohesion: 0.4
Nodes (3): formatMoney(), purchaseEmail(), renderPurchaseEmail()

### Community 41 - "Community 41"
Cohesion: 0.4
Nodes (5): CloudflareBindings, Cloudflare Wrangler Commands Documentation, Hono App, Synchronize Worker Configuration Types, Wrangler Type Generation

### Community 42 - "Community 42"
Cohesion: 0.5
Nodes (1): MockWebhookVerificationError

### Community 46 - "Community 46"
Cohesion: 0.5
Nodes (1): MainApplication

### Community 47 - "Community 47"
Cohesion: 0.5
Nodes (2): jsonContent(), jsonContentRequired()

### Community 50 - "Community 50"
Cohesion: 1.0
Nodes (2): addDays(), mondayOf()

### Community 51 - "Community 51"
Cohesion: 1.0
Nodes (2): rate(), requestStoreReview()

### Community 52 - "Community 52"
Cohesion: 0.67
Nodes (2): ExportWidgets0, WidgetBundle

### Community 60 - "Community 60"
Cohesion: 1.0
Nodes (2): useDhikrIncrement(), useWidgetInteractions()

### Community 61 - "Community 61"
Cohesion: 1.0
Nodes (2): makeDay(), makeInput()

### Community 62 - "Community 62"
Cohesion: 1.0
Nodes (2): iso(), makeSnapshot()

### Community 63 - "Community 63"
Cohesion: 1.0
Nodes (2): hashDateKey(), pickDailyAyah()

### Community 67 - "Community 67"
Cohesion: 0.67
Nodes (1): BootReceiver

### Community 102 - "Community 102"
Cohesion: 1.0
Nodes (1): StreakWidgetProvider

### Community 103 - "Community 103"
Cohesion: 1.0
Nodes (1): SalahArcWidgetProvider

### Community 104 - "Community 104"
Cohesion: 1.0
Nodes (1): LockComplicationsProvider

### Community 105 - "Community 105"
Cohesion: 1.0
Nodes (1): DhikrWidgetProvider

### Community 135 - "Community 135"
Cohesion: 1.0
Nodes (1): ExpoAppBlockerConfig

## Knowledge Gaps
- **62 isolated node(s):** `app`, `category`, `webDomain`, `StreakWidgetProvider`, `SalahArcWidgetProvider` (+57 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 23`** (15 nodes): `AppBlockerService`, `.buildNotification()`, `.createChannelsIfNeeded()`, `.getAppScheme()`, `.getCurrentForegroundPackage()`, `.handleForegroundChange()`, `.onBind()`, `.onCreate()`, `.onDestroy()`, `.onStartCommand()`, `.showBlockedNotification()`, `run()`, `start()`, `stop()`, `AppBlockerService.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (12 nodes): `OverlayManager.kt`, `OverlayManager`, `.bringAppToFront()`, `.buildLayoutParams()`, `.buildOverlayView()`, `.getAppScheme()`, `.hide()`, `.navigateToApp()`, `.parseColorOrDefault()`, `.parseColorOrNull()`, `.resolveAppName()`, `.show()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (8 nodes): `ShieldConfigurationExtension.swift`, `ShieldConfigurationExtension.swift`, `ShieldConfigurationDataSource`, `ShieldConfigurationExtension`, `.configuration()`, `.getBlockedAppCount()`, `.isTemporarilyUnlocked()`, `.makeConfig()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (6 nodes): `MainActivity`, `.createReactActivityDelegate()`, `.getMainComponentName()`, `.invokeDefaultOnBackPressed()`, `.onCreate()`, `MainActivity.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (6 nodes): `welcome-card-stack.ts`, `clearWelcomeCardDrag()`, `completeWelcomeCardSwipe()`, `createWelcomeCardStackState()`, `startWelcomeCardDrag()`, `startWelcomeCardExit()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (4 nodes): `webhook.test.ts`, `mockValidate()`, `MockWebhookVerificationError`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (4 nodes): `MainApplication`, `.onConfigurationChanged()`, `.onCreate()`, `MainApplication.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (4 nodes): `jsonContent()`, `jsonContentRequired()`, `json-content-required.ts`, `json-content.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (3 nodes): `progress.tsx`, `addDays()`, `mondayOf()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (3 nodes): `rating-prompt.tsx`, `rate()`, `requestStoreReview()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (3 nodes): `ExportWidgets0`, `index.swift`, `WidgetBundle`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (3 nodes): `use-widget-interactions.ts`, `useDhikrIncrement()`, `useWidgetInteractions()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (3 nodes): `widget-snapshot.test.ts`, `makeDay()`, `makeInput()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (3 nodes): `widget-derive.test.ts`, `iso()`, `makeSnapshot()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (3 nodes): `hashDateKey()`, `pickDailyAyah()`, `daily-ayah.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (3 nodes): `BootReceiver`, `.onReceive()`, `BootReceiver.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 102`** (2 nodes): `StreakWidgetProvider.kt`, `StreakWidgetProvider`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 103`** (2 nodes): `SalahArcWidgetProvider.kt`, `SalahArcWidgetProvider`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 104`** (2 nodes): `LockComplicationsProvider`, `LockComplicationsProvider.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 105`** (2 nodes): `DhikrWidgetProvider`, `DhikrWidgetProvider.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 135`** (2 nodes): `ExpoAppBlockerConfig`, `ExpoAppBlockerConfig.swift`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `parse()` connect `Community 1` to `Community 0`, `Community 3`, `Community 8`, `Community 12`, `Community 14`, `Community 16`, `Community 28`, `Community 31`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Why does `pickImage()` connect `Community 0` to `Community 1`, `Community 10`, `Community 3`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `createDatabase()` connect `Community 0` to `Community 6`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Are the 40 inferred relationships involving `createDatabase()` (e.g. with `handleScheduled()` and `getToday()`) actually correct?**
  _`createDatabase()` has 40 INFERRED edges - model-reasoned connections that need verification._
- **Are the 23 inferred relationships involving `requireUser()` (e.g. with `.get()` and `increment()`) actually correct?**
  _`requireUser()` has 23 INFERRED edges - model-reasoned connections that need verification._
- **Are the 20 inferred relationships involving `hapticSelection()` (e.g. with `onTryAgain()` and `pick()`) actually correct?**
  _`hapticSelection()` has 20 INFERRED edges - model-reasoned connections that need verification._
- **What connects `app`, `category`, `webDomain` to the rest of the system?**
  _62 weakly-connected nodes found - possible documentation gaps or missing edges._