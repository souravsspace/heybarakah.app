import { Redirect } from "expo-router";
import { AuthLoading } from "@/components/auth-loading";
import { useUser } from "@/contexts/user-context";

export default function Index() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <AuthLoading />;
  }
  if (user) {
    return <Redirect href="/home" />;
  }
  return <Redirect href={"/(onboarding)/welcome" as never} />;
}
