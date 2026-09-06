import { motion } from 'framer-motion';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useTranslation } from '../lib/i18n';
import { useTrustedBy } from '../lib/queries';
import type { TrustedBrand } from '../lib/storage';

/**
 * Section "Dipercaya Oleh" (sesuai sketsa sec 4).
 * Logo brand/klien digulir otomatis, datanya dari tabel `trusted_by`
 * di Supabase dan diatur lewat panel admin.
 */

function BrandLogo({ brand }: { brand: TrustedBrand }) {
  const inner = (
    <div
      className="flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 hover:scale-[1.04]"
      style={{
        background: 'rgba(255,255,255,0.55)',
        border: '1px solid rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        minWidth: 168,
      }}
    >
      {brand.logo_url ? (
        <img
          src={brand.logo_url}
          alt={brand.name}
          className="w-7 h-7 object-contain shrink-0"
          style={{ filter: 'grayscale(1)', opacity: 0.75 }}
          loading="lazy"
          draggable={false}
        />
      ) : (
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
          style={{ background: 'rgba(79,127,224,0.12)', color: '#4F7FE0' }}
        >
          {brand.name.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="text-sm font-semibold whitespace-nowrap" style={{ color: '#334155' }}>
        {brand.name}
      </span>
    </div>
  );

  if (brand.url) {
    return (
      <a href={brand.url} target="_blank" rel="noopener noreferrer" className="focus-ring rounded-2xl">
        {inner}
      </a>
    );
  }
  return inner;
}

export default function TrustedBy() {
  const { ref, isVisible } = useScrollReveal(0.12);
  const { t } = useTranslation();
  const { brands } = useTrustedBy('gabzdev');

  if (brands.length === 0) return null;

  // Digandain supaya marquee-nya nyambung mulus tanpa jeda.
  const loop = [...brands, ...brands];

  return (
    <section id="trusted-by" className="relative py-16 md:py-20 overflow-hidden" style={{ background: '#FFFFFF' }}>
      <div ref={ref} className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16">
        <div className="text-center mb-10">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm font-semibold tracking-[0.1em] mb-3"
            style={{ color: '#4F7FE0' }}
          >
            {t.trustedBy.label}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-bold mb-4"
            style={{ fontSize: 'clamp(24px,3vw,40px)', color: '#0F172A', lineHeight: 1.2 }}
          >
            {t.trustedBy.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-base max-w-[560px] mx-auto"
            style={{ color: '#475569', lineHeight: 1.7 }}
          >
            {t.trustedBy.subtitle}
          </motion.p>
        </div>
      </div>

      {/* marquee logo */}
      <div className="relative">
        <div
          className="absolute inset-y-0 left-0 w-16 md:w-28 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #F7F9FD, transparent)' }}
        />
        <div
          className="absolute inset-y-0 right-0 w-16 md:w-28 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #F7F9FD, transparent)' }}
        />
        <motion.div
          className="flex gap-4 w-max"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: Math.max(18, brands.length * 4.5), ease: 'linear', repeat: Infinity }}
        >
          {loop.map((brand, i) => (
            <BrandLogo key={`${brand.id}-${i}`} brand={brand} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
