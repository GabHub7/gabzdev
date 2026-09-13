import { useEffect, useMemo, useRef } from 'react';
import { ArrowUpRight, Github, ExternalLink } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useView } from '../context/ViewContext';
import { useTranslation } from '../lib/i18n';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import { useProjects, useSocial } from '../lib/queries';
import { mapDashProjects, type Project } from '../components/ProjectShared';
import FadeUp from '../components/fx/FadeUp';

/**
 * Portfolio — DIBENERIN biar match sama mekanisme ASLI flaid.my.id
 * (dicek langsung dari source code Svelte-nya, bukan nebak dari
 * screenshot lagi). Ternyata section Projects mereka BUKAN sticky
 * stacking cards — itu salah baca gue sebelumnya. Yang beneran kejadian:
 * tiap proyek jalan di flow dokumen NORMAL (nggak di-pin/sticky sama
 * sekali), geser masuk gantian dari KIRI/KANAN (xPercent -115/115 -> 0)
 * yang di-scrub (nempel presisi ke posisi scroll, bukan animasi sekali
 * jalan) begitu proyeknya mulai masuk area pandang.
 *
 * Yang DIPERTAHANIN dari revisi2 sebelumnya (di luar cakupan source
 * flaid, tapi udah confirmed sesuai keinginan Niz): selalu 2 kolom
 * gambar+teks berdampingan di HP MAUPUN desktop (nggak collapse ke 1
 * kolom), background hitam/putih-gading selang-seling per proyek, dan
 * fix auto-translate title/description.
 *
 * Cuma nampilin N proyek unggulan biar homepage nggak kepanjangan kalau
 * proyeknya puluhan — sisanya diarahin ke "View All Projects" (grid
 * biasa) di penutup.
 */
const FEATURED_LIMIT = 8;

