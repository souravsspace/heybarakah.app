import { api } from "@barakah/core/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HidayahMesh } from "@/components/meshes";
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
  const dark = scheme === "dark";

  return (
    <View
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

        <Pressable
          accessibilityLabel="New conversation"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => router.push("/hidayah/new")}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colors.primary,
            backgroundColor: pressed ? colors.primarySoft : "#FFFFFF",
          })}
        >
          <Ionicons color={colors.primary} name="add" size={22} />
        </Pressable>
      </View>

      <View
        style={{
          marginHorizontal: 20,
          height: 1,
          backgroundColor: colors.divider,
          opacity: 0.6,
        }}
      />

      {conversations.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 28,
            gap: 14,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: colors.primary,
              textAlign: "center",
            }}
          >
            Begin
          </Text>
          <Text
            style={{
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 26,
              lineHeight: 32,
              color: colors.ink,
              textAlign: "center",
            }}
          >
            No conversations yet.
          </Text>
          <Text
            style={{
              fontSize: 13,
              lineHeight: 20,
              color: colors.inkMuted,
              textAlign: "center",
              maxWidth: 280,
            }}
          >
            Ask only what the Qur'an or authentic Hadith can answer. Replies
            cite their source.
          </Text>
          <Pressable
            accessibilityLabel="Start a new conversation"
            accessibilityRole="button"
            onPress={() => router.push("/hidayah/new")}
            style={({ pressed }) => ({
              marginTop: 12,
              paddingHorizontal: 22,
              paddingVertical: 11,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: colors.primary,
              backgroundColor: pressed ? colors.primarySoft : "transparent",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            })}
          >
            <Ionicons
              color={colors.primary}
              name="sparkles-outline"
              size={14}
            />
            <Text
              style={{
                color: colors.primary,
                fontSize: 12,
                fontWeight: "700",
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              Ask Hidāyah
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{
            paddingTop: 8,
            paddingBottom: insets.bottom + 32,
            paddingHorizontal: 20,
          }}
          data={conversations}
          ItemSeparatorComponent={() => (
            <View
              style={{
                height: 1,
                backgroundColor: colors.divider,
                opacity: 0.5,
              }}
            />
          )}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              accessibilityLabel={`Open ${item.title}`}
              accessibilityRole="button"
              onPress={() => router.push(`/hidayah/${item.id}`)}
              style={({ pressed }) => ({
                paddingVertical: 16,
                paddingHorizontal: 4,
                backgroundColor: pressed
                  ? dark
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(41,96,62,0.05)"
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
                    lineHeight: 20,
                    color: colors.ink,
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
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
