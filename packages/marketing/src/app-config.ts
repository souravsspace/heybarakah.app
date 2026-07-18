// Polar checkout — sandbox while developing (`astro dev`), live in production builds.
const POLAR_CHECKOUT_PROD =
  "https://buy.polar.sh/polar_cl_Y5OrCssvZrWKPBmeacK37ZHOtdBgjBd4R1Hw43u4P8Q";
const POLAR_CHECKOUT_SANDBOX =
  "https://sandbox-api.polar.sh/v1/checkout-links/polar_cl_z6qSjYtqHLCf3EAjnxdzsXnrNXztHj0Nh7PHb20qNTf/redirect";
const checkoutUrl = import.meta.env.DEV ? POLAR_CHECKOUT_SANDBOX : POLAR_CHECKOUT_PROD;

// Live App Store listing. Primary CTA now that Barakah has launched on iOS.
const APP_STORE_URL =
  "https://apps.apple.com/hk/app/prayer-lock-barakah/id6772314573?l=en-GB";

// Polar checkout link with the discount PRESET attached, so 20% applies
// silently for auto-discount countries. Leave "" until the preset link exists
// in Polar; resolveCheckout() then falls back to prefilling the code instead.
const POLAR_CHECKOUT_DISCOUNT = "";

export const appConfig = {
  brand: {
    name: "Barakah App",
    shortName: "Barakah",
    tagline: "Prayer lock for muslims",
    description: "A quiet companion for salah. Show up; not scroll.",
    legalName: "Barakah App",
    bismillah: "Bismillah ir-Rahman ir-Raheem.",
  },

  seo: {
    siteUrl: "https://heybarakah.app",
    locale: "en_US",
    language: "en",
    themeColor: "#29603E",
    ogImage: "/og.png",
    ogImageAlt:
      "Barakah — a quiet prayer-lock app for Muslims. Cream calligraphic mark and serif wordmark on a mosque-green field with Islamic geometry.",
    keywords: [
      "prayer app",
      "salah",
      "Muslim app",
      "prayer lock",
      "phone lock during prayer",
      "halal screen time",
      "Islamic focus app",
      "distraction lock for Muslims",
      "five daily prayers",
      "Fajr Dhuhr Asr Maghrib Isha",
      "mindful Muslim app",
      "salah focus",
      "app that locks phone during prayer",
      "salah app blocker",
      "Muslim screen time app",
      "prayer times app with app blocker",
      "adhan qibla prayer times app",
      "Islamic productivity app",
    ],
    twitterHandle: "@heybarakah_app" as string | null,
  },

  contact: {
    email: "hello@heybarakah.app",
  },

  social: {
    twitter: "https://x.com/heybarakah_app",
    instagram: "#",
    tiktok: "#",
  },

  store: {
    ios: { url: APP_STORE_URL, status: "Live" },
    android: { url: "#", status: "Coming soon" },
  },

  pricing: {
    lifetimePrice: "$99",
    originalPrice: "$165",
    label: "Early access — lifetime",
    checkoutUrl,
  },

  // Regional pricing. Auto-discount countries hit the preset checkout link
  // (silent 20% off); everyone else sees the code and gets it prefilled at
  // checkout. autoCountries is ISO 3166-1 alpha-2 — edit freely.
  discount: {
    code: "UMMAH20",
    percent: 20,
    presetCheckoutUrl: POLAR_CHECKOUT_DISCOUNT,
    autoCountries: [
      "PK", "IN", "BD", "ID", "EG", "NG", "MA", "DZ", "TN", "LY",
      "SD", "IQ", "YE", "SY", "JO", "PS", "LB", "AF", "IR", "UZ",
      "TR", "KE", "TZ", "UG", "GH", "SN", "ML", "PH", "LK", "NP",
      "KZ", "KG", "TJ", "TM", "AZ", "ET", "MR", "SO", "CM", "CI",
    ] as readonly string[],
  },

  routes: {
    newsletter: "#newsletter",
    pricing: "#pricing",
    faq: "#faq",
    features: "#features",
    how: "#how",
    privacy: "/privacy",
    terms: "/terms",
    consent: "#",
    about: "#",
  },

  hero: {
    headline: {
      line1: "Your phone,",
      line2: "on prayer time.",
    },
    subheadline:
      "Barakah quietly locks distractions during salah. Five times a day, your phone steps aside so you can show up — not scroll.",
  },

  comparisons: [
    {
      name: "Netflix",
      logo: "/netflix-logo.avif",
      logoAlt: "Netflix",
      description: "A standard Netflix subscription is",
      price: "$19.99 / month.",
      comparison: "Barakah is a one-time payment, not a monthly bill.",
      comparisonBold: "one-time payment",
    },
    {
      name: "Food Delivery",
      logo: "/uber-eats-logo.png",
      logoAlt: "Uber Eats",
      description: "Average order value for a single delivery in the US is",
      price: "$27.30.",
      comparison: "Barakah is paid once, then never again.",
      comparisonBold: "never again",
    },
  ],

  islamic: {
    prayers: ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const,
  },
} as const;

export type AppConfig = typeof appConfig;
