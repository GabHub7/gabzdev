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

/**
 * Hero — wordmark besar dua-nada "GABZ" (outline) + "DEV" (solid biru)
 * sebagai focal point utama, foto nempel di tengah nutupin sebagian teks.
 *
 * v2 (revisi setelah feedback): section sekarang beneran "fullscreen"
 * (min-h-dvh + center konten) di desktop MAUPUN mobile, bukan cuma
 * setinggi konten. Badge availability dipindah ke Header (sebelah logo)
 * buat layar md ke atas — di sini cuma nongol di mobile, karena header
 * versi mobile cuma logo+hamburger, nggak ada tempat buat badge di situ.
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
    <section
      id="hero"
      className="relative min-h-dvh flex flex-col justify-center pt-24 md:pt-28 pb-12 px-6 md:px-10 overflow-hidden"
      style={{ background: '#FFFFFF' }}
    >
      <div className="max-w-[1200px] mx-auto w-full">
        {/* Badge — cuma di bawah lg, versi lg-ke-atas nongol di Header
            (breakpoint HARUS sama kayak di Header biar nggak ada rentang
            lebar layar yang badge-nya nggak muncul di dua-duanya). */}
        <div className={`lg:hidden flex justify-center mb-6 transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <AvailabilityBadge />
        </div>

        {/* Wordmark + foto — overlap di tengah */}
        <div className={`relative flex justify-center items-center transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <h1
            className="hero-headline relative flex flex-wrap justify-center items-baseline select-none"
            style={{
              fontSize: 'clamp(56px, 13vw, 168px)',
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

          {/* Foto — nempel di tengah, nutupin sebagian wordmark. v4 = versi
              crop rapat (padding transparan di sisi kiri asetnya udah
              dibuang), left:50%+translateX(-50%) EKSPLISIT biar posisinya
              nggak gantung ke "static position" flex item absolute.
              CATATAN: drop-shadow SENGAJA dihapus — potongan bawah foto
              rata/lurus, jadi blur bayangannya numpuk keliatan kayak
              smudge kotak pudar (ini yang bikin "kayak ditempel kotak"). */}
          <img
            src="/images/hero-photo-v4.webp"
            alt={`${profile.name}, Web & AI Engineer`}
            className="absolute pointer-events-none select-none"
            style={{
              width: 'clamp(190px, 26vw, 340px)',
              height: 'auto',
              left: '50%',
              bottom: '-4%',
              transform: 'translateX(-50%)',
            }}
            width={435}
            height={276}
            fetchPriority="high"
            draggable={false}
          />
        </div>

        {/* Baris bawah: tagline+CTA (kiri), sosmed (kanan). items-start
            (bukan items-end lagi) biar list sosmed nempel sejajar sama
            headline di atas, nggak ke-dorong ke bawah pas isinya cuma
            sedikit — sebelumnya items-end bikin list-nya keliatan "ilang"
            karena mepet banget ke bawah, numpuk sama tombol WA floating. */}
        <div
          className={`relative z-10 mt-10 md:mt-8 flex flex-col md:flex-row md:items-start md:justify-between gap-8 transition-all duration-700 delay-200 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <div className="max-w-[440px]">
            <p className="text-lg md:text-xl font-bold mb-2" style={{ color: '#3B5FE3' }}>
              {headline || t.hero.headline}
            </p>
            <p className="text-sm mb-5 line-clamp-3" style={{ color: '#64748B', lineHeight: 1.7 }}>
              {bio || t.hero.description1}
            </p>

            <Magnetic>
              <button
                onClick={() => setView('projects')}
                className="btn-bounce inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white focus-ring"
                style={{ background: '#3B5FE3', borderRadius: 9999, boxShadow: '0 6px 20px rgba(59,95,227,0.35)' }}
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
