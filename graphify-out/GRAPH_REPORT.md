# Graph Report - heybarakah_app  (2026-05-30)

## Corpus Check
- 350 files · ~178,655 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1269 nodes · 1642 edges · 59 communities detected
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 253 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 115|Community 115]]

## God Nodes (most connected - your core abstractions)
1. `ExpoAppBlockerModule` - 30 edges
2. `AppBlockerPrefs` - 25 edges
3. `resolve()` - 17 edges
4. `Color` - 14 edges
5. `FamilyActivityPickerView` - 13 edges
6. `AppBlockerDeviceActivityMonitor` - 12 edges
7. `AI Search Crawlers` - 12 edges
8. `Eyebrow` - 11 edges
9. `Direction` - 11 edges
10. `OverlayManager` - 11 edges

## Surprising Connections (you probably didn't know these)
- `peekPendingDhikr()` --calls--> `resolve()`  [INFERRED]
  packages/app/lib/widgets-native.ts → modules/expo-app-blocker/plugin/src/index.js
- `ackPendingDhikr()` --calls--> `resolve()`  [INFERRED]
  packages/app/lib/widgets-native.ts → modules/expo-app-blocker/plugin/src/index.js
- `endLockActivity()` --calls--> `resolve()`  [INFERRED]
  packages/app/lib/widgets-native.ts → modules/expo-app-blocker/plugin/src/index.js
- `endAllLockActivities()` --calls--> `resolve()`  [INFERRED]
  packages/app/lib/widgets-native.ts → modules/expo-app-blocker/plugin/src/index.js
- `getPermissionStatus()` --calls--> `resolve()`  [INFERRED]
  packages/app/lib/app-blocker.ts → modules/expo-app-blocker/plugin/src/index.js

