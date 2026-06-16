import {
  calculateAdhanJsPrayerDays,
  createPrayerTimesCacheKey,
  DEFAULT_PRAYER_DAYS,
  PRAYER_CACHE_TTL_MS,
  type PrayerDay,
  type PrayerTimesSource,
} from "@barakah/core/prayer";
import { useQuery as useRqQuery } from "@tanstack/react-query";
import type { InferRequestType } from "hono/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import {
  findEntryByLocationId,
  readPrayerStorage,
  type StoredPrayerEntry,
  type StoredPrayerState,
  writePrayerEntry,
} from "@/hooks/prayer-storage";
import { useLocations } from "@/hooks/use-locations";
import { useOnboardingState } from "@/hooks/use-onboarding-state";
import {
  getCurrentLocation,
  requestLocationPermission,
  reverseGeocodeLocation,
} from "@/hooks/use-permissions";
import { api } from "@/lib/api-client";
import { dateKey } from "@/lib/date-utils";
import { useOnline } from "@/lib/use-online";

type CalcMethod =
  | "isna"
  | "mwl"
  | "umm-al-qura"
  | "egyptian"
  | "karachi"
  | "custom";

type Madhab = "hanafi" | "shafii" | "maliki" | "hanbali" | "none";
type NextPrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

const AUTO_REFRESH_RETRY_MS = 30_000;
const GPS_LOCATION_ID = "gps";

const DEFAULT_METHOD_ID = 3;

const CALC_METHOD_MAP: Record<CalcMethod, number> = {
  isna: 2,
  mwl: 3,
  "umm-al-qura": 4,
  egyptian: 5,
  karachi: 1,
  custom: 3,
};

function mapSchool(madhab?: Madhab): number {
  return madhab === "hanafi" ? 1 : 0;
}

function mapMethod(calcMethod: CalcMethod | undefined): number {
  if (calcMethod) {
    return CALC_METHOD_MAP[calcMethod];
  }
  return DEFAULT_METHOD_ID;
}

