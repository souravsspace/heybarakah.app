import { api } from "@barakah/core/convex/_generated/api";
import type { PrayerDay } from "@barakah/core/prayer";
import { useAction, useQuery } from "convex/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import { useOnboardingState } from "@/hooks/use-onboarding-state";
import {
  getCurrentLocation,
  requestLocationPermission,
  reverseGeocodeLocation,
} from "@/hooks/use-permissions";

type CalcMethod =
  | "isna"
  | "mwl"
  | "umm-al-qura"
  | "egyptian"
  | "karachi"
  | "custom";

type Madhab = "hanafi" | "shafii" | "maliki" | "hanbali" | "none";
type NextPrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

const DEFAULT_DAYS = 7;
const AUTO_REFRESH_RETRY_MS = 30_000;

const CALC_METHOD_MAP: Record<CalcMethod, number> = {
  isna: 2,
  mwl: 3,
  "umm-al-qura": 4,
  egyptian: 5,
  karachi: 1,
  custom: 3,
};

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function todayDateKey() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function mapSchool(madhab?: Madhab): number {
  return madhab === "hanafi" ? 1 : 0;
}

function mapMethod(
  calcMethod: CalcMethod | undefined,
  isBangladesh: boolean
): number {
  if (calcMethod) {
    return CALC_METHOD_MAP[calcMethod];
  }
  return isBangladesh ? 1 : 3;
}

function pickNextPrayer(days: PrayerDay[]) {
  const now = new Date();
  const today = todayDateKey();
  const todayRecord = days.find((item) => item.date === today);
  const names: NextPrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

  if (!todayRecord) {
    return null;
  }

  for (const name of names) {
    const raw = todayRecord.timings[name];
    const [hourText, minuteText] = raw.split(":");
    const hour = Number(hourText);
    const minute = Number(minuteText);

    if (Number.isNaN(hour) || Number.isNaN(minute)) {
      continue;
    }

    const prayerAt = new Date(now);
    prayerAt.setHours(hour, minute, 0, 0);
    if (prayerAt > now) {
      return { name, time: raw, at: prayerAt };
    }
  }

  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowKey = `${tomorrowDate.getFullYear()}-${pad2(tomorrowDate.getMonth() + 1)}-${pad2(tomorrowDate.getDate())}`;
  const tomorrow = days.find((item) => item.date === tomorrowKey);
  if (!tomorrow) {
    return null;
  }
  const [fh, fm] = tomorrow.timings.fajr.split(":").map(Number);
  if (Number.isNaN(fh) || Number.isNaN(fm)) {
    return null;
  }
  const at = new Date(now);
  at.setDate(at.getDate() + 1);
  at.setHours(fh, fm, 0, 0);

  return {
    name: "fajr" as const,
    time: tomorrow.timings.fajr,
    at,
  };
}

