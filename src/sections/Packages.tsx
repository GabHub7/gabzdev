import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import FadeUp from '../components/fx/FadeUp';
import { useTranslation } from '../lib/i18n';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import { useSocial, usePackages } from '../lib/queries';
import { Star, Check, ArrowRight, Flame, X } from 'lucide-react';
import SpotlightCard from '../components/fx/SpotlightCard';
import Magnetic from '../components/fx/Magnetic';

const badgeColors: Record<string, { bg: string; color: string }> = {
  Basic: { bg: 'rgba(59,130,246,0.1)', color: '#1D4ED8' },
  Standard: { bg: 'rgba(99,102,241,0.1)', color: '#4338CA' },
  Premium: { bg: 'rgba(217,119,6,0.1)', color: '#B45309' },
};

// Kartu cuma nampilin teaser (4 fitur pertama) biar tinggi kartu nggak
// njomplang antar paket walau jumlah fitur di DB beda jauh. Detail
// lengkapnya dibuka lewat modal "Lihat Detail" — pola yang sama kayak
// modal proyek di section Portfolio.
const TEASER_FEATURES = 4;

const formatRupiah = (value: number) => `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;

/** Feature list disimpan sebagai array string — nggak bisa panggil hook
 * langsung di dalam .map() loop, jadi tiap item dibungkus komponen kecil
 * sendiri yang manggil useAutoTranslate-nya masing-masing. */
function TranslatedFeature({ text }: { text: string }) {
  return <>{useAutoTranslate(text)}</>;
}

type PackageItem = {
  id: string;
  title: string;
  badge: string;
  rating: string;
  price: number;
  priceLabel?: string;
  description: string;
  features: string[];
  image_url: string | null;
  is_popular: boolean;
};

function PackageDetailModal({ pkg, orderLink, t, onClose }: { pkg: PackageItem; orderLink: (name: string) => string; t: ReturnType<typeof useTranslation>['t']; onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const colors = badgeColors[pkg.badge] ?? badgeColors.Basic;
  const priceLabel = pkg.priceLabel ?? formatRupiah(pkg.price);
  const title = useAutoTranslate(pkg.title);
  const description = useAutoTranslate(pkg.description);

  return createPortal(
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(8px)', background: 'rgba(15,17,21,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto"
        style={{ background: '#FFFFFF', boxShadow: '0 32px 80px rgba(0,0,0,0.45)', borderRadius: 16 }}
      >
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center focus-ring"
          style={{ background: 'rgba(15,23,42,0.06)', borderRadius: '50%' }}
        >
          <X size={18} style={{ color: '#0F172A' }} />
        </button>

        {pkg.image_url && (
          <img src={pkg.image_url} alt={title} className="w-full h-40 object-cover" />
        )}

        <div className="p-7">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: colors.bg, color: colors.color }}>
              {pkg.badge}
            </span>
            <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: '#0F172A' }}>
              <Star size={14} fill="#FBBF24" color="#FBBF24" />
              {pkg.rating}
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-2" style={{ color: '#0F172A' }}>{title}</h3>
          <p className="text-sm mb-6" style={{ color: '#64748B', lineHeight: 1.6 }}>{description}</p>

          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#94A3B8' }}>
            {t.packages.allFeatures}
          </p>
          <ul className="flex flex-col gap-2.5 mb-6">
            {pkg.features.map((feat) => (
              <li key={feat} className="flex items-start gap-2.5 text-sm" style={{ color: '#334155' }}>
                <Check size={16} style={{ color: '#3B5FE3', flexShrink: 0, marginTop: 2 }} />
                <TranslatedFeature text={feat} />
              </li>
            ))}
          </ul>

          <div className="pt-5" style={{ borderTop: '1px solid #E2E8F0' }}>
            <div className="flex items-baseline gap-1.5 mb-4">
              <strong className="text-2xl font-extrabold" style={{ color: '#0F172A' }}>{priceLabel}</strong>
              <span className="text-sm" style={{ color: '#94A3B8' }}>{t.packages.perPackage}</span>
            </div>
            <a
              href={orderLink(pkg.title)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
            >
              {t.packages.ctaDetail} <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function PackageCard({ pkg, orderLink, t, onViewDetail }: { pkg: PackageItem; orderLink: (name: string) => string; t: ReturnType<typeof useTranslation>['t']; onViewDetail: () => void }) {
  const colors = badgeColors[pkg.badge] ?? badgeColors.Basic;
  const priceLabel = pkg.priceLabel ?? formatRupiah(pkg.price);
  const hasImage = Boolean(pkg.image_url && pkg.image_url.trim());
  const teaser = pkg.features.slice(0, TEASER_FEATURES);
  const remaining = pkg.features.length - TEASER_FEATURES;
  const title = useAutoTranslate(pkg.title);
  const description = useAutoTranslate(pkg.description);

  return (
    <SpotlightCard
      className="overflow-hidden transition-transform duration-300 hover:-translate-y-1.5"
      spotlightColor={pkg.is_popular ? 'rgba(59, 95, 227,0.4)' : 'rgba(59, 95, 227,0.25)'}
      style={{
        background: '#FFFFFF',
        boxShadow: pkg.is_popular ? '0 16px 40px rgba(59, 95, 227,0.18)' : 'none',
        border: pkg.is_popular ? '2px solid #3B5FE3' : '1px solid #0F172A',
        borderRadius: 16,
      }}
    >
      {pkg.is_popular && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1 sm:py-1.5 font-bold z-10 whitespace-nowrap"
          style={{ background: '#3B5FE3', color: '#FFFFFF', borderRadius: '0 0 10px 10px', fontSize: 'clamp(8px,2.2vw,12px)' }}
        >
          <Flame size={11} className="shrink-0" /> {t.packages.popular}
        </div>
      )}

      {hasImage && (
        <img src={pkg.image_url!} alt={title} className="w-full object-cover" style={{ height: 'clamp(60px, 14vw, 128px)' }} loading="lazy" />
      )}

      <div className={`p-2.5 sm:p-5 md:p-7 flex flex-col flex-1 ${pkg.is_popular ? 'pt-5 sm:pt-8 md:pt-9' : ''}`}>
        <div className="flex items-center justify-between gap-1 mb-2 sm:mb-4">
          <span className="font-bold px-1.5 sm:px-3 py-0.5 sm:py-1 whitespace-nowrap rounded-full" style={{ background: colors.bg, color: colors.color, fontSize: 'clamp(8px,2vw,12px)' }}>
            {pkg.badge}
          </span>
          <div className="flex items-center gap-1 font-semibold shrink-0" style={{ color: '#0F172A', fontSize: 'clamp(9px,2.2vw,14px)' }}>
            <Star size={12} fill="#FBBF24" color="#FBBF24" className="shrink-0" />
            {pkg.rating}
          </div>
        </div>

        <h3 className="font-bold mb-1 sm:mb-2" style={{ color: '#0F172A', fontSize: 'clamp(12px,3vw,20px)' }}>{title}</h3>
        <p className="mb-2 sm:mb-5 line-clamp-3 sm:line-clamp-none" style={{ color: '#64748B', lineHeight: 1.5, fontSize: 'clamp(9px,2.2vw,14px)' }}>{description}</p>

        <ul className="flex flex-col gap-1 sm:gap-2.5 mb-1 sm:mb-2">
          {teaser.map((feat) => (
            <li key={feat} className="flex items-start gap-1 sm:gap-2.5" style={{ color: '#334155', fontSize: 'clamp(9px,2.1vw,14px)' }}>
              <Check size={13} style={{ color: '#3B5FE3', flexShrink: 0, marginTop: 2 }} />
              <TranslatedFeature text={feat} />
            </li>
          ))}
        </ul>

        {remaining > 0 && (
          <button
            type="button"
            onClick={onViewDetail}
            className="text-left font-semibold mb-2 sm:mb-4 focus-ring"
            style={{ color: '#3B5FE3', fontSize: 'clamp(9px,2.1vw,14px)' }}
          >
            +{remaining} {t.packages.moreFeatures}
          </button>
        )}

        <div className="mt-auto pt-2.5 sm:pt-5" style={{ borderTop: '1px solid #E2E8F0' }}>
          <div className="flex items-baseline gap-1 sm:gap-1.5 mb-2 sm:mb-4">
            <strong className="font-extrabold" style={{ color: '#0F172A', fontSize: 'clamp(13px,3.4vw,24px)' }}>{priceLabel}</strong>
            <span style={{ color: '#94A3B8', fontSize: 'clamp(8px,1.8vw,14px)' }}>{t.packages.perPackage}</span>
          </div>
          <Magnetic className="w-full">
            <a
              href={orderLink(pkg.title)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full flex items-center justify-center gap-1 sm:gap-2"
              style={{ fontSize: 'clamp(9px,2.2vw,14px)', padding: 'clamp(6px,1.8vw,12px) clamp(8px,2vw,16px)' }}
            >
              {t.packages.ctaDetail} <ArrowRight size={14} className="shrink-0" />
            </a>
          </Magnetic>
        </div>
      </div>
    </SpotlightCard>
  );
}

export default function Packages() {
  const { t } = useTranslation();
  const social = useSocial();
  const { packages, isLoading } = usePackages();
  const waNumber = (social.whatsapp || '08811494688').replace(/^0/, '62');
  const [detailPkg, setDetailPkg] = useState<PackageItem | null>(null);

  const items: PackageItem[] =
    packages.length > 0
      ? [...packages]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((p) => ({
            id: p.id,
            title: p.title,
            badge: p.badge,
            rating: p.rating,
            price: p.price,
            description: p.description,
            features: [...p.features.map((f) => f.text), ...p.includes],
            image_url: p.image_url,
            is_popular: p.is_popular,
          }))
      : t.packages.items.map((p, i) => ({
          id: `fallback-${i}`,
          title: p.name,
          badge: p.badge,
          rating: p.rating,
          price: 0,
          priceLabel: p.price,
          description: p.description,
          features: p.features,
          image_url: null,
          is_popular: i === 1,
        }));

  const orderLink = (pkgName: string) =>
    `https://wa.me/${waNumber}?text=${encodeURIComponent(
      `Halo GabzStore, saya mau pesan ${pkgName}.`
    )}`;

  if (isLoading) return null;

  return (
    <section id="packages" className="relative py-20 md:py-24" style={{ background: '#FFFFFF' }}>
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="text-center max-w-[620px] mx-auto mb-12">
          <FadeUp threshold={0.2}>
            <p className="text-sm font-semibold tracking-[0.1em] uppercase mb-3" style={{ color: '#3B5FE3' }}>
              {t.packages.label}
            </p>
          </FadeUp>
          <FadeUp threshold={0.2} delay={80}>
            <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(28px,3.5vw,48px)', color: '#0F172A', lineHeight: 1.2 }}>
              {t.packages.title}
            </h2>
          </FadeUp>
          <FadeUp threshold={0.2} delay={160}>
            <p className="text-base" style={{ color: '#64748B', lineHeight: 1.7 }}>
              {t.packages.subtitle}
            </p>
          </FadeUp>
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6 items-stretch">
          {items.map((pkg, i) => (
            <FadeUp key={pkg.id} threshold={0.15} delay={i * 120} className="h-full">
              <PackageCard pkg={pkg} orderLink={orderLink} t={t} onViewDetail={() => setDetailPkg(pkg)} />
            </FadeUp>
          ))}
        </div>

        <FadeUp threshold={0.2} delay={items.length * 120}>
          <div className="text-center mt-8">
            <a
              href={import.meta.env.VITE_GABZSTORE_URL || 'https://gabzstore.web.id'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold focus-ring"
              style={{ color: '#3B5FE3' }}
            >
              Lihat paket lengkap <ArrowRight size={15} />
            </a>
          </div>
        </FadeUp>
      </div>

      {detailPkg && (
        <PackageDetailModal pkg={detailPkg} orderLink={orderLink} t={t} onClose={() => setDetailPkg(null)} />
      )}
    </section>
  );
}
