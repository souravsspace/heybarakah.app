import type { Achievement } from "@barakah/core/achievements";
import {
  useQueryClient,
  useMutation as useRqMutation,
  useQuery as useRqQuery,
} from "@tanstack/react-query";
import { router } from "expo-router";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api-client";
import { AchievementDialog } from "./achievement-dialog";

type UnseenUnlock = Achievement & { unlockedAt: number };

const UNSEEN_QUERY_KEY = ["cf", "achievements", "unseen"] as const;

export function AchievementPopupProvider({
  children,
}: {
  children: ReactNode;
}) {
  const queryClient = useQueryClient();
  const unseenQuery = useRqQuery({
    queryKey: UNSEEN_QUERY_KEY,
    queryFn: async (): Promise<UnseenUnlock[]> => {
      const res = await api.api.v1.achievements.unseen.$get();
      if (!res.ok) {
        throw new Error("Failed to load unseen achievements");
      }
      return (await res.json()) as unknown as UnseenUnlock[];
    },
  });
  const unseen = unseenQuery.data;
  const markSeenMutation = useRqMutation({
    mutationFn: async (codes: string[]) => {
      const res = await api.api.v1.achievements.seen.$post({ json: { codes } });
      if (!res.ok) {
        throw new Error("Failed to mark achievements seen");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UNSEEN_QUERY_KEY });
    },
  });
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
    markSeenMutation.mutateAsync([code]).catch(() => undefined);
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
