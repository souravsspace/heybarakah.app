import * as Notifications from "expo-notifications";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";
import { useTheme } from "@/contexts/theme-context";

Notifications.setNotificationHandler({
  handleNotification: () =>
    Promise.resolve({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
});

const PRIMARY_BRIGHT = "#00D26A";

export default function TabsLayout() {
  const { colors, scheme } = useTheme();
  const selectedContent =
    Platform.OS === "android" ? "#FFFFFF" : PRIMARY_BRIGHT;
  const tabBg = scheme === "dark" ? "#0A0A0A" : "#FFFFFF";

  return (
    <NativeTabs
      backgroundColor={tabBg}
      disableTransparentOnScrollEdge
      iconColor={{ default: colors.inkMuted, selected: selectedContent }}
      indicatorColor={colors.primary}
      labelStyle={{
        default: { color: colors.inkMuted },
        selected: { color: selectedContent },
      }}
      tintColor={colors.primary}
    >
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Icon
          sf={{ default: "house", selected: "house.fill" }}
        />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="dhikr">
        <NativeTabs.Trigger.Icon
          sf={{
            default: "circle.hexagongrid",
            selected: "circle.hexagongrid.fill",
          }}
        />
        <NativeTabs.Trigger.Label>Dhikr</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="locked">
        <NativeTabs.Trigger.Icon
          sf={{ default: "lock", selected: "lock.fill" }}
        />
        <NativeTabs.Trigger.Label>Locked</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="progress">
        <NativeTabs.Trigger.Icon sf="chart.xyaxis.line" />
        <NativeTabs.Trigger.Label>Progress</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile" role="search">
        <NativeTabs.Trigger.Icon
          sf={{
            default: "person.crop.circle",
            selected: "person.crop.circle.fill",
          }}
        />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger hidden name="name" />
      <NativeTabs.Trigger hidden name="success" />
    </NativeTabs>
  );
}
