import { Text, View } from "react-native";

const PRIMARY = "#29603E";
const INK = "#0F1311";
const MUTED = "#6B7280";

interface Props {
  city: string;
  name: string;
  quote: string;
}

export function ReviewTile({ quote, name, city }: Props) {
  return (
    <View style={{ paddingVertical: 12 }}>
      <Stars />
      <Text
        className="font-serif"
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: INK,
          marginTop: 8,
          fontStyle: "italic",
        }}
      >
        {`“${quote}”`}
      </Text>
      <Text
        className="font-sans"
        style={{
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 2,
          color: MUTED,
          marginTop: 8,
        }}
      >
        {`${name.toUpperCase()} · ${city.toUpperCase()}`}
      </Text>
    </View>
  );
}

function Stars() {
  return (
    <View style={{ flexDirection: "row", gap: 3 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={{
            width: 7,
            height: 7,
            backgroundColor: PRIMARY,
            transform: [{ rotate: "45deg" }],
          }}
        />
      ))}
    </View>
  );
}
