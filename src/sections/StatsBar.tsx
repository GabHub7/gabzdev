import { Star, Users, Globe, Clock, Infinity as InfinityIcon } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import CountUp from '../components/fx/CountUp';

/**
 * Stats bar — 5 kolom di atas hero, persis pola gabzstore.web.id.
 * Hardcode dulu (sesuai keputusan): 4.9 / 235+ / 1823 / 24 Hours / Unlimited.
 * Nanti bisa dipindahin ke tabel Supabase supaya editable dari admin.
 * 3 yang genuinely angka (rating, klien, website) pakai CountUp biar
 * "ngitung naik" pas discroll ke sini; 2 sisanya (24 Hours, Unlimited)
 * teks statis karena bukan angka murni.
 */

const stats = [
  { icon: Star,         labelKey: 'clientRating' as const,      color: '#3B5FE3', node: <CountUp end={4.9} decimals={1} /> },
  { icon: Users,        labelKey: 'happyClients' as const,      color: '#3B5FE3', node: <CountUp end={235} suffix="+" /> },
  { icon: Globe,        labelKey: 'websitesDelivered' as const, color: '#3B5FE3', node: <CountUp end={1823} separator /> },
  { icon: Clock,        labelKey: 'whatsappSupport' as const,   color: '#3B5FE3', node: '24 Hours' },
  { icon: InfinityIcon, labelKey: 'freeRevisions' as const,     color: '#3B5FE3', node: 'Unlimited' },
];

export default function StatsBar() {
  const { t } = useTranslation();
  return (
    <section
      id="stats-bar"
      className="relative"
      style={{ background: '#0A0F1C', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      aria-label="Ringkasan pencapaian"
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-y sm:divide-y-0" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <li
                key={s.labelKey}
                className="flex flex-col items-center justify-center text-center py-5 px-3"
                style={{
                  // hilangkan garis kiri di kolom paling kiri tiap baris
                  borderLeftColor: i === 0 ? 'transparent' : 'rgba(255,255,255,0.08)',
                }}
              >
                <Icon size={20} strokeWidth={2} style={{ color: s.color }} className="mb-1.5" />
                <span
                  className="font-bold leading-none"
                  style={{ fontSize: 'clamp(20px, 2.2vw, 28px)', color: '#F8FAFC' }}
                >
                  {s.node}
                </span>
                <span className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                  {t.stats[s.labelKey]}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
