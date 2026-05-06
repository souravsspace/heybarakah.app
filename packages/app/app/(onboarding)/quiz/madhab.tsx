import { QuizScreen } from "@/components/onboarding/quiz-screen";
import { QUIZ_OPTIONS } from "@/constants/onboarding-config";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import { useOnboardingState } from "@/hooks/use-onboarding-state";

export default function Madhab() {
  const { state, dispatch } = useOnboardingState();
  const { next } = useOnboardingNav();

  return (
    <QuizScreen
      title="Which fiqh do you follow?"
      subtitle="This affects asr time and prayer length defaults."
      options={QUIZ_OPTIONS.madhab}
      value={state.madhab}
      onSelect={(v) =>
        dispatch({
          type: "SET_FIELD",
          payload: { madhab: v as "hanafi" | "shafii" | "maliki" | "hanbali" | "none" },
        })
      }
      onNext={next}
    />
  );
}
