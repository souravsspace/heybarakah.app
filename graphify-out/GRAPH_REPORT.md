# Graph Report - heybarakah_app  (2026-06-15)

## Corpus Check
- 523 files · ~298,656 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1755 nodes · 2231 edges · 88 communities detected
- Extraction: 78% EXTRACTED · 22% INFERRED · 0% AMBIGUOUS · INFERRED: 497 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 117|Community 117]]

## God Nodes (most connected - your core abstractions)
1. `createDatabase()` - 39 edges
2. `ExpoAppBlockerModule` - 35 edges
3. `useOnboardingNav()` - 29 edges
4. `useOnboardingState()` - 26 edges
5. `AppBlockerPrefs` - 25 edges
6. `requireUser()` - 24 edges
7. `useTheme()` - 23 edges
8. `hapticSelection()` - 22 edges
9. `parse()` - 19 edges
10. `useUser()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Auth()` --calls--> `useGoogleAuth()`  [INFERRED]
  design/project/_ds_bundle.js → packages/app/lib/oauth/use-google-auth.ts
- `Auth()` --calls--> `useAppleAuth()`  [INFERRED]
  design/project/_ds_bundle.js → packages/app/lib/oauth/use-apple-auth.ts
- `EmailOtp()` --calls--> `verify()`  [INFERRED]
  design/project/_ds_bundle.js → packages/app/app/(account)/email-otp.tsx
- `fmt12()` --calls--> `pad2()`  [INFERRED]
  design/project/_ds_bundle.js → packages/api/src/routes/prayer-logs/prayer-logs.service.ts
- `Home()` --calls--> `usePrayerTimes()`  [INFERRED]
  design/project/_ds_bundle.js → packages/app/hooks/usePrayerTimes.ts

