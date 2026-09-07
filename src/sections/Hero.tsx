import { useEffect, useState } from 'react';
import { useView } from '../context/ViewContext';
import { useTranslation } from '../lib/i18n';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import { useProfile, useSocialIcons } from '../lib/queries';
import { useSeo } from '../hooks/useSeo';
import { ArrowUpRight } from 'lucide-react';
import { SocialGlyph } from '../lib/socialIcon';
import Magnetic from '../components/fx/Magnetic';
import { AvailabilityBadge } from '../components/AvailabilityBadge';

export default function Hero() {
  const { setView } = useView();
  const { t } = useTranslation();
  const { profile } = useProfile();
  useSeo(profile);
  const bio = useAutoTranslate(profile.bio);
  const headline = useAutoTranslate(profile.headline);
  const socialIcons = useSocialIcons('gabzdev');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 60);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="hero" className="relative overflow-hidden bg-white px-6 pb-16 pt-24 md:px-10 md:pb-20 md:pt-28">
      <div className="mx-auto flex min-h-[calc(100dvh-7rem)] w-full max-w-[1280px] flex-col justify-center">
        <div className={`mb-6 flex justify-center transition-opacity duration-700 lg:hidden ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <AvailabilityBadge />
        </div>

        <div className={`relative transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="relative flex min-h-[clamp(260px,38vw,510px)] items-end justify-center overflow-visible">
            <h1
              className="hero-headline relative z-0 flex select-none items-baseline justify-center whitespace-nowrap text-[clamp(4.5rem,16vw,13.5rem)] font-bold leading-[0.82] tracking-[-0.055em]"
              aria-label={`${profile.name} Gabzdev`}
            >
              <span className="sr-only">{profile.name}: </span>
              <span aria-hidden className="text-transparent" style={{ WebkitTextStroke: '2px #3B5FE3' }}>
                GABZ
              </span>
              <span aria-hidden className="text-[#3B5FE3]">DEV</span>
            </h1>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center">
              <img
                src="/images/hero-photo-v4.webp"
                alt={`${profile.name}, Web & AI Engineer`}
                className="h-auto w-[clamp(245px,34vw,455px)] select-none object-contain object-bottom"
                width={435}
                height={276}
                fetchPriority="high"
                draggable={false}
              />
            </div>
          </div>
        </div>

        <div className={`relative z-20 mt-8 flex flex-col gap-8 transition-all delay-200 duration-700 md:mt-10 md:flex-row md:items-start md:justify-between ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}>
          <div className="max-w-[460px]">
            <p className="mb-2 text-lg font-bold text-[#3B5FE3] md:text-xl">{headline || t.hero.headline}</p>
            <p className="mb-5 line-clamp-3 text-sm leading-7 text-slate-500">{bio || t.hero.description1}</p>
            <Magnetic>
              <button
                onClick={() => setView('projects')}
                className="btn-bounce focus-ring inline-flex items-center gap-2 rounded-full bg-[#3B5FE3] px-6 py-3 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(59,95,227,0.35)]"
              >
                {t.hero.ctaOrder} <ArrowUpRight size={15} />
              </button>
            </Magnetic>
          </div>

          {socialIcons.length > 0 && (
            <ul className="flex shrink-0 gap-4 md:flex-col md:gap-3">
              {socialIcons.map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="focus-ring flex items-center gap-2 text-sm font-medium text-slate-700">
                    <SocialGlyph label={s.label} iconUrl={s.icon_url} size={16} />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
