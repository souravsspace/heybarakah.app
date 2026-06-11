import type { Achievement } from "@barakah/core/achievements";
import { api } from "@barakah/core/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { AchievementDialog } from "./achievement-dialog";

type UnseenUnlock = Achievement & { unlockedAt: number };

export function AchievementPopupProvider({
  children,
}: {
  children: ReactNode;
}) {
  const unseen = useQuery(api.lib.achievements.listUnseen, {});
  const markSeen = useMutation(api.lib.achievements.markSeen);
  const [queue, setQueue] = useState<UnseenUnlock[]>([]);
  const [active, setActive] = useState<UnseenUnlock | null>(null);
  const dismissedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!unseen) {
      return;
    }
    const liveCodes = new Set<string>(unseen.map((u) => u.code));
    for (const code of Array.from(dismissedRef.current)) {
      if (!liveCodes.has(code)) {
        dismissedRef.current.delete(code);
      }
    }
    if (unseen.length === 0) {
      return;
    }
    const activeCode = active?.code;
    setQueue((prev) => {
      const knownCodes = new Set<string>(prev.map((p) => p.code));
      if (activeCode) {
        knownCodes.add(activeCode);
      }
      for (const code of dismissedRef.current) {
        knownCodes.add(code);
      }
      const next = unseen.filter(
        (u): u is UnseenUnlock => !knownCodes.has(u.code)
      );
      return next.length === 0 ? prev : [...prev, ...next];
    });
  }, [unseen, active]);

  useEffect(() => {
    if (active || queue.length === 0) {
      return;
    }
    setActive(queue[0]);
    setQueue((q) => q.slice(1));
  }, [active, queue]);

  const onClose = () => {
    if (!active) {
      return;
    }
    const code = active.code;
    dismissedRef.current.add(code);
    setActive(null);
    markSeen({ codes: [code] }).catch(() => undefined);
  };

  const onViewAll = () => {
    router.push("/achievements" as never);
  };

  return (
    <>
      {children}
      <AchievementDialog
        category={active?.category ?? "beginnings"}
        description={active?.description ?? ""}
        icon={active?.icon ?? "trophy-outline"}
        mode="reveal"
        onClose={onClose}
        onViewAll={onViewAll}
        quote={active?.quote}
        tier={active?.tier ?? "bronze"}
        title={active?.title ?? ""}
        unlockedAt={active?.unlockedAt ?? null}
        visible={active !== null}
      />
    </>
  );
}
