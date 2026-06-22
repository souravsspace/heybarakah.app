import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery as useRqQuery } from "@tanstack/react-query";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useUser } from "@/contexts/user-context";
import { api } from "@/lib/api-client";
import { hapticImpact, hapticSelection } from "@/lib/haptics";

export interface Preset {
  arabic: string;
  id: string;
  meaning: string;
  name: string;
  phonetic: string;
  short: string;
  target: number;
}

export const PRESETS: Preset[] = [
  {
    id: "subhanallah",
    name: "Subhanallah",
    short: "Subhan",
    arabic: "سُبْحَانَ ٱللَّٰه",
    phonetic: "Sub-haa-nal-laah",
    meaning: "Glory be to Allah",
    target: 33,
  },
  {
    id: "alhamdulillah",
    name: "Alhamdulillah",
    short: "Hamd",
    arabic: "ٱلْحَمْدُ لِلَّٰه",
    phonetic: "Al-ham-du-lil-laah",
    meaning: "All praise is for Allah",
    target: 33,
  },
  {
    id: "allahuakbar",
    name: "Allahu Akbar",
    short: "Akbar",
    arabic: "ٱللَّٰهُ أَكْبَر",
    phonetic: "Al-laa-hu Ak-bar",
    meaning: "Allah is the greatest",
    target: 34,
  },
  {
    id: "lailaha",
    name: "La ilaha illa Allah",
    short: "Tahlil",
    arabic: "لَا إِلَٰهَ إِلَّا ٱللَّٰه",
    phonetic: "Laa i-laa-ha il-lal-laah",
    meaning: "There is no god but Allah",
    target: 100,
  },
];

// Per-user storage keys. A device-global key leaked one account's lifetime
// counts into the next account on the same device, so keys are namespaced by the
// signed-in user id. `synced` caches the last-known cloud totals (instant +
// offline display); `pending` holds local taps not yet flushed to the server.
const SYNCED_KEY_PREFIX = "@barakah/dhikr/synced";
const PENDING_KEY_PREFIX = "@barakah/dhikr/pending";
const MONTHLY_KEY_PREFIX = "@barakah/dhikr/monthly";
const syncedKey = (userId: string) => `${SYNCED_KEY_PREFIX}/${userId}`;
const pendingKey = (userId: string) => `${PENDING_KEY_PREFIX}/${userId}`;
const monthlyKey = (userId: string) => `${MONTHLY_KEY_PREFIX}/${userId}`;
const FLUSH_DELAY_MS = 1200;

type Lifetime = Record<string, number>;

interface CloudTotals {
  grandTotal: number;
  // Per-preset count in the current cloud-tracked 30-day window (auto-resets).
  monthly: Lifetime;
  totals: Lifetime;
}

function readMap(raw: string | null): Lifetime {
  if (!raw) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw) as Lifetime;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

interface DhikrContextValue {
  active: Preset;
  activeIndex: number;
  complete: boolean;
  count: number;
  goTo: (idx: number) => void;
  grandTotal: number;
  increment: () => void;
  isLast: boolean;
  monthly: Lifetime;
  next: Preset;
  nextDhikr: () => void;
  resetSession: () => void;
  totals: Lifetime;
}

const DhikrContext = createContext<DhikrContextValue | null>(null);

