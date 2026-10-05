import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useView } from '../context/ViewContext';
import { useTranslation } from '../lib/i18n';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import { useProfile, useSocialIcons } from '../lib/queries';
import { useSeo } from '../hooks/useSeo';
import { ArrowUpRight } from 'lucide-react';
import { SocialGlyph } from '../lib/socialIcon';
import Magnetic from '../components/fx/Magnetic';

/**
 * Hero — wordmark besar dua-nada "GABZ" (outline) + "DEV" (solid biru)
 * sebagai focal point utama, foto nempel di tengah nutupin sebagian teks.
 *
 * v5 (optimasi scroll): efek "numpuk" section 1->2 dulu pake GSAP
 * ScrollTrigger pin — itu ngitung ulang posisi pake JavaScript tiap frame
 * scroll, dan barengan sama Lenis yang juga nge-drive scroll, jadi dua
 * sistem rebutan => berat/patah-patah. Sekarang pake CSS `position:
 * sticky` murni (dikerjain compositor GPU, nol JS per frame). Hero
 * ke-pin di belakang About (About z-10 + background solid). Begitu About
 * udah nutup Hero sepenuhnya, Hero di-`visibility:hidden` lewat 1 listener
 * scroll pasif (cuma nulis style kalau statusnya berubah) — jadi nggak
 * ada biaya paint ngendon di belakang sepanjang halaman.
 * Otomatis dilewatin kalau user set prefers-reduced-motion.
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
  const maskRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mobilePhotoRef = useRef<HTMLImageElement>(null);
  const mobileContentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = [
      maskRef.current,
      wordmarkRef.current,
      photoRef.current,
      contentRef.current,
      mobilePhotoRef.current,
      mobileContentRef.current,
    ];
    if (reduce || els.some((el) => !el)) {
      gsap.set(els, { clearProps: 'all' });
      return;
    }


    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.set(wordmarkRef.current, { yPercent: 100 })
        .set(maskRef.current, { clipPath: 'inset(0 0 0 0)' })
        .to(wordmarkRef.current, { yPercent: 0, duration: 0.9 }, 0.15)
        .to([photoRef.current, mobilePhotoRef.current], { opacity: 1, scale: 1, duration: 0.7 }, 0.45)
        .to([contentRef.current, mobileContentRef.current], { opacity: 1, y: 0, duration: 0.6 }, 0.65);

    }, rootRef);

    return () => ctx.revert();
  }, []);

  // Hero sticky di belakang About. Setelah About nutup penuh (scrollY >
  // tinggi Hero), sembunyiin Hero biar browser nggak ngecat layer
  // fullscreen yang nggak kelihatan. Tinggi Hero di-cache lewat
  // ResizeObserver, handler scroll pasif + rAF, tulis style HANYA saat flip.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let heroH = el.offsetHeight;
    let hidden = false;
    let ticking = false;
    const ro = new ResizeObserver(() => {
      heroH = el.offsetHeight;
    });
    ro.observe(el);
    const update = () => {
      ticking = false;
      const shouldHide = window.scrollY > heroH + 40;
      if (shouldHide !== hidden) {
        hidden = shouldHide;
        el.style.visibility = shouldHide ? 'hidden' : 'visible';
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      ro.disconnect();
      el.style.visibility = '';
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id="hero"
      className="sticky top-0 z-0 min-h-dvh flex flex-col justify-center pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-12 px-6 md:px-10 overflow-hidden"
      style={{ background: '#FFFFFF' }}
    >
      <div className="max-w-[1200px] mx-auto w-full">
        {/* Wordmark + foto — overlap di tengah. Foto overlap-nya CUMA di
            desktop (lg+) sekarang — mobile punya komposisi sendiri di
            bawah (bukan sekadar wordmark ini yang diperkecil). */}
        <div className="relative flex justify-center items-center">
          {/* maskRef: overflow-hidden "jendela tirai" — wordmark di
              dalemnya digeser dari yPercent:100 (ketutup penuh) ke 0
              (kebuka), kesannya kayak tirai/blind kebuka ke atas. */}
          <div ref={maskRef} className="overflow-hidden">
            <h1
              ref={wordmarkRef}
              className="hero-headline relative flex flex-wrap justify-center items-baseline select-none"
              style={{
                fontSize: 'clamp(76px, 17vw, 196px)',
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

          {/* Foto — ASET FINAL BARU (hero-portrait-final.webp), sudah
              termasuk anotasi dekoratif biru (panah, titik grid, plus,
              garis orbit) yang dibakar jadi satu gambar transparan —
              nggak perlu bikin ulang elemen-elemen itu manual jadi HTML/
              SVG terpisah. Cuma tampil DESKTOP (lg+); ukurannya dibesarin
              dari versi crop lama karena frame gambar baru ini jauh lebih
              lebar (nyisain ruang buat anotasi di kiri-kanan), jadi kalau
              dipasang di lebar yang sama kayak crop lama, orangnya bakal
              keliatan lebih kecil — DIKOMPENSASI naikin ukuran. */}
          <img
            ref={photoRef}
            src="/images/hero-portrait-final.webp"
            alt={`${profile.name}, Web & AI Engineer`}
            className="hero-photo hidden lg:block absolute pointer-events-none select-none"
            style={{ opacity: 0 }}
            width={1536}
            height={1024}
            fetchPriority="high"
            decoding="async"
            draggable={false}
          />
        </div>

        {/* ================== MOBILE-ONLY KOMPOSISI (< lg) ==================
            Bukan sekadar nyusutin layout desktop — ini urutan/hierarchy
            SENDIRI sesuai spec: role -> deskripsi -> potret (besar,
            di tengah, nggak nempel navbar/CTA) -> baris CTA+sosmed.
            Potret di sini BUKAN posisi absolute-overlap kayak desktop,
            dia di normal flow (ngambil tempatnya sendiri), jadi otomatis
            punya "breathing room" di atas & bawahnya tanpa perlu itung
            manual jarak overlap. */}
        <div ref={mobileContentRef} className="lg:hidden flex flex-col items-center text-center mt-5" style={{ opacity: 0, transform: 'translateY(14px)' }}>
          <p className="font-bold mb-2" style={{ color: '#3B5FE3', fontSize: 'clamp(15px, 4.2vw, 19px)' }}>
            {headline || t.hero.headline}
          </p>
          <p className="mb-1 max-w-[92vw] line-clamp-3" style={{ color: '#64748B', lineHeight: 1.6, fontSize: 'clamp(12px, 3.2vw, 15px)' }}>
            {bio || t.hero.description1}
          </p>

          <img
            ref={mobilePhotoRef}
            src="/images/hero-portrait-final.webp"
            alt={`${profile.name}, Web & AI Engineer`}
            className="select-none my-4 sm:my-5"
            style={{ width: 'min(88vw, 420px)', height: 'auto', opacity: 0 }}
            width={1536}
            height={1024}
            loading="eager"
            draggable={false}
          />

          <div className="flex items-center justify-center flex-wrap gap-4 gap-y-3">
            <Magnetic>
              <button
                onClick={() => setView('projects')}
                className="btn-bounce inline-flex items-center gap-1.5 px-5 py-2.5 font-semibold text-white focus-ring"
                style={{ background: '#3B5FE3', borderRadius: 9999, boxShadow: '0 6px 20px rgba(59, 95, 227,0.35)', fontSize: 'clamp(12px, 3.2vw, 14px)' }}
              >
                {t.hero.ctaOrder} <ArrowUpRight size={14} className="shrink-0" />
              </button>
            </Magnetic>

            {socialIcons.length > 0 && (
              <ul className="flex items-center gap-4">
                {socialIcons.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor
                      className="flex items-center gap-1.5 font-medium focus-ring whitespace-nowrap"
                      style={{ color: '#334155', fontSize: 'clamp(11px, 2.8vw, 13px)' }}
                    >
                      <SocialGlyph label={s.label} iconUrl={s.icon_url} size={14} />
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ================== DESKTOP-ONLY (lg+) ==================
            Baris tagline+CTA (kiri) + sosmed (kanan), persis kayak
            sebelumnya — cuma sekarang eksplisit `hidden lg:flex` karena
            versi mobile-nya udah punya blok sendiri di atas. */}
        <div
          ref={contentRef}
          className="hidden lg:flex relative z-10 mt-64 items-start justify-between gap-8"
          style={{ opacity: 0, transform: 'translateY(14px)' }}
        >
          <div className="min-w-0 flex-1 max-w-[440px]">
            <p className="font-bold mb-2" style={{ color: '#3B5FE3', fontSize: 'clamp(13px, 3.6vw, 20px)' }}>
              {headline || t.hero.headline}
            </p>
            <p className="mb-5 line-clamp-3" style={{ color: '#64748B', lineHeight: 1.6, fontSize: 'clamp(10px, 2.6vw, 14px)' }}>
              {bio || t.hero.description1}
            </p>

            <Magnetic>
              <button
                onClick={() => setView('projects')}
                className="btn-bounce inline-flex items-center gap-2 px-6 py-3 font-semibold text-white focus-ring"
                style={{ background: '#3B5FE3', borderRadius: 9999, boxShadow: '0 6px 20px rgba(59, 95, 227,0.35)', fontSize: 'clamp(11px, 2.8vw, 14px)' }}
              >
                {t.hero.ctaOrder} <ArrowUpRight size={14} className="shrink-0" />
              </button>
            </Magnetic>
          </div>

          {socialIcons.length > 0 && (
            <ul className="flex flex-col gap-3 shrink-0">
              {socialIcons.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor
                    className="flex items-center gap-2 font-medium focus-ring whitespace-nowrap"
                    style={{ color: '#334155', fontSize: 'clamp(9px, 2.4vw, 14px)' }}
                  >
                    <SocialGlyph label={s.label} iconUrl={s.icon_url} size={14} />
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
