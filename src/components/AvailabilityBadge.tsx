import { useTranslation } from '../lib/i18n';

/**
 * Badge status "Available for New Project" — dipakai di Header (desktop,
 * sebelah logo) DAN di Hero (mobile, karena header versi mobile cuma
 * logo+hamburger, nggak ada tempat buat badge). Satu komponen, dua tempat
 * render, dikondisikan pake class `hidden md:inline-flex` / `md:hidden` di
 * pemanggilnya masing-masing biar nggak dobel di layar yang sama.
 */
export function AvailabilityBadge({ className = '' }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 ${className}`}
      style={{ background: 'rgba(59,95,227,0.08)', border: '1px solid rgba(59,95,227,0.18)', borderRadius: 9999 }}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: '#22C55E' }} />
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#22C55E' }} />
      </span>
      <span className="text-[11px] font-semibold tracking-[0.1em] uppercase whitespace-nowrap" style={{ color: '#3B5FE3' }}>
        {t.hero.badge}
      </span>
    </div>
  );
}
