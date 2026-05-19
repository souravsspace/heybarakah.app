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
import { HidayahMesh } from "@/components/meshes";
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
  const dark = scheme === "dark";

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
      keyboardVerticalOffset={0}
      style={{
        flex: 1,
        backgroundColor: dark ? "#0E1311" : "#F8F1E1",
      }}
    >
      <StatusBar style={dark ? "light" : "dark"} />
      <HidayahMesh dark={dark} />

      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 20,
          paddingBottom: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable
          accessibilityLabel="Back"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => router.back()}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: pressed
              ? dark
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.04)"
              : "transparent",
          })}
        >
          <Ionicons color={colors.ink} name="chevron-back" size={22} />
        </Pressable>

        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: colors.inkSubtle,
            }}
          >
            Guidance
          </Text>
          <Text
            style={{
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 18,
              lineHeight: 22,
              color: colors.ink,
            }}
          >
            Hidāyah
          </Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      <View
        style={{
          marginHorizontal: 20,
          height: 1,
          backgroundColor: colors.divider,
          opacity: 0.6,
        }}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 14,
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
          <View
            style={{
              marginTop: 14,
              alignSelf: "center",
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: colors.primary,
              backgroundColor: colors.primarySoft,
            }}
          >
            <Text
              style={{
                color: colors.primary,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {error}
            </Text>
          </View>
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
