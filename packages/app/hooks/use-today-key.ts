import { useEffect, useState } from "react";
import { AppState } from "react-native";

import { dateKey } from "@/lib/date-utils";

/**
 * Local YYYY-MM-DD key for "today" that stays correct across midnight.
 * Refreshes when the app returns to the foreground; without this a screen
 * left open past midnight keeps querying yesterday's date.
 */
export function useTodayKey(): string {
  const [today, setToday] = useState(dateKey);

  useEffect(() => {
    const refresh = () => {
      const current = dateKey();
      setToday((prev) => (prev === current ? prev : current));
    };

    const sub = AppState.addEventListener("change", (status) => {
      if (status === "active") {
        refresh();
      }
    });

    // Also flip exactly at the next local midnight while the app stays open.
    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      1,
      0
    );
    const timer = setTimeout(refresh, nextMidnight.getTime() - now.getTime());

    return () => {
      sub.remove();
      clearTimeout(timer);
    };
  }, []);

  return today;
}
