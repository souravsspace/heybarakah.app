import confetti from "canvas-confetti";
import { useEffect } from "react";

export default function SuccessConfetti() {
  useEffect(() => {
    const colors = ["#29603E", "#234F34", "#1B3F29", "#EAF2EC", "#FFFFFF"];
    const duration = 2200;
    const end = Date.now() + duration;

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.55 },
      colors,
      ticks: 220,
    });

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return null;
}
