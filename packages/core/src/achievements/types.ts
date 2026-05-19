export type AchievementCode =
  | "all_bronze"
  | "all_gold"
  | "all_silver"
  | "comeback"
  | "complete"
  | "dhikr_100"
  | "dhikr_100k"
  | "dhikr_1000"
  | "dhikr_10000"
  | "fajr_100"
  | "fajr_streak_30"
  | "fajr_streak_7"
  | "first_dhikr"
  | "first_log"
  | "first_on_time"
  | "first_steps"
  | "gentle_return"
  | "isha_streak_7"
  | "jumuah_12"
  | "jumuah_4"
  | "late_devotion"
  | "night_complete_30"
  | "perfect_day_1"
  | "perfect_day_30"
  | "perfect_day_7"
  | "pre_dawn_watcher"
  | "qada_first"
  | "qada_seven"
  | "ramadan_complete"
  | "sacred_month_day"
  | "streak_100"
  | "streak_3"
  | "streak_30"
  | "streak_365"
  | "streak_7";

export type AchievementTier = "bronze" | "gold" | "silver";

export type AchievementCategory =
  | "beginnings"
  | "continuity"
  | "fajr"
  | "mercy"
  | "night"
  | "reflection"
  | "remembrance"
  | "salah"
  | "seasons";

export type AchievementIcon =
  | "checkmark-circle-outline"
  | "ellipse"
  | "ellipse-outline"
  | "flame"
  | "flame-outline"
  | "footsteps-outline"
  | "leaf-outline"
  | "moon"
  | "moon-outline"
  | "refresh-outline"
  | "star"
  | "star-outline"
  | "sunny"
  | "sunny-outline"
  | "time-outline"
  | "trophy"
  | "trophy-outline";

export interface AchievementQuote {
  source: string;
  text: string;
}

export interface Achievement {
  category: AchievementCategory;
  code: AchievementCode;
  description: string;
  icon: AchievementIcon;
  quote?: AchievementQuote;
  tier: AchievementTier;
  title: string;
}

export interface PrayerLogEntry {
  date: string;
  prayedAt?: number;
  prayer: "asr" | "dhuhr" | "fajr" | "isha" | "maghrib";
  status: "late" | "missed" | "on_time" | "qada";
  updatedAt: number;
}

export interface EvaluationContext {
  dhikrTotal: number;
  onboardingComplete: boolean;
  prayerLogs: PrayerLogEntry[];
  timezone?: string;
  today: string;
}

export interface AchievementProgress {
  current: number;
  target: number;
  unit: string;
}

export interface AchievementEvaluation {
  progress?: AchievementProgress;
  unlocked: boolean;
}

export interface UnlockedAchievement {
  code: AchievementCode;
  seenAt?: number;
  unlockedAt: number;
}
