import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Pin, Maximize2 } from 'lucide-react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { useTranslation } from '../lib/i18n';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useCoarsePointer } from '../hooks/useCoarsePointer';
import type { DashProject } from '../lib/storage';

export interface Project {
  id: number;
  title: string;
  description: string;
  brief: string;
  image: string;
  categories: string[];
  tags: string[];
  highlights: string[];
  liveLink: string;
  repoUrl: string | null;
  demoUrl: string | null;
  isPinned: boolean;
}

export const MAX_CATEGORIES_PER_PROJECT = 3;

/**
 * Palet warna label kategori. Kategori dipetakan ke warna secara
 * deterministik (hash nama kategori) supaya kategori yang sama selalu
 * dapat warna yang sama, dan kategori berbeda kelihatan beda — tanpa admin
 * perlu atur warna satu-satu.
 */
const CATEGORY_PALETTE: { bg: string; text: string; border: string }[] = [
  { bg: 'rgba(79,127,224,0.12)', text: '#1D4ED8', border: 'rgba(79,127,224,0.18)' },   // blue
  { bg: 'rgba(16,185,129,0.12)', text: '#047857', border: 'rgba(16,185,129,0.18)' }, // green
  { bg: 'rgba(249,115,22,0.12)', text: '#C2410C', border: 'rgba(249,115,22,0.18)' }, // orange
  { bg: 'rgba(168,85,247,0.12)', text: '#7E22CE', border: 'rgba(168,85,247,0.18)' }, // purple
  { bg: 'rgba(236,72,153,0.12)', text: '#BE185D', border: 'rgba(236,72,153,0.18)' }, // pink
  { bg: 'rgba(20,184,166,0.12)', text: '#0F766E', border: 'rgba(20,184,166,0.18)' }, // teal
  { bg: 'rgba(234,179,8,0.14)', text: '#A16207', border: 'rgba(234,179,8,0.2)' },    // amber
];

function categoryColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return CATEGORY_PALETTE[hash % CATEGORY_PALETTE.length];
}

/**
 * Daftar filter kategori dibuat dinamis dari kategori yang benar-benar
 * dipakai di data proyek (bukan daftar tetap) — supaya kategori baru yang
 * ditambahkan lewat panel admin otomatis muncul jadi filter di sini juga.
 */
export function getCategoryFilters(projects: Project[]): string[] {
  const unique = Array.from(new Set(projects.flatMap((p) => p.categories).filter(Boolean)));
  return ['All', ...unique];
}

function FilterLabel({ category }: { category: string }) {
  const { t } = useTranslation();
  const translated = useAutoTranslate(category === 'All' ? '' : category);
  if (category === 'All') return <>{t.portfolio.filters.all}</>;
  return <>{translated}</>;
}

export function CategoryFilterBar({ categories, active, onChange, dark = false }: { categories: string[]; active: string; onChange: (c: string) => void; dark?: boolean }) {
  return (
    <>
      {categories.map((cat) => (
        <button key={cat} onClick={() => onChange(cat)}
          className="px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300 focus-ring"
          style={{
            background: active === cat ? '#4F7FE0' : dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)',
            color: active === cat ? '#FFFFFF' : dark ? '#CBD5E1' : '#334155',
            border: active === cat ? '1px solid #4F7FE0' : dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(15,23,42,0.1)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }}>
          <FilterLabel category={cat} />
        </button>
      ))}
    </>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const label = useAutoTranslate(category);
  const color = categoryColor(category);
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: color.bg, color: color.text, border: `1px solid ${color.border}` }}
    >
      {label}
    </span>
  );
}

function CategoryBadgeRow({ categories }: { categories: string[] }) {
  if (categories.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {categories.slice(0, MAX_CATEGORIES_PER_PROJECT).map((cat) => (
        <CategoryBadge key={cat} category={cat} />
      ))}
    </div>
  );
}

export function mapDashProjects(list: DashProject[]): Project[] {
  return list.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    brief: p.description,
    image: p.image_url || '/images/project-gabzstore.jpg',
    categories: (p.categories && p.categories.length > 0 ? p.categories : (p.category ? [p.category] : [])).slice(0, MAX_CATEGORIES_PER_PROJECT),
    tags: p.tags ?? [],
    highlights: p.highlights ?? [],
    liveLink: p.link,
    repoUrl: p.repo_url ?? null,
    demoUrl: p.demo_url ?? null,
    isPinned: Boolean(p.is_pinned),
  }));
}

