import { useMemo } from 'react';
import { ArrowUpRight, Github, ExternalLink } from 'lucide-react';
import { useView } from '../context/ViewContext';
import { useTranslation } from '../lib/i18n';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import { useProjects, useSocial } from '../lib/queries';
import { mapDashProjects, type Project } from '../components/ProjectShared';
import FadeUp from '../components/fx/FadeUp';

/**
 * Portfolio — "Sticky Stacking Cards" beneran, niru referensi flaid.my.id:
 * tiap proyek nge-pin (sticky) di posisi yang SAMA (top:0), z-index naik
 * per index, jadi pas proyek berikutnya scroll naik dari bawah dia
 * NUTUPIN proyek sebelumnya yang lagi diem — scroll ke bawah numpuk,
 * scroll ke atas kepisah lagi (karena sticky itu native browser behavior,
 * bukan animasi satu-arah).
 *
 * Tiap kartu gantian: background HITAM/PUTIH selang-seling per index, dan
 * layout gambar-kiri/gambar-kanan juga selang-seling (index genap: gambar
 * kiri, ganjil: gambar kanan) — biar nggak monoton satu warna & satu
 * layout doang sepanjang stack.
 *
 * Cuma di-stack buat N proyek unggulan (biar homepage nggak jadi sepanjang
 * jumlah_proyek x 130vh kalau proyeknya puluhan) — sisanya diarahin ke
 * "View All Projects" (grid biasa) di penutup.
 */
const STACK_LIMIT = 6;
const SLOT_VH = 130; // tinggi "jatah scroll" per kartu, dalam vh
const STACK_BG = ['#080808', '#F7F7F5']; // selang-seling hitam / putih-gading