export function DhikrProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const userId = user?.id ?? null;
  const [activeIndex, setActiveIndex] = useState(0);
  const [count, setCount] = useState(0);
  // Cloud-authoritative per-preset totals + local taps not yet flushed. Displayed
  // total = synced + pending (local-first, survives offline).
  const [synced, setSynced] = useState<Lifetime>({});
  const [pending, setPending] = useState<Lifetime>({});
  // Cloud-authoritative per-preset monthly-window totals (server auto-resets
  // every 30 days). Mirrors `synced`: cached for instant/offline display.
  const [monthlySynced, setMonthlySynced] = useState<Lifetime>({});
  // Authoritative live counter. State lags a render behind, so rapid double-taps
  // would otherwise read a stale `count`; the ref advances synchronously per tap.
  const countRef = useRef(0);
  const hydrated = useRef(false);
  const pendingRef = useRef<Lifetime>({});
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flushingRef = useRef(false);

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  // Cloud totals (authoritative across devices). The realtime sync layer
  // invalidates ["cf","dhikr"] when another device increments.
  const cloudQuery = useRqQuery({
    queryKey: ["cf", "dhikr"],
    enabled: Boolean(userId),
    queryFn: async (): Promise<CloudTotals> => {
      const res = await api.api.v1.dhikr.presets.$get();
      if (!res.ok) {
        throw new Error("Failed to load dhikr");
      }
      return (await res.json()) as CloudTotals;
    },
  });

  // Hydrate local caches on user change. Reset first so the previous account's
  // counts never flash before the new account's load resolves.
  useEffect(() => {
    hydrated.current = false;
    setSynced({});
    setPending({});
    setMonthlySynced({});
    pendingRef.current = {};
    if (!userId) {
      hydrated.current = true;
      return;
    }
    let cancelled = false;
    Promise.all([
      AsyncStorage.getItem(syncedKey(userId)),
      AsyncStorage.getItem(pendingKey(userId)),
      AsyncStorage.getItem(monthlyKey(userId)),
    ])
      .then(([s, p, m]) => {
        if (cancelled) {
          return;
        }
        setSynced(readMap(s));
        const pendingMap = readMap(p);
        setPending(pendingMap);
        pendingRef.current = pendingMap;
        setMonthlySynced(readMap(m));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) {
          hydrated.current = true;
        }
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Adopt cloud totals whenever they load or refresh.
  useEffect(() => {
    if (cloudQuery.data) {
      setSynced(cloudQuery.data.totals ?? {});
      setMonthlySynced(cloudQuery.data.monthly ?? {});
    }
  }, [cloudQuery.data]);

  // Persist both caches (kept out of the setState updaters, which must be pure).
  useEffect(() => {
    if (!(hydrated.current && userId)) {
      return;
    }
    AsyncStorage.setItem(syncedKey(userId), JSON.stringify(synced)).catch(
      () => undefined
    );
  }, [synced, userId]);
  useEffect(() => {
    if (!(hydrated.current && userId)) {
      return;
    }
    AsyncStorage.setItem(pendingKey(userId), JSON.stringify(pending)).catch(
      () => undefined
    );
  }, [pending, userId]);
  useEffect(() => {
    if (!(hydrated.current && userId)) {
      return;
    }
    AsyncStorage.setItem(
      monthlyKey(userId),
      JSON.stringify(monthlySynced)
    ).catch(() => undefined);
  }, [monthlySynced, userId]);

  // Push unsynced taps to the server. Each preset's server total already includes
  // the sent delta, so synced is set to it and the same delta removed from pending
  // in lockstep — the displayed sum never flickers. Failures keep pending for the
  // next flush, so offline taps are never lost.
  const flush = useCallback(async () => {
    if (!userId || flushingRef.current) {
      return;
    }
    const entries = Object.entries(pendingRef.current).filter(([, n]) => n > 0);
    if (entries.length === 0) {
      return;
    }
    flushingRef.current = true;
    try {
      for (const [presetId, by] of entries) {
        try {
          const res = await api.api.v1.dhikr.presets.increment.$post({
            json: { presetId, by },
          });
          if (!res.ok) {
            continue;
          }
          const { presetTotal, monthlyTotal } = (await res.json()) as {
            presetTotal: number;
            grandTotal: number;
            monthlyTotal: number;
          };
          setSynced((prev) => ({ ...prev, [presetId]: presetTotal }));
          setMonthlySynced((prev) => ({ ...prev, [presetId]: monthlyTotal }));
          setPending((prev) => ({
            ...prev,
            [presetId]: Math.max(0, (prev[presetId] ?? 0) - by),
          }));
        } catch {
          // Keep pending; retry on the next flush.
        }
      }
    } finally {
      flushingRef.current = false;
    }
  }, [userId]);

  const scheduleFlush = useCallback(() => {
    if (flushTimer.current) {
      clearTimeout(flushTimer.current);
    }
    flushTimer.current = setTimeout(() => {
      flush().catch(() => undefined);
    }, FLUSH_DELAY_MS);
  }, [flush]);

  // Flush leftover pending on mount / user change (e.g. taps made while offline),
  // and clear the debounce timer on unmount.
  useEffect(() => {
    if (userId) {
      flush().catch(() => undefined);
    }
    return () => {
      if (flushTimer.current) {
        clearTimeout(flushTimer.current);
      }
    };
  }, [userId, flush]);

  const addLifetime = useCallback(
    (id: string, n = 1) => {
      setPending((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + n }));
      scheduleFlush();
    },
    [scheduleFlush]
  );

  // Displayed lifetime = cloud-synced + unflushed local taps.
  const totals = useMemo<Lifetime>(() => {
    const merged: Lifetime = { ...synced };
    for (const [id, n] of Object.entries(pending)) {
      merged[id] = (merged[id] ?? 0) + n;
    }
    return merged;
  }, [synced, pending]);

  // Displayed monthly = cloud monthly window + unflushed local taps (recent
  // taps always fall inside the current window).
  const monthly = useMemo<Lifetime>(() => {
    const merged: Lifetime = { ...monthlySynced };
    for (const [id, n] of Object.entries(pending)) {
      merged[id] = (merged[id] ?? 0) + n;
    }
    return merged;
  }, [monthlySynced, pending]);

  const active = PRESETS[activeIndex];
  const complete = count >= active.target;
  const isLast = activeIndex === PRESETS.length - 1;
  const next = PRESETS[(activeIndex + 1) % PRESETS.length];

  const goTo = useCallback((idx: number) => {
    setActiveIndex(idx);
    countRef.current = 0;
    setCount(0);
  }, []);

  const resetSession = useCallback(() => {
    hapticSelection();
    countRef.current = 0;
    setCount(0);
  }, []);

  const nextDhikr = useCallback(() => {
    hapticSelection();
    setActiveIndex((idx) => (idx + 1) % PRESETS.length);
    countRef.current = 0;
    setCount(0);
  }, []);

  const increment = useCallback(() => {
    const prev = countRef.current;
    if (prev >= active.target) {
      return;
    }
    const nextCount = prev + 1;
    countRef.current = nextCount;
    if (nextCount >= active.target) {
      hapticImpact("heavy");
    } else if (nextCount % 10 === 0) {
      hapticImpact("medium");
    } else {
      hapticImpact("light");
    }
    setCount(nextCount);
    addLifetime(active.id, 1);
  }, [active.id, active.target, addLifetime]);

  const grandTotal = useMemo(
    () => Object.values(totals).reduce((s, n) => s + n, 0),
    [totals]
  );

  const value = useMemo<DhikrContextValue>(
    () => ({
      active,
      activeIndex,
      complete,
      count,
      goTo,
      grandTotal,
      increment,
      isLast,
      monthly,
      next,
      nextDhikr,
      resetSession,
      totals,
    }),
    [
      active,
      activeIndex,
      complete,
      count,
      goTo,
      grandTotal,
      increment,
      isLast,
      monthly,
      next,
      nextDhikr,
      resetSession,
      totals,
    ]
  );

  return (
    <DhikrContext.Provider value={value}>{children}</DhikrContext.Provider>
  );
}

export function useDhikr() {
  const ctx = useContext(DhikrContext);
  if (!ctx) {
    throw new Error("useDhikr must be used inside DhikrProvider");
  }
  return ctx;
}
