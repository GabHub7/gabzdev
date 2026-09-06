import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useTranslation } from '../lib/i18n';
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

  return createPortal(
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(8px)', background: 'rgba(15,17,21,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto"
        style={{ background: '#FFFFFF', boxShadow: '0 32px 80px rgba(0,0,0,0.45)' }}
      >
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center focus-ring"
          style={{ background: 'rgba(15,23,42,0.06)' }}
        >
          <X size={18} style={{ color: '#0F172A' }} />
        </button>

        {pkg.image_url && (
          <img src={pkg.image_url} alt={pkg.title} className="w-full h-40 object-cover" />
        )}

        <div className="p-7">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold px-3 py-1" style={{ background: colors.bg, color: colors.color }}>
              {pkg.badge}
            </span>
            <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: '#0F172A' }}>
              <Star size={14} fill="#FBBF24" color="#FBBF24" />
              {pkg.rating}
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-2" style={{ color: '#0F172A' }}>{pkg.title}</h3>
          <p className="text-sm mb-6" style={{ color: '#64748B', lineHeight: 1.6 }}>{pkg.description}</p>

          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#94A3B8' }}>
            Semua yang kamu dapat
          </p>
          <ul className="flex flex-col gap-2.5 mb-6">
            {pkg.features.map((feat) => (
              <li key={feat} className="flex items-start gap-2.5 text-sm" style={{ color: '#334155' }}>
                <Check size={16} style={{ color: '#4F7FE0', flexShrink: 0, marginTop: 2 }} />
                {feat}
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

  return (
    <SpotlightCard
      className="overflow-hidden transition-transform duration-300 hover:-translate-y-1.5"
      spotlightColor={pkg.is_popular ? 'rgba(79,127,224,0.4)' : 'rgba(79,127,224,0.25)'}
      style={{
        background: '#FFFFFF',
        boxShadow: pkg.is_popular ? '0 16px 40px rgba(79,127,224,0.18)' : 'none',
        border: pkg.is_popular ? '2px solid #3B5FE3' : '1px solid #0F172A',
      }}
    >
      {pkg.is_popular && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold z-10"
          style={{ background: '#4F7FE0', color: '#FFFFFF' }}
        >
          <Flame size={13} /> {t.packages.popular}
        </div>
      )}

      {hasImage && (
        <img src={pkg.image_url!} alt={pkg.title} className="w-full h-32 object-cover" loading="lazy" />
      )}

      <div className={`p-7 flex flex-col flex-1 ${pkg.is_popular ? 'pt-9' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold px-3 py-1" style={{ background: colors.bg, color: colors.color }}>
            {pkg.badge}
          </span>
          <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: '#0F172A' }}>
            <Star size={14} fill="#FBBF24" color="#FBBF24" />
            {pkg.rating}
          </div>
        </div>

        <h3 className="text-xl font-bold mb-2" style={{ color: '#0F172A' }}>{pkg.title}</h3>
        <p className="text-sm mb-5" style={{ color: '#64748B', lineHeight: 1.6 }}>{pkg.description}</p>

        <ul className="flex flex-col gap-2.5 mb-2">
          {teaser.map((feat) => (
            <li key={feat} className="flex items-start gap-2.5 text-sm" style={{ color: '#334155' }}>
              <Check size={16} style={{ color: '#4F7FE0', flexShrink: 0, marginTop: 2 }} />
              {feat}
            </li>
          ))}
        </ul>

        {remaining > 0 && (
          <button
            type="button"
            onClick={onViewDetail}
            className="text-left text-sm font-semibold mb-4 focus-ring"
            style={{ color: '#4F7FE0' }}
          >
            +{remaining} fitur lainnya — Lihat Detail
          </button>
        )}

        <div className="mt-auto pt-5" style={{ borderTop: '1px solid #E2E8F0' }}>
          <div className="flex items-baseline gap-1.5 mb-4">
            <strong className="text-2xl font-extrabold" style={{ color: '#0F172A' }}>{priceLabel}</strong>
            <span className="text-sm" style={{ color: '#94A3B8' }}>{t.packages.perPackage}</span>
          </div>
          <Magnetic className="w-full">
            <a
              href={orderLink(pkg.title)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
            >
              {t.packages.ctaDetail} <ArrowRight size={15} />
            </a>
          </Magnetic>
        </div>
      </div>
    </SpotlightCard>
  );
}

export default function Packages() {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollReveal(0.1);
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
      <div
        ref={ref}
        className={`max-w-[1100px] mx-auto px-6 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
      >
        <div className="text-center max-w-[620px] mx-auto mb-12">
          <p className="text-sm font-semibold tracking-[0.1em] uppercase mb-3" style={{ color: '#3B5FE3' }}>
            {t.packages.label}
          </p>
          <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(28px,3.5vw,48px)', color: '#0F172A', lineHeight: 1.2 }}>
            {t.packages.title}
          </h2>
          <p className="text-base" style={{ color: '#64748B', lineHeight: 1.7 }}>
            {t.packages.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {items.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} orderLink={orderLink} t={t} onViewDetail={() => setDetailPkg(pkg)} />
          ))}
        </div>

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
      </div>

      {detailPkg && (
        <PackageDetailModal pkg={detailPkg} orderLink={orderLink} t={t} onClose={() => setDetailPkg(null)} />
      )}
    </section>
  );
}
