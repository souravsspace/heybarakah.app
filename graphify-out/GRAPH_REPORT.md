# Graph Report - heybarakah_app  (2026-06-05)

## Corpus Check
- 326 files · ~176,644 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1133 nodes · 1298 edges · 64 communities detected
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 153 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
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
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 109|Community 109]]
- [[_COMMUNITY_Community 110|Community 110]]
- [[_COMMUNITY_Community 111|Community 111]]
- [[_COMMUNITY_Community 112|Community 112]]
- [[_COMMUNITY_Community 120|Community 120]]

## God Nodes (most connected - your core abstractions)
1. `ExpoAppBlockerModule` - 33 edges
2. `AppBlockerPrefs` - 25 edges
3. `ImageSlot` - 17 edges
4. `resolve()` - 16 edges
5. `parse()` - 15 edges
6. `AppBlockerDeviceActivityMonitor` - 14 edges
7. `FamilyActivityPickerView` - 13 edges
8. `AI Search Crawlers` - 12 edges
9. `OverlayManager` - 11 edges
10. `AppBlockerService` - 11 edges

## Surprising Connections (you probably didn't know these)
- `WelcomeIllust()` --calls--> `from()`  [INFERRED]
  design/ui_kits/app/components.jsx → packages/core/convex/lib/polar.ts
- `LockPreviewScreen()` --calls--> `from()`  [INFERRED]
  design/ui_kits/app/screens.jsx → packages/core/convex/lib/polar.ts
- `close()` --calls--> `toDataUrl()`  [INFERRED]
  packages/app/app/(app)/unlock.tsx → tmp/barakah-marketing/image-slot.js
- `endLockActivity()` --calls--> `resolve()`  [INFERRED]
  packages/app/lib/widgets-native.ts → modules/expo-app-blocker/plugin/src/index.js
- `endAllLockActivities()` --calls--> `resolve()`  [INFERRED]
  packages/app/lib/widgets-native.ts → modules/expo-app-blocker/plugin/src/index.js

