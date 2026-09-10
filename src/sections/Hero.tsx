import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
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
 * v3 (rombak per MASTER PROMPT poin 7 — "cinematic entrance"): entrance
 * animation-nya diganti dari fade CSS biasa ke timeline GSAP dengan
 * clip-path reveal buat wordmark (kesan "tirai kebuka ke atas") + stagger
 * buat elemen lain, ngikutin timing yang disaranin di prompt (~150ms
 * antar-tahap). Layout/posisi/ukuran (wordmark, foto, spacing) TETAP
 * dipertahanin persis kayak hasil tuning berkali-kali sebelumnya — yang
 * berubah cuma CARA elemen-elemennya muncul pertama kali.
 * Otomatis dilewatin (langsung state akhir, nggak ada animasi) kalau
 * user set prefers-reduced-motion.
 */

export default function Hero() {
  const { setView } = useView();
  const { t } = useTranslation();
  const { profile } = useProfile();
  useSeo(profile);
  const bio = useAutoTranslate(profile.bio);
  const headline = useAutoTranslate(profile.headline);
  const socialIcons = useSocialIcons('gabzdev');

  const rootRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = [badgeRef.current, maskRef.current, wordmarkRef.current, photoRef.current, contentRef.current];
    if (reduce || els.some((el) => !el)) {
      gsap.set(els, { clearProps: 'all' });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.set(wordmarkRef.current, { yPercent: 100 })
        .set(maskRef.current, { clipPath: 'inset(0 0 0 0)' })
        .to(badgeRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0)
        .to(wordmarkRef.current, { yPercent: 0, duration: 0.9 }, 0.15)
        .to(photoRef.current, { opacity: 1, scale: 1, duration: 0.7 }, 0.45)
        .to(contentRef.current, { opacity: 1, y: 0, duration: 0.6 }, 0.65);
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="hero"
      className="relative min-h-dvh flex flex-col justify-center pt-24 md:pt-28 pb-12 px-6 md:px-10 overflow-hidden"
      style={{ background: '#FFFFFF' }}
    >
      <div className="max-w-[1200px] mx-auto w-full">
        {/* Badge — cuma di bawah lg, versi lg-ke-atas nongol di Header
            (breakpoint HARUS sama kayak di Header biar nggak ada rentang
            lebar layar yang badge-nya nggak muncul di dua-duanya). */}
        <div ref={badgeRef} className="lg:hidden flex justify-center mb-6" style={{ opacity: 0, transform: 'translateY(10px)' }}>
          <AvailabilityBadge />
        </div>

        {/* Wordmark + foto — overlap di tengah */}
        <div className="relative flex justify-center items-center">
          {/* maskRef: overflow-hidden "jendela tirai" — wordmark di
              dalemnya digeser dari yPercent:100 (ketutup penuh) ke 0
              (kebuka), kesannya kayak tirai/blind kebuka ke atas. */}
          <div ref={maskRef} className="overflow-hidden">
            <h1
              ref={wordmarkRef}
              className="hero-headline relative flex flex-wrap justify-center items-baseline select-none"
              style={{
                fontSize: 'clamp(64px, 15vw, 196px)',
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
          </div>

          {/* Foto — DIBESARIN + nempel turun sampe deket blok teks di
              bawahnya, biar keliatan "grounded"/nyatu ke layout, bukan
              stiker kecil yang ngambang doang. Dipositioning relatif ke
              TINGGI FOTO SENDIRI (top:100% dari wordmark lalu translateY
              negatif berdasar % tinggi foto), bukan ke tinggi wordmark
              yang notabene cuma setinggi 1 baris teks — supaya proporsi
              overlap-nya konsisten di semua ukuran layar.
              v4 = versi crop rapat (padding transparan sisi kiri asetnya
              udah dibuang). drop-shadow SENGAJA nggak dipasang — potongan
              bawah foto rata, jadi shadow blur numpuk keliatan kayak
              smudge kotak pudar. */}
          <img
            ref={photoRef}
            src="/images/hero-photo-v4.webp"
            alt={`${profile.name}, Web & AI Engineer`}
            className="absolute pointer-events-none select-none"
            style={{
              width: 'clamp(300px, 42vw, 560px)',
              height: 'auto',
              left: '50%',
              top: '100%',
              transform: 'translate(-50%, -45%) scale(0.94)',
              opacity: 0,
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
          ref={contentRef}
          className="relative z-10 mt-24 md:mt-40 flex flex-col md:flex-row md:items-start md:justify-between gap-8"
          style={{ opacity: 0, transform: 'translateY(14px)' }}
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
                style={{ background: '#3B5FE3', borderRadius: 9999, boxShadow: '0 6px 20px rgba(59, 95, 227,0.35)' }}
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
                    data-cursor
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
