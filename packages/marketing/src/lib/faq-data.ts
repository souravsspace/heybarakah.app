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
    q: "What happens if I buy before launch?",
    a: "You reserve founding lifetime access at the launch price. At launch, Barakah emails your access instructions. If you prefer not to pay before the app opens, join the free waitlist instead.",
  },
  {
    q: "Is Barakah free?",
    a: "Core lock, adhan, qibla, and times are free. A modest one-time purchase supports development and unlocks reciter packs, Jumu'ah and Ramadan focus modes, and every future update.",
  },
  {
    q: "Why should I trust an early-access purchase?",
    a: "Because the promise is intentionally narrow: no subscription, no renewal, private prayer settings, and a launch email when access opens. The checkout is handled securely by Polar.",
  },
  {
    q: "Is there an app that locks your phone during prayer times?",
    a: "Yes — that is exactly what Barakah is. When each of the five daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) arrives, Barakah closes the distracting apps you chose and unlocks once you've prayed or the window ends. Adhan, qibla, and prayer times are built in.",
  },
  {
    q: "How is Barakah different from screen-time apps like Opal, one sec, or Apple Screen Time?",
    a: "General blockers schedule focus by the clock. Barakah schedules by the salah calendar — prayer windows shift every day, and Barakah follows them automatically, lifting the lock once you've prayed. It also includes adhan, qibla, and prayer times, so one quiet app covers the whole rhythm of a praying Muslim's day.",
  },
  {
    q: "Which madhhab does it follow?",
    a: "Barakah is for every Muslim. Asr calculation supports both Shafi'i and Hanafi positions. We don't take rulings on fiqh — we leave that to you and your scholar.",
  },
] as const;
