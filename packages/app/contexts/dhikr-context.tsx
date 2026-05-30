import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
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

const LIFETIME_KEY = "@barakah/dhikr/lifetime";

type Lifetime = Record<string, number>;

interface DhikrContextValue {
  active: Preset;
  activeIndex: number;
  complete: boolean;
  count: number;
  goTo: (idx: number) => void;
  grandTotal: number;
  increment: () => void;
  isLast: boolean;
  next: Preset;
  nextDhikr: () => void;
  resetSession: () => void;
  totals: Lifetime;
}

const DhikrContext = createContext<DhikrContextValue | null>(null);

export function DhikrProvider({ children }: { children: ReactNode }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [totals, setTotals] = useState<Lifetime>({});
  // Authoritative live counter. State lags a render behind, so rapid double-taps
  // would otherwise read a stale `count`; the ref advances synchronously per tap.
  const countRef = useRef(0);
  const totalsHydrated = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(LIFETIME_KEY)
      .then((raw) => {
        if (!raw) {
          return;
        }
        try {
          const parsed = JSON.parse(raw) as Lifetime;
          if (parsed && typeof parsed === "object") {
            setTotals(parsed);
          }
        } catch {
          // ignore malformed
        }
      })
      .catch(() => undefined)
      .finally(() => {
        totalsHydrated.current = true;
      });
  }, []);

  // Persist totals as a pure effect — keeping the write out of the setState
  // updater (updaters must be pure; React may double-invoke them).
  useEffect(() => {
    if (!totalsHydrated.current) {
      return;
    }
    AsyncStorage.setItem(LIFETIME_KEY, JSON.stringify(totals)).catch(
      () => undefined
    );
  }, [totals]);

  const addLifetime = useCallback((id: string, n = 1) => {
    setTotals((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + n }));
  }, []);

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
    Haptics.selectionAsync().catch(() => undefined);
    countRef.current = 0;
    setCount(0);
  }, []);

  const nextDhikr = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(
        () => undefined
      );
    } else if (nextCount % 10 === 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
        () => undefined
      );
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
        () => undefined
      );
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
