import { useCallback, useRef, useState } from 'react';

/**
 * Reveal-on-scroll pakai IntersectionObserver.
 *
 * PENTING: pakai callback ref (bukan `useRef` + `useEffect`). Banyak section
 * yang memanggil hook ini melakukan early-return `null` selagi datanya masih
 * loading (mis. `if (skills.length === 0) return null`). Dengan `useEffect`
 * biasa, efeknya cuma jalan sekali di render pertama — saat itu `ref.current`
 * masih null karena JSX belum ke-render sama sekali — dan karena dependency
 * array-nya statis, efek itu TIDAK PERNAH jalan ulang setelah data datang
 * dan elemen aslinya akhirnya ter-mount. Akibatnya observer nggak pernah
 * ke-attach dan section itu permanen `opacity-0`.
 *
 * Callback ref dipanggil React setiap kali node DOM-nya berubah (termasuk
 * dari null → elemen beneran), jadi observer selalu ke-setup di elemen yang
 * benar-benar hidup di DOM, kapanpun itu terjadi.
 */
export function useScrollReveal(threshold = 0.15) {
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (element: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold }
      );
      observer.observe(element);
      observerRef.current = observer;
    },
    [threshold]
  );

  return { ref, isVisible };
}
