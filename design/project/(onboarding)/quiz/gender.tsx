import { QuizScreen } from "@/components/onboarding/quiz-screen";
import { QUIZ_OPTIONS } from "@/constants/onboarding-config";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import { useOnboardingState } from "@/hooks/use-onboarding-state";

export default function Gender() {
  const { state, dispatch } = useOnboardingState();
  const { next } = useOnboardingNav();

  return (
    <QuizScreen
      onNext={next}
      onSelect={(v) =>
        dispatch({
          type: "SET_FIELD",
          payload: { gender: v as "male" | "female" },
        })
      }
      options={QUIZ_OPTIONS.gender}
      subtitle="Barakah tailors its reminders for each."
      title="What's your gender?"
      value={state.gender}
    />
  );
}
