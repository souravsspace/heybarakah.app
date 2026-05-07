export const appConfig = {
  brand: {
    name: "Barakah App",
    shortName: "Barakah",
    tagline: "Prayer lock for muslims",
    description: "A quiet companion for salah. Show up; not scroll.",
    legalName: "Barakah App",
    bismillah: "Bismillah ir-Rahman ir-Raheem.",
  },

  contact: {
    email: "hello@heybarakah.app",
  },

  social: {
    twitter: "#",
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
    checkoutUrl:
      "https://buy.polar.sh/polar_cl_Y5OrCssvZrWKPBmeacK37ZHOtdBgjBd4R1Hw43u4P8Q",
  },

  routes: {
    waitlist: "#waitlist",
    pricing: "#pricing",
    faq: "#faq",
    features: "#features",
    how: "#how",
    privacy: "#",
    terms: "#",
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

  footer: {
    blurb: "A quiet companion for salah. Show up; not scroll.",
    groups: [
      {
        title: "Barakah",
        links: [
          {
            label: "Early Access (lifetime)",
            href: "https://buy.polar.sh/polar_cl_Y5OrCssvZrWKPBmeacK37ZHOtdBgjBd4R1Hw43u4P8Q",
          },
          { label: "FAQs", href: "#faq" },
          { label: "Join Waitlist", href: "#waitlist" },
          { label: "Consent Preferences", href: "#", emphasis: true },
        ],
      },
      {
        title: "About",
        links: [
          { label: "iOS (Coming soon)", href: "#" },
          { label: "Android (Coming soon)", href: "#" },
          { label: "Email Us", href: "mailto:hello@heybarakah.app" },
          { label: "Twitter / X", href: "#" },
          { label: "Instagram", href: "#" },
          { label: "TikTok", href: "#" },
        ],
      },
    ],
  },

  islamic: {
    prayers: ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const,
  },
} as const;

export type AppConfig = typeof appConfig;
