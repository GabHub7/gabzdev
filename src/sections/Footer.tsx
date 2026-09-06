import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowUp, Star, MessageCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useView } from '../context/ViewContext';
import { useTranslation } from '../lib/i18n';
import { useSocial, useSocialIcons, useProfile, useTestimonials } from '../lib/queries';
import { SocialGlyph } from '../lib/socialIcon';
import { BUILD_VERSION } from '../lib/buildInfo';

/** Sama kayak di Testimonials.tsx — gandain testimoni asli (BUKAN hardcode
 * konten baru) sampai minimal segini banyak, biar carousel loop:true embla
 * punya cukup slide buat looping mulus meski testimoninya baru dikit. */
const MIN_LOOP_SLIDES = 8;
function withMinSlides<T>(items: T[]): T[] {
  if (items.length === 0) return items;
  if (items.length >= MIN_LOOP_SLIDES) return items;
  const repeats = Math.ceil(MIN_LOOP_SLIDES / items.length);
  return Array.from({ length: repeats }, () => items).flat();
}

/** Font yang gantian dipakai buat kata "Order" di judul "Order? Contact
 * Us." — murni efek visual (nunjukin variasi tipografi), teksnya sendiri
 * tetap sama, cuma font-family-nya yang di-cycle otomatis tiap ~1.3 detik. */
const ORDER_FONTS = [
  "'Poppins', sans-serif",
  "'Anton', sans-serif",
  "'Playfair Display', Georgia, serif",
  "'Caveat', cursive",
  "'Bebas Neue', sans-serif",
  "'Space Mono', monospace",
];
const ORDER_INTERVAL_MS = 1300;

function AnimatedTitle({ text }: { text: string }) {
  const [fontIndex, setFontIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFontIndex((i) => (i + 1) % ORDER_FONTS.length), ORDER_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const idx = text.indexOf('Order');
  if (idx === -1) return <>{text}</>;
  const before = text.slice(0, idx);
  const word = text.slice(idx, idx + 'Order'.length);
  const after = text.slice(idx + 'Order'.length);

  return (
    <>
      {before}
      <span style={{ display: 'inline-grid', verticalAlign: 'bottom' }}>
        <AnimatePresence mode="wait">
          <motion.span
            key={fontIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: ORDER_FONTS[fontIndex], gridArea: '1 / 1' }}
          >
            {word}
          </motion.span>
        </AnimatePresence>
      </span>
      {after}
    </>
  );
}

/**
 * Contact + Testimoni digabung jadi satu section (referensi: "Order?
 * Contact Us." dari gendesignid.web.id). Ganti dari form isian manual jadi
 * baris ikon kontak langsung (klik = buka WA/Instagram/dll), dan testimoni
 * yang tadinya section terpisah sekarang jadi panel kecil di sampingnya.
 *
 * Fungsi rahasia dari Footer lama TETAP dipertahankan: klik nama di bottom
 * bar 3x cepat = buka login admin diam-diam.
 */
