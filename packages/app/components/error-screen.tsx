import { Ionicons } from "@expo/vector-icons";
import { Appearance, Pressable, ScrollView, Text, View } from "react-native";
import { BarakahMark } from "@/components/onboarding/illustrations/barakah-mark";

const GREEN = "#29603E";
const GREEN_DARK = "#1B3F29";

// Self-contained on purpose: this renders when something upstream threw, so it
// must not depend on ThemeProvider/UserProvider/etc. (any of which may be the
// thing that failed). Palette is read straight from the OS, not from context.
export function ErrorScreen({
  error,
  retry,
  title = "Something interrupted us",
  message = "An unexpected error occurred. Your progress is safe — please try again.",
}: {
  error?: Error;
  retry?: () => void;
  title?: string;
  message?: string;
}) {
  const dark = Appearance.getColorScheme() === "dark";
  const bg = dark ? "#0E1311" : "#F8FAF8";
  const ink = dark ? "#FFFFFF" : "#0A0A0A";
  const inkMuted = dark ? "#8E8E93" : "#6B7280";
  const surface = dark ? "rgba(255,255,255,0.05)" : "rgba(41,96,62,0.05)";
  const border = dark ? "rgba(255,255,255,0.12)" : "rgba(41,96,62,0.16)";
  const accent = dark ? "#00D26A" : GREEN;

  return (
    <View style={{ backgroundColor: bg, flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 32,
          paddingVertical: 48,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            alignItems: "center",
            backgroundColor: surface,
            borderColor: border,
            borderRadius: 24,
            borderWidth: 1,
            height: 88,
            justifyContent: "center",
            width: 88,
          }}
        >
          <BarakahMark color={accent} size={40} />
        </View>

        <Text
          style={{
            color: ink,
            fontFamily: "LibreBaskerville-Bold",
            fontSize: 26,
            lineHeight: 32,
            marginTop: 28,
            textAlign: "center",
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            color: inkMuted,
            fontSize: 14,
            lineHeight: 22,
            marginTop: 12,
            maxWidth: 320,
            textAlign: "center",
          }}
        >
          {message}
        </Text>

        {error?.message ? (
          <Text
            style={{
              color: inkMuted,
              fontSize: 11,
              marginTop: 16,
              maxWidth: 320,
              opacity: 0.7,
              textAlign: "center",
            }}
          >
            {error.message}
          </Text>
        ) : null}

        {retry ? (
          <Pressable
            accessibilityLabel="Try again"
            accessibilityRole="button"
            onPress={retry}
            style={({ pressed }) => ({
              alignItems: "center",
              backgroundColor: pressed ? GREEN_DARK : accent,
              borderRadius: 999,
              flexDirection: "row",
              gap: 8,
              marginTop: 32,
              paddingHorizontal: 28,
              paddingVertical: 14,
            })}
          >
            <Ionicons color="#FFFFFF" name="refresh" size={16} />
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: "700",
                letterSpacing: 0.6,
              }}
            >
              Try again
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}
