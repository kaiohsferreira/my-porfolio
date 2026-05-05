import { useState, useRef } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PROJECTS_DATA } from '@/data/portfolio'

const PLACEHOLDER_ICONS = [
  <svg key="1" width="48" height="48" viewBox="0 0 48 48"><rect x="4" y="8" width="40" height="28" rx="2" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/><rect x="16" y="36" width="16" height="4" fill="rgba(255,255,255,0.06)"/><rect x="4" y="12" width="40" height="1" fill="rgba(255,255,255,0.06)"/></svg>,
  <svg key="2" width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="20" r="12" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/><path d="M16 36 Q24 28 32 36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5"/></svg>,
  <svg key="3" width="48" height="48" viewBox="0 0 48 48"><rect x="10" y="10" width="28" height="28" rx="14" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/><circle cx="24" cy="24" r="6" fill="rgba(255,255,255,0.06)"/></svg>,
]

export function Projects() {
  const { lang, t } = useLanguage()
  const [current, setCurrent] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const total = PROJECTS_DATA.length

  function goTo(idx: number) {
    const clamped = Math.max(0, Math.min(idx, total - 1))
    setCurrent(clamped)
    if (trackRef.current && trackRef.current.children[0]) {
      const cardW = (trackRef.current.children[0] as HTMLElement).getBoundingClientRect().width + 24
      trackRef.current.style.transform = `translateX(-${clamped * cardW}px)`
    }
  }

  return (
    <section
      id="projects"
      className="border-t"
      style={{ padding: '140px 48px', background: 'var(--bg2)', borderColor: 'var(--border)' }}
    >
      <SectionHeader num="03" title={t('Projetos', 'Projects')} />

      <div className="reveal">
        {/* Carousel */}
        <div className="overflow-hidden">
          <div
            ref={trackRef}
            className="flex gap-6"
            style={{ transition: 'transform 0.55s cubic-bezier(0.16,1,0.3,1)', willChange: 'transform' }}
          >
            {PROJECTS_DATA.map((proj, i) => (
              <div
                key={proj.id}
                className="project-card-wrap flex flex-col border flex-shrink-0 cursor-default overflow-hidden transition-colors duration-200"
                style={{
                  flex: '0 0 calc(50% - 12px)',
                  maxWidth: 'calc(50% - 12px)',
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                }}
              >
                {/* Image area */}
                <div
                  className="w-full relative overflow-hidden flex items-center justify-center"
                  style={{ aspectRatio: '16/9', background: 'var(--bg3)' }}
                >
                  <div
                    className="flex flex-col items-center justify-center gap-2 w-full h-full"
                    style={{
                      background: 'repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(255,255,255,0.015) 20px,rgba(255,255,255,0.015) 40px)',
                    }}
                  >
                    {PLACEHOLDER_ICONS[i]}
                    <span className="font-mono text-[10px] tracking-[0.08em]" style={{ color: 'var(--text-dim)' }}>
                      {proj.name.toLowerCase().replace(/ /g, '-')}.png
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6 flex flex-col gap-2 flex-1">
                  <span className="font-mono text-[10px] tracking-[0.15em] uppercase" style={{ color: 'var(--green)' }}>
                    {lang === 'pt' ? proj.type.pt : proj.type.en}
                  </span>
                  <span className="text-[18px] font-semibold tracking-[-0.01em]" style={{ color: 'var(--text)' }}>
                    {proj.name}
                  </span>
                  <p className="text-[13px] leading-[1.6]" style={{ color: 'var(--text-muted)' }}>
                    {lang === 'pt' ? proj.desc.pt : proj.desc.en}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {proj.tags.map((tag) => (
                      <span
                        key={tag}
                        className="project-tag-item font-mono text-[10px] border px-2 py-[3px] tracking-[0.06em] uppercase transition-all duration-200"
                        style={{ color: 'var(--text-dim)', borderColor: 'var(--border)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3 mt-9">
          <button
            onClick={() => goTo(current - 1)}
            disabled={current === 0}
            className="clip-chip-sm w-11 h-11 flex items-center justify-center border text-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}
            onMouseEnter={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; e.currentTarget.style.background = 'var(--green-glow)' } }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--surface)' }}
            aria-label={t('Anterior', 'Previous')}
          >
            ←
          </button>

          <button
            onClick={() => goTo(current + 1)}
            disabled={current === total - 1}
            className="clip-chip-sm w-11 h-11 flex items-center justify-center border text-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}
            onMouseEnter={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; e.currentTarget.style.background = 'var(--green-glow)' } }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--surface)' }}
            aria-label={t('Próximo', 'Next')}
          >
            →
          </button>

          {/* Dots */}
          <div className="flex gap-1.5 items-center ml-2">
            {PROJECTS_DATA.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="h-1.5 rounded-full transition-all duration-200 border-none"
                style={{
                  width: i === current ? '20px' : '6px',
                  background: i === current ? 'var(--green)' : 'var(--border-bright)',
                  cursor: 'pointer',
                  borderRadius: i === current ? '3px' : '50%',
                  padding: 0,
                }}
                aria-label={`${t('Ir para', 'Go to')} ${i + 1}`}
              />
            ))}
          </div>

          {/* Counter */}
          <div className="ml-auto font-mono text-[12px] tracking-[0.08em]" style={{ color: 'var(--text-dim)' }}>
            <span style={{ color: 'var(--green)' }}>{current + 1}</span> / {total}
          </div>
        </div>
      </div>
    </section>
  )
}
