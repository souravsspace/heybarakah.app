import * as Notifications from "expo-notifications";
import { Redirect } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";
import { AuthLoading } from "@/components/auth-loading";
import { useTheme } from "@/contexts/theme-context";
import { useUser } from "@/contexts/user-context";
import { useDailyAyahNotification } from "@/hooks/useDailyAyahNotification";
import { useLockActivityScheduler } from "@/hooks/useLockActivityScheduler";
import { useWidgetSync } from "@/hooks/useWidgetSync";
import { useSubscription } from "@/lib/subscription";

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

function TabsWithTheme() {
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
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="dhikr">
        <Icon
          sf={{
            default: "circle.hexagongrid",
            selected: "circle.hexagongrid.fill",
          }}
        />
        <Label>Dhikr</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="locked">
        <Icon sf={{ default: "lock", selected: "lock.fill" }} />
        <Label>Locked</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="progress">
        <Icon sf="chart.xyaxis.line" />
        <Label>Progress</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile" role="search">
        <Icon
          sf={{
            default: "person.crop.circle",
            selected: "person.crop.circle.fill",
          }}
        />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger hidden name="achievements" />
      <NativeTabs.Trigger hidden name="name" />
      <NativeTabs.Trigger hidden name="success" />
      <NativeTabs.Trigger hidden name="logging-out" />
    </NativeTabs>
  );
}

function AuthedShell() {
  useDailyAyahNotification();
  useWidgetSync();
  useLockActivityScheduler();
  return <TabsWithTheme />;
}

export default function AppLayout() {
  const { user, isLoading } = useUser();
  const { activeSubscription, isSubscriptionLoading } = useSubscription();

  if (isLoading || isSubscriptionLoading) {
    return <AuthLoading />;
  }
  if (!user) {
    return <Redirect href={"/(onboarding)/welcome" as never} />;
  }
  if (!activeSubscription) {
    return <Redirect href="/no-active-sub" />;
  }

  return <AuthedShell />;
}