export default function Footer() {
  const { ref, isVisible } = useScrollReveal(0.1);
  const { setView } = useView();
  const { t } = useTranslation();

  const social = useSocial();
  const socialIcons = useSocialIcons('gabzdev');
  const { profile } = useProfile();
  const { testimonials } = useTestimonials('gabzdev');
  const testimonialSlides = withMinSlides(testimonials);

  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    axis: 'y',
    align: 'start',
  });
  const autoplayTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopAutoplay = useCallback(() => {
    if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    autoplayTimer.current = null;
  }, []);
  const startAutoplay = useCallback(() => {
    stopAutoplay();
    if (!emblaApi) return;
    autoplayTimer.current = setInterval(() => emblaApi.scrollNext(), 2600);
  }, [emblaApi, stopAutoplay]);
  useEffect(() => {
    if (!emblaApi) return;
    startAutoplay();
    emblaApi.on('pointerDown', stopAutoplay);
    emblaApi.on('pointerUp', startAutoplay);
    return () => {
      stopAutoplay();
      emblaApi.off('pointerDown', stopAutoplay);
      emblaApi.off('pointerUp', startAutoplay);
    };
  }, [emblaApi, startAutoplay, stopAutoplay]);

  const handleNameSecret = () => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      setView('login');
      return;
    }
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 900);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const waHref = social.whatsapp
    ? `https://wa.me/${social.whatsapp.replace(/^0/, '62')}?text=${encodeURIComponent('Halo GabzDev, saya tertarik dengan jasa pembuatan website.')}`
    : null;

  return (
    <footer id="contact" className="relative" style={{ background: '#FFFFFF' }}>
      <div
        ref={ref}
        className={`relative z-10 max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16 py-20 md:py-24 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-9'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
          {/* KIRI — headline besar + ikon kontak */}
          <div>
            <p className="text-sm font-semibold tracking-[0.1em] uppercase mb-3" style={{ color: '#3B5FE3' }}>
              {t.contact.label}
            </p>
            <h2
              className="font-bold mb-3"
              style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', lineHeight: 1.05, color: '#0F172A' }}
            >
              <AnimatedTitle text={t.contact.title} />
            </h2>
            <p className="text-sm mb-8" style={{ color: '#64748B' }}>
              {t.contact.clickToOrder}
            </p>

            <div className="flex flex-wrap gap-3">
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-bounce flex flex-col items-center justify-center gap-2 w-24 h-24 focus-ring"
                  style={{ border: '1px solid #0F172A' }}
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={22} style={{ color: '#0F172A' }} />
                  <span className="text-xs font-semibold" style={{ color: '#0F172A' }}>WhatsApp</span>
                </a>
              )}
              {socialIcons.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-bounce flex flex-col items-center justify-center gap-2 w-24 h-24 focus-ring"
                  style={{ border: '1px solid #0F172A' }}
                  aria-label={s.label}
                >
                  <SocialGlyph label={s.label} iconUrl={s.icon_url} size={22} color="#0F172A" />
                  <span className="text-xs font-semibold" style={{ color: '#0F172A' }}>{s.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* KANAN — panel testimoni: embla carousel vertikal, bisa di-swipe
              (drag mouse/touch), loop:true (infinite, bukan cuma digandakan
              2x lewat CSS kayak sebelumnya), autoplay pause pas lagi di-drag. */}
          {testimonialSlides.length > 0 && (
            <div
              onMouseEnter={stopAutoplay}
              onMouseLeave={startAutoplay}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold tracking-widest uppercase" style={{ color: '#94A3B8' }}>
                  {t.contact.testimonialsLabel}
                </h4>
                <div className="hidden sm:flex items-center gap-1.5">
                  <button type="button" onClick={() => emblaApi?.scrollPrev()} aria-label="Previous"
                    className="w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 focus-ring"
                    style={{ border: '1px solid #E2E8F0' }}>
                    <ChevronUp size={13} style={{ color: '#334155' }} />
                  </button>
                  <button type="button" onClick={() => emblaApi?.scrollNext()} aria-label="Next"
                    className="w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 focus-ring"
                    style={{ border: '1px solid #E2E8F0' }}>
                    <ChevronDown size={13} style={{ color: '#334155' }} />
                  </button>
                </div>
              </div>
              <div
                ref={emblaRef}
                style={{ height: 420, overflow: 'hidden', maskImage: 'linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)' }}
              >
                <div className="flex flex-col gap-3">
                  {testimonialSlides.map((item, i) => (
                    <div
                      key={`${item.id}-${i}`}
                      className="flex items-start gap-3 p-4 shrink-0"
                      style={{ border: '1px solid #E2E8F0' }}
                    >
                      <div
                        className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-bold overflow-hidden"
                        style={{ background: '#0F172A', color: '#FFFFFF' }}
                      >
                        {item.photo_url ? (
                          <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          item.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#0F172A' }}>{item.name}</p>
                        <div className="flex gap-0.5 mb-1">
                          {Array.from({ length: 5 }).map((_, si) => (
                            <Star key={si} size={11} fill={si < item.rating ? '#3B5FE3' : 'none'} style={{ color: '#3B5FE3' }} />
                          ))}
                        </div>
                        <p className="text-xs line-clamp-2" style={{ color: '#64748B' }}>"{item.quote}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-16 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid #E2E8F0' }}
        >
          <p className="text-xs text-center sm:text-left" style={{ color: '#94A3B8' }}>
            &copy; 2026{' '}
            <span onClick={handleNameSecret} style={{ cursor: 'default', userSelect: 'none' }}>
              {profile.name}
            </span>
            {' '}{t.footer.rights}
          </p>

          <div className="flex items-center gap-4">
            {/* Penanda versi build — buat verifikasi cepat apakah situs udah
                jalanin kode terbaru atau masih build lama yang belum
                di-redeploy. Sengaja kecil & pudar, nggak ganggu desain. */}
            <span className="text-[10px]" style={{ color: '#CBD5E1' }}>{BUILD_VERSION}</span>
            <button
              onClick={scrollToTop}
              className="w-9 h-9 flex items-center justify-center transition-all duration-300 hover:scale-110 focus-ring"
              style={{ border: '1px solid #0F172A' }}
              aria-label="Scroll to top"
            >
              <ArrowUp size={15} style={{ color: '#0F172A' }} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
