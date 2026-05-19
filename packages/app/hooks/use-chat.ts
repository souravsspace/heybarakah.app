import { api } from "@barakah/core/convex/_generated/api";
import type { Id } from "@barakah/core/convex/_generated/dataModel";
import { env } from "@barakah/env/app";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  getCachedMessages,
  type LocalChatMessage,
  setCachedMessages,
} from "@/lib/chat-local";
import { useChatStream } from "./use-chat-stream";

export type ChatMessageView = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  streamId?: string;
  pending?: boolean;
};

type SendState = {
  streamId: string;
  assistantMessageId: Id<"chatMessages">;
} | null;

export function useChat(conversationId: Id<"chatConversations"> | null) {
  const { isAuthenticated } = useConvexAuth();
  const messagesQuery = useQuery(
    api.lib.chat.listMessages,
    conversationId && isAuthenticated ? { conversationId } : "skip"
  );
  const remainingQuery = useQuery(
    api.lib.chat.getRemainingToday,
    isAuthenticated ? {} : "skip"
  );
  const sendMutation = useMutation(api.lib.chat.sendUserMessage);

  const [localMessages, setLocalMessages] = useState<ChatMessageView[]>([]);
  const [activeStream, setActiveStream] = useState<SendState>(null);
  const [pendingUser, setPendingUser] = useState<ChatMessageView | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hydratedRef = useRef<string | null>(null);
  const sendingRef = useRef(false);

  useEffect(() => {
    if (!conversationId) {
      setLocalMessages([]);
      hydratedRef.current = null;
      return;
    }
    if (hydratedRef.current === conversationId) {
      return;
    }
    hydratedRef.current = conversationId;
    let cancelled = false;
    getCachedMessages(conversationId)
      .then((cached) => {
        if (cancelled) {
          return;
        }
        setLocalMessages(
          cached.map((m: LocalChatMessage) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            createdAt: m.createdAt,
          }))
        );
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  useEffect(() => {
    if (!(conversationId && messagesQuery)) {
      return;
    }
    const flat = messagesQuery.map((m) => ({
      id: m._id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
      streamId: m.streamId,
    }));
    setLocalMessages(flat);
    setCachedMessages(
      conversationId,
      flat.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      }))
    ).catch(() => undefined);
  }, [messagesQuery, conversationId]);

  const streamUrl = useMemo(
    () => new URL(`${env.EXPO_PUBLIC_CONVEX_SITE_URL}/api/chat/stream`),
    []
  );

  const [authToken, setAuthToken] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!isAuthenticated) {
      setAuthToken(undefined);
      return;
    }
    let cancelled = false;
    authClient.convex
      .token({ fetchOptions: { throw: false } })
      .then((res: { data?: { token?: string | null } | null }) => {
        if (cancelled) {
          return;
        }
        const token = res?.data?.token ?? null;
        setAuthToken(token ?? undefined);
      })
      .catch(() => {
        if (!cancelled) {
          setAuthToken(undefined);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const streamOpts = useMemo(
    () => (authToken ? { authToken } : undefined),
    [authToken]
  );
  const streamHook = useChatStream(
    api.lib.chat.getStreamBody,
    streamUrl,
    Boolean(activeStream) && Boolean(authToken),
    activeStream?.streamId ?? "",
    streamOpts
  );

  useEffect(() => {
    if (!activeStream) {
      return;
    }
    if (streamHook.status === "done" || streamHook.status === "error") {
      setActiveStream(null);
      setPendingUser(null);
      setSending(false);
      sendingRef.current = false;
    }
  }, [streamHook.status, activeStream]);

  const send = useCallback(
    async (
      text: string,
      currentConvId: Id<"chatConversations"> | null
    ): Promise<{ conversationId: Id<"chatConversations"> } | null> => {
      const trimmed = text.trim();
      if (!trimmed || sendingRef.current) {
        return null;
      }
      if (!authToken) {
        setError("Signing in… please try again.");
        return null;
      }
      sendingRef.current = true;
      setSending(true);
      setError(null);
      const optimistic: ChatMessageView = {
        id: `optimistic-${Date.now()}`,
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
        pending: true,
      };
      setPendingUser(optimistic);
      try {
        const result = await sendMutation({
          conversationId: currentConvId ?? undefined,
          content: trimmed,
        });
        setActiveStream({
          streamId: result.streamId,
          assistantMessageId: result.assistantMessageId,
        });
        return { conversationId: result.conversationId };
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to send";
        setError(
          message.includes("DAILY_LIMIT_REACHED")
            ? "Daily limit reached. Try again tomorrow."
            : message
        );
        setPendingUser(null);
        setSending(false);
        sendingRef.current = false;
        return null;
      }
    },
    [sendMutation, authToken]
  );

  const messages: ChatMessageView[] = (() => {
    const list = [...localMessages];
    if (activeStream && streamHook.text && streamHook.status !== "error") {
      const idx = list.findIndex(
        (m) => m.streamId === activeStream.streamId && m.role === "assistant"
      );
      if (idx >= 0) {
        list[idx] = { ...list[idx], content: streamHook.text };
      }
    }
    if (
      pendingUser &&
      !list.some((m) => m.role === "user" && m.content === pendingUser.content)
    ) {
      list.push(pendingUser);
    }
    return list;
  })();

  return {
    messages,
    send,
    sending,
    streaming: Boolean(
      activeStream &&
        (streamHook.status === "streaming" || streamHook.status === "pending")
    ),
    streamStatus: streamHook.status,
    remaining: remainingQuery?.remaining ?? null,
    limit: remainingQuery?.limit ?? null,
    error,
  };
}
