// Polar checkout — sandbox while developing (`astro dev`), live in production builds.
const POLAR_CHECKOUT_PROD =
  "https://buy.polar.sh/polar_cl_Y5OrCssvZrWKPBmeacK37ZHOtdBgjBd4R1Hw43u4P8Q";
const POLAR_CHECKOUT_SANDBOX =
  "https://sandbox-api.polar.sh/v1/checkout-links/polar_cl_z6qSjYtqHLCf3EAjnxdzsXnrNXztHj0Nh7PHb20qNTf/redirect";
const checkoutUrl = import.meta.env.DEV ? POLAR_CHECKOUT_SANDBOX : POLAR_CHECKOUT_PROD;

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
      "Barakah — a quiet prayer-lock app for Muslims. Mosque-green wordmark on a white field.",
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
    ios: { url: "#", status: "Coming soon" },
    android: { url: "#", status: "Coming soon" },
  },

  pricing: {
    lifetimePrice: "$39.99",
    originalPrice: "$165",
    label: "Early access — lifetime",
    checkoutUrl,
  },

  routes: {
    waitlist: "#waitlist",
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
      comparison: "Barakah lifetime costs less than 2 months of Netflix.",
      comparisonBold: "2 months",
    },
    {
      name: "Food Delivery",
      logo: "/uber-eats-logo.png",
      logoAlt: "Uber Eats",
      description: "Average order value for a single delivery in the US is",
      price: "$27.30.",
      comparison: "Barakah lifetime costs less than 1.5 takeout orders.",
      comparisonBold: "1.5 takeout orders",
    },
  ],

  islamic: {
    prayers: ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const,
  },
} as const;

export type AppConfig = typeof appConfig;
