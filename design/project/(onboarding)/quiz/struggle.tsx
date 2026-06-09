import { QuizScreen } from "@/components/onboarding/quiz-screen";
import { QUIZ_OPTIONS } from "@/constants/onboarding-config";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import { useOnboardingState } from "@/hooks/use-onboarding-state";

export default function Struggle() {
  const { state, dispatch } = useOnboardingState();
  const { next } = useOnboardingNav();

  return (
    <QuizScreen
      onNext={next}
      onSelect={(v) =>
        dispatch({
          type: "SET_FIELD",
          payload: {
            struggle: v as "phone" | "forgetting" | "fajr" | "khushu",
          },
        })
      }
      options={QUIZ_OPTIONS.struggle}
      subtitle="Pick the one that hurts the most."
      title="What gets in the way?"
      value={state.struggle}
    />
  );
}
