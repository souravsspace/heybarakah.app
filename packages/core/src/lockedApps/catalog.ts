export interface CatalogApp {
  appId: string;
  bundleId: string;
  monogram: string;
  name: string;
  scheme: string;
}

export const APP_CATALOG: readonly CatalogApp[] = [
  {
    appId: "instagram",
    name: "Instagram",
    bundleId: "com.burbn.instagram",
    scheme: "instagram://",
    monogram: "Ig",
  },
  {
    appId: "tiktok",
    name: "TikTok",
    bundleId: "com.zhiliaoapp.musically",
    scheme: "tiktok://",
    monogram: "Tt",
  },
  {
    appId: "x",
    name: "X",
    bundleId: "com.atebits.Tweetie2",
    scheme: "twitter://",
    monogram: "X",
  },
  {
    appId: "youtube",
    name: "YouTube",
    bundleId: "com.google.ios.youtube",
    scheme: "youtube://",
    monogram: "Yt",
  },
  {
    appId: "facebook",
    name: "Facebook",
    bundleId: "com.facebook.Facebook",
    scheme: "fb://",
    monogram: "Fb",
  },
  {
    appId: "snapchat",
    name: "Snapchat",
    bundleId: "com.toyopagroup.picaboo",
    scheme: "snapchat://",
    monogram: "Sc",
  },
  {
    appId: "reddit",
    name: "Reddit",
    bundleId: "com.reddit.Reddit",
    scheme: "reddit://",
    monogram: "Rd",
  },
  {
    appId: "whatsapp",
    name: "WhatsApp",
    bundleId: "net.whatsapp.WhatsApp",
    scheme: "whatsapp://",
    monogram: "Wa",
  },
  {
    appId: "threads",
    name: "Threads",
    bundleId: "com.burbn.barcelona",
    scheme: "barcelona://",
    monogram: "Th",
  },
  {
    appId: "linkedin",
    name: "LinkedIn",
    bundleId: "com.linkedin.LinkedIn",
    scheme: "linkedin://",
    monogram: "Li",
  },
  {
    appId: "pinterest",
    name: "Pinterest",
    bundleId: "pinterest",
    scheme: "pinterest://",
    monogram: "Pn",
  },
  {
    appId: "discord",
    name: "Discord",
    bundleId: "com.hammerandchisel.discord",
    scheme: "discord://",
    monogram: "Dc",
  },
];

export const CATALOG_BY_ID: Record<string, CatalogApp> = Object.fromEntries(
  APP_CATALOG.map((app) => [app.appId, app])
);
