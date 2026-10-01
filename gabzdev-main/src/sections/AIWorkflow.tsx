import { lazy, Suspense } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useTranslation } from '../lib/i18n';
import DecryptedText from '../components/fx/DecryptedText';

const LottieIllustration = lazy(() => import('../components/LottieIllustration'));

export default function AIWorkflow() {
  const { ref, isVisible } = useScrollReveal(0.15);
  const { t } = useTranslation();

  return (
    <section id="ai-workflow" className="relative py-20 md:py-24" style={{ background: '#0A0F1C' }}>
      <div
        ref={ref}
        className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center">
          {/* Robot + human illustration — kanan (selang-seling: About gambar di
              kiri, section ini di kanan, biar berganti sisi mengalir ke bawah) */}
          <div
            className={`hidden lg:flex justify-center lg:order-last transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <Suspense fallback={<div className="w-full max-w-md" style={{ minHeight: 260 }} />}>
              <LottieIllustration src="/animations/man-robot-workplace.json" className="w-full max-w-md" />
            </Suspense>
          </div>

          {/* Text — kiri */}
          <div
            className={`lg:order-first transition-all duration-700 delay-150 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <p className="text-sm font-semibold tracking-[0.1em] mb-3" style={{ color: '#7BA1EC' }}>
              {t.aiWorkflow.label}
            </p>
            <h2
              className="font-bold mb-4"
              style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', lineHeight: 1.2, color: '#F8FAFC' }}
            >
              <DecryptedText text={t.aiWorkflow.title} />
            </h2>
            <p className="text-base" style={{ color: '#94A3B8', lineHeight: 1.8 }}>
              {t.aiWorkflow.body}
            </p>

            {/* Mobile fallback illustration (Lottie hidden below lg to keep things light on mobile) */}
            <div className="lg:hidden mt-8">
              <Suspense fallback={<div style={{ minHeight: 200 }} />}>
                <LottieIllustration src="/animations/man-robot-workplace.json" className="w-full max-w-sm mx-auto" />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