## Hyperedges (group relationships)
- **App Widget Delivery Pattern** — app_widgets_ios_18, app_barakah_widgets_extension, app_expo_widget_bridge_module, app_widget_surfaces, app_shared_app_group_snapshot [EXTRACTED 1.00]
- **Early Access Pricing Plan Structure** — pricing_barakah_app, pricing_free_plan, pricing_lifetime_early_access_plan, pricing_polar_checkout [EXTRACTED 1.00]
- **AI Search Visibility Pattern** — robots_barakah_robots_txt, robots_ai_search_crawlers, robots_ai_citation_rationale, robots_sitemap [EXTRACTED 1.00]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.01
Nodes (116): AchievementCard(), formatUnlockedDate(), tierAccent(), DevResetOnboarding(), DhikrProvider(), readMap(), useDhikr(), DiscountPaywall() (+108 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (65): formatUnlockedDate(), handleClose(), onPrimary(), tierAccent(), onClose(), onNext(), onViewAll(), listForMe() (+57 more)

### Community 2 - "Community 2"
Cohesion: 0.04
Nodes (32): createMessageObjectSchema(), dateSeed(), Name(), Unlock(), Equatable, BlockConfig, BlockedAppsContentView, BlockedAppsView (+24 more)

### Community 3 - "Community 3"
Cohesion: 0.04
Nodes (60): cancelDailyAyahNotification(), forbiddenRanges(), isInRanges(), loadStored(), parseHHmm(), pickRandomMinute(), saveStored(), scheduleDailyAyahNotification() (+52 more)

### Community 4 - "Community 4"
Cohesion: 0.04
Nodes (42): ForceUpdateGate(), Locations(), ForceUpdateGate(), buildRevenueCatSubscriptionDoc(), resolveProductId(), parseJson(), enqueueMutation(), load() (+34 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (43): applyHighLatitudeRule(), applyPolarCircleResolution(), applyTune(), calculateAdhanJsPrayerDays(), formatHijriDate(), getAdhanJsCalculationParameters(), isAdhanJsSupportedMethod(), pad2() (+35 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (32): fillDefaultsIfWelcome(), pick(), pick(), pickMadhab(), manipulateToWebp(), requestOtp(), resendCode(), sendCode() (+24 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (27): getInstalledApps(), getPermissionStatus(), presentFamilyActivityPicker(), relockApps(), removeBlockedItem(), requestPermissions(), setBlockConfiguration(), temporaryUnlock() (+19 more)

### Community 8 - "Community 8"
Cohesion: 0.04
Nodes (4): AppBlockerPrefs, configureAndroid(), getPermissionStatus(), requestPermissions()

### Community 9 - "Community 9"
Cohesion: 0.06
Nodes (21): authSession(), buildApp(), applyMiddleware(), createApp(), createTestApp(), appWithPing(), createRouter(), idempotency() (+13 more)

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (28): enumerateDates(), isInSacredMonth(), addDays(), bool(), buildDateMap(), buildOnTimeDateMap(), codesOfTier(), completeEval() (+20 more)

### Community 11 - "Community 11"
Cohesion: 0.07
Nodes (12): TabBar(), useColors(), AchievementCard(), AchievementsScreen(), UnlockScreen(), DhikrScreen(), HomeScreen(), LockedScreen() (+4 more)

### Community 12 - "Community 12"
Cohesion: 0.08
Nodes (25): counterProgress(), dhikrTotalForUser(), latestTimezone(), listForMe(), localToday(), pad2(), runEvaluate(), utcToday() (+17 more)

### Community 13 - "Community 13"
Cohesion: 0.05
Nodes (37): API Package, Cloudflare Worker, API Deploy Workflow, API Development Workflow, Android Emulator, Authenticated User Snapshot Flow, BarakahWidgets Extension, create-expo-app (+29 more)

### Community 14 - "Community 14"
Cohesion: 0.1
Nodes (9): close(), temporaryUnlock(), broadcastToUser(), SyncHub, SyncSocket, toWsUrl(), onContinueQuiet(), onMarkPrayed() (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.09
Nodes (20): EmailOtp(), isTruthyFlag(), parseEnv(), buildSocialProviders(), buildTrustedOrigins(), createAuth(), createLogger(), emit() (+12 more)

### Community 16 - "Community 16"
Cohesion: 0.15
Nodes (16): dateSeed(), hashString(), pickDaily(), cancelShieldNotifications(), loadIds(), lockStartAt(), saveIds(), scheduleShieldNotifications() (+8 more)

### Community 17 - "Community 17"
Cohesion: 0.16
Nodes (8): DeviceActivityMonitor, AppBlockerDeviceActivityMonitor, MonitorBlockConfig, MonitorBlockedItemInfo, MonitorBlockedItemType, app, category, webDomain

### Community 18 - "Community 18"
Cohesion: 0.14
Nodes (7): AppDelegate, ReactNativeDelegate, ExpoAppDelegate, ExpoReactNativeFactoryDelegate, url(), ShieldActionDelegate, ShieldActionExtension

### Community 19 - "Community 19"
Cohesion: 0.12
Nodes (18): Contact Information, https://heybarakah.app, Allow AI Search Crawlers so Barakah Can Be Cited, AI Search Crawlers, anthropic-ai, Applebot-Extended, Barakah robots.txt, CCBot (+10 more)

### Community 20 - "Community 20"
Cohesion: 0.13
Nodes (1): AppBlockerService

### Community 21 - "Community 21"
Cohesion: 0.26
Nodes (12): configureRevenueCatAnonymous(), getApiKey(), getCustomerInfo(), getOfferings(), hasRevenueCatApiKey(), isRevenueCatSupported(), linkRevenueCatToUser(), logOutRevenueCat() (+4 more)

### Community 22 - "Community 22"
Cohesion: 0.15
Nodes (14): Barakah App, Prayer Times, Adhan, Qibla, and Core Prayer Lock, Family Sharing, Free Plan, All Future Updates, Lifetime Early Access Plan, $39.99 USD One-Time Price, iOS and Android Coming Soon (+6 more)

### Community 23 - "Community 23"
Cohesion: 0.23
Nodes (8): escapeHtml(), buildPolarSubscriptionWrite(), buildPurchaseEmail(), findSub(), recordPaidOrder(), resolveExistingPolarSub(), buildOTPEmail(), sendOTPEmail()

### Community 24 - "Community 24"
Cohesion: 0.36
Nodes (11): badInput(), create(), getOwned(), getProfile(), listMine(), remove(), rename(), setActive() (+3 more)

### Community 25 - "Community 25"
Cohesion: 0.17
Nodes (1): OverlayManager

### Community 26 - "Community 26"
Cohesion: 0.33
Nodes (9): AchievementsMesh(), DhikrMesh(), LockedMesh(), MeshShell(), ProfileMesh(), ProgressMesh(), RecordMesh(), SplashMesh() (+1 more)

### Community 27 - "Community 27"
Cohesion: 0.22
Nodes (5): DhikrWidget, LockComplications, SalahArcWidget, StreakWidget, Widget

### Community 28 - "Community 28"
Cohesion: 0.36
Nodes (2): ShieldConfigurationDataSource, ShieldConfigurationExtension

### Community 29 - "Community 29"
Cohesion: 0.29
Nodes (4): main(), readDocs(), toInsertSql(), toSqlLiteral()

### Community 30 - "Community 30"
Cohesion: 0.48
Nodes (5): formatToday(), nextPrayerIndex(), nextPrayerIndexFor(), parseMinutes(), toPrayerRows()

### Community 31 - "Community 31"
Cohesion: 0.43
Nodes (4): findMine(), getMine(), setEnabled(), setWindows()

### Community 32 - "Community 32"
Cohesion: 0.4
Nodes (4): buildOTPVerificationEmail(), formatCode(), renderVerifyOtpEmail(), VerifyOtpEmail()

### Community 33 - "Community 33"
Cohesion: 0.33
Nodes (1): MainActivity

### Community 34 - "Community 34"
Cohesion: 0.4
Nodes (2): clearWelcomeCardDrag(), completeWelcomeCardSwipe()

### Community 35 - "Community 35"
Cohesion: 0.4
Nodes (3): formatMoney(), purchaseEmail(), renderPurchaseEmail()

### Community 36 - "Community 36"
Cohesion: 0.6
Nodes (3): KhatamWatermark(), onRestore(), useDifferentAccount()

### Community 37 - "Community 37"
Cohesion: 0.4
Nodes (5): CloudflareBindings, Cloudflare Wrangler Commands Documentation, Hono App, Synchronize Worker Configuration Types, Wrangler Type Generation

### Community 38 - "Community 38"
Cohesion: 0.67
Nodes (2): describe(), resolveState()

### Community 39 - "Community 39"
Cohesion: 0.67
Nodes (2): goToUnlock(), handleResponse()

### Community 40 - "Community 40"
Cohesion: 0.83
Nodes (2): addDays(), mondayOf()

### Community 41 - "Community 41"
Cohesion: 0.67
Nodes (2): quietVerb(), summarizeIosSelection()

### Community 42 - "Community 42"
Cohesion: 0.83
Nodes (2): rate(), requestStoreReview()

### Community 43 - "Community 43"
Cohesion: 0.67
Nodes (2): hero(), ScreenShell()

### Community 44 - "Community 44"
Cohesion: 0.67
Nodes (2): Dot(), DotsLoader()

### Community 45 - "Community 45"
Cohesion: 0.67
Nodes (2): StaggeredPath(), Twinkle()

### Community 46 - "Community 46"
Cohesion: 0.67
Nodes (2): Ripple(), Twinkle()

### Community 47 - "Community 47"
Cohesion: 0.67
Nodes (2): StaggeredPath(), Twinkle()

### Community 48 - "Community 48"
Cohesion: 0.5
Nodes (1): MockWebhookVerificationError

### Community 50 - "Community 50"
Cohesion: 0.5
Nodes (1): MainApplication

### Community 51 - "Community 51"
Cohesion: 0.5
Nodes (2): RealtimeSync(), useRealtimeSync()

### Community 52 - "Community 52"
Cohesion: 0.5
Nodes (2): jsonContent(), jsonContentRequired()

### Community 53 - "Community 53"
Cohesion: 0.67
Nodes (1): onLayout()

### Community 54 - "Community 54"
Cohesion: 0.67
Nodes (1): cellStyle()

### Community 55 - "Community 55"
Cohesion: 0.67
Nodes (1): HapticTab()

### Community 56 - "Community 56"
Cohesion: 0.67
Nodes (1): ModalScreen()

### Community 57 - "Community 57"
Cohesion: 0.67
Nodes (1): IconSymbol()

### Community 58 - "Community 58"
Cohesion: 0.67
Nodes (1): IconSymbol()

### Community 59 - "Community 59"
Cohesion: 0.67
Nodes (1): Button()

### Community 60 - "Community 60"
Cohesion: 0.67
Nodes (1): formatStamp()

### Community 61 - "Community 61"
Cohesion: 0.67
Nodes (1): labelFor()

### Community 62 - "Community 62"
Cohesion: 0.67
Nodes (1): RubElHizb()

### Community 63 - "Community 63"
Cohesion: 0.67
Nodes (1): randInt()

### Community 64 - "Community 64"
Cohesion: 0.67
Nodes (1): QuizScreen()

### Community 65 - "Community 65"
Cohesion: 0.67
Nodes (1): BodyText()

### Community 66 - "Community 66"
Cohesion: 0.67
Nodes (1): ProgressBar()

### Community 67 - "Community 67"
Cohesion: 0.67
Nodes (1): FadeSlideIn()

### Community 68 - "Community 68"
Cohesion: 0.67
Nodes (1): CountUp()

### Community 69 - "Community 69"
Cohesion: 0.67
Nodes (1): Headline()

### Community 70 - "Community 70"
Cohesion: 0.67
Nodes (1): BrandMark()

### Community 71 - "Community 71"
Cohesion: 0.67
Nodes (1): smoothPath()

### Community 72 - "Community 72"
Cohesion: 0.67
Nodes (1): easeInOutCubic()

### Community 73 - "Community 73"
Cohesion: 0.67
Nodes (1): MosqueMinaret()

### Community 74 - "Community 74"
Cohesion: 0.67
Nodes (1): BarakahMark()

### Community 75 - "Community 75"
Cohesion: 0.67
Nodes (1): SuccessCheck()

### Community 76 - "Community 76"
Cohesion: 0.67
Nodes (1): Bead()

### Community 77 - "Community 77"
Cohesion: 0.67
Nodes (1): BreathRing()

### Community 78 - "Community 78"
Cohesion: 0.67
Nodes (1): toggle()

### Community 80 - "Community 80"
Cohesion: 0.67
Nodes (2): ExportWidgets0, WidgetBundle

### Community 82 - "Community 82"
Cohesion: 1.0
Nodes (2): useDhikrIncrement(), useWidgetInteractions()

### Community 83 - "Community 83"
Cohesion: 1.0
Nodes (2): iso(), makeSnapshot()

### Community 84 - "Community 84"
Cohesion: 1.0
Nodes (2): hashDateKey(), pickDailyAyah()

### Community 88 - "Community 88"
Cohesion: 0.67
Nodes (1): BootReceiver

### Community 94 - "Community 94"
Cohesion: 1.0
Nodes (1): StreakWidgetProvider

### Community 95 - "Community 95"
Cohesion: 1.0
Nodes (1): SalahArcWidgetProvider

### Community 96 - "Community 96"
Cohesion: 1.0
Nodes (1): LockComplicationsProvider

### Community 97 - "Community 97"
Cohesion: 1.0
Nodes (1): DhikrWidgetProvider

### Community 117 - "Community 117"
Cohesion: 1.0
Nodes (1): ExpoAppBlockerConfig

## Knowledge Gaps
- **62 isolated node(s):** `app`, `category`, `webDomain`, `StreakWidgetProvider`, `SalahArcWidgetProvider` (+57 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 20`** (15 nodes): `AppBlockerService`, `.buildNotification()`, `.createChannelsIfNeeded()`, `.getAppScheme()`, `.getCurrentForegroundPackage()`, `.handleForegroundChange()`, `.onBind()`, `.onCreate()`, `.onDestroy()`, `.onStartCommand()`, `.showBlockedNotification()`, `run()`, `start()`, `stop()`, `AppBlockerService.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (12 nodes): `OverlayManager.kt`, `OverlayManager`, `.bringAppToFront()`, `.buildLayoutParams()`, `.buildOverlayView()`, `.getAppScheme()`, `.hide()`, `.navigateToApp()`, `.parseColorOrDefault()`, `.parseColorOrNull()`, `.resolveAppName()`, `.show()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (8 nodes): `ShieldConfigurationExtension.swift`, `ShieldConfigurationExtension.swift`, `ShieldConfigurationDataSource`, `ShieldConfigurationExtension`, `.configuration()`, `.getBlockedAppCount()`, `.isTemporarilyUnlocked()`, `.makeConfig()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (6 nodes): `MainActivity`, `.createReactActivityDelegate()`, `.getMainComponentName()`, `.invokeDefaultOnBackPressed()`, `.onCreate()`, `MainActivity.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (6 nodes): `welcome-card-stack.ts`, `clearWelcomeCardDrag()`, `completeWelcomeCardSwipe()`, `createWelcomeCardStackState()`, `startWelcomeCardDrag()`, `startWelcomeCardExit()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (4 nodes): `prayer-source-chip.tsx`, `prayer-source-chip.tsx`, `describe()`, `resolveState()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (4 nodes): `_layout.tsx`, `goToUnlock()`, `handleResponse()`, `_layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (4 nodes): `progress.tsx`, `progress.tsx`, `addDays()`, `mondayOf()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (4 nodes): `locked.tsx`, `quietVerb()`, `summarizeIosSelection()`, `locked.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (4 nodes): `rating-prompt.tsx`, `rating-prompt.tsx`, `rate()`, `requestStoreReview()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (4 nodes): `screen-shell.tsx`, `screen-shell.tsx`, `hero()`, `ScreenShell()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (4 nodes): `dots-loader.tsx`, `Dot()`, `DotsLoader()`, `dots-loader.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (4 nodes): `mosque-podium.tsx`, `StaggeredPath()`, `Twinkle()`, `mosque-podium.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (4 nodes): `mosque-glow.tsx`, `Ripple()`, `Twinkle()`, `mosque-glow.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (4 nodes): `mosque-twin.tsx`, `StaggeredPath()`, `Twinkle()`, `mosque-twin.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (4 nodes): `webhook.test.ts`, `mockValidate()`, `MockWebhookVerificationError`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (4 nodes): `MainApplication`, `.onConfigurationChanged()`, `.onCreate()`, `MainApplication.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (4 nodes): `RealtimeSync()`, `_layout.tsx`, `use-realtime-sync.ts`, `useRealtimeSync()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (4 nodes): `jsonContent()`, `jsonContentRequired()`, `json-content-required.ts`, `json-content.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (3 nodes): `onLayout()`, `area-chart.tsx`, `area-chart.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (3 nodes): `prayer-matrix.tsx`, `prayer-matrix.tsx`, `cellStyle()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (3 nodes): `haptic-tab.tsx`, `HapticTab()`, `haptic-tab.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (3 nodes): `modal.tsx`, `ModalScreen()`, `modal.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (3 nodes): `icon-symbol.ios.tsx`, `IconSymbol()`, `icon-symbol.ios.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (3 nodes): `icon-symbol.tsx`, `IconSymbol()`, `icon-symbol.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (3 nodes): `Button()`, `button.tsx`, `button.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (3 nodes): `formatStamp()`, `achievements.tsx`, `achievements.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (3 nodes): `plan-summary.tsx`, `plan-summary.tsx`, `labelFor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (3 nodes): `hadith.tsx`, `RubElHizb()`, `hadith.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (3 nodes): `stats.tsx`, `stats.tsx`, `randInt()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (3 nodes): `quiz-screen.tsx`, `quiz-screen.tsx`, `QuizScreen()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (3 nodes): `BodyText()`, `body-text.tsx`, `body-text.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (3 nodes): `progress-bar.tsx`, `progress-bar.tsx`, `ProgressBar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (3 nodes): `fade-slide-in.tsx`, `FadeSlideIn()`, `fade-slide-in.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 68`** (3 nodes): `CountUp()`, `count-up.tsx`, `count-up.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 69`** (3 nodes): `headline.tsx`, `Headline()`, `headline.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (3 nodes): `BrandMark()`, `brand-mark.tsx`, `brand-mark.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 71`** (3 nodes): `smoothPath()`, `area-chart.tsx`, `area-chart.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (3 nodes): `hourglass.tsx`, `easeInOutCubic()`, `hourglass.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 73`** (3 nodes): `mosque-minaret.tsx`, `MosqueMinaret()`, `mosque-minaret.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (3 nodes): `BarakahMark()`, `barakah-mark.tsx`, `barakah-mark.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (3 nodes): `success-check.tsx`, `success-check.tsx`, `SuccessCheck()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (3 nodes): `tasbih-row.tsx`, `tasbih-row.tsx`, `Bead()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (3 nodes): `BreathRing()`, `breath-ring.tsx`, `breath-ring.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (3 nodes): `faq-row.tsx`, `toggle()`, `faq-row.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (3 nodes): `ExportWidgets0`, `index.swift`, `WidgetBundle`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (3 nodes): `use-widget-interactions.ts`, `useDhikrIncrement()`, `useWidgetInteractions()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (3 nodes): `widget-derive.test.ts`, `iso()`, `makeSnapshot()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (3 nodes): `hashDateKey()`, `pickDailyAyah()`, `daily-ayah.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 88`** (3 nodes): `BootReceiver`, `.onReceive()`, `BootReceiver.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 94`** (2 nodes): `StreakWidgetProvider.kt`, `StreakWidgetProvider`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 95`** (2 nodes): `SalahArcWidgetProvider.kt`, `SalahArcWidgetProvider`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 96`** (2 nodes): `LockComplicationsProvider`, `LockComplicationsProvider.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 97`** (2 nodes): `DhikrWidgetProvider`, `DhikrWidgetProvider.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 117`** (2 nodes): `ExpoAppBlockerConfig`, `ExpoAppBlockerConfig.swift`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pickImage()` connect `Community 6` to `Community 1`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `AchievementDialog()` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `parse()` connect `Community 4` to `Community 0`, `Community 3`, `Community 5`, `Community 6`, `Community 7`, `Community 12`, `Community 16`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Are the 38 inferred relationships involving `createDatabase()` (e.g. with `handleScheduled()` and `getToday()`) actually correct?**
  _`createDatabase()` has 38 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `useOnboardingNav()` (e.g. with `Calculating()` and `Commit()`) actually correct?**
  _`useOnboardingNav()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 25 inferred relationships involving `useOnboardingState()` (e.g. with `Index()` and `Auth()`) actually correct?**
  _`useOnboardingState()` has 25 INFERRED edges - model-reasoned connections that need verification._
- **What connects `app`, `category`, `webDomain` to the rest of the system?**
  _62 weakly-connected nodes found - possible documentation gaps or missing edges._