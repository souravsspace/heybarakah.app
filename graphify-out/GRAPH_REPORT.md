# Graph Report - heybarakah_app  (2026-05-27)

## Corpus Check
- 634 files · ~237,372 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1950 nodes · 2168 edges · 84 communities detected
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 313 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 105|Community 105]]
- [[_COMMUNITY_Community 108|Community 108]]
- [[_COMMUNITY_Community 109|Community 109]]
- [[_COMMUNITY_Community 110|Community 110]]
- [[_COMMUNITY_Community 112|Community 112]]
- [[_COMMUNITY_Community 113|Community 113]]
- [[_COMMUNITY_Community 115|Community 115]]
- [[_COMMUNITY_Community 116|Community 116]]
- [[_COMMUNITY_Community 117|Community 117]]
- [[_COMMUNITY_Community 120|Community 120]]
- [[_COMMUNITY_Community 121|Community 121]]
- [[_COMMUNITY_Community 162|Community 162]]

## God Nodes (most connected - your core abstractions)
1. `GET()` - 44 edges
2. `POST()` - 34 edges
3. `ExpoAppBlockerModule` - 30 edges
4. `AppBlockerPrefs` - 25 edges
5. `resolve()` - 17 edges
6. `ChatPage` - 14 edges
7. `FamilyActivityPickerView` - 13 edges
8. `log()` - 12 edges
9. `AppBlockerDeviceActivityMonitor` - 12 edges
10. `DELETE()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `applyPrayerCounterDelta()` --calls--> `PATCH()`  [INFERRED]
  packages/core/convex/lib/prayerLogs.ts → tmp/expo-ai-chatbot-lite/ai-chatbot--3.1.0/app/(chat)/api/vote/route.ts
- `notFound` --calls--> `Page()`  [INFERRED]
  modules/expo-widget-bridge/ios/LockActivityController.swift → tmp/expo-ai-chatbot-lite/ai-chatbot--3.1.0/app/(auth)/register/page.tsx
- `buildDateMap()` --calls--> `GET()`  [INFERRED]
  packages/core/src/achievements/evaluate.ts → tmp/expo-ai-chatbot-lite/ai-chatbot--3.1.0/app/(chat)/api/suggestions/route.ts
- `buildOnTimeDateMap()` --calls--> `GET()`  [INFERRED]
  packages/core/src/achievements/evaluate.ts → tmp/expo-ai-chatbot-lite/ai-chatbot--3.1.0/app/(chat)/api/suggestions/route.ts
- `ramadanCompleteStrict()` --calls--> `GET()`  [INFERRED]
  packages/core/src/achievements/evaluate.ts → tmp/expo-ai-chatbot-lite/ai-chatbot--3.1.0/app/(chat)/api/suggestions/route.ts

## Hyperedges (group relationships)
- **App Widget Delivery Pattern** — app_widgets_ios_18, app_barakah_widgets_extension, app_expo_widget_bridge_module, app_widget_surfaces, app_shared_app_group_snapshot [EXTRACTED 1.00]
- **Early Access Pricing Plan Structure** — pricing_barakah_app, pricing_free_plan, pricing_lifetime_early_access_plan, pricing_polar_checkout [EXTRACTED 1.00]
- **AI Search Visibility Pattern** — robots_barakah_robots_txt, robots_ai_search_crawlers, robots_ai_citation_rationale, robots_sitemap [EXTRACTED 1.00]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (59): deleteTrailingMessages(), generateTitleFromUserMessage(), getSuggestions(), login(), register(), updateChatVisibility(), fetchApi(), getChatById() (+51 more)

### Community 1 - "Community 1"
Cohesion: 0.03
Nodes (48): AyahView, AyahWidget, areEqual(), PureCodeEditor(), handleTransaction(), headingRule(), DhikrView, DhikrWidget (+40 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (19): AppBlockerService, start(), Equatable, BlockConfig, BlockedItemInfo, BlockedItemRendering, ExpoAppBlockerModule, ScheduleInfo (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.04
Nodes (12): AppBlockerPrefs, configureAndroid(), getPermissionStatus(), requestPermissions(), startMonitoring(), stopMonitoring(), temporaryUnlock(), close() (+4 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (26): ActivityAttributes, Codable, Hashable, BarakahLockAttributes, ContentState, LockActivityController, LockActivityError, activityKitDisabled (+18 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (32): handleClose(), enumerateDates(), isInSacredMonth(), addDays(), bool(), buildDateMap(), buildOnTimeDateMap(), codesOfTier() (+24 more)

### Community 6 - "Community 6"
Cohesion: 0.04
Nodes (4): handleKeyDown(), PromptInputSubmit(), useOptionalProviderAttachments(), usePromptInputAttachments()

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (23): getInstalledApps(), getPermissionStatus(), presentFamilyActivityPicker(), relockApps(), removeBlockedItem(), requestPermissions(), setBlockConfiguration(), temporaryUnlock() (+15 more)

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (24): Index(), LoggingOut(), SubscriptionProvider(), useSubscription(), readMirror(), storageKeyFor(), useLocations(), writeMirror() (+16 more)

### Community 9 - "Community 9"
Cohesion: 0.07
Nodes (19): createDocument(), BlockedItemType, app, category, webDomain, FamilyActivityPickerView, generateImage(), dismiss() (+11 more)

### Community 10 - "Community 10"
Cohesion: 0.06
Nodes (5): BotIcon(), GPSIcon(), HomeIcon(), InvoiceIcon(), LogoOpenAI()

### Community 11 - "Community 11"
Cohesion: 0.09
Nodes (31): cancelDailyAyahNotification(), dateKey(), forbiddenRanges(), isInRanges(), loadStored(), pad2(), parseHHmm(), pickRandomMinute() (+23 more)

### Community 12 - "Community 12"
Cohesion: 0.06
Nodes (16): PureArtifactCloseButton(), PureBlockCloseButton(), Chat(), DataStreamHandler(), useDataStream(), DocumentPreview(), MessageEditor(), PurePreviewMessage() (+8 more)

### Community 13 - "Community 13"
Cohesion: 0.05
Nodes (37): API Package, Cloudflare Worker, API Deploy Workflow, API Development Workflow, Android Emulator, Authenticated User Snapshot Flow, BarakahWidgets Extension, create-expo-app (+29 more)

### Community 14 - "Community 14"
Cohesion: 0.17
Nodes (28): assertNodeTypeEqual(), computeChildEqualityFactor(), createDiffMark(), createDiffNode(), createNewNode(), createTextNode(), diffEditor(), ensureArray() (+20 more)

### Community 15 - "Community 15"
Cohesion: 0.11
Nodes (17): openMail(), openUrl(), performLogout(), configureRevenueCatAnonymous(), getApiKey(), getCustomerInfo(), getOfferings(), hasRevenueCatApiKey() (+9 more)

### Community 16 - "Community 16"
Cohesion: 0.09
Nodes (14): buildOTPVerificationEmail(), formatMoney(), purchaseEmail(), requireEnv(), renderPurchaseEmail(), ReactRenderer, sendEmail(), sendOTPVerification() (+6 more)

### Community 17 - "Community 17"
Cohesion: 0.1
Nodes (13): AchievementCard(), tierAccent(), AnimatedSplash(), useColorScheme(), SettingsLayout(), ParallaxScrollView(), ThemeProvider(), useTheme() (+5 more)

### Community 18 - "Community 18"
Cohesion: 0.13
Nodes (13): createGuestUser(), cn(), convertToUIMessages(), fetcher(), generateDummyPassword(), generateHashedPassword(), generateUUID(), getDocumentTimestampByIndex() (+5 more)

### Community 19 - "Community 19"
Cohesion: 0.13
Nodes (19): buildAlAdhanQuery(), createAlAdhanCalendarUrl(), fetchAlAdhanCalendarByCoordinates(), fetchAlAdhanTimingsByCoordinates(), normalizeAlAdhanCalendarResponse(), normalizeAlAdhanDay(), parseAlAdhanDateToDateKey(), parseResponseJson() (+11 more)

### Community 20 - "Community 20"
Cohesion: 0.13
Nodes (4): ChatPage, handleFormSubmit(), start(), tryRealPurchase()

### Community 21 - "Community 21"
Cohesion: 0.14
Nodes (7): AppDelegate, ReactNativeDelegate, ExpoAppDelegate, ExpoReactNativeFactoryDelegate, url(), ShieldActionDelegate, ShieldActionExtension

### Community 22 - "Community 22"
Cohesion: 0.17
Nodes (8): DeviceActivityMonitor, AppBlockerDeviceActivityMonitor, MonitorBlockConfig, MonitorBlockedItemInfo, MonitorBlockedItemType, app, category, webDomain

### Community 23 - "Community 23"
Cohesion: 0.11
Nodes (8): handleDeleteAll(), LockPreview(), Promise(), handleDelete(), PureChatItem(), PureChatItem(), useChatVisibility(), useOnboardingNav()

### Community 24 - "Community 24"
Cohesion: 0.12
Nodes (18): Contact Information, https://heybarakah.app, Allow AI Search Crawlers so Barakah Can Be Cited, AI Search Crawlers, anthropic-ai, Applebot-Extended, Barakah robots.txt, CCBot (+10 more)

### Community 25 - "Community 25"
Cohesion: 0.28
Nodes (13): InlineCitation(), InlineCitationCard(), InlineCitationCardBody(), InlineCitationCardTrigger(), InlineCitationCarousel(), InlineCitationCarouselContent(), InlineCitationCarouselHeader(), InlineCitationCarouselIndex() (+5 more)

### Community 27 - "Community 27"
Cohesion: 0.15
Nodes (14): Barakah App, Prayer Times, Adhan, Qibla, and Core Prayer Lock, Family Sharing, Free Plan, All Future Updates, Lifetime Early Access Plan, $39.99 USD One-Time Price, iOS and Android Coming Soon (+6 more)

### Community 29 - "Community 29"
Cohesion: 0.19
Nodes (6): addFromGps(), allow(), getCurrentLocation(), requestLocationPermission(), requestNotificationPermission(), reverseGeocodeLocation()

### Community 30 - "Community 30"
Cohesion: 0.23
Nodes (8): Message(), MessageBranchContent(), MessageBranchNext(), MessageBranchPage(), MessageBranchPrevious(), MessageBranchSelector(), MessageContent(), useMessageBranch()

### Community 31 - "Community 31"
Cohesion: 0.17
Nodes (1): OverlayManager

### Community 32 - "Community 32"
Cohesion: 0.2
Nodes (7): DrawerContent(), groupChatsByDate(), handleSubmit(), SignupScreen(), AuthProvider(), useAsyncState(), useAuth()

### Community 33 - "Community 33"
Cohesion: 0.33
Nodes (10): createResetPlan(), isProductionDeployment(), listComponents(), listTables(), main(), parseConvexComponentNames(), parseConvexDataTables(), parseResetDbArgs() (+2 more)

### Community 34 - "Community 34"
Cohesion: 0.33
Nodes (8): applyHighLatitudeRule(), applyPolarCircleResolution(), applyTune(), calculateAdhanJsPrayerDays(), formatHijriDate(), getAdhanJsCalculationParameters(), isAdhanJsSupportedMethod(), pad2()

### Community 35 - "Community 35"
Cohesion: 0.27
Nodes (4): fmt12(), fmtRangeTime(), pad(), todayKey()

### Community 37 - "Community 37"
Cohesion: 0.36
Nodes (7): isFiniteNumber(), isValidEntry(), isValidLocation(), isValidTimingsArray(), pruneOldest(), readPrayerStorage(), writePrayerEntry()

### Community 38 - "Community 38"
Cohesion: 0.22
Nodes (4): AppSidebar(), cn(), SidebarToggle(), useSidebar()

### Community 39 - "Community 39"
Cohesion: 0.24
Nodes (3): PlanDescription(), PlanTitle(), usePlan()

### Community 42 - "Community 42"
Cohesion: 0.29
Nodes (3): adjustHeight(), handleInput(), uploadFile()

### Community 43 - "Community 43"
Cohesion: 0.43
Nodes (6): BranchMessages(), BranchNext(), BranchPage(), BranchPrevious(), BranchSelector(), useBranch()

### Community 44 - "Community 44"
Cohesion: 0.39
Nodes (5): ConfirmationAccepted(), ConfirmationActions(), ConfirmationRejected(), ConfirmationRequest(), useConfirmation()

### Community 46 - "Community 46"
Cohesion: 0.38
Nodes (3): localToday(), pad2(), utcToday()

### Community 47 - "Community 47"
Cohesion: 0.29
Nodes (1): MainApplication

### Community 48 - "Community 48"
Cohesion: 0.29
Nodes (3): Action(), joinWaitlist(), onSubmit()

### Community 51 - "Community 51"
Cohesion: 0.33
Nodes (2): handleResize(), n()

### Community 52 - "Community 52"
Cohesion: 0.48
Nodes (5): Task(), TaskContent(), TaskItem(), TaskItemFile(), TaskTrigger()

### Community 53 - "Community 53"
Cohesion: 0.52
Nodes (5): useWebPreview(), WebPreview(), WebPreviewNavigation(), WebPreviewNavigationButton(), WebPreviewUrl()

### Community 57 - "Community 57"
Cohesion: 0.6
Nodes (5): booleanField(), parseRevenueCatEntitlementPayload(), parseRevenueCatPeriodType(), parseRevenueCatStore(), stringField()

### Community 59 - "Community 59"
Cohesion: 0.33
Nodes (2): handleAttachmentSelect(), pickImage()

### Community 60 - "Community 60"
Cohesion: 0.33
Nodes (1): MainActivity

### Community 61 - "Community 61"
Cohesion: 0.4
Nodes (2): clearWelcomeCardDrag(), completeWelcomeCardSwipe()

### Community 62 - "Community 62"
Cohesion: 0.6
Nodes (5): calculateQuery(), iterateQuery(), queryResolver(), useMediaQueries(), useMediaQuery()

### Community 64 - "Community 64"
Cohesion: 0.6
Nodes (3): requestOtp(), resendCode(), sendCode()

### Community 65 - "Community 65"
Cohesion: 0.6
Nodes (4): addDays(), dateKey(), mondayOf(), pad2()

### Community 66 - "Community 66"
Cohesion: 0.6
Nodes (3): cancelCloseTimer(), handleSelect(), startCloseTimer()

### Community 67 - "Community 67"
Cohesion: 0.5
Nodes (3): getRequestPromptFromHints(), systemPrompt(), updateDocumentPrompt()

### Community 68 - "Community 68"
Cohesion: 0.5
Nodes (2): Conversation(), ConversationContent()

### Community 69 - "Community 69"
Cohesion: 0.4
Nodes (1): CodeBlockCopyButton()

### Community 70 - "Community 70"
Cohesion: 0.4
Nodes (2): useMessages(), useScrollToBottom()

### Community 71 - "Community 71"
Cohesion: 0.6
Nodes (3): ChatSDKError, getMessageByErrorCode(), getStatusCodeByType()

### Community 73 - "Community 73"
Cohesion: 0.4
Nodes (5): CloudflareBindings, Cloudflare Wrangler Commands Documentation, Hono App, Synchronize Worker Configuration Types, Wrangler Type Generation

### Community 74 - "Community 74"
Cohesion: 0.5
Nodes (1): MockWebhookVerificationError

### Community 76 - "Community 76"
Cohesion: 0.67
Nodes (2): createPrayerTimesCacheKey(), roundCoordinate()

### Community 77 - "Community 77"
Cohesion: 0.67
Nodes (2): buildRevenueCatSubscriptionDoc(), resolveProductId()

### Community 79 - "Community 79"
Cohesion: 0.67
Nodes (2): getWeather(), getWeatherCondition()

### Community 80 - "Community 80"
Cohesion: 0.5
Nodes (1): useReasoning()

### Community 81 - "Community 81"
Cohesion: 0.67
Nodes (2): Loader(), LoaderIcon()

### Community 85 - "Community 85"
Cohesion: 0.67
Nodes (2): getEdgeParams(), getHandleCoordsByPosition()

### Community 86 - "Community 86"
Cohesion: 0.67
Nodes (2): Suggestion(), Suggestions()

### Community 92 - "Community 92"
Cohesion: 0.67
Nodes (2): BarakahWidgetsBundle, WidgetBundle

### Community 93 - "Community 93"
Cohesion: 0.67
Nodes (2): ControlWidget, LockNowControl

### Community 102 - "Community 102"
Cohesion: 1.0
Nodes (2): hashDateKey(), pickDailyAyah()

### Community 104 - "Community 104"
Cohesion: 0.67
Nodes (1): BootReceiver

### Community 105 - "Community 105"
Cohesion: 1.0
Nodes (2): getTextContent(), hasTextContent()

### Community 108 - "Community 108"
Cohesion: 0.67
Nodes (1): RootLayout()

### Community 109 - "Community 109"
Cohesion: 0.67
Nodes (1): ThemeProvider()

### Community 110 - "Community 110"
Cohesion: 0.67
Nodes (1): getActionText()

### Community 112 - "Community 112"
Cohesion: 0.67
Nodes (1): AuthForm()

### Community 113 - "Community 113"
Cohesion: 0.67
Nodes (1): SignOutForm()

### Community 115 - "Community 115"
Cohesion: 0.67
Nodes (1): SubmitButton()

### Community 116 - "Community 116"
Cohesion: 0.67
Nodes (1): Skeleton()

### Community 117 - "Community 117"
Cohesion: 0.67
Nodes (1): useIsMobile()

### Community 120 - "Community 120"
Cohesion: 0.67
Nodes (1): Artifact

### Community 121 - "Community 121"
Cohesion: 1.0
Nodes (2): generateCsv(), handleRowsChange()

### Community 162 - "Community 162"
Cohesion: 1.0
Nodes (1): ExpoAppBlockerConfig

## Knowledge Gaps
- **66 isolated node(s):** `SamplePayload`, `BarakahColor`, `BarakahMetric`, `past`, `upcoming` (+61 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 31`** (12 nodes): `OverlayManager.kt`, `OverlayManager`, `.bringAppToFront()`, `.buildLayoutParams()`, `.buildOverlayView()`, `.getAppScheme()`, `.hide()`, `.navigateToApp()`, `.parseColorOrDefault()`, `.parseColorOrNull()`, `.resolveAppName()`, `.show()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (7 nodes): `getJSMainModuleName()`, `getPackages()`, `getUseDeveloperSupport()`, `MainApplication`, `.onConfigurationChanged()`, `.onCreate()`, `MainApplication.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (7 nodes): `weather.tsx`, `weather.tsx`, `CloudIcon()`, `handleResize()`, `MoonIcon()`, `n()`, `SunIcon()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (6 nodes): `handleAttachmentSelect()`, `personal-details.tsx`, `GradientAvatar()`, `pickImage()`, `save()`, `chat-input.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (6 nodes): `MainActivity`, `.createReactActivityDelegate()`, `.getMainComponentName()`, `.invokeDefaultOnBackPressed()`, `.onCreate()`, `MainActivity.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (6 nodes): `welcome-card-stack.ts`, `clearWelcomeCardDrag()`, `completeWelcomeCardSwipe()`, `createWelcomeCardStackState()`, `startWelcomeCardDrag()`, `startWelcomeCardExit()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 68`** (5 nodes): `Conversation()`, `ConversationContent()`, `ConversationScrollButton()`, `conversation.tsx`, `conversation.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 69`** (5 nodes): `CodeBlock()`, `CodeBlockCopyButton()`, `highlightCode()`, `code-block.tsx`, `code-block.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (5 nodes): `use-messages.tsx`, `use-scroll-to-bottom.tsx`, `use-scroll-to-bottom.ts`, `useMessages()`, `useScrollToBottom()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (4 nodes): `webhook.test.ts`, `mockValidate()`, `MockWebhookVerificationError`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (4 nodes): `createPrayerTimesCacheKey()`, `createUserPrayerTimesCacheKey()`, `roundCoordinate()`, `cache-key.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (4 nodes): `buildRevenueCatSubscriptionDoc()`, `resolveProductId()`, `shouldSkipRcSync()`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (4 nodes): `getWeather()`, `getWeatherCondition()`, `index.ts`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (4 nodes): `defaultGetThinkingMessage()`, `useReasoning()`, `reasoning.tsx`, `reasoning.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (4 nodes): `Loader()`, `LoaderIcon()`, `loader.tsx`, `loader.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (4 nodes): `getEdgeParams()`, `getHandleCoordsByPosition()`, `Temporary()`, `edge.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 86`** (4 nodes): `Suggestion()`, `Suggestions()`, `suggestion.tsx`, `suggestion.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 92`** (3 nodes): `BarakahWidgetsBundle`, `BarakahWidgetsBundle.swift`, `WidgetBundle`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 93`** (3 nodes): `ControlWidget`, `LockNowControl`, `LockNowControl.swift`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 102`** (3 nodes): `hashDateKey()`, `pickDailyAyah()`, `daily-ayah.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 104`** (3 nodes): `BootReceiver`, `.onReceive()`, `BootReceiver.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 105`** (3 nodes): `getTextContent()`, `hasTextContent()`, `chat-interface.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 108`** (3 nodes): `RootLayout()`, `layout.tsx`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 109`** (3 nodes): `ThemeProvider()`, `theme-provider.tsx`, `theme-provider.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 110`** (3 nodes): `getActionText()`, `document.tsx`, `document.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 112`** (3 nodes): `AuthForm()`, `auth-form.tsx`, `auth-form.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 113`** (3 nodes): `SignOutForm()`, `sign-out-form.tsx`, `sign-out-form.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 115`** (3 nodes): `SubmitButton()`, `submit-button.tsx`, `submit-button.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 116`** (3 nodes): `Skeleton()`, `skeleton.tsx`, `skeleton.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 117`** (3 nodes): `use-mobile.ts`, `use-mobile.tsx`, `useIsMobile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 120`** (3 nodes): `Artifact`, `.constructor()`, `create-artifact.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 121`** (3 nodes): `generateCsv()`, `handleRowsChange()`, `sheet-editor.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 162`** (2 nodes): `ExpoAppBlockerConfig`, `ExpoAppBlockerConfig.swift`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `POST()` connect `Community 0` to `Community 9`, `Community 18`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 0` to `Community 32`, `Community 34`, `Community 5`, `Community 19`, `Community 23`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `FamilyActivityPickerView` connect `Community 9` to `Community 1`, `Community 2`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `GET()` (e.g. with `buildDateMap()` and `buildOnTimeDateMap()`) actually correct?**
  _`GET()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 33 inferred relationships involving `Error` (e.g. with `fetchAndNormalize()` and `sendEmail()`) actually correct?**
  _`Error` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Are the 18 inferred relationships involving `POST()` (e.g. with `log()` and `getUser()`) actually correct?**
  _`POST()` has 18 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SamplePayload`, `BarakahColor`, `BarakahMetric` to the rest of the system?**
  _66 weakly-connected nodes found - possible documentation gaps or missing edges._