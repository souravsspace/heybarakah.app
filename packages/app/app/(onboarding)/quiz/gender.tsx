import { QuizScreen } from "@/components/onboarding/quiz-screen";
import { QUIZ_OPTIONS } from "@/constants/onboarding-config";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import { useOnboardingState } from "@/hooks/use-onboarding-state";

export default function Gender() {
  const { state, dispatch } = useOnboardingState();
  const { next } = useOnboardingNav();

  return (
    <QuizScreen
      title="What's your gender?"
      subtitle="Barakah tailors its reminders for each."
      options={QUIZ_OPTIONS.gender}
      value={state.gender}
      onSelect={(v) =>
        dispatch({ type: "SET_FIELD", payload: { gender: v as "male" | "female" } })
      }
      onNext={next}
    />
  );
}
