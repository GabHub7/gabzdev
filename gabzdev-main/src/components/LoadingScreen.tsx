import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { INTRO_DURATION } from '../lib/intro';

/**
 * Page loader — per MASTER PROMPT poin 28: layar hitam, "GABZDEV" di
 * tengah, progress indicator kecil, lalu layar hitamnya "slide away"
 * (bukan cuma fade) pas beres, baru portfolio kelihatan.
 *
 * Cuma tampil sekali per sesi browser (dijaga sessionStorage di lib/intro.ts).
 * Diganti dari versi lama yang gantian nampilin "gabzdev" -> "gabzstore" ->
 * logo — disederhanain jadi satu wordmark + counter angka biar sesuai spec
 * baru ("center: GABZDEV, small progress indicator").
 */
export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const pct = Math.min(100, Math.round(((now - start) / INTRO_DURATION) * 100));
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setExiting(true);
        setTimeout(onDone, 650); // kasih waktu buat animasi exit selesai dulu
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = '';
    };
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[10000] flex items-center justify-center px-6"
      style={{ background: 'var(--brand-black)' }}
      initial={false}
      animate={exiting ? { clipPath: 'inset(0 0 100% 0)' } : { clipPath: 'inset(0 0 0% 0)' }}
      transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="relative z-10 flex flex-col items-center gap-5 text-center">
        <p
          className="select-none"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(48px, 10vw, 96px)',
            lineHeight: 1,
            letterSpacing: '0.02em',
            color: 'var(--brand-white)',
          }}
        >
          GABZDEV
        </p>

        <div className="flex items-center gap-3">
          <div className="h-[2px] rounded-full overflow-hidden" style={{ width: 160, background: 'rgba(247,247,245,0.15)' }}>
            <div
              className="h-full"
              style={{ width: `${progress}%`, background: 'var(--brand-blue)', transition: 'width 0.1s linear' }}
            />
          </div>
          <span
            className="tabular-nums"
            style={{ fontSize: 12, color: 'var(--brand-gray)', minWidth: 30, fontFamily: "'Space Grotesk', monospace" }}
          >
            {progress}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}
