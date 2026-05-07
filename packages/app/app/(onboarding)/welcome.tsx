import { Image } from "expo-image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  type ImageSourcePropType,
  PanResponder,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { welcomeCardContent } from "@/constants/welcome-card-content";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import {
  clearWelcomeCardDrag,
  completeWelcomeCardSwipe,
  createWelcomeCardStackState,
  startWelcomeCardDrag,
  startWelcomeCardExit,
} from "@/lib/welcome-card-stack";
import { getWelcomeLayout } from "@/lib/welcome-layout";

const welcomeImages: ImageSourcePropType[] = [
  require("../../assets/images/onboarding/welcome/eating-lady.png"),
  require("../../assets/images/onboarding/welcome/al-quran.png"),
  require("../../assets/images/onboarding/welcome/halal-meat-animal.png"),
  require("../../assets/images/onboarding/welcome/halal-income.png"),
  require("../../assets/images/onboarding/welcome/tasbih.png"),
  require("../../assets/images/onboarding/welcome/traveling.png"),
  require("../../assets/images/onboarding/welcome/wudu-man.png"),
  require("../../assets/images/onboarding/welcome/house.png"),
  require("../../assets/images/onboarding/welcome/no-adult-content.png"),
  require("../../assets/images/onboarding/welcome/laying-pray.png"),
  require("../../assets/images/onboarding/welcome/sleeping-on-right-side.png"),
  require("../../assets/images/onboarding/welcome/jannah.png"),
];

const welcomeCards = welcomeCardContent.map((card, index) => ({
  ...card,
  image: welcomeImages[index],
}));

