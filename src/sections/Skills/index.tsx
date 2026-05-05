import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SKILLS_DATA } from '@/data/portfolio'

export function Skills() {
  const { t } = useLanguage()
  const marqueeRef = useRef<HTMLDivElement>(null)
  const baseGroupRef = useRef<HTMLDivElement>(null)
  const [repeatCount, setRepeatCount] = useState(2)
  const [loopShift, setLoopShift] = useState(0)

  useEffect(() => {
    const marquee = marqueeRef.current
    const baseGroup = baseGroupRef.current

    if (!marquee || !baseGroup) return

    let frameId = 0

    const updateLoopMetrics = () => {
      cancelAnimationFrame(frameId)

      frameId = requestAnimationFrame(() => {
        const containerWidth = marquee.offsetWidth
        const baseWidth = baseGroup.scrollWidth

        if (!containerWidth || !baseWidth) return

        const nextRepeatCount = Math.max(2, Math.ceil(containerWidth / baseWidth) + 1)

        setRepeatCount((current) => (current === nextRepeatCount ? current : nextRepeatCount))
        setLoopShift((current) => (current === baseWidth ? current : baseWidth))
      })
    }

    updateLoopMetrics()

    const resizeObserver = new ResizeObserver(updateLoopMetrics)
    resizeObserver.observe(marquee)
    resizeObserver.observe(baseGroup)
    window.addEventListener('resize', updateLoopMetrics)

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateLoopMetrics)
    }
  }, [])

  const trackStyle = {
    '--skills-loop-shift': `${loopShift}px`,
  } as CSSProperties

  return (
    <section
      id="skills"
      className="border-t"
      style={{ padding: '140px 0', borderColor: 'var(--border)' }}
    >
      <SectionHeader num="02" title={t('Skills', 'Skills')} className="px-12 !mb-16" />

      <div ref={marqueeRef} className="skills-marquee-wrap reveal">
        <div className="skills-marquee-track" style={trackStyle}>
          {Array.from({ length: repeatCount }, (_, groupIndex) => (
            <div
              key={`skills-group-${groupIndex}`}
              ref={groupIndex === 0 ? baseGroupRef : undefined}
              className="skills-marquee-group"
              aria-hidden={groupIndex > 0}
            >
              {SKILLS_DATA.map((skill) => (
                <div
                  key={`${groupIndex}-${skill.name}`}
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
          ))}
        </div>
      </div>
    </section>
  )
}
