import { useMemo, useRef, useState } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Github } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { useProjects, useSocial } from '../lib/queries';
import { mapDashProjects, type Project } from '../components/ProjectShared';
import FadeUp from '../components/fx/FadeUp';

/**
 * Portfolio — niru persis pola flaid.my.id: SATU proyek besar penuh layar
 * per "slot" scroll, scroll vertikal biasa yang dorong transisi (crossfade)
 * ke proyek berikutnya, bukan grid/carousel drag manual.
 *
 * Mekanisme: wrapper luar tingginya = jumlah_proyek × 120vh (biar tiap
 * proyek dapet "jatah" scroll yang cukup buat dibaca sebelum ganti).
 * Bagian dalam sticky, scrollYProgress dipetakan ke activeIndex proyek
 * mana yang lagi aktif — AnimatePresence yang handle crossfade-nya.
 *
 * Ditutup dengan listing "proyek lainnya" (proyek yang nggak pinned) +
 * link GitHub, persis kayak penutup "THAT'S THE HIGHLIGHT REEL" di flaid.
 */
export default function Portfolio() {
  const { t } = useTranslation();
  const { projects: stored } = useProjects('gabzdev');
  const social = useSocial();
  const allProjects = useMemo<Project[]>(() => mapDashProjects(stored), [stored]);

  const pinnedProjects = allProjects.filter((p) => p.isPinned);
  const featured = pinnedProjects.length > 0 ? pinnedProjects : allProjects;
  const otherProjects = allProjects.filter((p) => !featured.includes(p));

  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ['start start', 'end end'] });
  const [activeIndex, setActiveIndex] = useState(0);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (featured.length === 0) return;
    const idx = Math.min(featured.length - 1, Math.floor(v * featured.length));
    setActiveIndex(idx);
  });

  const project = featured[activeIndex];
  const canPin = featured.length >= 2;

  return (
    <section id="portfolio" className="relative" style={{ background: '#FFFFFF' }}>
      <div className="pt-20 md:pt-24 px-6 md:px-10 max-w-[1200px] mx-auto">
        <FadeUp>
          <p className="text-sm font-semibold tracking-[0.1em] uppercase mb-3" style={{ color: '#3B5FE3' }}>
            // {t.portfolio.label}
          </p>
          <h2 className="font-bold mb-8" style={{ fontSize: 'clamp(28px,3.5vw,48px)', color: '#0F172A', lineHeight: 1.15 }}>
            {t.portfolio.title}
          </h2>
        </FadeUp>
      </div>

      {featured.length === 0 ? (
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 text-center" style={{ color: '#94A3B8' }}>
          {t.portfolio.empty}
        </div>
      ) : canPin ? (
        <div ref={targetRef} style={{ height: `${featured.length * 120}vh` }}>
          <div className="sticky top-0 flex items-center overflow-hidden" style={{ height: '100dvh' }}>
            <div className="max-w-[1200px] mx-auto px-6 md:px-10 w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(6px)' }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
                >
                  <div
                    className="overflow-hidden"
                    style={{ aspectRatio: '16/10', border: '1px solid #E2E8F0' }}
                  >
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                  </div>

                  <div>
                    <p className="text-sm font-mono mb-2" style={{ color: '#94A3B8' }}>
                      {String(activeIndex + 1).padStart(2, '0')}
                    </p>
                    <h3 className="font-bold mb-3" style={{ fontSize: 'clamp(24px,3vw,36px)', color: '#0F172A' }}>
                      {project.title}
                    </h3>

                    {project.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.highlights.map((h) => (
                          <span
                            key={h}
                            className="text-xs font-semibold px-3 py-1"
                            style={{ background: '#0F172A', color: '#FFFFFF' }}
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-sm mb-5" style={{ color: '#64748B', lineHeight: 1.7 }}>
                      {project.description}
                    </p>

                    {project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs font-medium px-2.5 py-1"
                            style={{ border: '1px solid #E2E8F0', color: '#334155' }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      {project.liveLink && (
                        <a
                          href={project.liveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-bounce inline-flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 focus-ring"
                          style={{ background: '#0F172A', color: '#FFFFFF' }}
                        >
                          {t.portfolio.caseStudy} <ArrowUpRight size={14} />
                        </a>
                      )}
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-bounce inline-flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 focus-ring"
                          style={{ border: '1px solid #0F172A', color: '#0F172A' }}
                        >
                          {t.portfolio.liveDemo} <ArrowUpRight size={14} />
                        </a>
                      )}
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-bounce inline-flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 focus-ring"
                          style={{ border: '1px solid #E2E8F0', color: '#64748B' }}
                        >
                          <Github size={14} /> {t.portfolio.repository}
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Indikator progress proyek (titik-titik) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {featured.map((p, i) => (
                <span
                  key={p.id}
                  className="transition-all duration-300"
                  style={{
                    width: i === activeIndex ? 20 : 6,
                    height: 6,
                    background: i === activeIndex ? '#3B5FE3' : '#E2E8F0',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Cuma 1 proyek — nggak perlu di-pin, tampil statis aja
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="overflow-hidden" style={{ aspectRatio: '16/10', border: '1px solid #E2E8F0' }}>
              <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold mb-3" style={{ fontSize: 'clamp(24px,3vw,36px)', color: '#0F172A' }}>
                {project.title}
              </h3>
              <p className="text-sm mb-5" style={{ color: '#64748B', lineHeight: 1.7 }}>
                {project.description}
              </p>
              {project.liveLink && (
                <a
                  href={project.liveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-bounce inline-flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 focus-ring"
                  style={{ background: '#0F172A', color: '#FFFFFF' }}
                >
                  {t.portfolio.caseStudy} <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Penutup — "proyek lainnya" + link GitHub */}
      {(otherProjects.length > 0 || social.github) && (
        <FadeUp>
          <div style={{ background: '#0A0F1C' }} className="py-20 px-6 text-center">
            <p className="text-2xl md:text-3xl font-bold mb-6" style={{ color: '#FFFFFF' }}>
              {t.portfolio.thatsIt}
            </p>
            {otherProjects.length > 0 && (
              <p className="text-sm mb-6 max-w-[500px] mx-auto" style={{ color: '#94A3B8', lineHeight: 1.8 }}>
                {t.portfolio.otherProjects}: {otherProjects.map((p) => p.title).join(' · ')}
              </p>
            )}
            {social.github && (
              <a
                href={`https://github.com/${social.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold underline focus-ring"
                style={{ color: '#7BA1EC' }}
              >
                <Github size={16} /> {t.portfolio.moreOnGithub}
              </a>
            )}
          </div>
        </FadeUp>
      )}
    </section>
  );
}
