import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  Text,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const INK = "#0F1311";
const MUTED = "#6B7280";
const LINE = "#E5E7EB";

interface Props {
  answer: string;
  question: string;
}

export function FaqRow({ question, answer }: Props) {
  const [open, setOpen] = useState(false);

  function toggle() {
    LayoutAnimation.configureNext({
      duration: 220,
      update: { type: LayoutAnimation.Types.easeInEaseOut },
    });
    setOpen((v) => !v);
  }

  return (
    <View style={{ borderBottomColor: LINE, borderBottomWidth: 1 }}>
      <Pressable
        accessibilityRole="button"
        onPress={toggle}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 16,
        }}
      >
        <Text
          className="font-sans"
          style={{
            flex: 1,
            fontSize: 15,
            fontWeight: "600",
            color: INK,
            paddingRight: 12,
          }}
        >
          {question}
        </Text>
        <Ionicons
          color={MUTED}
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
        />
      </Pressable>
      {open ? (
        <Text
          className="font-sans"
          style={{
            fontSize: 14,
            lineHeight: 21,
            color: MUTED,
            paddingBottom: 16,
          }}
        >
          {answer}
        </Text>
      ) : null}
    </View>
  );
}
