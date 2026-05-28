import { Text, View } from "react-native";
import Svg, { Circle, G, Line, Path } from "react-native-svg";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";

const ACCENT = "#29603E";
const HAIRLINE = "#D1D5DB";
const SOFT = "#9CA3AF";

function RubElHizb({
  size = 18,
  opacity = 1,
}: {
  size?: number;
  opacity?: number;
}) {
  const s = size;
  const c = s / 2;
  const r = c - 1;
  const o = r * 0.55;
  const sq1 = `M ${c} ${c - r} L ${c + r} ${c} L ${c} ${c + r} L ${c - r} ${c} Z`;
  const sq2 = `M ${c - o} ${c - o} L ${c + o} ${c - o} L ${c + o} ${c + o} L ${c - o} ${c + o} Z`;
  return (
    <Svg height={s} width={s}>
      <G opacity={opacity}>
        <Path d={sq1} fill="none" stroke={ACCENT} strokeWidth={1} />
        <Path d={sq2} fill="none" stroke={ACCENT} strokeWidth={1} />
        <Circle cx={c} cy={c} fill={ACCENT} r={1.4} />
      </G>
    </Svg>
  );
}

function OrnamentalDivider({ width = 200 }: { width?: number }) {
  const star = 14;
  const lineW = (width - star - 24) / 2;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width,
      }}
    >
      <Svg height={1} width={lineW}>
        <Line
          stroke={ACCENT}
          strokeOpacity={0.35}
          strokeWidth={1}
          x1={0}
          x2={lineW}
          y1={0.5}
          y2={0.5}
        />
      </Svg>
      <View style={{ marginHorizontal: 12 }}>
        <RubElHizb opacity={0.85} size={star} />
      </View>
      <Svg height={1} width={lineW}>
        <Line
          stroke={ACCENT}
          strokeOpacity={0.35}
          strokeWidth={1}
          x1={0}
          x2={lineW}
          y1={0.5}
          y2={0.5}
        />
      </Svg>
    </View>
  );
}

function CornerBracket({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const size = 14;
  const t = position.startsWith("t");
  const l = position.endsWith("l");
  return (
    <Svg
      height={size}
      style={{
        position: "absolute",
        top: t ? -1 : undefined,
        bottom: t ? undefined : -1,
        left: l ? -1 : undefined,
        right: l ? undefined : -1,
      }}
      width={size}
    >
      <Path
        d={
          l && t
            ? `M 0 ${size} L 0 0 L ${size} 0`
            : !l && t
              ? `M 0 0 L ${size} 0 L ${size} ${size}`
              : l && !t
                ? `M 0 0 L 0 ${size} L ${size} ${size}`
                : `M 0 ${size} L ${size} ${size} L ${size} 0`
        }
        fill="none"
        stroke={ACCENT}
        strokeWidth={1.25}
      />
    </Svg>
  );
}

export default function Hadith() {
  const { next } = useOnboardingNav();
  return (
    <ScreenShell
      footer={
        <View style={{ paddingHorizontal: 8 }}>
          <Button label="Ameen" onPress={next} />
        </View>
      }
      scroll={false}
    >
      <FadeSlideIn className="flex-1" delay={120}>
        <View
          style={{
            maxWidth: 360,
            alignSelf: "center",
            flex: 1,
            width: "100%",
          }}
        >
          {/* Header: ornament + eyebrow seal */}
          <FadeSlideIn className="items-center" delay={140}>
            <View style={{ marginTop: 8 }}>
              <RubElHizb opacity={0.9} size={22} />
            </View>
            <Text
              className="font-sans text-tertiary"
              style={{
                fontSize: 10,
                letterSpacing: 2.6,
                fontWeight: "700",
                marginTop: 14,
              }}
            >
              HADITH · BUKHĀRĪ 6464
            </Text>
          </FadeSlideIn>

          {/* Folio: hairline frame with corner brackets around the quote */}
          <FadeSlideIn delay={280}>
            <View
              style={{
                marginTop: 36,
                paddingHorizontal: 22,
                paddingVertical: 28,
                borderWidth: 1,
                borderColor: HAIRLINE,
                position: "relative",
              }}
            >
              <CornerBracket position="tl" />
              <CornerBracket position="tr" />
              <CornerBracket position="bl" />
              <CornerBracket position="br" />

              <Text
                className="font-serif text-ink"
                style={{
                  fontSize: 20,
                  lineHeight: 32,
                  fontStyle: "italic",
                  textAlign: "left",
                }}
              >
                <Text
                  style={{
                    fontSize: 68,
                    lineHeight: 60,
                    fontWeight: "700",
                    color: ACCENT,
                    fontStyle: "normal",
                  }}
                >
                  T
                </Text>
                he most beloved deed to Allah is the one done regularly, even if
                little.
              </Text>

              <View style={{ alignItems: "center", marginTop: 24 }}>
                <OrnamentalDivider width={220} />
              </View>

              {/* Attribution inside folio */}
              <View style={{ alignItems: "center", marginTop: 20 }}>
                <Text
                  className="font-serif text-ink"
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    letterSpacing: 0.3,
                  }}
                >
                  Prophet Muhammad ﷺ
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 6,
                  }}
                >
                  <View
                    style={{
                      width: 14,
                      height: 1,
                      backgroundColor: SOFT,
                      opacity: 0.6,
                    }}
                  />
                  <Text
                    className="font-sans text-tertiary"
                    style={{
                      fontSize: 11,
                      letterSpacing: 1.4,
                      fontWeight: "600",
                      marginHorizontal: 10,
                      textTransform: "uppercase",
                    }}
                  >
                    Reported by Abū Hurayra
                  </Text>
                  <View
                    style={{
                      width: 14,
                      height: 1,
                      backgroundColor: SOFT,
                      opacity: 0.6,
                    }}
                  />
                </View>
              </View>
            </View>
          </FadeSlideIn>

          <View style={{ flex: 1 }} />

          {/* Footer ornament: vertical column of three diminishing stars */}
          <FadeSlideIn className="items-center" delay={680}>
            <View style={{ alignItems: "center", marginBottom: 4 }}>
              <RubElHizb opacity={0.7} size={12} />
              <View style={{ height: 6 }} />
              <RubElHizb opacity={0.4} size={8} />
              <View style={{ height: 6 }} />
              <RubElHizb opacity={0.2} size={5} />
            </View>
          </FadeSlideIn>
        </View>
      </FadeSlideIn>
    </ScreenShell>
  );
}
