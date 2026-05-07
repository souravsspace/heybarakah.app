import { useEffect, useState } from "react";
import { Text, type TextProps } from "react-native";

export function CountUp({
  to,
  duration = 800,
  className,
  ...rest
}: { to: number; duration?: number; className?: string } & TextProps) {
  const [n, setN] = useState(0);

  useEffect(() => {
    const start = Date.now();
    let raf: number;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setN(Math.floor(eased * to));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);

  return (
    <Text className={className} {...rest}>
      {n.toLocaleString()}
    </Text>
  );
}
