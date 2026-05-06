import { QuizScreen } from "@/components/onboarding/quiz-screen";
import { QUIZ_OPTIONS } from "@/constants/onboarding-config";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import { useOnboardingState } from "@/hooks/use-onboarding-state";

export default function Consistency() {
  const { state, dispatch } = useOnboardingState();
  const { next } = useOnboardingNav();

  return (
    <QuizScreen
      title="How often do you pray today?"
      subtitle="No judgement. We meet you where you are."
      options={QUIZ_OPTIONS.consistency}
      value={state.consistency}
      onSelect={(v) =>
        dispatch({
          type: "SET_FIELD",
          payload: { consistency: v as "never" | "sometimes" | "most" | "all" },
        })
      }
      onNext={next}
    />
  );
}
