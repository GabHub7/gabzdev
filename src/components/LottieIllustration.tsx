import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

interface LottieIllustrationProps {
  /** Path to a local animation JSON in /public (e.g. '/animations/seo-isometric.json'). */
  src: string;
  className?: string;
  loop?: boolean;
}

/**
 * Renders a self-hosted Lottie (vector) animation from /public/animations.
 * Fully local — no third-party CDN, no external fetch at runtime.
 */
export default function LottieIllustration({ src, className, loop = true }: LottieIllustrationProps) {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setAnimationData(null);
    setFailed(false);

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

  if (failed) return null;

  if (!animationData) {
    return <div className={className} style={{ minHeight: 200 }} />;
  }

  return <Lottie animationData={animationData} loop={loop} className={className} />;
}
