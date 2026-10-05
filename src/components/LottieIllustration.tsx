import { useEffect, useRef, useState } from 'react';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';

interface LottieIllustrationProps {
  /** Path to a local animation JSON in /public (e.g. '/animations/seo-isometric.json'). */
  src: string;
  className?: string;
  loop?: boolean;
}

/**
 * Renders a self-hosted Lottie (vector) animation from /public/animations.
 * Fully local — no third-party CDN, no external fetch at runtime.
 *
 * Optimasi scroll: animasi di-PAUSE otomatis begitu keluar dari layar
 * (IntersectionObserver) dan jalan lagi pas kelihatan. Sebelumnya terus
 * ngerender tiap frame walau lagi nggak ditonton, rebutan CPU/GPU sama
 * scroll — kerasa banget di HP.
 */
export default function LottieIllustration({ src, className, loop = true }: LottieIllustrationProps) {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [failed, setFailed] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`Lottie fetch failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setAnimationData(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !animationData) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) lottieRef.current?.play();
        else lottieRef.current?.pause();
      },
      { rootMargin: '80px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [animationData]);

  if (failed) return null;

  if (!animationData) {
    return <div className={className} style={{ minHeight: 200 }} />;
  }

  return (
    <div ref={wrapRef} className={className}>
      <Lottie lottieRef={lottieRef} animationData={animationData} loop={loop} className="w-full h-auto" />
    </div>
  );
}
