import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { X, MessageCircle, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useTestimonials } from '../lib/queries';
import type { DashTestimonial } from '../lib/storage';
import { useTranslation } from '../lib/i18n';
import { useAutoTranslate } from '../hooks/useAutoTranslate';

/** Testimoni asli dari DB digandakan sampai minimal segini banyak "slide"
 * biar embla (loop: true) punya cukup konten buat looping mulus — bukan
 * hardcode isinya, cuma ngulang array yang sama biar nggak keliatan
 * mepet/kepotong kalau testimoninya baru dikit. */
const MIN_LOOP_SLIDES = 8;

function withMinSlides<T>(items: T[]): T[] {
  if (items.length === 0) return items;
  if (items.length >= MIN_LOOP_SLIDES) return items;
  const repeats = Math.ceil(MIN_LOOP_SLIDES / items.length);
  return Array.from({ length: repeats }, () => items).flat();
}

const PALETTE = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

function StarRow({ rating, size = 15 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} dari 5 bintang`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < rating ? '#FBBF24' : 'none'} stroke={i < rating ? '#FBBF24' : '#CBD5E1'} strokeWidth="1.8">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function Avatar({ testimonial, color, size = 40 }: { testimonial: DashTestimonial; color: string; size?: number }) {
  if (testimonial.photo_url) {
    return (
      <img
        src={testimonial.photo_url}
        alt={testimonial.name}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        background: `linear-gradient(135deg, ${color}, ${color}CC)`,
      }}
    >
      {initialsOf(testimonial.name)}
    </div>
  );
}

/**
 * Modal detail testimoni (sesuai sketsa: klik kartu → detail testimoni).
 * Kutipan tampil penuh tanpa dipotong, plus tombol chat WA kalau nomornya diisi.
 */
function TestimonialModal({ testimonial, color, onClose }: { testimonial: DashTestimonial; color: string; onClose: () => void }) {
  const { t } = useTranslation();
  const quote = useAutoTranslate(testimonial.quote);
  const designation = useAutoTranslate(testimonial.designation);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4 animate-modal-bg"
      style={{ backdropFilter: 'blur(8px)', background: 'rgba(15,17,21,0.55)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={t.testimonials.detailTitle}
    >
      <div
        className="relative w-full max-w-lg max-h-[88vh] overflow-y-auto animate-modal-in"
        style={{
          background: 'rgba(13,15,22,0.94)',
          backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '28px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 focus-ring"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}
          aria-label={t.testimonials.close}
        >
          <X size={18} style={{ color: '#F8FAFC' }} />
        </button>

        <div className="p-8">
          <Quote size={34} style={{ color: 'rgba(79,127,224,0.45)' }} className="mb-4" />

          <p className="text-base mb-7" style={{ color: '#E2E8F0', lineHeight: 1.85 }}>
            {quote}
          </p>

          <div className="flex items-center gap-4 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.09)' }}>
            <Avatar testimonial={testimonial} color={color} size={52} />
            <div className="flex-grow min-w-0">
              <p className="text-base font-semibold" style={{ color: '#F8FAFC' }}>{testimonial.name}</p>
              <p className="text-xs mb-2" style={{ color: '#94A3B8' }}>{designation}</p>
              <StarRow rating={testimonial.rating} size={14} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-7">
            {testimonial.whatsapp && (
              <a
                href={`https://wa.me/${testimonial.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 btn-primary text-sm py-3 px-6 focus-ring"
              >
                <MessageCircle size={15} /> {t.testimonials.chatWa}
              </a>
            )}
            <button onClick={onClose} className="glass-button px-6 py-3 text-sm font-semibold focus-ring" style={{ color: '#F8FAFC' }}>
              {t.testimonials.close}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function TestimonialCard({
  testimonial,
  color,
  onOpen,
}: {
  testimonial: DashTestimonial;
  color: string;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const quote = useAutoTranslate(testimonial.quote);
  const designation = useAutoTranslate(testimonial.designation);

  return (
    <button
      onClick={onOpen}
      className="testimonial-card text-left focus-ring"
      aria-label={`${t.testimonials.readFull}: ${testimonial.name}`}
    >
      <div
        className="h-full flex flex-col gap-4 p-6 transition-all duration-300 hover:-translate-y-1"
        style={{
          background: '#FFFFFF',
          border: '1px solid rgba(15,23,42,0.08)',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(15,23,42,0.06)',
          transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <StarRow rating={testimonial.rating} />

        <p className="text-sm flex-grow line-clamp-4" style={{ color: '#334155', lineHeight: 1.75 }}>
          {quote}
        </p>

        <span className="text-xs font-semibold" style={{ color: '#4F7FE0' }}>
          {t.testimonials.readFull} →
        </span>

        <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid rgba(15,23,42,0.08)' }}>
          <Avatar testimonial={testimonial} color={color} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>{testimonial.name}</p>
            <p className="text-xs" style={{ color: '#64748B' }}>{designation}</p>
          </div>
        </div>
      </div>
    </button>
  );
}

const AUTOPLAY_MS = 3200;

export default function Testimonials() {
  const { ref, isVisible } = useScrollReveal(0.10);
  const { t } = useTranslation();
  const { testimonials } = useTestimonials('gabzdev');
  const [selected, setSelected] = useState<{ item: DashTestimonial; color: string } | null>(null);
  const slides = withMinSlides(testimonials);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    dragFree: false,
    skipSnaps: false,
  });

  const autoplayTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopAutoplay = useCallback(() => {
    if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    autoplayTimer.current = null;
  }, []);
  const startAutoplay = useCallback(() => {
    stopAutoplay();
    if (!emblaApi) return;
    autoplayTimer.current = setInterval(() => emblaApi.scrollNext(), AUTOPLAY_MS);
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

  return (
    <section id="testimonials" className="relative py-20 md:py-24 overflow-hidden" style={{ background: '#0A0F1C' }}>
      <div
        ref={ref}
        className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16"
      >
        <div className="text-center mb-14">
          <p
            className={`text-sm font-semibold tracking-[0.1em] mb-3 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-9'}`}
            style={{ color: '#7BA1EC', transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
          >
            {t.testimonials.label}
          </p>
          <h2
            className={`font-bold mb-4 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-9'}`}
            style={{ fontSize: 'clamp(28px,3.5vw,48px)', color: '#F8FAFC', lineHeight: 1.2, transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
          >
            {t.testimonials.title}
          </h2>
          <p
            className={`text-base max-w-[560px] mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-9'}`}
            style={{ color: '#94A3B8', lineHeight: 1.7, transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
          >
            {t.testimonials.subtitle}
          </p>
        </div>
      </div>

      {/* Carousel embla — drag/swipe native (mouse & touch), loop:true,
          autoplay yang pause pas user lagi drag. Klik kartu -> modal detail. */}
      {slides.length > 0 && (
        <div
          className={`relative max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          onMouseEnter={stopAutoplay}
          onMouseLeave={startAutoplay}
        >
          <div className="overflow-hidden" ref={emblaRef} style={{ maskImage: 'linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent)' }}>
            <div className="flex gap-5">
              {slides.map((item, i) => {
                const color = PALETTE[i % PALETTE.length];
                return (
                  <div key={`${item.id}-${i}`} className="shrink-0">
                    <TestimonialCard
                      testimonial={item}
                      color={color}
                      onOpen={() => setSelected({ item, color })}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous"
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 focus-ring"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}
          >
            <ChevronLeft size={18} style={{ color: '#F8FAFC' }} />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next"
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-10 h-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 focus-ring"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}
          >
            <ChevronRight size={18} style={{ color: '#F8FAFC' }} />
          </button>
        </div>
      )}

      {selected && (
        <TestimonialModal
          testimonial={selected.item}
          color={selected.color}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
