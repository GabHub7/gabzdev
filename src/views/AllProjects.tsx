import { useState, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useView } from '../context/ViewContext';
import { useTranslation } from '../lib/i18n';
import { useProjects } from '../lib/queries';
import { mapDashProjects, getCategoryFilters, CategoryFilterBar, ProjectCard, ProjectModal, ProjectGalleryProvider, type Project } from '../components/ProjectShared';

export default function AllProjects() {
  const { setView } = useView();
  const { t } = useTranslation();
  const { projects: stored, isLoading: loading } = useProjects('gabzdev');
  const projects = useMemo<Project[]>(() => mapDashProjects(stored), [stored]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = activeFilter === 'All' ? projects : projects.filter((p) => p.categories.includes(activeFilter));

  return (
    <div className="relative min-h-[100dvh]" style={{ paddingTop: '140px', paddingBottom: '80px' }}>
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16">
        <button
          onClick={() => setView('portfolio')}
          className="inline-flex items-center gap-2 text-sm font-medium mb-8 glass-button px-4 py-2.5 focus-ring"
          style={{ color: '#F8FAFC' }}
        >
          <ArrowLeft size={15} /> {t.allProjects.back}
        </button>

        <div className="text-center mb-10">
          <p className="text-sm font-semibold tracking-[0.1em] mb-3" style={{ color: '#4F7FE0' }}>
            {t.allProjects.label}
          </p>
          <h1 className="font-bold mb-4" style={{ fontSize: 'clamp(28px,3.5vw,48px)', color: '#F8FAFC', lineHeight: 1.2 }}>
            {t.allProjects.title}
          </h1>
          <p className="text-base max-w-[560px] mx-auto mb-2" style={{ color: '#CBD5E1', lineHeight: 1.7 }}>
            {t.allProjects.subtitle}
          </p>
          {!loading && (
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              {projects.length} {t.allProjects.countSuffix}
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <CategoryFilterBar categories={getCategoryFilters(projects)} active={activeFilter} onChange={setActiveFilter} />
        </div>

        {loading ? (
          <p className="text-center py-16" style={{ color: '#94A3B8' }}>...</p>
        ) : filteredProjects.length > 0 ? (
          <ProjectGalleryProvider>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} onClick={() => setSelectedProject(project)} />
              ))}
            </div>
          </ProjectGalleryProvider>
        ) : (
          <div className="flex items-center justify-center py-16 glass-card" style={{ color: '#94A3B8' }}>
            <p className="text-base">{t.portfolio.empty}</p>
          </div>
        )}
      </div>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
}
