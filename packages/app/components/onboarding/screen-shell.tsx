import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
  footer?: React.ReactNode;
  hero?: React.ReactNode;
  showProgress?: boolean;
  showBack?: boolean;
  scroll?: boolean;
  topSafe?: boolean;
  variant?: "default" | "filled-green";
};

export function ScreenShell({
  children,
  footer,
  hero,
  scroll = true,
  topSafe = false,
  variant = "default",
}: Props) {
  const Body = scroll ? ScrollView : View;
  const filled = variant === "filled-green";
  const bg = filled ? "bg-primary" : "bg-surface";

  return (
    <SafeAreaView
      className={`flex-1 ${bg}`}
      edges={topSafe ? ["top", "bottom"] : ["bottom"]}
    >
      {hero ? (
        <View
          className="items-center justify-center px-md"
          style={{ paddingTop: 16, paddingBottom: 8 }}
        >
          {hero}
        </View>
      ) : null}

      <Body
        className="flex-1"
        contentContainerStyle={
          scroll
            ? {
                paddingHorizontal: 24,
                paddingTop: 16,
                paddingBottom: 24,
                flexGrow: 1,
              }
            : undefined
        }
        style={
          scroll
            ? undefined
            : { paddingHorizontal: 24, paddingTop: 16, flex: 1 }
        }
      >
        {children}
      </Body>

      {footer ? <View className="px-md pt-sm pb-md">{footer}</View> : null}
    </SafeAreaView>
  );
}
