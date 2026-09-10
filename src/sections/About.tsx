import { useEffect, useState, lazy, Suspense } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import FadeUp from '../components/fx/FadeUp';
import { useTranslation } from '../lib/i18n';
import DevWorkflowIllustration from '../components/DevWorkflowIllustration';

const LottieIllustration = lazy(() => import('../components/LottieIllustration'));

interface Skill {
  name: string;
  percentage: number;
  hasNode: boolean;
}

const skillMeta: { percentage: number; hasNode: boolean }[] = [
  { percentage: 90, hasNode: true },
  { percentage: 80, hasNode: false },
  { percentage: 78, hasNode: false },
  { percentage: 75, hasNode: false },
];

function SkillBar({ skill }: { skill: Skill }) {
  const { ref, isVisible } = useScrollReveal(0.4);
  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setAnimatedWidth(skill.percentage);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, skill.percentage]);

  return (
    <div ref={ref} className="mb-6 last:mb-0">
      <div className="flex justify-between items-center mb-2">
        <span className="text-base font-semibold" style={{ color: '#0F172A' }}>
          {skill.name}
        </span>
        <span className="text-sm font-semibold" style={{ color: '#3B5FE3' }}>
          {skill.percentage}%
        </span>
      </div>
      <div className="skill-track">
        <div
          className="skill-fill"
          style={{ width: `${animatedWidth}%` }}
        >
          {skill.hasNode && (
            <div
              className={`skill-node ${isVisible ? 'animate-glow' : ''}`}
              style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 500ms ease 1500ms' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function About() {
  const { t } = useTranslation();
  const skills: Skill[] = t.about.skills.map((name, i) => ({ name, ...skillMeta[i] }));

  return (
    <section id="about" className="relative py-20 md:py-24" style={{ background: '#FFFFFF' }}>
      {/* Section watermark */}
      

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center">
          <div>
            {/* Section Label */}
            <FadeUp threshold={0.15}>
              <p
                className="text-sm font-semibold tracking-[0.1em] mb-3"
                style={{ color: '#3B5FE3' }}
              >
                {t.about.label}
              </p>
            </FadeUp>

            {/* Heading */}
            <FadeUp threshold={0.15} delay={80}>
              <h2
                className="font-bold mb-4 text-shimmer"
                style={{
                  fontSize: 'clamp(28px, 3.5vw, 48px)',
                  lineHeight: 1.2,
                }}
              >
                {t.about.title}
              </h2>
            </FadeUp>

            {/* Subtitle */}
            <FadeUp threshold={0.15} delay={160}>
              <p
                className="text-base mb-10"
                style={{
                  color: '#475569',
                  lineHeight: 1.7,
                }}
              >
                {t.about.subtitle}
              </p>
            </FadeUp>

            {/* Skill Indicators */}
            <div>
              {skills.map((skill, index) => (
                <FadeUp key={skill.name} threshold={0.15} delay={240 + index * 100}>
                  <SkillBar skill={skill} />
                </FadeUp>
              ))}
            </div>
          </div>

          {/* Ilustrasi isometrik custom — SVG + CSS animation, gak perlu setup apapun */}
          <FadeUp threshold={0.15} delay={120} className="hidden lg:flex justify-center lg:order-first">
            <Suspense fallback={<DevWorkflowIllustration className="w-full max-w-md" />}>
              <LottieIllustration src="/animations/seo-isometric.json" className="w-full max-w-md" />
            </Suspense>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
