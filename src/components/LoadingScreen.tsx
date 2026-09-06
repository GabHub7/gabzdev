import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INTRO_DURATION } from '../lib/intro';

/**
 * Loading screen — beneran sequential, SATU elemen tampil di satu waktu:
 *   1. "gabzdev"        → fade in, tahan sebentar, fade out
 *   2. "gabzstore"       → fade in, tahan sebentar, fade out
 *   3. logo GabzStore     → fade in, tahan sampai intro kelar
 *
 * Bukan numpuk (semua elemen fade-in ke posisi masing-masing dan menetap),
 * tapi gantian penuh di posisi yang sama pakai AnimatePresence mode="wait" —
 * elemen sebelumnya harus selesai exit dulu sebelum elemen berikutnya masuk.
 *
 * Terakhir, saat intro ditutup: logo GabzStore-nya SHARED-ELEMENT animate
 * pindah dari tengah layar ke posisi logo di Header (pojok kiri atas) via
 * <motion.img layoutId="brand-logo">.
 *
 * Cuma tampil sekali per sesi browser (dijaga oleh sessionStorage di
 * `lib/intro.ts`).
 */

// Titik waktu tiap fase mulai (ms), dihitung dari total INTRO_DURATION.
// gabzdev: 0 → gabzstore: ~28% → logo: ~58% → onDone: 100%
const PHASE_GABZSTORE = Math.round(INTRO_DURATION * 0.28);
const PHASE_LOGO = Math.round(INTRO_DURATION * 0.58);

type Phase = 'gabzdev' | 'gabzstore' | 'logo';

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>('gabzdev');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const t1 = setTimeout(() => setPhase('gabzstore'), PHASE_GABZSTORE);
    const t2 = setTimeout(() => setPhase('logo'), PHASE_LOGO);
    const t3 = setTimeout(onDone, INTRO_DURATION);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      document.body.style.overflow = '';
    };
  }, [onDone]);

  const barDuration = Math.max(0.4, (INTRO_DURATION - PHASE_LOGO) / 1000 - 0.3);

  return (
    <motion.div
      className="fixed inset-0 z-[10000] flex items-center justify-center px-6"
      style={{ background: '#0A0F1C' }}
      initial={{ opacity: 1 }}
      // fade out background lebih pelan dari transisi logo, jadi logo yang
      // lagi "terbang" ke header tetap kelihatan
      exit={{ opacity: 0, transition: { duration: 0.55, delay: 0.35, ease: [0.16, 1, 0.3, 1] } }}
    >
      {/* glow halus di tengah */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '55vmin',
          height: '55vmin',
          background: 'radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />

      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        {/* Stage: satu elemen teks/logo tampil gantian di posisi yang sama */}
        <div className="relative flex items-center justify-center" style={{ minHeight: 90 }}>
          <AnimatePresence mode="wait">
            {phase === 'gabzdev' && (
              <motion.p
                key="gabzdev"
                className="brand-wordmark-loading"
                initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(8px)', transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: 'clamp(34px, 7vw, 68px)',
                  lineHeight: 1,
                  color: '#FFFFFF',
                }}
              >
                gabzdev
              </motion.p>
            )}

            {phase === 'gabzstore' && (
              <motion.p
                key="gabzstore"
                className="brand-wordmark-loading"
                initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(8px)', transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: 'clamp(26px, 5vw, 48px)',
                  lineHeight: 1,
                  color: '#A3A3A3',
                }}
              >
                gabzstore
              </motion.p>
            )}

            {phase === 'logo' && (
              <motion.img
                key="logo"
                layoutId="brand-logo"
                src="/images/logo.png"
                alt="GabzStore"
                width={64}
                height={64}
                draggable={false}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  opacity: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                  scale: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                  layout: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
                }}
                style={{ width: 64, height: 64, objectFit: 'contain' }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* progress bar tipis — muncul bareng fase logo */}
        {phase === 'logo' && (
          <motion.div
            className="h-[2px] rounded-full overflow-hidden"
            style={{ width: 120, background: 'rgba(255,255,255,0.07)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg,#9CA3AF,#FFFFFF)' }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: barDuration, ease: 'easeInOut' }}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
