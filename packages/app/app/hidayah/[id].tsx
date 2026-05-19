import type { Id } from "@barakah/core/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatEmptyState } from "@/components/chat/empty-state";
import { LimitBanner } from "@/components/chat/limit-banner";
import { MessageBubble } from "@/components/chat/message-bubble";
import { StreamingMessage } from "@/components/chat/streaming-message";
import { useTheme } from "@/contexts/theme-context";
import { useChat } from "@/hooks/use-chat";

export default function HidayahThread() {
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const rawId = params.id;
  const isNew = !rawId || rawId === "new";
  const [conversationId, setConversationId] =
    useState<Id<"chatConversations"> | null>(
      isNew ? null : (rawId as Id<"chatConversations">)
    );

  const {
    messages,
    send,
    sending,
    streaming,
    streamStatus,
    remaining,
    limit,
    error,
  } = useChat(conversationId);

  const scrollRef = useRef<ScrollView>(null);
  const lastContentLength = messages.at(-1)?.content.length ?? 0;

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages.length, streaming, lastContentLength]);

  const limitReached = remaining !== null && remaining <= 0;

  const onSend = (text: string) => {
    send(text, conversationId)
      .then((result) => {
        if (result?.conversationId && !conversationId) {
          setConversationId(result.conversationId);
          router.setParams({ id: result.conversationId });
        }
      })
      .catch(() => undefined);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      style={{
        flex: 1,
        backgroundColor: scheme === "dark" ? "#0E1311" : "#F8F1E1",
      }}
    >
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <View
        style={{
          paddingTop: insets.top + 6,
          paddingHorizontal: 20,
          paddingBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomWidth: 1,
          borderBottomColor: colors.divider,
        }}
      >
        <Pressable
          accessibilityLabel="Back"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => router.back()}
        >
          <Ionicons color={colors.ink} name="chevron-back" size={26} />
        </Pressable>
        <Text
          style={{
            fontFamily: "LibreBaskerville-Bold",
            fontSize: 18,
            color: colors.ink,
          }}
        >
          Hidāyah
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 16,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && !sending ? (
          <ChatEmptyState colors={colors} />
        ) : (
          messages.map((m) => {
            const isStreaming =
              m.role === "assistant" && streaming && m.streamId;
            if (isStreaming) {
              return (
                <StreamingMessage
                  colors={colors}
                  content={m.content}
                  done={streamStatus === "done"}
                  key={m.id}
                />
              );
            }
            return (
              <MessageBubble
                colors={colors}
                content={m.content}
                key={m.id}
                role={m.role}
              />
            );
          })
        )}
        {error ? (
          <Text
            style={{
              marginTop: 12,
              textAlign: "center",
              color: colors.inkMuted,
              fontSize: 12,
            }}
          >
            {error}
          </Text>
        ) : null}
      </ScrollView>

      <LimitBanner colors={colors} limit={limit} remaining={remaining} />
      <View style={{ paddingBottom: insets.bottom }}>
        <ChatComposer
          colors={colors}
          disabled={sending || streaming || limitReached}
          onSend={onSend}
          placeholder={
            limitReached ? "Daily limit reached" : "Ask the Qur'an and Hadith…"
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
}
