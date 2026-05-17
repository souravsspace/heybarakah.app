import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import { scheduleDailyAyahNotification } from "@/lib/ayah-notification";
import { usePrayerTimes } from "./usePrayerTimes";

interface Timings {
  asr: string;
  dhuhr: string;
  fajr: string;
  isha: string;
  maghrib: string;
}

export function useDailyAyahNotification() {
  const { todayPrayerTimes } = usePrayerTimes();

  useEffect(() => {
    if (Platform.OS !== "ios" && Platform.OS !== "android") {
      return;
    }
    if (!todayPrayerTimes) {
      return;
    }
    const run = () => {
      scheduleDailyAyahNotification({
        times: todayPrayerTimes.timings as Timings,
      }).catch(() => null);
    };
    run();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        run();
      }
    });
    return () => sub.remove();
  }, [todayPrayerTimes]);
}
