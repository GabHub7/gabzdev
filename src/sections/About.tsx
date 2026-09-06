import { useEffect, useState, lazy, Suspense } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
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

function SkillBar({ skill, isVisible }: { skill: Skill; isVisible: boolean }) {
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
    <div className="mb-6 last:mb-0">
      <div className="flex justify-between items-center mb-2">
        <span className="text-base font-semibold" style={{ color: '#0F172A' }}>
          {skill.name}
        </span>
        <span className="text-sm font-semibold" style={{ color: '#4F7FE0' }}>
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
  const { ref, isVisible } = useScrollReveal(0.15);
  const { t } = useTranslation();
  const skills: Skill[] = t.about.skills.map((name, i) => ({ name, ...skillMeta[i] }));

  return (
    <section id="about" className="relative py-20 md:py-24" style={{ background: '#FFFFFF' }}>
      {/* Section watermark */}
      

      <div
        ref={ref}
        className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center">
          <div
            className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            {/* Section Label */}
            <p
              className="text-sm font-semibold tracking-[0.1em] mb-3"
              style={{ color: '#4F7FE0' }}
            >
              {t.about.label}
            </p>

            {/* Heading */}
            <h2
              className="font-bold mb-4 text-shimmer"
              style={{
                fontSize: 'clamp(28px, 3.5vw, 48px)',
                lineHeight: 1.2,
              }}
            >
              {t.about.title}
            </h2>

            {/* Subtitle */}
            <p
              className="text-base mb-10"
              style={{
                color: '#475569',
                lineHeight: 1.7,
              }}
            >
              {t.about.subtitle}
            </p>

            {/* Skill Indicators */}
            <div>
              {skills.map((skill, index) => (
                <div
                  key={skill.name}
                  className={`transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-9'
                  }`}
                  style={{
                    transitionDelay: `${200 + index * 100}ms`,
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <SkillBar skill={skill} isVisible={isVisible} />
                </div>
              ))}
            </div>
          </div>

          {/* Ilustrasi isometrik custom — SVG + CSS animation, gak perlu setup apapun */}
          <div
            className={`hidden lg:flex justify-center lg:order-first transition-all duration-700 delay-150 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <Suspense fallback={<DevWorkflowIllustration className="w-full max-w-md" />}>
              <LottieIllustration src="/animations/seo-isometric.json" className="w-full max-w-md" />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