export default function Welcome() {
  const { next, goTo } = useOnboardingNav();
  const { width } = useWindowDimensions();
  const {
    columnWidth,
    cardWidth,
    cardHeight,
    imageHeight,
    buttonWidth,
    buttonHeight,
  } = getWelcomeLayout(width);
  const swipe = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const isSwiping = useRef(false);
  const shouldResetSwipe = useRef(false);
  const [cardStack, setCardStack] = useState(() =>
    createWelcomeCardStackState(welcomeCards.length)
  );
  const { cardOrder, dragIndex, outgoingIndex } = cardStack;

  useEffect(() => {
    if (
      !shouldResetSwipe.current ||
      outgoingIndex !== null ||
      dragIndex !== null
    ) {
      return;
    }

    swipe.setValue({ x: 0, y: 0 });
    shouldResetSwipe.current = false;
    isSwiping.current = false;
  }, [dragIndex, outgoingIndex, swipe]);

  const completeSwipe = useCallback(() => {
    swipe.stopAnimation();
    shouldResetSwipe.current = true;
    setCardStack(completeWelcomeCardSwipe);
  }, [swipe]);

  const sendTopCardToBottom = useCallback(
    (dx: number, dy: number) => {
      if (isSwiping.current) {
        return;
      }
      isSwiping.current = true;
      setCardStack(startWelcomeCardExit);
      swipe.stopAnimation();

      const horizontalDirection = dx < 0 ? -1 : 1;
      const exitX = horizontalDirection * cardWidth * 1.55;
      const exitY = Math.max(
        Math.min(dy, cardHeight * 0.18),
        -cardHeight * 0.18
      );

      Animated.timing(swipe, {
        toValue: { x: exitX, y: exitY },
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          completeSwipe();
          return;
        }

        isSwiping.current = false;
      });
    },
    [cardHeight, cardWidth, completeSwipe, swipe]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !isSwiping.current,
        onStartShouldSetPanResponderCapture: () => !isSwiping.current,
        onMoveShouldSetPanResponder: () => !isSwiping.current,
        onMoveShouldSetPanResponderCapture: () => !isSwiping.current,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: () => {
          setCardStack(startWelcomeCardDrag);
        },
        onPanResponderMove: (_, gesture) => {
          if (isSwiping.current) {
            return;
          }

          swipe.setValue({
            x: gesture.dx,
            y: Math.max(
              Math.min(gesture.dy, cardHeight * 0.28),
              -cardHeight * 0.28
            ),
          });
        },
        onPanResponderRelease: (_, gesture) => {
          if (isSwiping.current) {
            return;
          }

          const cappedDy = Math.max(
            Math.min(gesture.dy, cardHeight * 0.28),
            -cardHeight * 0.28
          );
          const distance = Math.hypot(gesture.dx, cappedDy);
          const threshold = 44;

          if (distance > threshold) {
            sendTopCardToBottom(gesture.dx, cappedDy);
            return;
          }

          Animated.timing(swipe, {
            toValue: { x: 0, y: 0 },
            duration: 120,
            useNativeDriver: false,
          }).start(({ finished }) => {
            if (finished) {
              setCardStack(clearWelcomeCardDrag);
            }
          });
        },
        onPanResponderTerminate: () => {
          swipe.stopAnimation();
          swipe.setValue({ x: 0, y: 0 });
          setCardStack(clearWelcomeCardDrag);
          isSwiping.current = false;
        },
      }),
    [cardHeight, sendTopCardToBottom, swipe]
  );

  return (
    <ScreenShell scroll={false} showBack={false} showProgress={false}>
      <FadeSlideIn className="flex-1 items-center" delay={120}>
        <View className="items-center gap-xs" style={{ width: columnWidth }}>
          <Text className="text-center font-serif text-display text-ink">
            Learn the salah Allah made obligatory.
          </Text>
          <Text className="text-center font-sans text-body-sm text-tertiary">
            Just <Text style={{ fontWeight: "700" }}>5 minutes</Text> a day with
            prayer-lock lessons.
          </Text>
        </View>

        <View
          {...panResponder.panHandlers}
          className="items-center justify-center"
          style={{
            width: cardWidth + 28,
            height: cardHeight + 36,
            marginTop: 10,
          }}
        >
          {welcomeCards.map((card, cardIndex) => {
            const stackDepth = cardOrder.indexOf(cardIndex);
            const isOutgoing = outgoingIndex === cardIndex;
            const isActive = outgoingIndex === null && stackDepth === 0;
            const canUseSwipe = dragIndex === cardIndex;
            const visibleLimit = outgoingIndex === null ? 3 : 4;
            const isVisible =
              isOutgoing || (stackDepth >= 0 && stackDepth < visibleLimit);
            const baseX = stackDepth <= 0 ? 0 : stackDepth * 8;
            const baseY = stackDepth <= 0 ? 0 : stackDepth * 10;
            const targetX = Math.max(baseX - 8, 0);
            const targetY = Math.max(baseY - 10, 0);
            const promoteX =
              outgoingIndex !== null && !isOutgoing && stackDepth > 0
                ? swipe.x.interpolate({
                    inputRange: [-cardWidth, 0, cardWidth],
                    outputRange: [targetX, baseX, targetX],
                    extrapolate: "clamp",
                  })
                : baseX;
            const promoteY =
              outgoingIndex !== null && !isOutgoing && stackDepth > 0
                ? swipe.x.interpolate({
                    inputRange: [-cardWidth, 0, cardWidth],
                    outputRange: [targetY, baseY, targetY],
                    extrapolate: "clamp",
                  })
                : baseY;
            const translateX = promoteX;
            const translateY = promoteY;
            const rotate =
              canUseSwipe || isOutgoing
                ? swipe.x.interpolate({
                    inputRange: [-cardWidth, 0, cardWidth],
                    outputRange: ["-9deg", "0deg", "9deg"],
                  })
                : "0deg";

            return (
              <Animated.View
                className="absolute overflow-hidden rounded-xl border border-neutral bg-surface"
                key={card.title}
                pointerEvents="none"
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  opacity: isVisible ? 1 : 0,
                  shadowColor: "#0B1710",
                  shadowOffset: {
                    width: 0,
                    height: isActive || isOutgoing ? 8 : 4,
                  },
                  shadowOpacity: isVisible
                    ? isActive || isOutgoing
                      ? 0.08
                      : 0.04
                    : 0,
                  shadowRadius: isActive || isOutgoing ? 18 : 10,
                  elevation: isVisible ? (isActive || isOutgoing ? 8 : 4) : 0,
                  zIndex: isOutgoing
                    ? welcomeCards.length + 1
                    : welcomeCards.length - stackDepth,
                  transform: [
                    {
                      translateX:
                        canUseSwipe || isOutgoing ? swipe.x : translateX,
                    },
                    {
                      translateY:
                        canUseSwipe || isOutgoing ? swipe.y : translateY,
                    },
                    { rotate },
                  ],
                }}
              >
                <Image
                  accessible={false}
                  cachePolicy="memory-disk"
                  contentFit="contain"
                  source={card.image}
                  style={{ width: "100%", height: imageHeight, marginTop: 22 }}
                  transition={0}
                />
                <View className="flex-1 items-center justify-center px-md pb-md">
                  <Text className="text-center font-serif text-h2 text-ink">
                    {card.title}
                  </Text>
                  <Text className="mt-xs text-center font-sans text-caption text-tertiary">
                    {card.detail}
                  </Text>
                </View>
              </Animated.View>
            );
          })}
        </View>

        <View
          className="mt-auto gap-sm"
          style={{ width: buttonWidth, marginBottom: 10 }}
        >
          <Button height={buttonHeight} label="Bismillah" onPress={next} />
          <Pressable
            accessibilityRole="button"
            onPress={() => goTo("/(account)/auth")}
            style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
          >
            <Text className="text-center font-sans text-body-sm text-tertiary">
              Already subscribed?{" "}
              <Text className="text-ink" style={{ fontWeight: "700" }}>
                Log In
              </Text>
            </Text>
          </Pressable>
        </View>
      </FadeSlideIn>
    </ScreenShell>
  );
}
