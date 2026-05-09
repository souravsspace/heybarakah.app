import { Redirect, Stack } from "expo-router";
import { AuthLoading } from "@/components/auth-loading";
import { useUser } from "@/contexts/user-context";

export default function AppLayout() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <AuthLoading />;
  }
  if (!user) {
    return <Redirect href={"/(onboarding)/welcome" as never} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FFFFFF" },
      }}
    />
  );
}
