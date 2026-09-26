import FadeUp from '../components/fx/FadeUp';
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
  const { language } = useTranslation();
  const { skills } = useSkills('gabzdev');

  if (skills.length === 0) return null;

  const rows = splitIntoRows(skills, 2);

  return (
    <section id="skills-carousel" className="relative py-16 md:py-24" style={{ background: '#FFFFFF' }}>
      <div className="relative z-10 max-w-[1100px] mx-auto px-6">
        <FadeUp threshold={0.2}>
          <p className="skills-eyebrow">
            {language === 'id' ? 'Dibangun Pakai Teknologi Modern' : 'Built With Modern Technology'}
          </p>
        </FadeUp>

        <div className="skills-stage">
          {rows.map((row, i) => (
            <FadeUp key={i} threshold={0.2} delay={150 + i * 120} distance={16}>
              <MarqueeRow skills={row} reverse={i % 2 === 0} duration={30 + i * 8} />
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
