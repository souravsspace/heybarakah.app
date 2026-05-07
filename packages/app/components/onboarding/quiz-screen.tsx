import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { BodyText } from "./body-text";
import { FadeSlideIn } from "./fade-slide-in";
import { Headline } from "./headline";
import { OptionRow } from "./option-row";
import { ScreenShell } from "./screen-shell";

type Option = { value: string; label: string; hint?: string };

type Props = {
  title: string;
  subtitle?: string;
  options: readonly Option[];
  value?: string;
  onSelect: (v: string) => void;
  onNext: () => void;
  ctaLabel?: string;
};

export function QuizScreen({
  title,
  subtitle,
  options,
  value,
  onSelect,
  onNext,
  ctaLabel = "Continue",
}: Props) {
  return (
    <ScreenShell
      footer={<Button disabled={!value} label={ctaLabel} onPress={onNext} />}
    >
      <FadeSlideIn className="gap-md">
        <View className="gap-sm">
          <Headline align="left" size="h2">
            {title}
          </Headline>
          {subtitle ? (
            <BodyText align="left" size="sm" tone="muted">
              {subtitle}
            </BodyText>
          ) : null}
        </View>
        <View className="mt-sm gap-sm">
          {options.map((opt) => (
            <OptionRow
              hint={opt.hint}
              key={opt.value}
              label={opt.label}
              onPress={() => onSelect(opt.value)}
              selected={value === opt.value}
            />
          ))}
        </View>
      </FadeSlideIn>
    </ScreenShell>
  );
}
