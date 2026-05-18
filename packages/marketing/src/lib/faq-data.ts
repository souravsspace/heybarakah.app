export type FaqItem = {
  q: string;
  a: string;
};

export const faqItems: readonly FaqItem[] = [
  {
    q: "What is prayer lock, exactly?",
    a: "When a salah window opens, Barakah closes the apps you choose to set aside — social, video, games. Calls, Qur'an, du'a apps, and emergency tools stay open. The lock lifts once you've prayed, or after the window ends.",
  },
  {
    q: "Will it lock me out of important things?",
    a: "No. You decide what gets quieted. Barakah suggests sensible defaults — never your phone, calls, maps, or Qur'an apps. Everything is opt-in.",
  },
  {
    q: "Which prayer time calculation does Barakah use?",
    a: "We default to your local masjid where possible, with MWL, ISNA, Egyptian, and Umm al-Qura available. You can override per-prayer.",
  },
  {
    q: "Does Barakah work without internet?",
    a: "Yes. Prayer times, qibla, and the lock all work offline once configured. Your data never leaves your device.",
  },
  {
    q: "Is Barakah free?",
    a: "Core lock, adhan, qibla, and times are free. A modest subscription supports development and unlocks reciter packs and family sharing.",
  },
  {
    q: "Which madhhab does it follow?",
    a: "Barakah is for every muslim. Asr calculation supports both Shafi'i and Hanafi positions. We don't take rulings on fiqh — we leave that to you and your scholar.",
  },
] as const;
