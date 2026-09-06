import { useEffect, useState } from 'react';
import { useView } from '../context/ViewContext';
import { useTranslation } from '../lib/i18n';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import { useProfile, useSocialIcons } from '../lib/queries';
import { useSeo } from '../hooks/useSeo';
import { ArrowUpRight } from 'lucide-react';
import { SocialGlyph } from '../lib/socialIcon';
import Magnetic from '../components/fx/Magnetic';

/**
 * Hero baru — wordmark besar dua-nada "GABZ" (outline) + "DEV" (solid biru)
 * sebagai focal point utama, foto nempel di tengah nutupin sebagian teks.
 * Referensi: layout portfolio developer bergaya bold-typographic (pic 2
 * dari brief), bukan lagi pola "kiri teks - kanan foto" yang lama.
 */

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
    <section id="hero" className="relative pt-28 md:pt-32 pb-10 px-6 md:px-10 overflow-hidden" style={{ background: '#FFFFFF' }}>
      <div className="max-w-[1200px] mx-auto">
        {/* Wordmark + foto — overlap di tengah */}
        <div className={`relative flex justify-center items-center transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <h1
            className="hero-headline relative flex flex-wrap justify-center items-baseline select-none"
            style={{
              fontSize: 'clamp(64px, 13vw, 168px)',
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
              fontWeight: 700,
            }}
          >
            <span className="sr-only">{profile.name}: </span>
            <span
              aria-hidden
              style={{
                color: 'transparent',
                WebkitTextStroke: '2px #3B5FE3',
              }}
            >
              GABZ
            </span>
            <span aria-hidden style={{ color: '#3B5FE3' }}>
              DEV
            </span>
          </h1>

          {/* Foto — nempel di tengah, nutupin sebagian wordmark.
              v4 = versi crop rapat (padding transparan di sisi kiri asetnya
              udah dibuang), plus left:50%+translateX(-50%) EKSPLISIT biar
              posisinya nggak gantung ke "static position" flex item yang
              absolute (nggak konsisten antar browser). */}
          <img
            src="/images/hero-photo-v4.webp"
            alt={`${profile.name}, Web & AI Engineer`}
            className="absolute pointer-events-none select-none"
            style={{
              width: 'clamp(200px, 27vw, 340px)',
              height: 'auto',
              left: '50%',
              bottom: '-4%',
              transform: 'translateX(-50%)',
              filter: 'drop-shadow(0 20px 35px rgba(0,0,0,0.18))',
            }}
            width={435}
            height={276}
            fetchPriority="high"
            draggable={false}
          />
        </div>

        {/* Baris bawah: badge availability (kiri), tagline+CTA (tengah-kiri), sosmed (kanan) */}
        <div
          className={`relative z-10 mt-8 md:mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-8 transition-all duration-700 delay-200 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <div className="max-w-[440px]">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-4"
              style={{ background: 'rgba(59,95,227,0.08)', border: '1px solid rgba(59,95,227,0.18)' }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: '#22C55E' }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#22C55E' }} />
              </span>
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase" style={{ color: '#3B5FE3' }}>
                {t.hero.badge}
              </span>
            </div>

            <p className="text-lg font-semibold mb-2" style={{ color: '#0F172A' }}>
              {headline || t.hero.headline}
            </p>
            <p className="text-sm mb-5" style={{ color: '#64748B', lineHeight: 1.7 }}>
              {bio || t.hero.description1}
            </p>

            <Magnetic>
              <button
                onClick={() => setView('projects')}
                className="btn-bounce inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white focus-ring"
                style={{ background: '#3B5FE3', boxShadow: '0 6px 20px rgba(59,95,227,0.35)' }}
              >
                {t.hero.ctaOrder} <ArrowUpRight size={15} />
              </button>
            </Magnetic>
          </div>

          {socialIcons.length > 0 && (
            <ul className="flex md:flex-col gap-4 md:gap-3 shrink-0">
              {socialIcons.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium focus-ring"
                    style={{ color: '#334155' }}
                  >
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
