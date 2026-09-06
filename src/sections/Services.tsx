import { Globe, Smartphone, Gauge, ShieldCheck } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useTranslation } from '../lib/i18n';

const icons = [Globe, Smartphone, Gauge, ShieldCheck];
const accents = ['#60A5FA', '#818CF8', '#38BDF8', '#A78BFA'];

interface Service {
  icon: React.ElementType;
  title: string;
  description: string;
}

function ServiceItem({
  service, index, accent, isVisible,
}: { service: Service; index: number; accent: string; isVisible: boolean }) {
  const Icon = service.icon;
  return (
    <div
      className={`group flex gap-4 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{
        transitionDelay: `${250 + index * 90}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Icon size={20} strokeWidth={1.75} style={{ color: accent }} />
      </div>
      <div className="pt-1">
        <h3 className="text-base font-semibold mb-1.5" style={{ color: '#F1F5F9' }}>
          {service.title}
        </h3>
        <p className="text-sm" style={{ color: '#94A3B8', lineHeight: 1.65 }}>
          {service.description}
        </p>
      </div>
    </div>
  );
}

export default function Services() {
  const { ref, isVisible } = useScrollReveal(0.12);
  const { t } = useTranslation();
  const services: Service[] = t.services.items.map((item, i) => ({ ...item, icon: icons[i] }));

  return (
    <section
      id="services"
      className="relative py-20 md:py-28 px-4 md:px-6"
      style={{ background: 'linear-gradient(160deg, #0A0F1C 0%, #0F1729 60%, #0A0F1C 100%)' }}
    >
      <div
        ref={ref}
        className="relative max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-20 items-center"
      >
        {/* KIRI — heading + list layanan */}
        <div>
          <p
            className={`text-sm font-semibold tracking-[0.1em] mb-3 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-9'
            }`}
            style={{ color: '#60A5FA', transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
          >
            {t.services.label}
          </p>
          <h2
            className={`font-bold mb-4 transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-9'
            }`}
            style={{
              fontSize: 'clamp(28px, 3.4vw, 44px)',
              color: '#F8FAFC',
              lineHeight: 1.15,
              transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {t.services.title}
          </h2>
          <p
            className={`text-base mb-10 transition-all duration-700 delay-200 max-w-[440px] ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-9'
            }`}
            style={{
              color: '#94A3B8',
              lineHeight: 1.7,
              transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {t.services.subtitle}
          </p>

          <div className="space-y-6">
            {services.map((service, index) => (
              <ServiceItem
                key={service.title}
                service={service}
                index={index}
                accent={accents[index % accents.length]}
                isVisible={isVisible}
              />
            ))}
          </div>
        </div>

        {/* KANAN — mockup HP */}
        <div
          className={`relative flex justify-center lg:justify-end transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
        >
          {/* glow di belakang HP biar kesan floating & menyatu dgn bg gelap */}
          <div
            className="absolute w-[70%] h-[70%] rounded-full pointer-events-none"
            style={{
              top: '15%',
              background: 'radial-gradient(circle, rgba(96,165,250,0.16) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }}
            aria-hidden
          />
          <img
            src="/images/schoolpay-mockup-v2.webp"
            alt="Mockup SchoolPay, sistem informasi pembayaran SPP"
            className="relative w-full max-w-[380px] lg:max-w-[420px] h-auto animate-float"
            style={{ filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.4))' }}
            loading="lazy"
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
}
