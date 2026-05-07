import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";

const STORAGE_KEY = "onboarding:v1";

export type Plan = "yearly" | "monthly" | "lifetime";
export type AuthProvider = "apple" | "google" | "email";

export interface OnboardingState {
  authProvider?: AuthProvider;
  calcMethod?:
    | "isna"
    | "mwl"
    | "umm-al-qura"
    | "egyptian"
    | "karachi"
    | "custom";
  completedAt?: string;
  consistency?: "never" | "sometimes" | "most" | "all";
  gender?: "male" | "female";
  goal?: "all-five" | "khushu" | "phone-addiction" | "fajr";
  hydrated: boolean;
  locationGranted?: boolean;
  madhab?: "hanafi" | "shafii" | "maliki" | "hanbali" | "none";
  name?: string;
  notifGranted?: boolean;
  plan?: Plan;
  prayersToLock: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
  strictness?: "adhan-iqama" | "full-window" | "custom";
  struggle?: "phone" | "forgetting" | "fajr" | "khushu";
  trialStartedAt?: string;
  version: 1;
}

const INITIAL: OnboardingState = {
  prayersToLock: {
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
  hydrated: false,
  version: 1,
};

type Action =
  | { type: "SET_FIELD"; payload: Partial<OnboardingState> }
  | { type: "TOGGLE_PRAYER"; key: keyof OnboardingState["prayersToLock"] }
  | { type: "HYDRATE"; payload: OnboardingState }
  | { type: "RESET" }
  | { type: "COMPLETE" };

function reducer(state: OnboardingState, action: Action): OnboardingState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, ...action.payload };
    case "TOGGLE_PRAYER":
      return {
        ...state,
        prayersToLock: {
          ...state.prayersToLock,
          [action.key]: !state.prayersToLock[action.key],
        },
      };
    case "HYDRATE":
      return { ...action.payload, hydrated: true };
    case "RESET":
      return { ...INITIAL, hydrated: true };
    case "COMPLETE":
      return { ...state, completedAt: new Date().toISOString() };
    default:
      return state;
  }
}

interface Ctx {
  dispatch: React.Dispatch<Action>;
  state: OnboardingState;
}

const OnboardingContext = createContext<Ctx | null>(null);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as OnboardingState;
            dispatch({
              type: "HYDRATE",
              payload: { ...INITIAL, ...parsed, hydrated: true },
            });
            return;
          } catch {
            dispatch({ type: "HYDRATE", payload: INITIAL });
            return;
          }
        }
        dispatch({ type: "HYDRATE", payload: INITIAL });
      })
      .catch(() => dispatch({ type: "HYDRATE", payload: INITIAL }));
  }, []);

  useEffect(() => {
    if (!state.hydrated) {
      return;
    }
    if (writeTimer.current) {
      clearTimeout(writeTimer.current);
    }
    writeTimer.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(
        () => undefined
      );
    }, 200);
    return () => {
      if (writeTimer.current) {
        clearTimeout(writeTimer.current);
      }
    };
  }, [state]);

  return (
    <OnboardingContext.Provider value={{ state, dispatch }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingState() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error(
      "useOnboardingState must be used inside OnboardingProvider"
    );
  }
  return ctx;
}
