import { google } from "@ai-sdk/google";
import {
  PersistentTextStreaming,
  type StreamId,
  StreamIdValidator,
} from "@convex-dev/persistent-text-streaming";
import { streamText } from "ai";
import { v } from "convex/values";
import { components, internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import {
  httpAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "../_generated/server";
import { authComponent } from "./auth";
import { deriveTitle } from "./chatHelpers";
import {
  consumeOne,
  DAILY_CHAT_LIMIT,
  getRemainingForToday,
} from "./chatRateLimit";

const HISTORY_LIMIT = 20;
const MAX_OUTPUT_TOKENS = 320;
const TEMPERATURE = 0.4;
const MODEL_ID = "gemini-3.1-flash-lite";

const SYSTEM_PROMPT = `You answer only from the Qur'an and authentic Hadith.
Cite the Qur'an as (Surah:Ayah). Cite Hadith as (Collection, number).
If a question cannot be answered from these sources, reply exactly: "Outside the Qur'an and Hadith — I cannot answer."
Style: terse. Fragments OK. No preamble. No filler.
Maximum 4 sentences unless explicitly asked to expand.
Use Islamic honorifics: ﷺ for the Prophet, (AS) for prophets, (RA) for companions.`;

const persistentTextStreaming = new PersistentTextStreaming(
  components.persistentTextStreaming
);

export const listConversations = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return [];
    }
    return await ctx.db
      .query("chatConversations")
      .withIndex("by_user_updated", (q) => q.eq("authUserId", user._id))
      .order("desc")
      .take(50);
  },
});

export const listMessages = query({
  args: { conversationId: v.id("chatConversations") },
  handler: async (ctx, { conversationId }) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return [];
    }
    const conversation = await ctx.db.get(conversationId);
    if (!conversation || conversation.authUserId !== user._id) {
      return [];
    }
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_conversation_created", (q) =>
        q.eq("conversationId", conversationId)
      )
      .order("asc")
      .collect();
  },
});

export const getRemainingToday = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return { remaining: DAILY_CHAT_LIMIT, limit: DAILY_CHAT_LIMIT };
    }
    const remaining = await getRemainingForToday(ctx.db, user._id);
    return { remaining, limit: DAILY_CHAT_LIMIT };
  },
});

export const createConversation = mutation({
  args: { title: v.optional(v.string()) },
  handler: async (ctx, { title }) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const now = Date.now();
    return await ctx.db.insert("chatConversations", {
      authUserId: user._id,
      title: title?.trim() || "New conversation",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const sendUserMessage = mutation({
  args: {
    conversationId: v.optional(v.id("chatConversations")),
    content: v.string(),
  },
  handler: async (ctx, { conversationId, content }) => {
    const trimmed = content.trim();
    if (!trimmed) {
      throw new Error("Empty message");
    }
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    await consumeOne(ctx.db, user._id);

    const now = Date.now();

    let convId: Id<"chatConversations">;
    if (conversationId) {
      const existing = await ctx.db.get(conversationId);
      if (!existing || existing.authUserId !== user._id) {
        throw new Error("Conversation not found");
      }
      convId = existing._id;
    } else {
      convId = await ctx.db.insert("chatConversations", {
        authUserId: user._id,
        title: deriveTitle(trimmed),
        createdAt: now,
        updatedAt: now,
      });
    }

    const conv = await ctx.db.get(convId);
    if (conv && conv.title === "New conversation") {
      await ctx.db.patch(convId, {
        title: deriveTitle(trimmed),
        updatedAt: now,
      });
    } else if (conv) {
      await ctx.db.patch(convId, { updatedAt: now });
    }

    await ctx.db.insert("chatMessages", {
      conversationId: convId,
      authUserId: user._id,
      role: "user",
      content: trimmed,
      createdAt: now,
    });

    const streamId = await persistentTextStreaming.createStream(ctx);
    const assistantId = await ctx.db.insert("chatMessages", {
      conversationId: convId,
      authUserId: user._id,
      role: "assistant",
      content: "",
      streamId: streamId as string,
      createdAt: now + 1,
    });

    return {
      conversationId: convId,
      assistantMessageId: assistantId,
      streamId: streamId as string,
    };
  },
});

export const getStreamBody = query({
  args: { streamId: StreamIdValidator },
  handler: async (ctx, { streamId }) =>
    await persistentTextStreaming.getStreamBody(ctx, streamId as StreamId),
});

export const getMessageByStream = internalQuery({
  args: { streamId: v.string() },
  handler: async (ctx, { streamId }) =>
    await ctx.db
      .query("chatMessages")
      .withIndex("by_streamId", (q) => q.eq("streamId", streamId))
      .unique(),
});

export const getConversationHistory = internalQuery({
  args: {
    conversationId: v.id("chatConversations"),
    excludeMessageId: v.id("chatMessages"),
    limit: v.number(),
  },
  handler: async (ctx, { conversationId, excludeMessageId, limit }) => {
    const rows = await ctx.db
      .query("chatMessages")
      .withIndex("by_conversation_created", (q) =>
        q.eq("conversationId", conversationId)
      )
      .order("asc")
      .collect();
    return rows
      .filter((m: Doc<"chatMessages">) => m._id !== excludeMessageId)
      .slice(-limit)
      .map((m: Doc<"chatMessages">) => ({
        role: m.role,
        content: m.content,
      }));
  },
});

export const finalizeAssistantMessage = internalMutation({
  args: {
    messageId: v.id("chatMessages"),
    content: v.string(),
  },
  handler: async (ctx, { messageId, content }) => {
    const msg = await ctx.db.get(messageId);
    if (!msg) {
      return;
    }
    await ctx.db.patch(messageId, { content });
    await ctx.db.patch(msg.conversationId, { updatedAt: Date.now() });
  },
});

export const streamChat = httpAction(async (ctx, request) => {
  const { streamId } = (await request.json()) as { streamId: string };

  const assistantMsg = await ctx.runQuery(
    internal.lib.chat.getMessageByStream,
    { streamId }
  );
  if (!assistantMsg) {
    return new Response("Stream not found", { status: 404 });
  }

  const history = await ctx.runQuery(internal.lib.chat.getConversationHistory, {
    conversationId: assistantMsg.conversationId,
    excludeMessageId: assistantMsg._id,
    limit: HISTORY_LIMIT,
  });

  const response = await persistentTextStreaming.stream(
    ctx,
    request,
    streamId as StreamId,
    async (_ctx, _req, _sid, append) => {
      const result = streamText({
        model: google(MODEL_ID),
        system: SYSTEM_PROMPT,
        messages: history.map(
          (m: { role: "user" | "assistant"; content: string }) => ({
            role: m.role,
            content: m.content,
          })
        ),
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: TEMPERATURE,
      });

      let full = "";
      for await (const part of result.textStream) {
        full += part;
        await append(part);
      }

      await ctx.runMutation(internal.lib.chat.finalizeAssistantMessage, {
        messageId: assistantMsg._id,
        content: full,
      });
    }
  );

  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Vary", "Origin");
  return response;
});