function pickNextPrayer(days: PrayerDay[]) {
  const now = new Date();
  const today = dateKey();
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
  const tomorrowKey = dateKey(tomorrowDate);
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

function mergeDaysPreferStored(
  sdkDays: PrayerDay[],
  stored: StoredPrayerEntry | null
): PrayerDay[] {
  if (!stored?.timings?.length) {
    return sdkDays;
  }
  if (sdkDays.length === 0) {
    return stored.timings;
  }
  return sdkDays.map((sdkDay) => {
    const match = stored.timings.find((s) => s.date === sdkDay.date);
    return match ?? sdkDay;
  });
}

interface CachedPrayerTimes {
  cacheKey: string;
  generatedAt: number;
  source: PrayerTimesSource;
  timings: PrayerDay[];
}
type RefreshResult = { source: PrayerTimesSource; timings: PrayerDay[] } | null;

interface PrayerTimesRequest {
  city?: string;
  countryCode?: string;
  days: number;
  latitude: number;
  longitude: number;
  method: number;
  school: number;
  startDate: string;
  timezone: string;
}

type PrayerTimesQuery = InferRequestType<
  (typeof api.api.v1)["prayer-times"]["$get"]
>["query"];

// hc query params must be strings; numeric fields are coerced server-side.
function toPrayerTimesQuery(args: PrayerTimesRequest): PrayerTimesQuery {
  const query: Record<string, string> = {
    latitude: String(args.latitude),
    longitude: String(args.longitude),
    timezone: args.timezone,
    method: String(args.method),
    school: String(args.school),
    startDate: args.startDate,
    days: String(args.days),
  };
  if (args.countryCode) {
    query.countryCode = args.countryCode;
  }
  if (args.city) {
    query.city = args.city;
  }
  return query as PrayerTimesQuery;
}

function useCachedPrayerTimes(
  args: PrayerTimesRequest | null
): CachedPrayerTimes | undefined {
  const query = useRqQuery({
    queryKey: [
      "cf",
      "prayer-times",
      args ? createPrayerTimesCacheKey(args) : "none",
    ],
    enabled: Boolean(args),
    queryFn: async (): Promise<CachedPrayerTimes | null> => {
      const res = await api.api.v1["prayer-times"].$get({
        query: toPrayerTimesQuery(args as PrayerTimesRequest),
      });
      if (!res.ok) {
        throw new Error("Failed to load prayer times");
      }
      return (await res.json()) as unknown as CachedPrayerTimes | null;
    },
  });
  return query.data ?? undefined;
}

type RefreshFn = (args: PrayerTimesRequest) => Promise<RefreshResult>;

function useRefreshPrayerTimes(): RefreshFn {
  return useCallback(async (args: PrayerTimesRequest) => {
    const res = await api.api.v1["prayer-times"].refresh.$post({ json: args });
    if (!res.ok) {
      throw new Error("Failed to refresh prayer times");
    }
    return (await res.json()) as unknown as RefreshResult;
  }, []);
}

export function usePrayerTimes() {
  const { state } = useOnboardingState();
  const [today, setToday] = useState(dateKey);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (status) => {
      if (status === "active") {
        const current = dateKey();
        setToday((prev) => (prev === current ? prev : current));
      }
    });
    return () => sub.remove();
  }, []);

  const [storageState, setStorageState] = useState<StoredPrayerState>({
    version: 1,
    entries: {},
  });
  const [storageHydrated, setStorageHydrated] = useState(false);

  useEffect(() => {
    readPrayerStorage()
      .then((s) => {
        setStorageState(s);
        setStorageHydrated(true);
      })
      .catch(() => undefined);
  }, []);

  const { activeLocation } = useLocations();

  const [gpsLocation, setGpsLocation] = useState<{
    latitude: number;
    longitude: number;
    timezone: string;
    city: string | null;
    countryCode: string | null;
  } | null>(null);
  const [loadingGps, setLoadingGps] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoRefreshRequestKey = useRef<string | null>(null);
  const lastAutoRefreshAt = useRef(0);

  const isOnline = useOnline();

  const locationId = activeLocation ? activeLocation._id : GPS_LOCATION_ID;

  const location = useMemo(() => {
    if (activeLocation) {
      return {
        latitude: activeLocation.latitude,
        longitude: activeLocation.longitude,
        timezone: activeLocation.timezone,
        city: activeLocation.city ?? null,
        countryCode: activeLocation.countryCode ?? null,
      };
    }
    return gpsLocation;
  }, [activeLocation, gpsLocation]);

  useEffect(() => {
    if (!storageHydrated) {
      return;
    }
    if (gpsLocation || activeLocation) {
      return;
    }
    const fallback = findEntryByLocationId(storageState, GPS_LOCATION_ID);
    if (fallback) {
      setGpsLocation(fallback.location);
    }
  }, [storageHydrated, storageState, gpsLocation, activeLocation]);

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
      method: mapMethod(state.calcMethod as CalcMethod | undefined),
      school: mapSchool(state.madhab as Madhab | undefined),
      startDate: today,
      days: DEFAULT_PRAYER_DAYS,
    };
  }, [location, state.calcMethod, state.madhab, today]);

  const cacheKey = useMemo(
    () => (requestArgs ? createPrayerTimesCacheKey(requestArgs) : null),
    [requestArgs]
  );

  const cached = useCachedPrayerTimes(requestArgs);
  const refreshAction = useRefreshPrayerTimes();

  useEffect(() => {
    if (activeLocation) {
      setLoadingGps(false);
      return;
    }
    let cancelled = false;

    async function loadLocation() {
      setLoadingGps(true);
      setError(null);

      const granted =
        state.locationGranted === true || (await requestLocationPermission());
      if (!granted) {
        if (!cancelled) {
          setError("Location permission was denied.");
          setLoadingGps(false);
        }
        return;
      }

      const current = await getCurrentLocation();
      if (!current) {
        if (!cancelled) {
          setError("Unable to determine your location.");
          setLoadingGps(false);
        }
        return;
      }

      const { latitude, longitude } = current.coords;
      const timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      const geocode = await reverseGeocodeLocation(latitude, longitude);
      const countryCode = geocode?.countryCode?.toUpperCase() ?? null;

      if (!cancelled) {
        setGpsLocation({
          latitude,
          longitude,
          timezone,
          city: geocode?.city ?? null,
          countryCode,
        });
        setLoadingGps(false);
      }
    }

    loadLocation().catch(() => {
      if (!cancelled) {
        setError("Unable to determine your location.");
        setLoadingGps(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [state.locationGranted, activeLocation]);

  const loadingLocation = activeLocation ? false : loadingGps;

  const storedEntry = useMemo<StoredPrayerEntry | null>(
    () => (cacheKey ? (storageState.entries[cacheKey] ?? null) : null),
    [storageState, cacheKey]
  );

  const sdkDays = useMemo<PrayerDay[]>(() => {
    if (!(location && requestArgs)) {
      return [];
    }
    return (
      calculateAdhanJsPrayerDays({
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone,
        method: requestArgs.method,
        school: requestArgs.school,
        startDate: today,
        days: DEFAULT_PRAYER_DAYS,
      }) ?? []
    );
  }, [location, requestArgs, today]);

  const prayerTimes = useMemo(
    () => mergeDaysPreferStored(sdkDays, storedEntry),
    [sdkDays, storedEntry]
  );

  const todayPrayerTimes = useMemo(
    () => prayerTimes.find((item) => item.date === today) ?? null,
    [prayerTimes, today]
  );

  const nextPrayer = useMemo(() => pickNextPrayer(prayerTimes), [prayerTimes]);

  const isStale = useMemo(() => {
    if (!storedEntry) {
      return true;
    }
    return Date.now() - storedEntry.fetchedAt > PRAYER_CACHE_TTL_MS;
  }, [storedEntry]);

  const persistFromAlAdhan = useCallback(
    async (timings: PrayerDay[], source: PrayerTimesSource) => {
      if (!(location && requestArgs && cacheKey)) {
        return;
      }
      const entry: StoredPrayerEntry = {
        cacheKey,
        fetchedAt: Date.now(),
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          timezone: location.timezone,
          city: location.city,
          countryCode: location.countryCode,
        },
        locationId,
        settings: { method: requestArgs.method, school: requestArgs.school },
        source,
        timings,
      };
      const next = await writePrayerEntry(entry);
      setStorageState(next);
    },
    [cacheKey, location, locationId, requestArgs]
  );

  useEffect(() => {
    if (!(cached?.timings?.length && cacheKey)) {
      return;
    }
    if (cached.cacheKey !== cacheKey) {
      return;
    }
    if (storedEntry && storedEntry.fetchedAt >= cached.generatedAt) {
      return;
    }
    persistFromAlAdhan(cached.timings, cached.source).catch(() => undefined);
  }, [cached, cacheKey, storedEntry, persistFromAlAdhan]);

  useEffect(() => {
    if (
      !requestArgs ||
      loadingLocation ||
      refreshing ||
      !storageHydrated ||
      !isStale ||
      !isOnline
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
        if (cancelled || !refreshed?.timings?.length) {
          return;
        }
        return persistFromAlAdhan(refreshed.timings, refreshed.source);
      })
      .catch(() => {
        // swallow — SDK fallback already rendered; will retry on next stale tick
      })
      .finally(() => {
        if (!cancelled) {
          setRefreshing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    isOnline,
    isStale,
    loadingLocation,
    persistFromAlAdhan,
    refreshAction,
    refreshing,
    requestArgs,
    storageHydrated,
  ]);

  const cacheStatus = useMemo(() => {
    if (loadingLocation) {
      return "loading-location" as const;
    }
    if (refreshing) {
      return "refreshing" as const;
    }
    if (!isOnline && prayerTimes.length > 0) {
      return "offline" as const;
    }
    if (prayerTimes.length > 0) {
      return "hit" as const;
    }
    if (error) {
      return "error" as const;
    }
    return "idle" as const;
  }, [error, isOnline, loadingLocation, prayerTimes.length, refreshing]);

  const sourceForToday = useMemo<PrayerTimesSource>(
    () => todayPrayerTimes?.source ?? "adhan-js",
    [todayPrayerTimes]
  );

  const refresh = useCallback(async () => {
    if (!requestArgs) {
      return;
    }

    setError(null);
    setRefreshing(true);
    try {
      const refreshed = await refreshAction(requestArgs);
      if (refreshed?.timings?.length) {
        await persistFromAlAdhan(refreshed.timings, refreshed.source);
      }
    } catch {
      setError("Unable to refresh prayer times right now.");
    } finally {
      setRefreshing(false);
    }
  }, [persistFromAlAdhan, refreshAction, requestArgs]);

  return {
    location,
    prayerTimes,
    todayPrayerTimes,
    nextPrayer,
    loading: loadingLocation || (prayerTimes.length === 0 && refreshing),
    error,
    refresh,
    cacheStatus,
    source: sourceForToday,
    isStale,
    refreshing,
    isOnline,
  };
}
