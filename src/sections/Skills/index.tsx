import { useLanguage } from '@/context/LanguageContext'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SKILLS_DATA } from '@/data/portfolio'

const DOUBLED = [...SKILLS_DATA, ...SKILLS_DATA]

export function Skills() {
  const { t } = useLanguage()

  return (
    <section
      id="skills"
      className="border-t"
      style={{ padding: '140px 0', borderColor: 'var(--border)' }}
    >
      <SectionHeader num="02" title={t('Skills', 'Skills')} className="px-12 !mb-16" />

      <div className="skills-marquee-wrap reveal">
        <div className="skills-marquee-track">
          {DOUBLED.map((skill, i) => (
            <div
              key={`${skill.name}-${i}`}
              className="skill-card-hover relative border flex flex-col items-center justify-center gap-4 cursor-default overflow-hidden transition-all duration-[250ms]"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                width: '140px',
                height: '140px',
                flexShrink: 0,
                marginRight: '16px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--green)'
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.boxShadow = '0 16px 40px oklch(72% 0.25 160 / 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div className="w-16 h-16 flex items-center justify-center relative z-10">
                <img
                  src={skill.icon}
                  alt={skill.name}
                  className="w-16 h-16 object-contain transition-all duration-[250ms]"
                  style={{ filter: skill.filterStyle ?? 'grayscale(20%)' }}
                  loading="lazy"
                />
              </div>
              <span
                className="font-mono text-[11px] tracking-[0.06em] text-center relative z-10 whitespace-nowrap transition-colors duration-[250ms]"
                style={{ color: 'var(--text-muted)' }}
              >
                {skill.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
