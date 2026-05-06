import { QuizScreen } from "@/components/onboarding/quiz-screen";
import { QUIZ_OPTIONS } from "@/constants/onboarding-config";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import {
  type OnboardingState,
  useOnboardingState,
} from "@/hooks/use-onboarding-state";

export default function Strictness() {
  const { state, dispatch } = useOnboardingState();
  const { next } = useOnboardingNav();

  return (
    <QuizScreen
      title="How long should the lock last?"
      subtitle="Most users start with adhan to end of window. You can soften this later."
      options={QUIZ_OPTIONS.strictness}
      value={state.strictness}
      onSelect={(v) =>
        dispatch({
          type: "SET_FIELD",
          payload: { strictness: v as OnboardingState["strictness"] },
        })
      }
      onNext={next}
    />
  );
}
