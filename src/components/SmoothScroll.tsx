import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

/**
 * Smooth-scroll global dengan inersia (momentum).
 *
 * Efek "berat tapi halus, dan masih meluncur sebentar saat kursor dilepas"
 * itu datang dari Lenis: dia mengambil alih scroll native dan menerapkan
 * easing + momentum. Nilai di bawah disetel supaya:
 *   - responsif (nggak terasa lemot saat mulai scroll),
 *   - tetap meninggalkan "jejak" luncuran halus saat berhenti.
 *
 * Otomatis nonaktif kalau user mengaktifkan "reduce motion" di OS-nya.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 0.7,           // lebih pendek = scroll terasa ringan & responsif
      easing: (t) => 1 - Math.pow(1 - t, 3), // ease-out cubic (lembut, nggak nyangkut)
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.6,
      syncTouch: false,        // scroll di HP tetap native
    });
    lenisRef.current = lenis;

    // Ekspos ke window supaya komponen lain (mis. tombol "scroll to top",
    // anchor nav) bisa memakai lenis.scrollTo alih-alih scroll native.
    (window as unknown as { lenis?: Lenis }).lenis = lenis;

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      (window as unknown as { lenis?: Lenis }).lenis = undefined;
    };
  }, []);

  return <>{children}</>;
}
