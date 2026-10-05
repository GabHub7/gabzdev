import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ChevronDown, ChevronUp, Star } from 'lucide-react';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import type { DashTestimonial } from '../lib/storage';

/**
 * Panel "What Clients Say" — ngalir otomatis KE BAWAH pelan-pelan (efek air
 * terjun), loop tanpa ujung, dan tetap bisa di-scroll (wheel) + di-swipe
 * vertikal manual.
 *
 * Kenapa scroll native (bukan embla lagi): scroll/swipe/momentum-nya
 * gratis dari browser — nggak perlu plugin wheel/autoscroll tambahan.
 * Auto-flow digerakin 1 loop rAF yang cuma jalan KALAU panelnya lagi
 * kelihatan di layar (IntersectionObserver), dan berhenti sementara pas
 * user hover / sentuh / scroll, lanjut sendiri setelah diem sebentar.
 *
 * Loop mulus: daftar digandakan 2x, jadi posisi `s` dan `s + periode`
 * isinya identik — begitu mentok ujung, tinggal loncat sejarak 1 periode
 * tanpa kelihatan.
 */
const FLOW_SPEED_PX_PER_SEC = 22; // pelan
const MIN_ITEMS = 8; // minimal kartu per "putaran" biar loop-nya nggak kosong
const CARD_STEP = 104; // jarak loncat tombol panah (kira2 tinggi 1 kartu + gap)
const HEX = /^#[0-9a-fA-F]{6}$/;

function Quote({ text }: { text: string }) {
  return <>{useAutoTranslate(text)}</>;
}

function FlowCard({ item }: { item: DashTestimonial }) {
  const accent = item.accent_color && HEX.test(item.accent_color) ? item.accent_color : null;
  return (
    <div
      className="flex items-start gap-3 p-4 shrink-0"
      style={{
        border: `1px solid ${accent ? accent + '40' : '#E2E8F0'}`,
        borderRadius: 16,
        background: '#FFFFFF',
      }}
    >
      <div
        className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-bold overflow-hidden"
        style={{ background: accent ?? '#0F172A', color: '#FFFFFF' }}
      >
        {item.photo_url ? (
          <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover rounded-full" loading="lazy" />
        ) : (
          item.name.charAt(0).toUpperCase()
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: '#0F172A' }}>{item.name}</p>
        <div className="flex gap-0.5 mb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={11} fill={i < item.rating ? accent ?? '#3B5FE3' : 'none'} style={{ color: accent ?? '#3B5FE3' }} />
          ))}
        </div>
        <p className="text-xs line-clamp-3" style={{ color: '#64748B', lineHeight: 1.55 }}>
          "<Quote text={item.quote} />"
        </p>
      </div>
    </div>
  );
}

export default function TestimonialWaterfall({
  items,
  label,
  height = 420,
}: {
  items: DashTestimonial[];
  label: string;
  height?: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Satu "putaran" = daftar asli diulang sampai >= MIN_ITEMS, lalu digandakan 2x buat loop.
  const doubled = useMemo(() => {
    if (items.length === 0) return [];
    const repeats = Math.max(1, Math.ceil(MIN_ITEMS / items.length));
    const one = Array.from({ length: repeats }, () => items).flat();
    return [...one, ...one];
  }, [items]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || doubled.length === 0) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let period = 0;
    let pos = 0;
    let paused = false;
    let visible = false;
    let raf = 0;
    let last = 0;
    let resumeTimer: ReturnType<typeof setTimeout> | undefined;

    const measure = () => {
      period = el.scrollHeight / 2;
    };
    const wrap = () => {
      if (period <= 0) return;
      if (pos < 1) pos += period;
      else if (pos >= period + 1) pos -= period;
    };
    const pauseFor = (ms: number) => {
      paused = true;
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        paused = false;
      }, ms);
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(now - last, 50);
      last = now;
      if (paused || reduceMotion || period <= 0) return;
      pos -= (FLOW_SPEED_PX_PER_SEC * dt) / 1000; // turun = scrollTop mengecil
      wrap();
      el.scrollTop = pos;
    };
    const start = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    // Scroll dari USER (wheel/swipe/tombol): sinkronin posisi, pause, lanjut nanti.
    const onScroll = () => {
      if (Math.abs(el.scrollTop - pos) < 1.5) return; // ini scroll dari loop sendiri
      pos = el.scrollTop;
      const before = pos;
      wrap();
      if (pos !== before) el.scrollTop = pos;
      pauseFor(1800);
    };

    measure();
    pos = period; // mulai di tengah (salinan ke-2) biar bisa gerak ke dua arah
    el.scrollTop = pos;

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { threshold: 0.05 }
    );
    io.observe(el);

    const ro = new ResizeObserver(() => {
      measure();
      wrap();
    });
    ro.observe(el.firstElementChild as Element);

    const onEnter = () => {
      paused = true;
      clearTimeout(resumeTimer);
    };
    const onLeave = () => pauseFor(800);
    const onTouchEnd = () => pauseFor(1800);

    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      stop();
      clearTimeout(resumeTimer);
      io.disconnect();
      ro.disconnect();
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [doubled]);

  const step = useCallback((dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ top: dir * CARD_STEP, behavior: 'smooth' });
  }, []);

  if (doubled.length === 0) return null;

  const fade = 'linear-gradient(to bottom, transparent, black 9%, black 91%, transparent)';
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-bold tracking-widest uppercase" style={{ color: '#94A3B8' }}>{label}</h4>
        <div className="hidden sm:flex items-center gap-1.5">
          <button type="button" onClick={() => step(-1)} aria-label="Previous"
            className="w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 focus-ring"
            style={{ border: '1px solid #E2E8F0' }}>
            <ChevronUp size={13} style={{ color: '#334155' }} />
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Next"
            className="w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 focus-ring"
            style={{ border: '1px solid #E2E8F0' }}>
            <ChevronDown size={13} style={{ color: '#334155' }} />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        style={{
          height,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          maskImage: fade,
          WebkitMaskImage: fade,
          touchAction: 'pan-y',
        }}
      >
        <div className="flex flex-col gap-3 pb-3">
          {doubled.map((item, i) => (
            <FlowCard key={`${item.id}-${i}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
