import { View } from "react-native";

type Props = {
  width?: number;
  height?: number;
  children?: React.ReactNode;
};

export function DeviceFrame({ width = 220, height = 440, children }: Props) {
  const bezel = 6;
  const innerRadius = 30;
  return (
    <View
      style={{
        width,
        height,
        borderRadius: 38,
        backgroundColor: "#1A1A1A",
        padding: bezel,
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
      }}
    >
      <View
        style={{
          flex: 1,
          borderRadius: innerRadius,
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#2A2A2A",
        }}
      >
        <View style={{ flex: 1 }}>{children}</View>
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 10,
            alignSelf: "center",
            width: width * 0.32,
            height: 22,
            borderRadius: 999,
            backgroundColor: "#0A0A0A",
          }}
        />
      </View>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: -2,
          top: height * 0.22,
          width: 2,
          height: 36,
          borderTopRightRadius: 2,
          borderBottomRightRadius: 2,
          backgroundColor: "#0F0F0F",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: -2,
          top: height * 0.34,
          width: 2,
          height: 56,
          borderTopRightRadius: 2,
          borderBottomRightRadius: 2,
          backgroundColor: "#0F0F0F",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: -2,
          top: height * 0.28,
          width: 2,
          height: 70,
          borderTopLeftRadius: 2,
          borderBottomLeftRadius: 2,
          backgroundColor: "#0F0F0F",
        }}
      />
    </View>
  );
}
