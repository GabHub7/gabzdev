import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

/**
 * Teks yang muncul kayak "decrypt" — karakter acak dulu, pelan-pelan
 * "kekunci" jadi huruf asli dari kiri ke kanan. Trigger pas discroll ke
 * elemennya, sekali doang (once: true) biar nggak ngulang tiap scroll.
 */
export default function DecryptedText({
  text,
  className = '',
  speed = 30,
}: {
  text: string;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(text);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isInView || hasRun.current) return;
    hasRun.current = true;

    let iteration = 0;
    const totalIterations = text.length * 2;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            const revealAt = (i / text.length) * totalIterations;
            if (iteration >= revealAt + text.length * 0.5) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );
      iteration += 1;
      if (iteration > totalIterations) {
        setDisplay(text);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [isInView, text, speed]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
