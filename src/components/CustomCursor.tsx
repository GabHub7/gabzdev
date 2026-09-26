import { useEffect, useRef, useState } from 'react';

/**
 * Custom cursor — MASTER PROMPT poin 23.
 *
 * - Lingkaran biru kecil ngikutin mouse (pake transform translate3d biar
 *   GPU-accelerated, bukan re-render React tiap gerak — posisi di-drive
 *   langsung lewat ref.style, bukan useState, biar nggak bikin ratusan
 *   render per detik).
 * - Membesar pas hover elemen interaktif (link/button/[data-cursor]).
 * - Kalau elemen itu punya attribute `data-cursor-text="VIEW PROJECT"`,
 *   teks itu muncul di dalam cursor-nya.
 * - OTOMATIS MATI di touch device (dideteksi sekali di awal, bukan di
 *   tiap event) dan kalau user set `prefers-reduced-motion: reduce`.
 */
function shouldEnableCustomCursor(): boolean {
  if (typeof window === 'undefined') return false;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return !isTouch && !reducedMotion;
}

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled] = useState(shouldEnableCustomCursor);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    document.body.classList.add('custom-cursor-active');

    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          if (dotRef.current) {
            dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
          }
          raf = 0;
        });
      }
    };

    const onOver = (e: PointerEvent) => {
      const target = (e.target as HTMLElement)?.closest<HTMLElement>(
        'a, button, [role="button"], [data-cursor]'
      );
      if (target) {
        setHovering(true);
        setLabel(target.getAttribute('data-cursor-text'));
      } else {
        setHovering(false);
        setLabel(null);
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      cancelAnimationFrame(raf);
      document.body.classList.remove('custom-cursor-active');
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="fixed top-0 left-0 pointer-events-none flex items-center justify-center select-none"
      style={{
        zIndex: 9999,
        width: hovering ? (label ? 110 : 56) : 14,
        height: hovering ? (label ? 110 : 56) : 14,
        borderRadius: '50%',
        background: label ? 'var(--brand-blue)' : hovering ? 'rgba(37,99,255,0.15)' : 'var(--brand-blue)',
        border: hovering && !label ? '1.5px solid var(--brand-blue)' : 'none',
        transition: 'width 0.25s cubic-bezier(0.16,1,0.3,1), height 0.25s cubic-bezier(0.16,1,0.3,1), background 0.25s ease',
        willChange: 'transform',
      }}
    >
      {label && (
        <span
          className="uppercase whitespace-nowrap"
          style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--brand-white)' }}
        >
          {label} →
        </span>
      )}
    </div>
  );
}
