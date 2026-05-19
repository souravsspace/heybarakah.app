import { api } from "@barakah/core/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/theme-context";
import {
  getCachedConversations,
  type LocalConversationSummary,
  setCachedConversations,
} from "@/lib/chat-local";

function formatRelative(now: number, ts: number): string {
  const diff = now - ts;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < hour) {
    return `${Math.max(1, Math.round(diff / minute))}m`;
  }
  if (diff < day) {
    return `${Math.round(diff / hour)}h`;
  }
  if (diff < 7 * day) {
    return `${Math.round(diff / day)}d`;
  }
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function HidayahIndex() {
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const remote = useQuery(api.lib.chat.listConversations, {});
  const [local, setLocal] = useState<LocalConversationSummary[]>([]);

  useEffect(() => {
    getCachedConversations()
      .then(setLocal)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!remote) {
      return;
    }
    const summaries: LocalConversationSummary[] = remote.map((c) => ({
      id: c._id,
      title: c.title,
      updatedAt: c.updatedAt,
    }));
    setLocal(summaries);
    setCachedConversations(summaries).catch(() => undefined);
  }, [remote]);

  const conversations = local;
  const now = Date.now();

  return (
    <View
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
        <Pressable
          accessibilityLabel="New conversation"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => router.push("/hidayah/new")}
        >
          <Ionicons color={colors.primary} name="add" size={26} />
        </Pressable>
      </View>

      {conversations.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 32,
            gap: 14,
          }}
        >
          <Text
            style={{
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 22,
              color: colors.ink,
              textAlign: "center",
            }}
          >
            No conversations yet
          </Text>
          <Text
            style={{
              fontSize: 14,
              lineHeight: 20,
              color: colors.inkMuted,
              textAlign: "center",
            }}
          >
            Ask only what the Qur'an or authentic Hadith can answer.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/hidayah/new")}
            style={({ pressed }) => ({
              marginTop: 8,
              paddingHorizontal: 18,
              paddingVertical: 10,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: colors.primary,
              backgroundColor: pressed ? colors.primarySoft : "transparent",
            })}
          >
            <Text
              style={{
                color: colors.primary,
                fontSize: 13,
                fontWeight: "700",
              }}
            >
              Begin
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              accessibilityLabel={`Open ${item.title}`}
              accessibilityRole="button"
              onPress={() => router.push(`/hidayah/${item.id}`)}
              style={({ pressed }) => ({
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.divider,
                backgroundColor: pressed
                  ? scheme === "dark"
                    ? "#1A1A1A"
                    : "#F0E9D9"
                  : "transparent",
              })}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    flex: 1,
                    fontSize: 15,
                    color: colors.ink,
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    fontVariant: ["tabular-nums"],
                    color: colors.inkSubtle,
                  }}
                >
                  {formatRelative(now, item.updatedAt)}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