export function usePrayerTimes() {
  const { state } = useOnboardingState();
  const [today, setToday] = useState(todayDateKey);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (status) => {
      if (status === "active") {
        const current = todayDateKey();
        setToday((prev) => (prev === current ? prev : current));
      }
    });
    return () => sub.remove();
  }, []);

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    timezone: string;
    city: string | null;
    countryCode: string | null;
    isBangladesh: boolean;
  } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshResult, setRefreshResult] = useState<PrayerDay[] | null>(null);
  const autoRefreshRequestKey = useRef<string | null>(null);
  const lastAutoRefreshAt = useRef(0);

  const requestArgs = useMemo(() => {
    if (!location) {
      return null;
    }

    return {
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: location.timezone,
      countryCode: location.countryCode ?? undefined,
      city: location.city ?? undefined,
      method: mapMethod(
        state.calcMethod as CalcMethod | undefined,
        location.isBangladesh
      ),
      school: mapSchool(state.madhab as Madhab | undefined),
      startDate: today,
      days: DEFAULT_DAYS,
    };
  }, [location, state.calcMethod, state.madhab, today]);

  const cached = useQuery(
    api.lib.prayerTimes.getCachedPrayerTimes,
    requestArgs ?? "skip"
  );
  const refreshAction = useAction(api.lib.prayerTimes.refreshPrayerTimes);

  useEffect(() => {
    let cancelled = false;

    async function loadLocation() {
      setLoadingLocation(true);
      setError(null);

      const granted =
        state.locationGranted === true || (await requestLocationPermission());
      if (!granted) {
        if (!cancelled) {
          setError("Location permission was denied.");
          setLoadingLocation(false);
        }
        return;
      }

      const current = await getCurrentLocation();
      if (!current) {
        if (!cancelled) {
          setError("Unable to determine your location.");
          setLoadingLocation(false);
        }
        return;
      }

      const { latitude, longitude } = current.coords;
      const timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      const geocode = await reverseGeocodeLocation(latitude, longitude);
      const countryCode = geocode?.countryCode?.toUpperCase() ?? null;
      const isBangladesh = countryCode === "BD" || timezone === "Asia/Dhaka";

      if (!cancelled) {
        setLocation({
          latitude,
          longitude,
          timezone,
          city: geocode?.city ?? null,
          countryCode,
          isBangladesh,
        });
        setLoadingLocation(false);
      }
    }

    loadLocation().catch(() => {
      if (!cancelled) {
        setError("Unable to determine your location.");
        setLoadingLocation(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [state.locationGranted]);

  useEffect(() => {
    if (
      !requestArgs ||
      loadingLocation ||
      cached === undefined ||
      cached !== null ||
      refreshing
    ) {
      return;
    }

    const requestKey = JSON.stringify(requestArgs);
    if (
      autoRefreshRequestKey.current === requestKey &&
      Date.now() - lastAutoRefreshAt.current < AUTO_REFRESH_RETRY_MS
    ) {
      return;
    }
    autoRefreshRequestKey.current = requestKey;
    lastAutoRefreshAt.current = Date.now();

    let cancelled = false;
    setRefreshing(true);

    refreshAction(requestArgs)
      .then((refreshed) => {
        if (!cancelled) {
          setRefreshResult(refreshed?.timings ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not refresh prayer times. Please try again.");
        }
      })
      .finally(() => {
        setRefreshing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cached, loadingLocation, refreshAction, refreshing, requestArgs]);

  const prayerTimes = useMemo(() => {
    if (refreshResult?.length) {
      return refreshResult;
    }
    if (cached?.timings?.length) {
      return cached.timings;
    }
    return [] as PrayerDay[];
  }, [cached?.timings, refreshResult]);

  const todayPrayerTimes = useMemo(
    () => prayerTimes.find((item) => item.date === today) ?? null,
    [prayerTimes, today]
  );

  const nextPrayer = useMemo(() => pickNextPrayer(prayerTimes), [prayerTimes]);

  const cacheStatus = useMemo(() => {
    if (loadingLocation) {
      return "loading-location" as const;
    }
    if (refreshing) {
      return "refreshing" as const;
    }
    if (prayerTimes.length > 0) {
      return "hit" as const;
    }
    if (cached === null) {
      return "miss" as const;
    }
    if (error) {
      return "error" as const;
    }
    return "idle" as const;
  }, [cached, error, loadingLocation, prayerTimes.length, refreshing]);

  const refresh = useCallback(async () => {
    if (!requestArgs) {
      return;
    }

    setError(null);
    setRefreshing(true);
    try {
      const refreshed = await refreshAction(requestArgs);
      setRefreshResult(refreshed?.timings ?? []);
    } catch {
      setError("Unable to refresh prayer times right now.");
    } finally {
      setRefreshing(false);
    }
  }, [refreshAction, requestArgs]);

  return {
    location,
    prayerTimes,
    todayPrayerTimes,
    nextPrayer,
    loading: loadingLocation || cached === undefined,
    error,
    refresh,
    cacheStatus,
  };
}