export default function Portfolio() {
  const { setView } = useView();
  const { t } = useTranslation();
  const { projects: stored } = useProjects('gabzdev');
  const social = useSocial();
  const allProjects = useMemo<Project[]>(() => mapDashProjects(stored), [stored]);

  const pinnedProjects = allProjects.filter((p) => p.isPinned);
  const featuredAll = pinnedProjects.length > 0 ? pinnedProjects : allProjects;
  const stack = featuredAll.slice(0, STACK_LIMIT);
  const hasMore = allProjects.length > stack.length;
  const canStack = stack.length >= 2;

  return (
    <section id="portfolio" className="relative" style={{ background: '#080808' }}>
      <div className="pt-20 md:pt-24 pb-10 px-6 md:px-10 max-w-[1200px] mx-auto">
        <FadeUp>
          <p className="text-sm font-semibold tracking-[0.1em] uppercase mb-3" style={{ color: '#7BA1EC' }}>
            // {t.portfolio.label}
          </p>
          <h2 className="font-bold" style={{ fontSize: 'clamp(28px,3.5vw,48px)', color: '#FFFFFF', lineHeight: 1.15 }}>
            {t.portfolio.title}
          </h2>
        </FadeUp>
      </div>

      {stack.length === 0 ? (
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 text-center" style={{ color: '#64748B' }}>
          {t.portfolio.empty}
        </div>
      ) : canStack ? (
        <div className="relative" style={{ height: `${stack.length * SLOT_VH}vh` }}>
          {stack.map((project, i) => {
            const dark = i % 2 === 0;
            return (
              <div
                key={project.id}
                className="sticky top-0 flex items-center overflow-hidden"
                style={{ height: '100dvh', zIndex: i + 1, background: STACK_BG[i % 2] }}
              >
                <StackedCard project={project} index={i} total={stack.length} t={t} dark={dark} imageLeft={dark} />
              </div>
            );
          })}
        </div>
      ) : (
        // Cuma 1 proyek — nggak ada yang di-stack, tampil statis aja
        <div className="relative flex items-center" style={{ minHeight: '90dvh', background: STACK_BG[0] }}>
          <StackedCard project={stack[0]} index={0} total={1} t={t} dark imageLeft />
        </div>
      )}

      {/* Penutup: sisanya diarahin ke grid "View All" + link GitHub */}
      <div className="py-16 md:py-20 px-6 text-center" style={{ background: '#080808' }}>
        {hasMore && (
          <button
            onClick={() => setView('projects')}
            className="btn-bounce inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold focus-ring mb-5"
            style={{ border: '1px solid rgba(255,255,255,0.25)', color: '#FFFFFF', borderRadius: 9999 }}
          >
            {t.portfolio.viewAll} ({allProjects.length}) <ArrowUpRight size={15} />
          </button>
        )}
        {social.github && (
          <div>
            <a
              href={`https://github.com/${social.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold underline focus-ring"
              style={{ color: '#7BA1EC' }}
            >
              <Github size={15} /> {t.portfolio.moreOnGithub}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function StackedCard({
  project,
  index,
  total,
  t,
  dark,
  imageLeft,
}: {
  project: Project;
  index: number;
  total: number;
  t: ReturnType<typeof useTranslation>['t'];
  dark: boolean;
  imageLeft: boolean;
}) {
  // Bug lama: title/description nggak auto-translate (langsung raw dari
  // Supabase). Field lain (bio, headline, testimoni) semua udah lewat
  // useAutoTranslate — di sini kelewatan, sekarang disamain.
  const title = useAutoTranslate(project.title);
  const description = useAutoTranslate(project.description);

  // Warna dikondisiin berdasar background kartu (hitam/putih selang-seling)
  const c = {
    heading: dark ? '#FFFFFF' : '#080808',
    body: dark ? '#94A3B8' : '#475569',
    meta: dark ? '#64748B' : '#94A3B8',
    imgBorder: dark ? 'rgba(255,255,255,0.12)' : 'rgba(8,8,8,0.12)',
    pillBg: dark ? 'rgba(255,255,255,0.1)' : 'rgba(8,8,8,0.06)',
    pillText: dark ? '#FFFFFF' : '#080808',
    tagBorder: dark ? 'rgba(255,255,255,0.15)' : 'rgba(8,8,8,0.15)',
    tagText: dark ? '#CBD5E1' : '#334155',
    outlineBtnBorder: dark ? 'rgba(255,255,255,0.3)' : 'rgba(8,8,8,0.3)',
    outlineBtnText: dark ? '#FFFFFF' : '#080808',
    ghostBtnBorder: dark ? 'rgba(255,255,255,0.15)' : 'rgba(8,8,8,0.15)',
    ghostBtnText: dark ? '#94A3B8' : '#475569',
    dotInactive: dark ? 'rgba(255,255,255,0.2)' : 'rgba(8,8,8,0.15)',
  };

  const imgOrder = `order-2 ${imageLeft ? 'lg:order-1' : 'lg:order-2'}`;
  const textOrder = `order-1 ${imageLeft ? 'lg:order-2' : 'lg:order-1'}`;

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
      <FadeUp className={`overflow-hidden ${imgOrder}`} style={{ aspectRatio: '16/10', border: `1px solid ${c.imgBorder}`, borderRadius: 12 }} threshold={0.35}>
        <img src={project.image} alt={title} className="w-full h-full object-cover" loading={index === 0 ? 'eager' : 'lazy'} />
      </FadeUp>

      <div className={textOrder}>
        <FadeUp threshold={0.35}>
          <p className="text-sm font-mono mb-2" style={{ color: c.meta }}>
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </p>
        </FadeUp>

        <FadeUp threshold={0.35} delay={80}>
          <h3 className="font-bold mb-3" style={{ fontSize: 'clamp(24px,3vw,40px)', color: c.heading }}>
            {title}
          </h3>
        </FadeUp>

        {project.highlights.length > 0 && (
          <FadeUp threshold={0.35} delay={160}>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.highlights.map((h) => (
                <span key={h} className="text-xs font-semibold px-3 py-1" style={{ background: c.pillBg, color: c.pillText, borderRadius: 999 }}>
                  {h}
                </span>
              ))}
            </div>
          </FadeUp>
        )}

        <FadeUp threshold={0.35} delay={240}>
          <p className="text-sm mb-5" style={{ color: c.body, lineHeight: 1.7 }}>
            {description}
          </p>
        </FadeUp>

        {project.tags.length > 0 && (
          <FadeUp threshold={0.35} delay={320}>
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tags.map((tag) => (
                <span key={tag} className="text-xs font-medium px-2.5 py-1" style={{ border: `1px solid ${c.tagBorder}`, color: c.tagText, borderRadius: 999 }}>
                  {tag}
                </span>
              ))}
            </div>
          </FadeUp>
        )}

        <FadeUp threshold={0.35} delay={400}>
          <div className="flex flex-wrap gap-3">
            {project.liveLink && project.liveLink !== '#' && (
              <a
                href={project.liveLink}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor
                className="btn-bounce inline-flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 focus-ring"
                style={{ background: '#3B5FE3', color: '#FFFFFF', borderRadius: 9999 }}
              >
                {t.portfolio.caseStudy} <ExternalLink size={14} />
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor
                className="btn-bounce inline-flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 focus-ring"
                style={{ border: `1px solid ${c.outlineBtnBorder}`, color: c.outlineBtnText, borderRadius: 9999 }}
              >
                {t.portfolio.liveDemo} <ArrowUpRight size={14} />
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor
                className="btn-bounce inline-flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 focus-ring"
                style={{ border: `1px solid ${c.ghostBtnBorder}`, color: c.ghostBtnText, borderRadius: 9999 }}
              >
                <Github size={14} /> {t.portfolio.repository}
              </a>
            )}
          </div>
        </FadeUp>

        {/* Indikator posisi dalam stack (titik-titik) */}
        <FadeUp threshold={0.35} delay={480}>
          <div className="flex items-center gap-2 mt-8">
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                style={{
                  width: i === index ? 20 : 6,
                  height: 6,
                  borderRadius: 999,
                  background: i === index ? '#3B5FE3' : c.dotInactive,
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        </FadeUp>
      </div>
    </div>
  );
}
