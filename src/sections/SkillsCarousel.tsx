import { useScrollReveal } from '../hooks/useScrollReveal';
import { useTranslation } from '../lib/i18n';
import { useSkills } from '../lib/queries';
import { resolveSkillLogo } from '../lib/skillLogos';
import type { DashSkill } from '../lib/storage';

/**
 * Marquee skill: logo brand asli (bukan ikon generik), teks rapi, container
 * gelap memanjang dengan sudut membulat. 3 baris berselang arah (kiri-kanan-
 * kiri) — pola mengalir seperti referensi.
 */

function SkillPill({ skill }: { skill: DashSkill }) {
  const logo = resolveSkillLogo(skill.name, skill.logo_url);
  return (
    <div className="skill-pill">
      {logo ? (
        <img
          src={logo}
          alt={skill.name}
          className="skill-pill-logo"
          loading="lazy"
          draggable={false}
        />
      ) : (
        <span className="skill-pill-fallback">{skill.name.charAt(0).toUpperCase()}</span>
      )}
      <span className="skill-pill-name">{skill.name}</span>
    </div>
  );
}

function MarqueeRow({ skills, reverse, duration }: { skills: DashSkill[]; reverse: boolean; duration: number }) {
  // Digandakan supaya loop terlihat mulus tanpa jeda.
  const track = [...skills, ...skills];
  return (
    <div className="skills-row">
      <div
        className={`skills-track${reverse ? ' reverse' : ''}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {track.map((skill, i) => (
          <SkillPill key={`${skill.id}-${i}`} skill={skill} />
        ))}
      </div>
    </div>
  );
}

/**
 * Bagi daftar skill ke `count` baris seimbang. Kalau skill-nya terlalu
 * sedikit buat diisi merata, tiap baris dapat salinan penuh supaya nggak
 * ada baris kosong / pincang.
 */
function splitIntoRows(skills: DashSkill[], count: number): DashSkill[][] {
  const MIN_PER_ROW = 4;
  if (skills.length < MIN_PER_ROW * count) {
    return Array.from({ length: count }, () => skills);
  }
  const perRow = Math.ceil(skills.length / count);
  return Array.from({ length: count }, (_, i) => skills.slice(i * perRow, (i + 1) * perRow));
}

export default function SkillsCarousel() {
  const { ref, isVisible } = useScrollReveal(0.15);
  const { language } = useTranslation();
  const { skills } = useSkills('gabzdev');

  if (skills.length === 0) return null;

  const rows = splitIntoRows(skills, 2);

  return (
    <section id="skills-carousel" className="relative py-16 md:py-24" style={{ background: '#FFFFFF' }}>
      <div
        ref={ref}
        className={`relative z-10 max-w-[1100px] mx-auto px-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
      >
        <p className="skills-eyebrow">
          {language === 'id' ? 'Dibangun Pakai Teknologi Modern' : 'Built With Modern Technology'}
        </p>

        <div className="skills-stage">
          {rows.map((row, i) => (
            <MarqueeRow key={i} skills={row} reverse={i % 2 === 0} duration={30 + i * 8} />
          ))}
        </div>
      </div>
    </section>
  );
}
