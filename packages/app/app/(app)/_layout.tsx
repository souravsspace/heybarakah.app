import { Redirect, Tabs } from "expo-router";
import { AuthLoading } from "@/components/auth-loading";
import { FloatingGlassTabBar } from "@/components/floating-glass-tab-bar";
import { useUser } from "@/contexts/user-context";
import { useSubscription } from "@/lib/subscription";

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
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "#FFFFFF" },
      }}
      tabBar={(props) => <FloatingGlassTabBar {...props} />}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="dhikr" />
      <Tabs.Screen name="locked" />
      <Tabs.Screen name="progress" />
      <Tabs.Screen
        name="profile"
        options={{ tabBarItemStyle: { display: "none" } }}
      />
      <Tabs.Screen name="name" options={{ href: null }} />
      <Tabs.Screen name="success" options={{ href: null }} />
      <Tabs.Screen name="logging-out" options={{ href: null }} />
    </Tabs>
  );
}
