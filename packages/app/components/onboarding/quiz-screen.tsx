import { View } from "react-native";
import { BodyText } from "./body-text";
import { FadeSlideIn } from "./fade-slide-in";
import { Headline } from "./headline";
import { OptionRow } from "./option-row";
import { Button } from "@/components/ui/button";
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
      footer={<Button label={ctaLabel} onPress={onNext} disabled={!value} />}
    >
      <FadeSlideIn className="gap-md">
        <View className="gap-sm">
          <Headline size="h2" align="left">
            {title}
          </Headline>
          {subtitle ? (
            <BodyText size="sm" tone="muted" align="left">
              {subtitle}
            </BodyText>
          ) : null}
        </View>
        <View className="gap-sm mt-sm">
          {options.map((opt) => (
            <OptionRow
              key={opt.value}
              label={opt.label}
              hint={opt.hint}
              selected={value === opt.value}
              onPress={() => onSelect(opt.value)}
            />
          ))}
        </View>
      </FadeSlideIn>
    </ScreenShell>
  );
}