export default function Portfolio() {
  const { setView } = useView();
  const { t } = useTranslation();
  const { projects: stored } = useProjects('gabzdev');
  const social = useSocial();
  const allProjects = useMemo<Project[]>(() => mapDashProjects(stored), [stored]);

  const pinnedProjects = allProjects.filter((p) => p.isPinned);
  const featuredAll = pinnedProjects.length > 0 ? pinnedProjects : allProjects;
  const featured = featuredAll.slice(0, FEATURED_LIMIT);
  const hasMore = allProjects.length > featured.length;

  return (
    <section id="portfolio" className="relative" style={{ background: '#080808' }}>
      <div className="pt-20 md:pt-24 pb-14 px-6 md:px-10 max-w-[1200px] mx-auto">
        <FadeUp>
          <p className="text-sm font-semibold tracking-[0.1em] uppercase mb-3" style={{ color: '#7BA1EC' }}>
            // {t.portfolio.label}
          </p>
          <h2 className="font-bold" style={{ fontSize: 'clamp(28px,3.5vw,48px)', color: '#FFFFFF', lineHeight: 1.15 }}>
            {t.portfolio.title}
          </h2>
        </FadeUp>
      </div>

      {featured.length === 0 ? (
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 text-center" style={{ color: '#64748B' }}>
          {t.portfolio.empty}
        </div>
      ) : (
        featured.map((project, i) => {
          const dark = i % 2 === 0;
          return (
            <div key={project.id} style={{ background: dark ? '#080808' : '#F7F7F5' }}>
              <SlideInCard project={project} index={i} total={featured.length} t={t} dark={dark} imageLeft={dark} />
            </div>
          );
        })
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

function SlideInCard({
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
  const title = useAutoTranslate(project.title);
  const description = useAutoTranslate(project.description);

  const rootRef = useRef<HTMLDivElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const textWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !imgWrapRef.current || !textWrapRef.current) return;

    gsap.registerPlugin(ScrollTrigger);
    // Persis kayak flaid: xPercent -115/115 -> 0, di-scrub nempel ke
    // scroll (bukan sekali-jalan) selama proyeknya lewat rentang
    // "top 85%" (mulai kelihatan dikit di bawah layar) sampe "top 45%"
    // (udah nyampe deket tengah layar).
    const fromImg = imageLeft ? -70 : 70;
    const fromText = imageLeft ? 70 : -70;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imgWrapRef.current,
        { xPercent: fromImg, opacity: 0 },
        {
          xPercent: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: rootRef.current, start: 'top 85%', end: 'top 45%', scrub: 0.6 },
        }
      );
      gsap.fromTo(
        textWrapRef.current,
        { xPercent: fromText, opacity: 0 },
        {
          xPercent: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: rootRef.current, start: 'top 85%', end: 'top 45%', scrub: 0.6 },
        }
      );
    }, rootRef);

    return () => ctx.revert();
  }, [imageLeft]);

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

  const imgOrder = imageLeft ? 'order-1' : 'order-2';
  const textOrder = imageLeft ? 'order-2' : 'order-1';

  return (
    <div ref={rootRef} className="min-h-[90dvh] flex items-center overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-10 w-full grid grid-cols-2 gap-3 sm:gap-6 md:gap-10 items-center">
        <div ref={imgWrapRef} className={`overflow-hidden ${imgOrder}`} style={{ aspectRatio: '16/10', border: `1px solid ${c.imgBorder}`, borderRadius: 12 }}>
          <img src={project.image} alt={title} className="w-full h-full object-cover" loading={index === 0 ? 'eager' : 'lazy'} />
        </div>

        <div ref={textWrapRef} className={textOrder}>
          <p className="text-[10px] sm:text-sm font-mono mb-1 sm:mb-2" style={{ color: c.meta }}>
            {String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
          </p>

          <h3 className="font-bold mb-1.5 sm:mb-3" style={{ fontSize: 'clamp(15px,4vw,40px)', lineHeight: 1.15, color: c.heading }}>
            {title}
          </h3>

          {project.highlights.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-4">
              {project.highlights.map((h) => (
                <span key={h} className="text-[9px] sm:text-xs font-semibold px-1.5 sm:px-3 py-0.5 sm:py-1" style={{ background: c.pillBg, color: c.pillText, borderRadius: 999 }}>
                  {h}
                </span>
              ))}
            </div>
          )}

          <p className="text-[11px] sm:text-sm mb-2 sm:mb-5 line-clamp-4 sm:line-clamp-none" style={{ color: c.body, lineHeight: 1.55 }}>
            {description}
          </p>

          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-6">
              {project.tags.map((tag) => (
                <span key={tag} className="text-[9px] sm:text-xs font-medium px-1.5 sm:px-2.5 py-0.5 sm:py-1" style={{ border: `1px solid ${c.tagBorder}`, color: c.tagText, borderRadius: 999 }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 sm:gap-3">
            {project.liveLink && project.liveLink !== '#' && (
              <a
                href={project.liveLink}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor
                className="btn-bounce inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-sm font-semibold px-2.5 sm:px-5 py-1.5 sm:py-2.5 focus-ring"
                style={{ background: '#3B5FE3', color: '#FFFFFF', borderRadius: 9999 }}
              >
                {t.portfolio.caseStudy} <ExternalLink size={12} className="sm:hidden" /><ExternalLink size={14} className="hidden sm:block" />
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor
                className="btn-bounce inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-sm font-semibold px-2.5 sm:px-5 py-1.5 sm:py-2.5 focus-ring"
                style={{ border: `1px solid ${c.outlineBtnBorder}`, color: c.outlineBtnText, borderRadius: 9999 }}
              >
                {t.portfolio.liveDemo} <ArrowUpRight size={12} className="sm:hidden" /><ArrowUpRight size={14} className="hidden sm:block" />
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor
                className="btn-bounce inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-sm font-semibold px-2.5 sm:px-5 py-1.5 sm:py-2.5 focus-ring"
                style={{ border: `1px solid ${c.ghostBtnBorder}`, color: c.ghostBtnText, borderRadius: 9999 }}
              >
                <Github size={12} className="sm:hidden" /><Github size={14} className="hidden sm:block" /> {t.portfolio.repository}
              </a>
            )}
          </div>

          {/* Indikator posisi (titik-titik) */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-3 sm:mt-8">
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                style={{
                  width: i === index ? 16 : 5,
                  height: 5,
                  borderRadius: 999,
                  background: i === index ? '#3B5FE3' : c.dotInactive,
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
