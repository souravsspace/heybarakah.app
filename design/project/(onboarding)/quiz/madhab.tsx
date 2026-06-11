import { QuizScreen } from "@/components/onboarding/quiz-screen";
import { QUIZ_OPTIONS } from "@/constants/onboarding-config";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import { useOnboardingState } from "@/hooks/use-onboarding-state";

export default function Madhab() {
  const { state, dispatch } = useOnboardingState();
  const { next } = useOnboardingNav();

  return (
    <QuizScreen
      onNext={next}
      onSelect={(v) =>
        dispatch({
          type: "SET_FIELD",
          payload: {
            madhab: v as "hanafi" | "shafii" | "maliki" | "hanbali" | "none",
          },
        })
      }
      options={QUIZ_OPTIONS.madhab}
      subtitle="This affects asr time and prayer length defaults."
      title="Which fiqh do you follow?"
      value={state.madhab}
    />
  );
}
