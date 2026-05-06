import { QuizScreen } from "@/components/onboarding/quiz-screen";
import { QUIZ_OPTIONS } from "@/constants/onboarding-config";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import {
  type OnboardingState,
  useOnboardingState,
} from "@/hooks/use-onboarding-state";

export default function CalcMethod() {
  const { state, dispatch } = useOnboardingState();
  const { next } = useOnboardingNav();

  return (
    <QuizScreen
      title="How should we calculate prayer times?"
      subtitle="Choose the method your community uses. You can change this later."
      options={QUIZ_OPTIONS.calcMethod}
      value={state.calcMethod}
      onSelect={(v) =>
        dispatch({
          type: "SET_FIELD",
          payload: { calcMethod: v as OnboardingState["calcMethod"] },
        })
      }
      onNext={next}
    />
  );
}
