import { QuizScreen } from "@/components/onboarding/quiz-screen";
import { QUIZ_OPTIONS } from "@/constants/onboarding-config";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import { useOnboardingState } from "@/hooks/use-onboarding-state";

export default function Struggle() {
  const { state, dispatch } = useOnboardingState();
  const { next } = useOnboardingNav();

  return (
    <QuizScreen
      title="What gets in the way?"
      subtitle="Pick the one that hurts the most."
      options={QUIZ_OPTIONS.struggle}
      value={state.struggle}
      onSelect={(v) =>
        dispatch({
          type: "SET_FIELD",
          payload: { struggle: v as "phone" | "forgetting" | "fajr" | "khushu" },
        })
      }
      onNext={next}
    />
  );
}