## Hyperedges (group relationships)
- **App Widget Delivery Pattern** — app_widgets_ios_18, app_barakah_widgets_extension, app_expo_widget_bridge_module, app_widget_surfaces, app_shared_app_group_snapshot [EXTRACTED 1.00]
- **Early Access Pricing Plan Structure** — pricing_barakah_app, pricing_free_plan, pricing_lifetime_early_access_plan, pricing_polar_checkout [EXTRACTED 1.00]
- **AI Search Visibility Pattern** — robots_barakah_robots_txt, robots_ai_search_crawlers, robots_ai_citation_rationale, robots_sitemap [EXTRACTED 1.00]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (31): handleClose(), enumerateDates(), isInSacredMonth(), addDays(), bool(), buildDateMap(), buildOnTimeDateMap(), codesOfTier() (+23 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (15): applyHighLatitudeRule(), applyPolarCircleResolution(), applyTune(), calculateAdhanJsPrayerDays(), formatHijriDate(), getAdhanJsCalculationParameters(), isAdhanJsSupportedMethod(), pad2() (+7 more)

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (10): Equatable, BlockConfig, BlockedItemInfo, BlockedItemRendering, ExpoAppBlockerModule, ScheduleInfo, async(), Identifiable (+2 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (20): BlockedAppsContentView, BlockedAppsView, BlockedAppsViewModel, BlockedItemType, app, category, webDomain, FamilyActivityPickerView (+12 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (23): dateKey(), fmtRangeTime(), pad2(), useDhikr(), activePrayerNow(), fmt12(), fmtRangeTime(), formatDateLine() (+15 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (19): ForceUpdateGate(), enqueueMutation(), load(), persist(), removeMutation(), useOfflineReplay(), pickImage(), loadShieldSchedule() (+11 more)

### Community 6 - "Community 6"
Cohesion: 0.05
Nodes (37): API Package, Cloudflare Worker, API Deploy Workflow, API Development Workflow, Android Emulator, Authenticated User Snapshot Flow, BarakahWidgets Extension, create-expo-app (+29 more)

### Community 7 - "Community 7"
Cohesion: 0.08
Nodes (20): getInstalledApps(), getPermissionStatus(), presentFamilyActivityPicker(), relockApps(), removeBlockedItem(), requestPermissions(), setBlockConfiguration(), temporaryUnlock() (+12 more)

### Community 8 - "Community 8"
Cohesion: 0.1
Nodes (26): cancelDailyAyahNotification(), forbiddenRanges(), isInRanges(), loadStored(), parseHHmm(), pickRandomMinute(), saveStored(), scheduleDailyAyahNotification() (+18 more)

### Community 9 - "Community 9"
Cohesion: 0.08
Nodes (14): DiscountPaywall(), Index(), LockPreview(), LoggingOut(), Promise(), SubscriptionProvider(), useSubscription(), readMirror() (+6 more)

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (6): getPermissionStatus(), requestPermissions(), temporaryUnlock(), close(), onMarkPrayed(), onUnlockFiveMin()

### Community 11 - "Community 11"
Cohesion: 0.08
Nodes (2): AppBlockerPrefs, configureAndroid()

### Community 12 - "Community 12"
Cohesion: 0.13
Nodes (19): buildAlAdhanQuery(), createAlAdhanCalendarUrl(), fetchAlAdhanCalendarByCoordinates(), fetchAlAdhanTimingsByCoordinates(), normalizeAlAdhanCalendarResponse(), normalizeAlAdhanDay(), parseAlAdhanDateToDateKey(), parseResponseJson() (+11 more)

### Community 13 - "Community 13"
Cohesion: 0.16
Nodes (7): clampS(), getSlot(), ImageSlot, load(), save(), setSlot(), toDataUrl()

### Community 14 - "Community 14"
Cohesion: 0.16
Nodes (8): DeviceActivityMonitor, AppBlockerDeviceActivityMonitor, MonitorBlockConfig, MonitorBlockedItemInfo, MonitorBlockedItemType, app, category, webDomain

### Community 15 - "Community 15"
Cohesion: 0.14
Nodes (7): AppDelegate, ReactNativeDelegate, ExpoAppDelegate, ExpoReactNativeFactoryDelegate, url(), ShieldActionDelegate, ShieldActionExtension

### Community 16 - "Community 16"
Cohesion: 0.12
Nodes (10): AchievementCard(), tierAccent(), SettingsLayout(), ParallaxScrollView(), ThemeProvider(), useTheme(), ThemedText(), ThemedView() (+2 more)

### Community 17 - "Community 17"
Cohesion: 0.12
Nodes (18): Contact Information, https://heybarakah.app, Allow AI Search Crawlers so Barakah Can Be Cited, AI Search Crawlers, anthropic-ai, Applebot-Extended, Barakah robots.txt, CCBot (+10 more)

### Community 18 - "Community 18"
Cohesion: 0.24
Nodes (10): confirmDelete(), go(), handleLogout(), openMail(), openSettings(), openUrl(), manage(), openFamilyHelp() (+2 more)

### Community 19 - "Community 19"
Cohesion: 0.21
Nodes (11): log(), createResetPlan(), isProductionDeployment(), listComponents(), listTables(), main(), parseConvexComponentNames(), parseConvexDataTables() (+3 more)

### Community 20 - "Community 20"
Cohesion: 0.18
Nodes (7): addFromGps(), allow(), skip(), getCurrentLocation(), requestLocationPermission(), requestNotificationPermission(), reverseGeocodeLocation()

### Community 21 - "Community 21"
Cohesion: 0.24
Nodes (12): configureRevenueCatAnonymous(), getApiKey(), getCustomerInfo(), getOfferings(), hasRevenueCatApiKey(), isRevenueCatSupported(), linkRevenueCatToUser(), logOutRevenueCat() (+4 more)

### Community 22 - "Community 22"
Cohesion: 0.13
Nodes (1): AppBlockerService

### Community 23 - "Community 23"
Cohesion: 0.15
Nodes (14): Barakah App, Prayer Times, Adhan, Qibla, and Core Prayer Lock, Family Sharing, Free Plan, All Future Updates, Lifetime Early Access Plan, $39.99 USD One-Time Price, iOS and Android Coming Soon (+6 more)

### Community 24 - "Community 24"
Cohesion: 0.28
Nodes (11): AppScaffold(), AreaChart(), DhikrScreen(), HomeScreen(), LockedScreen(), PermissionRow(), PrayerMatrix(), PrayerRow() (+3 more)

### Community 25 - "Community 25"
Cohesion: 0.17
Nodes (1): OverlayManager

### Community 26 - "Community 26"
Cohesion: 0.22
Nodes (7): buildOTPVerificationEmail(), requireEnv(), sendEmail(), sendOTPVerification(), formatCode(), renderVerifyOtpEmail(), VerifyOtpEmail()

### Community 27 - "Community 27"
Cohesion: 0.31
Nodes (8): celestialTone(), derivePrayerState(), formatCountdown(), formatHM(), hex(), lerpHex(), parseSnapshotISO(), snapshotISOFor()

### Community 29 - "Community 29"
Cohesion: 0.36
Nodes (7): isFiniteNumber(), isValidEntry(), isValidLocation(), isValidTimingsArray(), pruneOldest(), readPrayerStorage(), writePrayerEntry()

### Community 30 - "Community 30"
Cohesion: 0.22
Nodes (5): DhikrWidget, LockComplications, SalahArcWidget, StreakWidget, Widget

### Community 32 - "Community 32"
Cohesion: 0.54
Nodes (5): formatToday(), nextPrayerIndex(), nextPrayerIndexFor(), parseMinutes(), toPrayerRows()

### Community 33 - "Community 33"
Cohesion: 0.36
Nodes (2): ShieldConfigurationDataSource, ShieldConfigurationExtension

### Community 34 - "Community 34"
Cohesion: 0.38
Nodes (3): localToday(), pad2(), utcToday()

### Community 35 - "Community 35"
Cohesion: 0.57
Nodes (4): addDays(), dateKey(), mondayOf(), pad2()

### Community 36 - "Community 36"
Cohesion: 0.53
Nodes (3): setPlan(), start(), tryRealPurchase()

### Community 37 - "Community 37"
Cohesion: 0.4
Nodes (3): formatMoney(), purchaseEmail(), renderPurchaseEmail()

### Community 38 - "Community 38"
Cohesion: 0.33
Nodes (1): MainActivity

### Community 39 - "Community 39"
Cohesion: 0.6
Nodes (3): DhikrLayout(), DhikrProvider(), useDhikr()

### Community 41 - "Community 41"
Cohesion: 0.6
Nodes (3): requestOtp(), resendCode(), sendCode()

### Community 42 - "Community 42"
Cohesion: 0.4
Nodes (5): CloudflareBindings, Cloudflare Wrangler Commands Documentation, Hono App, Synchronize Worker Configuration Types, Wrangler Type Generation

### Community 43 - "Community 43"
Cohesion: 0.83
Nodes (3): AchievementsScreen(), palette(), UnlockScreen()

### Community 44 - "Community 44"
Cohesion: 0.67
Nodes (2): capitalize(), fmt12()

### Community 45 - "Community 45"
Cohesion: 0.5
Nodes (1): randInt()

### Community 46 - "Community 46"
Cohesion: 0.5
Nodes (1): onLayout()

### Community 47 - "Community 47"
Cohesion: 0.5
Nodes (1): cellStyle()

### Community 48 - "Community 48"
Cohesion: 0.67
Nodes (2): sumDhikrDaily(), updateDhikrAggregate()

### Community 49 - "Community 49"
Cohesion: 0.5
Nodes (1): MockWebhookVerificationError

### Community 51 - "Community 51"
Cohesion: 0.67
Nodes (2): createPrayerTimesCacheKey(), roundCoordinate()

### Community 52 - "Community 52"
Cohesion: 0.67
Nodes (2): buildRevenueCatSubscriptionDoc(), resolveProductId()

### Community 54 - "Community 54"
Cohesion: 0.5
Nodes (1): MainApplication

### Community 55 - "Community 55"
Cohesion: 0.5
Nodes (2): joinWaitlist(), onSubmit()

### Community 56 - "Community 56"
Cohesion: 0.67
Nodes (1): close()

### Community 57 - "Community 57"
Cohesion: 0.67
Nodes (1): Rule()

### Community 59 - "Community 59"
Cohesion: 1.0
Nodes (2): fillDefaultsIfWelcome(), pick()

### Community 62 - "Community 62"
Cohesion: 1.0
Nodes (2): rate(), requestStoreReview()

### Community 64 - "Community 64"
Cohesion: 0.67
Nodes (2): ExportWidgets0, WidgetBundle

### Community 73 - "Community 73"
Cohesion: 1.0
Nodes (2): iso(), makeSnapshot()

### Community 74 - "Community 74"
Cohesion: 1.0
Nodes (2): hashDateKey(), pickDailyAyah()

### Community 77 - "Community 77"
Cohesion: 0.67
Nodes (1): BootReceiver

### Community 109 - "Community 109"
Cohesion: 1.0
Nodes (1): StreakWidgetProvider

### Community 110 - "Community 110"
Cohesion: 1.0
Nodes (1): SalahArcWidgetProvider

### Community 111 - "Community 111"
Cohesion: 1.0
Nodes (1): LockComplicationsProvider

### Community 112 - "Community 112"
Cohesion: 1.0
Nodes (1): DhikrWidgetProvider

### Community 120 - "Community 120"
Cohesion: 1.0
Nodes (1): ExpoAppBlockerConfig

## Knowledge Gaps
- **62 isolated node(s):** `app`, `category`, `webDomain`, `StreakWidgetProvider`, `SalahArcWidgetProvider` (+57 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 11`** (26 nodes): `AppBlockerPrefs`, `.getBlockedPackages()`, `.getNotificationText()`, `.getNotificationTitle()`, `.getOverlayBackgroundColor()`, `.getOverlayFloat()`, `.getOverlayIconBottomMargin()`, `.getOverlayIconSize()`, `.getOverlayPadding()`, `.getOverlayShowSpinner()`, `.getOverlaySpinnerColor()`, `.getOverlaySpinnerSize()`, `.getOverlaySpinnerTopMargin()`, `.getOverlayText()`, `.getOverlayTextColor()`, `.getOverlayTextFontSize()`, `.getOverlayTitle()`, `.getOverlayTitleBold()`, `.getOverlayTitleBottomMargin()`, `.getOverlayTitleColor()`, `.getOverlayTitleFontSize()`, `.putNullableFloat()`, `.setAndroidConfig()`, `.setBlockedPackages()`, `configureAndroid()`, `AppBlockerPrefs.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (15 nodes): `AppBlockerService`, `.buildNotification()`, `.createChannelsIfNeeded()`, `.getAppScheme()`, `.getCurrentForegroundPackage()`, `.handleForegroundChange()`, `.onBind()`, `.onCreate()`, `.onDestroy()`, `.onStartCommand()`, `.showBlockedNotification()`, `run()`, `start()`, `stop()`, `AppBlockerService.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (12 nodes): `OverlayManager.kt`, `OverlayManager`, `.bringAppToFront()`, `.buildLayoutParams()`, `.buildOverlayView()`, `.getAppScheme()`, `.hide()`, `.navigateToApp()`, `.parseColorOrDefault()`, `.parseColorOrNull()`, `.resolveAppName()`, `.show()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (8 nodes): `ShieldConfigurationExtension.swift`, `ShieldConfigurationExtension.swift`, `ShieldConfigurationDataSource`, `ShieldConfigurationExtension`, `.configuration()`, `.getBlockedAppCount()`, `.isTemporarilyUnlocked()`, `.makeConfig()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (6 nodes): `MainActivity`, `.createReactActivityDelegate()`, `.getMainComponentName()`, `.invokeDefaultOnBackPressed()`, `.onCreate()`, `MainActivity.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (4 nodes): `locked.tsx`, `locked.tsx`, `capitalize()`, `fmt12()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (4 nodes): `stats.tsx`, `stats.tsx`, `stats.tsx`, `randInt()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (4 nodes): `onLayout()`, `area-chart.tsx`, `area-chart.tsx`, `area-chart.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (4 nodes): `prayer-matrix.tsx`, `prayer-matrix.tsx`, `prayer-matrix.tsx`, `cellStyle()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (4 nodes): `isValidDateKey()`, `sumDhikrDaily()`, `updateDhikrAggregate()`, `dhikr.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (4 nodes): `webhook.test.ts`, `mockValidate()`, `MockWebhookVerificationError`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (4 nodes): `createPrayerTimesCacheKey()`, `createUserPrayerTimesCacheKey()`, `roundCoordinate()`, `cache-key.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (4 nodes): `buildRevenueCatSubscriptionDoc()`, `resolveProductId()`, `shouldSkipRcSync()`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (4 nodes): `MainApplication`, `.onConfigurationChanged()`, `.onCreate()`, `MainApplication.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (4 nodes): `joinWaitlist()`, `WaitlistForm.tsx`, `convex.ts`, `onSubmit()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (3 nodes): `record.tsx`, `record.tsx`, `close()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (3 nodes): `testimonial.tsx`, `testimonial.tsx`, `Rule()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (3 nodes): `fillDefaultsIfWelcome()`, `pick()`, `auth.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (3 nodes): `rating-prompt.tsx`, `rate()`, `requestStoreReview()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (3 nodes): `ExportWidgets0`, `index.swift`, `WidgetBundle`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 73`** (3 nodes): `widget-derive.test.ts`, `iso()`, `makeSnapshot()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (3 nodes): `hashDateKey()`, `pickDailyAyah()`, `daily-ayah.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (3 nodes): `BootReceiver`, `.onReceive()`, `BootReceiver.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 109`** (2 nodes): `StreakWidgetProvider.kt`, `StreakWidgetProvider`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 110`** (2 nodes): `SalahArcWidgetProvider.kt`, `SalahArcWidgetProvider`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 111`** (2 nodes): `LockComplicationsProvider`, `LockComplicationsProvider.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 112`** (2 nodes): `DhikrWidgetProvider`, `DhikrWidgetProvider.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 120`** (2 nodes): `ExpoAppBlockerConfig`, `ExpoAppBlockerConfig.swift`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `parse()` connect `Community 5` to `Community 8`, `Community 9`, `Community 12`, `Community 19`, `Community 27`, `Community 29`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Why does `parseResponseJson()` connect `Community 12` to `Community 0`, `Community 5`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Why does `resolve()` connect `Community 7` to `Community 2`, `Community 3`, `Community 13`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Are the 14 inferred relationships involving `resolve()` (e.g. with `getPermissionStatus()` and `requestPermissions()`) actually correct?**
  _`resolve()` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `parse()` (e.g. with `parseRevenueCatEntitlementPayload()` and `log()`) actually correct?**
  _`parse()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **What connects `app`, `category`, `webDomain` to the rest of the system?**
  _62 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._