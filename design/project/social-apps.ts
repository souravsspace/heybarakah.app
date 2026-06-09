import type { ImageSourcePropType } from "react-native";

export interface SocialApp {
  androidPackageName: string;
  id: string;
  logo: ImageSourcePropType;
  name: string;
}

export const SOCIAL_APPS: SocialApp[] = [
  {
    id: "instagram",
    name: "Instagram",
    androidPackageName: "com.instagram.android",
    logo: require("@/assets/images/socials/instagram.png"),
  },
  {
    id: "tiktok",
    name: "TikTok",
    androidPackageName: "com.zhiliaoapp.musically",
    logo: require("@/assets/images/socials/tiktok.png"),
  },
  {
    id: "x",
    name: "X",
    androidPackageName: "com.twitter.android",
    logo: require("@/assets/images/socials/x.png"),
  },
  {
    id: "facebook",
    name: "Facebook",
    androidPackageName: "com.facebook.katana",
    logo: require("@/assets/images/socials/facebook.png"),
  },
  {
    id: "snapchat",
    name: "Snapchat",
    androidPackageName: "com.snapchat.android",
    logo: require("@/assets/images/socials/snapchat.png"),
  },
  {
    id: "youtube",
    name: "YouTube",
    androidPackageName: "com.google.android.youtube",
    logo: require("@/assets/images/socials/youtube.png"),
  },
  {
    id: "reddit",
    name: "Reddit",
    androidPackageName: "com.reddit.frontpage",
    logo: require("@/assets/images/socials/reddit.png"),
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    androidPackageName: "com.whatsapp",
    logo: require("@/assets/images/socials/whatsapp.png"),
  },
  {
    id: "telegram",
    name: "Telegram",
    androidPackageName: "org.telegram.messenger",
    logo: require("@/assets/images/socials/telegram.png"),
  },
  {
    id: "discord",
    name: "Discord",
    androidPackageName: "com.discord",
    logo: require("@/assets/images/socials/discord.png"),
  },
  {
    id: "threads",
    name: "Threads",
    androidPackageName: "com.instagram.barcelona",
    logo: require("@/assets/images/socials/threads.png"),
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    androidPackageName: "com.linkedin.android",
    logo: require("@/assets/images/socials/linkedin.png"),
  },
  {
    id: "pinterest",
    name: "Pinterest",
    androidPackageName: "com.pinterest",
    logo: require("@/assets/images/socials/pinterest.png"),
  },
  {
    id: "twitch",
    name: "Twitch",
    androidPackageName: "tv.twitch.android.app",
    logo: require("@/assets/images/socials/twitch.png"),
  },
  {
    id: "messenger",
    name: "Messenger",
    androidPackageName: "com.facebook.orca",
    logo: require("@/assets/images/socials/messenger.png"),
  },
];

export const SOCIAL_BY_PACKAGE: Record<string, SocialApp> = Object.fromEntries(
  SOCIAL_APPS.map((app) => [app.androidPackageName, app])
);
