import { useEffect, useRef } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { usePortfolioContent } from '@/context/PortfolioContentContext'
import { useTyped } from '@/hooks/useTyped'
import { HeroEmblem } from './HeroEmblem'

const SNIPPETS = ['const','let','var','=>','for','if()','async','await','<div>','</div>','class','null','true','{}','[]','import','return','===','&&','||','...']
const LINE_NUMS = ['01','02','03','04','05','06','07','08','09','10']

export function Hero() {
  const { lang, t } = useLanguage()
  const { profile } = usePortfolioContent()
  const typedRef = useRef<HTMLSpanElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)
  const nameParts = profile.fullName.trim().split(/\s+/)
  const firstName = nameParts[0] || 'Kaio'
  const remainingName = nameParts.slice(1).join(' ') || 'Henrique'

  useTyped(typedRef, lang)

  useEffect(() => {
    const container = particlesRef.current
    if (!container) return
    container.innerHTML = ''
    for (let i = 0; i < 22; i++) {
      const p = document.createElement('div')
      p.className = 'particle'
      p.textContent = SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)]
      p.style.left = Math.random() * 100 + 'vw'
      p.style.animationDuration = (8 + Math.random() * 14) + 's'
      p.style.animationDelay = (Math.random() * -20) + 's'
      p.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px')
      p.style.opacity = (0.2 + Math.random() * 0.4).toString()
      container.appendChild(p)
    }
  }, [])

  return (
    <section
      id="home"
      className="hero-section relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{ padding: '0 48px' }}
    >
      {/* Grid lines */}
      <div className="hero-grid-lines" aria-hidden="true" />

      {/* Line numbers */}
      <div
        className="absolute left-5 top-1/2 -translate-y-1/2 flex flex-col gap-7 font-mono text-[10px] select-none"
        style={{ color: 'var(--text-dim)' }}
        aria-hidden="true"
      >
        {LINE_NUMS.map((n) => <span key={n}>{n}</span>)}
      </div>

      {/* Particles */}
      <div ref={particlesRef} className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true" />

      {/* Content */}
      <div className="hero-content relative z-10 max-w-4xl">
        {/* Tag */}
        <div
          className="hero-anim-1 inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.12em] uppercase mb-8"
          style={{ color: 'var(--green)' }}
        >
          <span className="block w-6 h-px" style={{ background: 'var(--green)' }} />
          {lang === 'pt'
            ? `// ${profile.headline || 'Desenvolvedor Fullstack'}`
            : `// ${profile.headlineEn || profile.headline || 'Fullstack Developer'}`}
        </div>

        {/* Name */}
        <div className="hero-anim-2 flex items-center gap-6 mb-2 flex-wrap">
          <h1
            className="font-bold leading-[0.92] tracking-[-0.03em]"
            style={{ fontSize: 'clamp(56px,8vw,120px)', color: 'var(--text)' }}
          >
            <span className="glitch" data-text={firstName}>{firstName}</span>
            <span className="block" style={{ color: 'var(--green)' }}>{remainingName}</span>
          </h1>
          <HeroEmblem />
        </div>

        {/* Role typed */}
        <div
          className="hero-anim-3 font-mono flex items-center gap-3 mt-7 mb-12"
          style={{ fontSize: 'clamp(14px,1.5vw,18px)', color: 'var(--text-muted)' }}
        >
          <span style={{ color: 'var(--green)' }}>$</span>
          <span style={{ color: 'var(--text-muted)' }}>{t('especialidade', 'specialty')}</span>
          <span style={{ color: 'var(--text-dim)' }}> = </span>
          <span ref={typedRef} style={{ color: 'var(--cyan)' }} />
          <span
            className="inline-block w-0.5 h-[1em] align-middle"
            style={{ background: 'var(--cyan)', animation: 'blink 0.8s step-end infinite' }}
          />
        </div>

        {/* CTAs */}
        <div className="hero-anim-4 flex gap-4 flex-wrap">
          <a
            href="#projects"
            className="clip-chip inline-flex items-center gap-2 font-mono text-[13px] font-medium tracking-[0.08em] px-7 py-[14px] no-underline transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'var(--green)',
              color: 'var(--bg)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--cyan)'; e.currentTarget.style.boxShadow = '0 8px 32px oklch(72% 0.25 220 / 0.3)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--green)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            {t('Ver Projetos →', 'View Projects →')}
          </a>
          <a
            href="#contact"
            className="clip-chip inline-flex items-center gap-2 font-mono text-[13px] tracking-[0.08em] px-7 py-[14px] no-underline border transition-all duration-200"
            style={{ background: 'transparent', color: 'var(--text)', borderColor: 'var(--border-bright)' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; e.currentTarget.style.background = 'var(--green-glow)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'transparent' }}
          >
            {t('Falar comigo', 'Get in touch')}
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="hero-anim-5 absolute bottom-10 left-12 flex items-center gap-2.5 font-mono text-[11px] tracking-[0.1em] uppercase"
        style={{ color: 'var(--text-dim)' }}
      >
        <div className="scroll-line" />
        <span>{t('scroll para explorar', 'scroll to explore')}</span>
      </div>
    </section>
  )
}