export function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const { t } = useTranslation();
  const title = useAutoTranslate(project.title);
  const brief = useAutoTranslate(project.brief);

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

  return createPortal(
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4 animate-modal-bg"
      style={{ backdropFilter: 'blur(8px)', background: 'rgba(15,17,21,0.55)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modal-in"
        style={{
          background: 'rgba(13,15,22,0.92)', backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '28px', boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
        }}
      >
        <button onClick={onClose}
          className="absolute top-5 right-5 z-10 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 focus-ring"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}
          aria-label="Close modal">
          <X size={18} style={{ color: '#F8FAFC' }} />
        </button>

        <PhotoProvider maskOpacity={0.92} bannerVisible={false}>
          <div className="relative overflow-hidden group/img" style={{ borderRadius: '28px 28px 0 0', aspectRatio: '16/9' }}>
            <PhotoView src={project.image}>
              <img
                src={project.image}
                alt={title}
                className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover/img:scale-[1.03]"
              />
            </PhotoView>
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent 60%, rgba(13,15,22,0.55))' }} />
            <div
              className="absolute bottom-4 left-5 flex items-center gap-2 px-3 py-1.5 rounded-full pointer-events-none opacity-0 group-hover/img:opacity-100 transition-opacity duration-300"
              style={{ background: 'rgba(9,13,24,0.72)', border: '1px solid rgba(255,255,255,0.14)' }}
            >
              <Maximize2 size={12} style={{ color: '#7BA1EC' }} />
              <span className="text-[11px] font-semibold" style={{ color: '#CBD5E1' }}>{t.portfolio.galleryHint}</span>
            </div>
          </div>
        </PhotoProvider>

        <div className="p-7">
          <div className="mb-3">
            <CategoryBadgeRow categories={project.categories} />
          </div>
          <h3 className="text-2xl font-bold mb-3" style={{ color: '#F8FAFC' }}>{title}</h3>
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#CBD5E1', lineHeight: 1.75 }}>{brief}</p>

          {project.tags.length > 0 && (
            <div className="mb-7">
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#94A3B8' }}>{t.portfolio.techStack}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="text-xs font-semibold px-3.5 py-1.5 rounded-full"
                    style={{ background: 'rgba(79,127,224,0.1)', color: '#4F7FE0', border: '1px solid rgba(79,127,224,0.15)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <a href={project.liveLink} target="_blank" rel="noopener noreferrer"
              onClick={(e) => { if (project.liveLink === '#') e.preventDefault(); }}
              className="inline-flex items-center gap-2 btn-primary text-sm py-3 px-6 focus-ring">
              <ExternalLink size={15} /> {t.portfolio.livePreview}
            </a>
            <button onClick={onClose} className="glass-button px-6 py-3 text-sm font-semibold focus-ring" style={{ color: '#F8FAFC' }}>
              {t.portfolio.close}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const title = useAutoTranslate(project.title);
  const description = useAutoTranslate(project.description);
  const { ref, isVisible } = useScrollReveal(0.15);
  // Di layar sentuh nggak ada hover, jadi tombol zoom-nya dibikin selalu
  // kelihatan — kalau nggak, galeri fullscreen mustahil dibuka dari HP.
  const isTouch = useCoarsePointer();

  return (
    <div
      ref={ref}
      className={`min-w-0 w-full cursor-pointer transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
      onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={onClick}
    >
      <div className="glass-card-strong overflow-hidden h-full flex flex-col transition-all duration-300"
        style={{
          transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
          boxShadow: isHovered ? '0 16px 56px rgba(31,38,135,0.14)' : '0 8px 40px rgba(31,38,135,0.08)',
          transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
        }}>
        <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
          <img src={project.image} alt={title}
            className="w-full h-full object-cover transition-transform duration-500"
            style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)', transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
            loading="lazy" />
          <PhotoView src={project.image}>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-4 left-4 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 focus-ring"
              style={{
                background: 'rgba(9,13,24,0.55)',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                opacity: isTouch || isHovered ? 1 : 0,
                pointerEvents: isTouch || isHovered ? 'auto' : 'none',
              }}
              aria-label={t.portfolio.zoomImage}
            >
              <Maximize2 size={14} style={{ color: '#F8FAFC' }} />
            </button>
          </PhotoView>
          {project.isPinned && (
            <div className="absolute top-4 right-4 glass-pill px-2.5 py-1.5 flex items-center gap-1"
              style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', background: 'rgba(79,127,224,0.85)' }}>
              <Pin size={11} style={{ color: '#fff' }} />
              <span className="text-[10px] font-semibold" style={{ color: '#fff' }}>{t.portfolio.pinnedLabel}</span>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
            style={{ opacity: isHovered ? 1 : 0, background: 'rgba(79,127,224,0.12)', backdropFilter: 'blur(2px)' }}>
            <div className="glass-pill px-4 py-2 text-sm font-semibold flex items-center gap-2"
              style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', color: '#0F172A' }}>
              <ExternalLink size={14} style={{ color: '#4F7FE0' }} /> {t.portfolio.viewDetail}
            </div>
          </div>
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <div className="mb-2.5">
            <CategoryBadgeRow categories={project.categories} />
          </div>
          <h3 className="text-base font-semibold mb-2" style={{ color: '#0F172A', lineHeight: 1.4 }}>{title}</h3>
          <p className="text-sm mb-4 line-clamp-2" style={{ color: '#475569', lineHeight: 1.6 }}>{description}</p>
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-auto">
              {project.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs font-medium px-3 py-1 rounded-full"
                  style={{ background: 'rgba(79,127,224,0.08)', color: '#4F7FE0' }}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


/**
 * Bungkus daftar ProjectCard biar tombol zoom di tiap kartu masuk ke satu
 * galeri yang sama — jadi di dalam mode fullscreen bisa di-swipe pindah
 * antar proyek (di mobile maupun desktop).
 */
export function ProjectGalleryProvider({ children }: { children: React.ReactNode }) {
  return (
    <PhotoProvider maskOpacity={0.92} bannerVisible={false} loop={3}>
      {children}
    </PhotoProvider>
  );
}
