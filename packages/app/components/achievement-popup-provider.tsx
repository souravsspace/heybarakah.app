import type { Achievement } from "@barakah/core/achievements";
import { api } from "@barakah/core/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { type ReactNode, useEffect, useState } from "react";
import { AchievementDetailSheet } from "./achievement-detail-sheet";

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

  useEffect(() => {
    if (!unseen || unseen.length === 0) {
      return;
    }
    setQueue((prev) => {
      const knownCodes = new Set(prev.map((p) => p.code));
      if (active) {
        knownCodes.add(active.code);
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
    setActive(null);
    markSeen({ codes: [code] }).catch(() => undefined);
  };

  return (
    <>
      {children}
      <AchievementDetailSheet
        ctaLabel="Continue"
        description={active?.description ?? ""}
        headerLabel="Achievement unlocked"
        icon={active?.icon ?? "trophy-outline"}
        onClose={onClose}
        quote={active?.quote}
        title={active?.title ?? ""}
        unlocked={true}
        unlockedAt={active?.unlockedAt ?? null}
        visible={active !== null}
      />
    </>
  );
}
