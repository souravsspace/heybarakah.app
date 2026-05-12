import { api } from "@barakah/core/convex/_generated/api";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useUser } from "@/contexts/user-context";

const MADHAB_LABEL: Record<string, string> = {
  hanafi: "Hanafi",
  shafii: "Shāfiʿī",
  maliki: "Mālikī",
  hanbali: "Ḥanbalī",
  none: "Not specified",
};

const METHOD_LABEL: Record<string, string> = {
  isna: "ISNA",
  mwl: "Muslim World League",
  "umm-al-qura": "Umm al-Qura",
  egyptian: "Egyptian",
  karachi: "Karachi",
  custom: "Custom",
};

interface Row {
  destructive?: boolean;
  id: string;
  label: string;
  onPress?: () => void;
  sf: string;
  value?: string;
}

export default function Profile() {
  const router = useRouter();
  const { user } = useUser();
  const profile = useQuery(api.lib.users.getMyProfile);

  const name = profile?.name?.trim() || user?.name?.trim() || "friend";
  const email = user?.email ?? null;
  const initial = name.charAt(0).toUpperCase();

  const rows: Row[] = [
    {
      id: "madhab",
      label: "Madhab",
      value: MADHAB_LABEL[profile?.madhab ?? "none"] ?? "Not set",
      sf: "book.closed",
    },
    {
      id: "method",
      label: "Calculation",
      value: METHOD_LABEL[profile?.calcMethod ?? "mwl"] ?? "Not set",
      sf: "function",
    },
    {
      id: "location",
      label: "Location",
      value: profile?.locationGranted ? "Granted" : "Not granted",
      sf: "location",
    },
    {
      id: "notifications",
      label: "Notifications",
      value: profile?.notifGranted ? "Granted" : "Not granted",
      sf: "bell",
    },
  ];

  const actions: Row[] = [
    {
      id: "logout",
      label: "Log out",
      sf: "arrow.right.square",
      destructive: true,
      onPress: () => router.replace("/logging-out" as never),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-md" style={{ paddingTop: 8, gap: 4 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 2.4,
              color: "#6B7280",
              textTransform: "uppercase",
            }}
          >
            Profile
          </Text>
        </View>

        <View
          className="mx-md"
          style={{
            marginTop: 16,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            padding: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "#E8F0EA",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              className="font-serif"
              style={{ fontSize: 28, color: "#29603E" }}
            >
              {initial}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              className="font-serif"
              style={{ fontSize: 22, color: "#000" }}
            >
              {name}
            </Text>
            {email ? (
              <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
                {email}
              </Text>
            ) : null}
          </View>
        </View>

        <View className="px-md" style={{ marginTop: 28, gap: 12 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 2.4,
              color: "#6B7280",
              textTransform: "uppercase",
            }}
          >
            Preferences
          </Text>
          <View
            style={{
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              overflow: "hidden",
            }}
          >
            {rows.map((r, i) => (
              <RowItem isFirst={i === 0} key={r.id} row={r} />
            ))}
          </View>
        </View>

        <View className="px-md" style={{ marginTop: 28, gap: 12 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 2.4,
              color: "#6B7280",
              textTransform: "uppercase",
            }}
          >
            Account
          </Text>
          <View
            style={{
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              overflow: "hidden",
            }}
          >
            {actions.map((r, i) => (
              <RowItem isFirst={i === 0} key={r.id} row={r} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RowItem({ row, isFirst }: { row: Row; isFirst: boolean }) {
  const color = row.destructive ? "#B42318" : "#000";
  const iconColor = row.destructive ? "#B42318" : "#29603E";
  return (
    <Pressable
      disabled={!row.onPress}
      onPress={row.onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 14,
        borderTopWidth: isFirst ? 0 : 1,
        borderTopColor: "#EFEFEF",
        backgroundColor: pressed ? "#FAFAF7" : "transparent",
      })}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: row.destructive ? "#FBEAE8" : "#F5F5F4",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconSymbol color={iconColor} name={row.sf as never} size={16} />
      </View>
      <Text style={{ flex: 1, fontSize: 15, fontWeight: "600", color }}>
        {row.label}
      </Text>
      {row.value ? (
        <Text style={{ fontSize: 14, color: "#6B7280" }}>{row.value}</Text>
      ) : null}
    </Pressable>
  );
}
