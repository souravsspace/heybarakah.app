import { Redirect } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";
import { AuthLoading } from "@/components/auth-loading";
import { useUser } from "@/contexts/user-context";
import { useSubscription } from "@/lib/subscription";

const PRIMARY = "#29603E";
const PRIMARY_BRIGHT = "#4FB07A";
const INK_MUTED = "#6B7280";
const ON_PRIMARY = "#FFFFFF";
const SELECTED_CONTENT =
  Platform.OS === "android" ? ON_PRIMARY : PRIMARY_BRIGHT;

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

  return (
    <NativeTabs
      backgroundColor="#FFFFFF"
      disableTransparentOnScrollEdge
      iconColor={{ default: INK_MUTED, selected: SELECTED_CONTENT }}
      indicatorColor={PRIMARY}
      labelStyle={{
        default: { color: INK_MUTED },
        selected: { color: SELECTED_CONTENT },
      }}
      tintColor={PRIMARY}
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
      <NativeTabs.Trigger hidden name="name" />
      <NativeTabs.Trigger hidden name="success" />
      <NativeTabs.Trigger hidden name="logging-out" />
    </NativeTabs>
  );
}
