import { api } from "@barakah/core/convex/_generated/api";
import { useMutation } from "convex/react";
import {
  addDhikrIncrementListener,
  consumePendingDhikr,
} from "expo-widget-bridge";
import { useEffect } from "react";

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function useDhikrIncrementBridge(): void {
  const increment = useMutation(api.lib.dhikr.increment);
  useEffect(() => {
    const sub = addDhikrIncrementListener(() => {
      consumePendingDhikr()
        .then((n) => {
          if (n > 0) {
            return increment({ date: todayKey(), by: n });
          }
          return null;
        })
        .catch(() => {
          // bridge may be unavailable
        });
    });
    return () => sub.remove();
  }, [increment]);
}
