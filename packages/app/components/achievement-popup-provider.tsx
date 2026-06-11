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
  // The whole set of just-unlocked achievements is shown in a single dialog
  // session with an in-place pager, so two unlocks from one action (e.g.
  // first_log + first_on_time) read as one celebration, not a glitchy repeat.
  const [batch, setBatch] = useState<UnseenUnlock[]>([]);
  const [index, setIndex] = useState(0);
  const dismissedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!unseen) {
      return;
    }
    // Drop dismissed codes the server no longer reports so a later genuine
    // re-unlock (shouldn't happen, but cheap to be safe) can surface again.
    const liveCodes = new Set<string>(unseen.map((u) => u.code));
    for (const code of Array.from(dismissedRef.current)) {
      if (!liveCodes.has(code)) {
        dismissedRef.current.delete(code);
      }
    }
    // Don't grow a batch mid-celebration; the next set surfaces after close.
    if (batch.length > 0 || unseen.length === 0) {
      return;
    }
    const fresh = unseen.filter((u) => !dismissedRef.current.has(u.code));
    if (fresh.length === 0) {
      return;
    }
    setBatch(fresh);
    setIndex(0);
  }, [unseen, batch.length]);

  const active = batch[index] ?? null;
  const pageCount = batch.length;
  const onLast = index >= pageCount - 1;

  const onNext = () => {
    if (!onLast) {
      setIndex((i) => i + 1);
    }
  };

  const onClose = () => {
    if (pageCount === 0) {
      return;
    }
    const codes = batch.map((b) => b.code);
    for (const code of codes) {
      dismissedRef.current.add(code);
    }
    setBatch([]);
    setIndex(0);
    markSeenMutation.mutateAsync(codes).catch(() => undefined);
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
        onNext={onNext}
        onViewAll={onViewAll}
        pageCount={pageCount}
        pageIndex={index}
        quote={active?.quote}
        tier={active?.tier ?? "bronze"}
        title={active?.title ?? ""}
        unlockedAt={active?.unlockedAt ?? null}
        visible={active !== null}
      />
    </>
  );
}