## Hyperedges (group relationships)
- **App Widget Delivery Pattern** — app_widgets_ios_18, app_barakah_widgets_extension, app_expo_widget_bridge_module, app_widget_surfaces, app_shared_app_group_snapshot [EXTRACTED 1.00]
- **Early Access Pricing Plan Structure** — pricing_barakah_app, pricing_free_plan, pricing_lifetime_early_access_plan, pricing_polar_checkout [EXTRACTED 1.00]
- **AI Search Visibility Pattern** — robots_barakah_robots_txt, robots_ai_search_crawlers, robots_ai_citation_rationale, robots_sitemap [EXTRACTED 1.00]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (40): AyahView, AyahWidget, PlayGlyph, Celestial, nowMinutes(), SkyTone, Stop, BeadRing (+32 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (29): ActivityAttributes, AppIntentTimelineProvider, Codable, Hashable, BarakahLockAttributes, ContentState, LockActivityController, LockActivityError (+21 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (18): AppBlockerService, Equatable, BlockConfig, BlockedItemInfo, BlockedItemRendering, ExpoAppBlockerModule, ScheduleInfo, async() (+10 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (37): buildAlAdhanQuery(), createAlAdhanCalendarUrl(), fetchAlAdhanCalendarByCoordinates(), fetchAlAdhanTimingsByCoordinates(), normalizeAlAdhanCalendarResponse(), normalizeAlAdhanDay(), parseAlAdhanDateToDateKey(), parseResponseJson() (+29 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (40): cancelDailyAyahNotification(), forbiddenRanges(), isInRanges(), loadStored(), parseHHmm(), pickRandomMinute(), saveStored(), scheduleDailyAyahNotification() (+32 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (31): handleClose(), enumerateDates(), isInSacredMonth(), addDays(), bool(), buildDateMap(), buildOnTimeDateMap(), codesOfTier() (+23 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (23): getInstalledApps(), getPermissionStatus(), presentFamilyActivityPicker(), relockApps(), removeBlockedItem(), requestPermissions(), setBlockConfiguration(), temporaryUnlock() (+15 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (12): WelcomeIllust(), countComebacks(), formatCountdown(), formatHM(), PrayerCatalog, PrayerInfo, PrayerState, RailPoint (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.05
Nodes (37): API Package, Cloudflare Worker, API Deploy Workflow, API Development Workflow, Android Emulator, Authenticated User Snapshot Flow, BarakahWidgets Extension, create-expo-app (+29 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (23): confirmDelete(), go(), handleLogout(), openMail(), openSettings(), openUrl(), performLogout(), configureRevenueCatAnonymous() (+15 more)

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (14): DiscountPaywall(), Index(), LockPreview(), LoggingOut(), Promise(), SubscriptionProvider(), useSubscription(), readMirror() (+6 more)

### Community 11 - "Community 11"
Cohesion: 0.08
Nodes (8): getPermissionStatus(), requestPermissions(), startMonitoring(), stopMonitoring(), temporaryUnlock(), close(), onMarkPrayed(), onUnlockFiveMin()

### Community 12 - "Community 12"
Cohesion: 0.1
Nodes (11): BlockedAppsContentView, BlockedAppsView, BlockedAppsViewModel, ExpoAppBlockerPickerModule, FamilyActivityPickerNativeView, FamilyActivityPickerViewModel, InlinePickerContentView, ExpoView (+3 more)

### Community 13 - "Community 13"
Cohesion: 0.08
Nodes (2): AppBlockerPrefs, configureAndroid()

### Community 14 - "Community 14"
Cohesion: 0.1
Nodes (11): AchievementCard(), tierAccent(), AnimatedSplash(), SettingsLayout(), ParallaxScrollView(), ThemeProvider(), useTheme(), ThemedText() (+3 more)

### Community 15 - "Community 15"
Cohesion: 0.14
Nodes (7): AppDelegate, ReactNativeDelegate, ExpoAppDelegate, ExpoReactNativeFactoryDelegate, url(), ShieldActionDelegate, ShieldActionExtension

### Community 16 - "Community 16"
Cohesion: 0.17
Nodes (8): DeviceActivityMonitor, AppBlockerDeviceActivityMonitor, MonitorBlockConfig, MonitorBlockedItemInfo, MonitorBlockedItemType, app, category, webDomain

### Community 17 - "Community 17"
Cohesion: 0.19
Nodes (17): AppEnum, AyahConfigIntent, AyahWidgetStyle, dawn, night, DhikrConfigIntent, DirectionProviding, SalahArcConfigIntent (+9 more)

### Community 18 - "Community 18"
Cohesion: 0.12
Nodes (18): Contact Information, https://heybarakah.app, Allow AI Search Crawlers so Barakah Can Be Cited, AI Search Crawlers, anthropic-ai, Applebot-Extended, Barakah robots.txt, CCBot (+10 more)

### Community 19 - "Community 19"
Cohesion: 0.21
Nodes (11): log(), createResetPlan(), isProductionDeployment(), listComponents(), listTables(), main(), parseConvexComponentNames(), parseConvexDataTables() (+3 more)

### Community 20 - "Community 20"
Cohesion: 0.17
Nodes (10): CaseIterable, Direction, arch, bold, celestial, dawn, editorial, night (+2 more)

### Community 21 - "Community 21"
Cohesion: 0.18
Nodes (7): addFromGps(), allow(), skip(), getCurrentLocation(), requestLocationPermission(), requestNotificationPermission(), reverseGeocodeLocation()

### Community 22 - "Community 22"
Cohesion: 0.15
Nodes (14): Barakah App, Prayer Times, Adhan, Qibla, and Core Prayer Lock, Family Sharing, Free Plan, All Future Updates, Lifetime Early Access Plan, $39.99 USD One-Time Price, iOS and Android Coming Soon (+6 more)

### Community 23 - "Community 23"
Cohesion: 0.28
Nodes (11): AppScaffold(), AreaChart(), DhikrScreen(), HomeScreen(), LockedScreen(), PermissionRow(), PrayerMatrix(), PrayerRow() (+3 more)

### Community 24 - "Community 24"
Cohesion: 0.39
Nodes (9): activePrayerNow(), fmt12(), fmtRangeTime(), formatDateLine(), formatHijri(), pad(), todayKey(), useCountdown() (+1 more)

### Community 25 - "Community 25"
Cohesion: 0.17
Nodes (1): OverlayManager

### Community 26 - "Community 26"
Cohesion: 0.33
Nodes (8): applyHighLatitudeRule(), applyPolarCircleResolution(), applyTune(), calculateAdhanJsPrayerDays(), formatHijriDate(), getAdhanJsCalculationParameters(), isAdhanJsSupportedMethod(), pad2()

### Community 28 - "Community 28"
Cohesion: 0.36
Nodes (7): isFiniteNumber(), isValidEntry(), isValidLocation(), isValidTimingsArray(), pruneOldest(), readPrayerStorage(), writePrayerEntry()

### Community 30 - "Community 30"
Cohesion: 0.54
Nodes (5): formatToday(), nextPrayerIndex(), nextPrayerIndexFor(), parseMinutes(), toPrayerRows()

### Community 31 - "Community 31"
Cohesion: 0.57
Nodes (4): addDays(), dateKey(), mondayOf(), pad2()

### Community 32 - "Community 32"
Cohesion: 0.38
Nodes (3): localToday(), pad2(), utcToday()

### Community 33 - "Community 33"
Cohesion: 0.6
Nodes (5): booleanField(), parseRevenueCatEntitlementPayload(), parseRevenueCatPeriodType(), parseRevenueCatStore(), stringField()

### Community 34 - "Community 34"
Cohesion: 0.53
Nodes (3): setPlan(), start(), tryRealPurchase()

### Community 35 - "Community 35"
Cohesion: 0.33
Nodes (3): LockNowWidgetBundle, WidgetBundle, BarakahWidgetBundle

### Community 36 - "Community 36"
Cohesion: 0.33
Nodes (1): MainActivity

### Community 38 - "Community 38"
Cohesion: 0.4
Nodes (3): formatMoney(), purchaseEmail(), renderPurchaseEmail()

### Community 39 - "Community 39"
Cohesion: 0.6
Nodes (3): DhikrLayout(), DhikrProvider(), useDhikr()

### Community 41 - "Community 41"
Cohesion: 0.6
Nodes (3): requestOtp(), resendCode(), sendCode()

### Community 42 - "Community 42"
Cohesion: 0.4
Nodes (2): ControlWidget, LockNowControl

### Community 43 - "Community 43"
Cohesion: 0.4
Nodes (5): CloudflareBindings, Cloudflare Wrangler Commands Documentation, Hono App, Synchronize Worker Configuration Types, Wrangler Type Generation

### Community 44 - "Community 44"
Cohesion: 0.83
Nodes (3): AchievementsScreen(), palette(), UnlockScreen()

### Community 45 - "Community 45"
Cohesion: 0.67
Nodes (2): capitalize(), fmt12()

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
Nodes (2): sumDhikrDaily(), updateDhikrAggregate()

### Community 50 - "Community 50"
Cohesion: 0.5
Nodes (1): MockWebhookVerificationError

### Community 52 - "Community 52"
Cohesion: 0.67
Nodes (2): createPrayerTimesCacheKey(), roundCoordinate()

### Community 53 - "Community 53"
Cohesion: 0.67
Nodes (2): buildRevenueCatSubscriptionDoc(), resolveProductId()

### Community 56 - "Community 56"
Cohesion: 0.5
Nodes (1): MainApplication

### Community 57 - "Community 57"
Cohesion: 0.5
Nodes (2): joinWaitlist(), onSubmit()

### Community 58 - "Community 58"
Cohesion: 0.67
Nodes (1): close()

### Community 59 - "Community 59"
Cohesion: 0.67
Nodes (1): Rule()

### Community 62 - "Community 62"
Cohesion: 1.0
Nodes (2): fillDefaultsIfWelcome(), pick()

### Community 65 - "Community 65"
Cohesion: 1.0
Nodes (2): rate(), requestStoreReview()

### Community 67 - "Community 67"
Cohesion: 0.67
Nodes (1): SamplePayload

### Community 75 - "Community 75"
Cohesion: 1.0
Nodes (2): hashDateKey(), pickDailyAyah()

### Community 77 - "Community 77"
Cohesion: 0.67
Nodes (1): BootReceiver

### Community 115 - "Community 115"
Cohesion: 1.0
Nodes (1): ExpoAppBlockerConfig

## Knowledge Gaps
- **78 isolated node(s):** `app`, `category`, `webDomain`, `editorial`, `bold` (+73 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 13`** (26 nodes): `AppBlockerPrefs`, `.getBlockedPackages()`, `.getNotificationText()`, `.getNotificationTitle()`, `.getOverlayBackgroundColor()`, `.getOverlayFloat()`, `.getOverlayIconBottomMargin()`, `.getOverlayIconSize()`, `.getOverlayPadding()`, `.getOverlayShowSpinner()`, `.getOverlaySpinnerColor()`, `.getOverlaySpinnerSize()`, `.getOverlaySpinnerTopMargin()`, `.getOverlayText()`, `.getOverlayTextColor()`, `.getOverlayTextFontSize()`, `.getOverlayTitle()`, `.getOverlayTitleBold()`, `.getOverlayTitleBottomMargin()`, `.getOverlayTitleColor()`, `.getOverlayTitleFontSize()`, `.putNullableFloat()`, `.setAndroidConfig()`, `.setBlockedPackages()`, `configureAndroid()`, `AppBlockerPrefs.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (12 nodes): `OverlayManager.kt`, `OverlayManager`, `.bringAppToFront()`, `.buildLayoutParams()`, `.buildOverlayView()`, `.getAppScheme()`, `.hide()`, `.navigateToApp()`, `.parseColorOrDefault()`, `.parseColorOrNull()`, `.resolveAppName()`, `.show()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (6 nodes): `MainActivity`, `.createReactActivityDelegate()`, `.getMainComponentName()`, `.invokeDefaultOnBackPressed()`, `.onCreate()`, `MainActivity.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (5 nodes): `ControlWidget`, `LockNowControl`, `LockNowControl.swift`, `LockNowControl.swift`, `LockNowControl.swift`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (4 nodes): `locked.tsx`, `locked.tsx`, `capitalize()`, `fmt12()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (4 nodes): `stats.tsx`, `stats.tsx`, `stats.tsx`, `randInt()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (4 nodes): `onLayout()`, `area-chart.tsx`, `area-chart.tsx`, `area-chart.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (4 nodes): `prayer-matrix.tsx`, `prayer-matrix.tsx`, `prayer-matrix.tsx`, `cellStyle()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (4 nodes): `isValidDateKey()`, `sumDhikrDaily()`, `updateDhikrAggregate()`, `dhikr.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (4 nodes): `webhook.test.ts`, `mockValidate()`, `MockWebhookVerificationError`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (4 nodes): `createPrayerTimesCacheKey()`, `createUserPrayerTimesCacheKey()`, `roundCoordinate()`, `cache-key.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (4 nodes): `buildRevenueCatSubscriptionDoc()`, `resolveProductId()`, `shouldSkipRcSync()`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (4 nodes): `MainApplication`, `.onConfigurationChanged()`, `.onCreate()`, `MainApplication.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (4 nodes): `joinWaitlist()`, `WaitlistForm.tsx`, `convex.ts`, `onSubmit()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (3 nodes): `record.tsx`, `record.tsx`, `close()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (3 nodes): `testimonial.tsx`, `testimonial.tsx`, `Rule()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (3 nodes): `fillDefaultsIfWelcome()`, `pick()`, `auth.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (3 nodes): `rating-prompt.tsx`, `rate()`, `requestStoreReview()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (3 nodes): `SamplePayload.swift`, `SamplePayload.swift`, `SamplePayload`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (3 nodes): `hashDateKey()`, `pickDailyAyah()`, `daily-ayah.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (3 nodes): `BootReceiver`, `.onReceive()`, `BootReceiver.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 115`** (2 nodes): `ExpoAppBlockerConfig`, `ExpoAppBlockerConfig.swift`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dateSeed()` connect `Community 4` to `Community 3`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Are the 10 inferred relationships involving `String` (e.g. with `fetchAndNormalize()` and `sendEmail()`) actually correct?**
  _`String` has 10 INFERRED edges - model-reasoned connections that need verification._
- **Are the 15 inferred relationships involving `resolve()` (e.g. with `reloadTimelines()` and `peekPendingDhikr()`) actually correct?**
  _`resolve()` has 15 INFERRED edges - model-reasoned connections that need verification._
- **What connects `app`, `category`, `webDomain` to the rest of the system?**
  _78 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._