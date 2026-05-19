export type AchievementCode =
  | "first_steps"
  | "first_log"
  | "first_on_time"
  | "streak_3"
  | "streak_7"
  | "streak_30"
  | "streak_100"
  | "perfect_day_1"
  | "perfect_day_7"
  | "perfect_day_30"
  | "fajr_streak_7"
  | "fajr_streak_30"
  | "dhikr_100"
  | "dhikr_1000"
  | "dhikr_10000"
  | "qada_first"
  | "comeback";

export type AchievementTier = "bronze" | "silver" | "gold";

export type AchievementCategory =
  | "onboarding"
  | "prayer"
  | "streak"
  | "dhikr"
  | "recovery";

export interface AchievementQuote {
  source: string;
  text: string;
}

export interface Achievement {
  category: AchievementCategory;
  code: AchievementCode;
  description: string;
  icon: string;
  quote?: AchievementQuote;
  tier: AchievementTier;
  title: string;
}

export interface PrayerLogEntry {
  date: string;
  prayedAt?: number;
  prayer: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
  status: "on_time" | "late" | "qada" | "missed";
  updatedAt: number;
}

export interface EvaluationContext {
  dhikrTotal: number;
  onboardingComplete: boolean;
  prayerLogs: PrayerLogEntry[];
  today: string;
}

export interface UnlockedAchievement {
  code: AchievementCode;
  seenAt?: number;
  unlockedAt: number;
}
