import { Gauge, Layers, MessagesSquare, ShieldCheck } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useTranslation } from '../lib/i18n';

const icons = [Gauge, Layers, MessagesSquare, ShieldCheck];
const accents = ['#60A5FA', '#818CF8', '#38BDF8', '#A78BFA'];

export default function WhyHireMe() {
  const { ref, isVisible } = useScrollReveal(0.12);
  const { t } = useTranslation();

  return (
    <section id="why-hire-me" className="relative py-20 md:py-24 px-4 md:px-6" style={{ background: 'linear-gradient(160deg, #0A0F1C 0%, #0F1729 60%, #0A0F1C 100%)' }}>
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }}
      />

      <div ref={ref} className="relative max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <p
            className={`text-sm font-semibold tracking-[0.1em] mb-3 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-9'}`}
            style={{ color: '#60A5FA', transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
          >
            {t.whyHire.label}
          </p>
          <h2
            className={`font-bold mb-4 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-9'}`}
            style={{ fontSize: 'clamp(28px,3.5vw,48px)', color: '#F8FAFC', lineHeight: 1.2, transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
          >
            {t.whyHire.title}
          </h2>
          <p
            className={`text-base max-w-[560px] mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-9'}`}
            style={{ color: '#94A3B8', lineHeight: 1.7, transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
          >
            {t.whyHire.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {t.whyHire.items.map((item, i) => {
            const Icon = icons[i];
            const accent = accents[i % accents.length];
            return (
              <div
                key={item.title}
                className={`group p-6 rounded-2xl transition-all duration-700 hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  transitionDelay: `${200 + i * 80}ms`,
                  transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <Icon size={20} strokeWidth={1.75} style={{ color: accent }} />
                </div>

                <h3 className="text-base font-semibold mb-2" style={{ color: '#F1F5F9' }}>
                  {item.title}
                </h3>
                <p className="text-sm" style={{ color: '#94A3B8', lineHeight: 1.7 }}>
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
