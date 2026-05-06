import { QuizScreen } from "@/components/onboarding/quiz-screen";
import { QUIZ_OPTIONS } from "@/constants/onboarding-config";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import { useOnboardingState } from "@/hooks/use-onboarding-state";

export default function Goal() {
  const { state, dispatch } = useOnboardingState();
  const { next } = useOnboardingNav();

  return (
    <QuizScreen
      title="What's your number one goal?"
      subtitle="Niyyah is half the deed."
      options={QUIZ_OPTIONS.goal}
      value={state.goal}
      onSelect={(v) =>
        dispatch({
          type: "SET_FIELD",
          payload: { goal: v as "all-five" | "khushu" | "phone-addiction" | "fajr" },
        })
      }
      onNext={next}
    />
  );
}
