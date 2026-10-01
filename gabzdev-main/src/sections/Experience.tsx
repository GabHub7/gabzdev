import { ExternalLink, Github } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import FadeUp from '../components/fx/FadeUp';

/**
 * Experience — timeline pengalaman nyata (GabzStore, Hero Exam, SchoolPay,
 * project klien eksternal). Data-nya di lib/i18n.ts (t.experience.items),
 * jadi kalau nanti mau nambah/ubah item tinggal edit di situ, bukan di
 * component ini — component-nya murni "render", nggak ada teks hardcode.
 *
 * Desktop: garis tengah vertikal + node + kartu selang-seling kiri-kanan.
 * Mobile: satu garis vertikal di kiri, semua kartu di kanan garis (nggak
 * ada versi alternating kiri-kanan di mobile — sesuai permintaan, biar
 * nggak overflow horizontal & tetep gampang dibaca).
 *
 * Visual language disamain ke yang udah ada di situs: .glass-card-strong
 * buat kartu, biru brand (#3B5FE3) buat garis/node/glow, FadeUp buat
 * reveal-nya (pola yang sama kayak About/Packages/Portfolio).
 */

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  ongoing: { bg: 'rgba(34,197,94,0.12)', text: '#16A34A' },
  project: { bg: 'rgba(59,95,227,0.12)', text: '#3B5FE3' },
  delivered: { bg: 'rgba(59,95,227,0.12)', text: '#3B5FE3' },
  clientProject: { bg: 'rgba(148,163,184,0.16)', text: '#64748B' },
};

function ExperienceCard({
  item,
  statusLabel,
}: {
  item: ReturnType<typeof useTranslation>['t']['experience']['items'][number];
  statusLabel: string;
}) {
  const description = useAutoTranslate(item.description);
  const supporting = useAutoTranslate(item.supporting);
  const statusColor = STATUS_COLOR[item.status] ?? STATUS_COLOR.project;

  return (
    <div className="glass-card-strong p-6" style={{ background: 'rgba(255,255,255,0.9)' }}>
      <h3 className="font-bold" style={{ fontSize: 'clamp(17px,2vw,20px)', color: '#0F172A' }}>
        {item.title}
      </h3>
      <p className="text-sm font-medium mb-1.5" style={{ color: '#3B5FE3' }}>
        {item.role}
      </p>

      <p className="text-xs font-mono mb-3" style={{ color: '#94A3B8' }}>
        {item.date}
      </p>

      <p className="text-sm mb-3" style={{ color: '#475569', lineHeight: 1.7 }}>
        {description}
      </p>
      {supporting && (
        <p className="text-sm mb-4" style={{ color: '#64748B', lineHeight: 1.7 }}>
          {supporting}
        </p>
      )}

      {item.focus.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {item.focus.map((f: string) => (
            <span
              key={f}
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ border: '1px solid rgba(59,95,227,0.25)', color: '#3B5FE3' }}
            >
              {f}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap pt-1" style={{ borderTop: '1px solid #EEF2F7', paddingTop: 14 }}>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
          style={{ background: statusColor.bg, color: statusColor.text }}
        >
          {statusLabel}
        </span>
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor
            className="inline-flex items-center gap-1.5 text-sm font-semibold focus-ring"
            style={{ color: '#3B5FE3' }}
          >
            {item.link.replace(/^https?:\/\//, '').replace(/\/$/, '')} <ExternalLink size={13} />
          </a>
        )}
        {item.repo && (
          <a
            href={item.repo}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor
            className="inline-flex items-center gap-1.5 text-sm font-semibold focus-ring"
            style={{ color: '#64748B' }}
          >
            <Github size={13} /> Repository
          </a>
        )}
      </div>
    </div>
  );
}

export default function Experience() {
  const { t } = useTranslation();
  const items = t.experience.items;
  const statusLabels: Record<string, string> = {
    ongoing: t.experience.ongoing,
    project: t.experience.project,
    delivered: t.experience.delivered,
    clientProject: t.experience.clientProject,
  };

  return (
    <section id="experience" className="relative py-20 md:py-24 overflow-hidden" style={{ background: '#FFFFFF' }}>
      <div className="max-w-[1100px] mx-auto px-6 md:px-10">
        <FadeUp>
          <p className="text-sm font-semibold tracking-[0.1em] uppercase mb-3" style={{ color: '#3B5FE3' }}>
            // {t.experience.label}
          </p>
        </FadeUp>
        <FadeUp delay={80}>
          <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(28px,3.5vw,48px)', color: '#0F172A', lineHeight: 1.15 }}>
            {t.experience.title}
          </h2>
        </FadeUp>
        <FadeUp delay={160}>
          <p className="text-sm max-w-[560px] mb-14 md:mb-20" style={{ color: '#64748B', lineHeight: 1.7 }}>
            {t.experience.subtitle}
          </p>
        </FadeUp>

        {/* ── Mobile: satu garis vertikal di kiri ── */}
        <div className="md:hidden relative pl-8">
          <div
            className="absolute left-[7px] top-2 bottom-2 w-[2px]"
            style={{ background: 'linear-gradient(180deg, #3B5FE3, rgba(59,95,227,0.15))' }}
            aria-hidden
          />
          <div className="flex flex-col gap-10">
            {items.map((item, i) => (
              <div key={item.title} className="relative">
                <span
                  className="absolute -left-8 top-1.5 w-4 h-4 rounded-full"
                  style={{ background: '#3B5FE3', boxShadow: '0 0 0 4px rgba(59,95,227,0.15), 0 0 14px rgba(59,95,227,0.55)' }}
                  aria-hidden
                />
                <FadeUp delay={i * 60}>
                  <ExperienceCard item={item} statusLabel={statusLabels[item.status]} />
                </FadeUp>
              </div>
            ))}
          </div>
        </div>

        {/* ── Desktop: garis tengah + selang-seling kiri/kanan ── */}
        <div className="hidden md:block relative">
          <div
            className="absolute left-1/2 top-2 bottom-2 w-[2px] -translate-x-1/2"
            style={{ background: 'linear-gradient(180deg, rgba(59,95,227,0.1), #3B5FE3 15%, #3B5FE3 85%, rgba(59,95,227,0.1))' }}
            aria-hidden
          />
          <div className="flex flex-col gap-16">
            {items.map((item, i) => {
              const onRight = i % 2 === 0;
              return (
                <div key={item.title} className="relative grid grid-cols-2 gap-10 items-start">
                  <span
                    className="absolute left-1/2 top-6 w-4 h-4 rounded-full -translate-x-1/2 z-10"
                    style={{ background: '#3B5FE3', boxShadow: '0 0 0 5px #FFFFFF, 0 0 0 7px rgba(59,95,227,0.18), 0 0 16px rgba(59,95,227,0.5)' }}
                    aria-hidden
                  />
                  {onRight ? (
                    <>
                      <div />
                      <FadeUp delay={i * 60} className="pl-6">
                        <ExperienceCard item={item} statusLabel={statusLabels[item.status]} />
                      </FadeUp>
                    </>
                  ) : (
                    <>
                      <FadeUp delay={i * 60} className="pr-6">
                        <ExperienceCard item={item} statusLabel={statusLabels[item.status]} />
                      </FadeUp>
                      <div />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
