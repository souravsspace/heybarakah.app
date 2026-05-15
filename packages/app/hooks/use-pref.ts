import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const PREFIX = "@barakah/pref/";

export function usePref(key: string, defaultValue: boolean) {
  const [value, setValue] = useState(defaultValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PREFIX + key)
      .then((raw) => {
        if (raw === "1") {
          setValue(true);
        } else if (raw === "0") {
          setValue(false);
        }
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, [key]);

  const set = (v: boolean) => {
    setValue(v);
    AsyncStorage.setItem(PREFIX + key, v ? "1" : "0").catch(() => undefined);
  };

  return { value, set, hydrated };
}
