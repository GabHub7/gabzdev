import { useEffect, useRef, useState } from 'react';
import { useInView, animate } from 'framer-motion';

/**
 * Angka yang "ngitung naik" dari 0 ke target pas elemen keliatan di layar.
 * Contoh: <CountUp end={235} suffix="+" /> -> 0, 1, 2 ... 235+
 */
export default function CountUp({
  end,
  duration = 1.6,
  prefix = '',
  suffix = '',
  decimals = 0,
  separator = false,
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  separator?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, end, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        const fixed = v.toFixed(decimals);
        setDisplay(separator ? Number(fixed).toLocaleString('en-US') : fixed);
      },
    });
    return () => controls.stop();
  }, [isInView, end, duration, decimals, separator]);

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
