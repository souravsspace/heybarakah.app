export const ONBOARDING_ROUTES = [
  "/(onboarding)/welcome",
  "/(onboarding)/problem",
  "/(onboarding)/promise",
  "/(onboarding)/quiz/gender",
  "/(onboarding)/quiz/madhab",
  "/(onboarding)/quiz/consistency",
  "/(onboarding)/quiz/struggle",
  "/(onboarding)/quiz/goal",
  "/(onboarding)/config/calc-method",
  "/(onboarding)/config/prayers",
  "/(onboarding)/config/strictness",
  "/(onboarding)/calculating",
  "/(onboarding)/stats",
  "/(onboarding)/plan-summary",
  "/(onboarding)/notify-framing",
  "/(onboarding)/permissions",
  "/(onboarding)/prayer-times",
  "/(onboarding)/reviews",
  "/(onboarding)/testimonial",
  "/(onboarding)/hadith",
  "/(onboarding)/rating-prompt",
  "/(onboarding)/commit",
  "/(onboarding)/paywall/try-free",
  "/(onboarding)/paywall/akhira-worth",
  "/(onboarding)/paywall/plans",
] as const;

export type OnboardingRoute = (typeof ONBOARDING_ROUTES)[number];

export const QUIZ_OPTIONS = {
  gender: [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ],
  madhab: [
    { value: "hanafi", label: "Hanafi" },
    { value: "shafii", label: "Shafi'i" },
    { value: "maliki", label: "Maliki" },
    { value: "hanbali", label: "Hanbali" },
    { value: "none", label: "Just Muslim" },
  ],
  consistency: [
    { value: "never", label: "I rarely pray" },
    { value: "sometimes", label: "Sometimes" },
    { value: "most", label: "Most prayers" },
    { value: "all", label: "All five, every day" },
  ],
  struggle: [
    { value: "phone", label: "Phone distraction" },
    { value: "forgetting", label: "Forgetting prayer times" },
    { value: "fajr", label: "Waking for fajr" },
    { value: "khushu", label: "Lack of khushu'" },
  ],
  goal: [
    { value: "all-five", label: "Pray all five" },
    { value: "khushu", label: "Build khushu'" },
    { value: "phone-addiction", label: "Beat phone addiction" },
    { value: "fajr", label: "Wake for fajr consistently" },
  ],
  calcMethod: [
    { value: "isna", label: "ISNA", hint: "North America" },
    { value: "mwl", label: "Muslim World League", hint: "Europe, Asia" },
    { value: "umm-al-qura", label: "Umm al-Qura", hint: "Saudi Arabia" },
    { value: "egyptian", label: "Egyptian", hint: "Africa, Levant" },
    { value: "karachi", label: "Karachi", hint: "South Asia" },
    { value: "custom", label: "Set up later" },
  ],
  strictness: [
    {
      value: "adhan-iqama",
      label: "Adhan to iqama",
      hint: "Around 20 minutes",
    },
    {
      value: "full-window",
      label: "Adhan to end of window",
      hint: "Recommended for full presence",
    },
    {
      value: "custom",
      label: "I'll choose later",
      hint: "Set per prayer in settings",
    },
  ],
} as const;

export const PLANS = [
  {
    id: "yearly" as const,
    name: "Yearly",
    price: "$39.99",
    cadence: "year",
    perMonth: "$3.33 / mo",
    badge: "7 days free",
    recommended: true,
  },
  {
    id: "monthly" as const,
    name: "Monthly",
    price: "$7.99",
    cadence: "month",
    perMonth: null,
    badge: null,
    recommended: false,
  },
  {
    id: "family" as const,
    name: "Family",
    price: "$59.88",
    cadence: "year",
    perMonth: "$4.99 / mo · up to 5 members",
    badge: null,
    recommended: false,
  },
];
