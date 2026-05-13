import { useState, useRef, useEffect } from 'react'
import { useNavScroll } from '@/hooks/useNavScroll'
import { useLanguage } from '@/context/LanguageContext'
import { usePortfolioContent } from '@/context/PortfolioContentContext'
import { THEMES, type ThemeConfig } from '@/data/portfolio'

/* Dropdown shows: Padrão (green) + all 22 heroes */
const DROPDOWN_THEMES: ThemeConfig[] = [
  THEMES.find((t) => t.id === 'green')!,
  ...THEMES.filter((t) => t.group === 'hero'),
]

function applyTheme(theme: ThemeConfig) {
  const r = document.documentElement
  r.style.setProperty('--bg',           theme.bg)
  r.style.setProperty('--bg2',          theme.bg2)
  r.style.setProperty('--bg3',          theme.bg3)
  r.style.setProperty('--surface',      theme.surface)
  r.style.setProperty('--border',       theme.border)
  r.style.setProperty('--border-bright',theme.borderBright)
  r.style.setProperty('--text',         theme.text)
  r.style.setProperty('--text-muted',   theme.textMuted)
  r.style.setProperty('--text-dim',     theme.textDim)
  r.style.setProperty('--green',        theme.green)
  r.style.setProperty('--cyan',         theme.cyan)
  r.style.setProperty('--green-glow',   theme.greenGlow)
  r.style.setProperty('--cyan-glow',    theme.cyanGlow)
}

export function Navbar() {
  const scrolled = useNavScroll()
  const { lang, setLang, t } = useLanguage()
  const { profile } = usePortfolioContent()
  const [themeOpen, setThemeOpen]       = useState(false)
  const [activeThemeId, setActiveThemeId] = useState('green')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeTheme = THEMES.find((th) => th.id === activeThemeId) ?? THEMES[0]

  function selectTheme(theme: ThemeConfig) {
    applyTheme(theme)
    setActiveThemeId(theme.id)
    setThemeOpen(false)
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setThemeOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const navLinks = [
    { href: '#about',    label: t('Sobre',    'About')    },
    { href: '#skills',   label: t('Skills',   'Skills')   },
    { href: '#projects', label: t('Projetos', 'Projects') },
    { href: '#contact',  label: t('Contato',  'Contact')  },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between px-12 py-5 border-b border-transparent transition-all duration-300 ${scrolled ? 'scrolled' : ''}`}
    >
      {/* Logo */}
      <a
        href="#home"
        className="font-mono text-[13px] tracking-[0.08em] no-underline"
        style={{ color: 'var(--green)' }}
      >
        <span style={{ color: 'var(--text-muted)' }}>//</span> kaio.dev
      </a>

      {/* Links */}
      <ul className="nav-links-desktop flex gap-9 items-center list-none">
        {navLinks.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              className="nav-link-underline relative font-mono text-[12px] tracking-[0.1em] uppercase no-underline transition-colors duration-200"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--green)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              {l.label}
            </a>
          </li>
        ))}
        <li>
          <a
            href={profile.resumeFileUrl || '#contact'}
            target={profile.resumeFileUrl ? '_blank' : undefined}
            rel={profile.resumeFileUrl ? 'noreferrer' : undefined}
            className="clip-chip font-mono text-[11px] tracking-[0.08em] px-4 py-2 no-underline transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: 'var(--green)', color: 'var(--bg)' }}
          >
            {t('Currículo', 'Resume')}
          </a>
        </li>
      </ul>

      {/* Controls */}
      <div className="flex items-center gap-3">

        {/* Theme picker */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setThemeOpen((o) => !o)}
            className="flex items-center gap-[7px] font-mono text-[11px] tracking-[0.08em] px-3 py-[5px] border border-[var(--border-bright)] transition-all duration-200 hover:border-[var(--green)] hover:text-[var(--green)] whitespace-nowrap"
            style={{ background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0 transition-colors duration-300"
              style={{ background: activeTheme.green }}
            />
            TEMA
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {themeOpen && (
            <div
              className="theme-dropdown-panel absolute top-[calc(100%+8px)] right-0 w-[480px] border border-[var(--border-bright)] z-[9500] overflow-hidden"
              style={{ background: 'var(--bg2)', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}
            >
              {/* top accent line */}
              <div className="h-px w-full" style={{ background: 'linear-gradient(to right, var(--green), var(--cyan), transparent)' }} />

              <div className="theme-dropdown-content p-4">
                {/* Header */}
                <div
                  className="font-mono text-[10px] tracking-[0.15em] uppercase pb-3 mb-3 border-b"
                  style={{ color: 'var(--text-dim)', borderColor: 'var(--border)' }}
                >
                  // selecione o tema
                </div>

                {/* Flat 3-col grid */}
                <div className="theme-dropdown-grid grid grid-cols-3 gap-1">
                  {DROPDOWN_THEMES.map((th) => (
                    <ThemeButton
                      key={th.id}
                      theme={th}
                      active={activeThemeId === th.id}
                      onSelect={selectTheme}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lang toggle */}
        <div className="flex border border-[var(--border-bright)] rounded overflow-hidden font-mono text-[11px] tracking-[0.08em]">
          {(['pt', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="px-[10px] py-[5px] transition-all duration-200"
              style={{
                background: lang === l ? 'var(--green)' : 'none',
                color: lang === l ? 'var(--bg)' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

      </div>
    </nav>
  )
}

/* ── Sub-component ── */
interface ThemeButtonProps {
  theme: ThemeConfig
  active: boolean
  onSelect: (t: ThemeConfig) => void
}

function ThemeButton({ theme, active, onSelect }: ThemeButtonProps) {
  return (
    <button
      onClick={() => onSelect(theme)}
      title={theme.label}
      className="theme-dropdown-item flex items-center gap-2 px-3 py-2 font-mono text-[12px] border transition-all duration-150 text-left w-full"
      style={{
        background:  active ? theme.greenGlow : 'none',
        borderColor: active ? theme.green     : 'transparent',
        color:       active ? theme.green     : 'var(--text-muted)',
        cursor: 'pointer',
        borderRadius: 0,
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background  = 'var(--surface)'
          e.currentTarget.style.borderColor = 'var(--border-bright)'
          e.currentTarget.style.color       = 'var(--text)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background  = 'none'
          e.currentTarget.style.borderColor = 'transparent'
          e.currentTarget.style.color       = 'var(--text-muted)'
        }
      }}
    >
      {/* círculo único com a cor primária do tema */}
      <span
        className="w-[10px] h-[10px] rounded-full shrink-0 border border-white/10"
        style={{ background: theme.green }}
      />
      <span className="truncate">{theme.label}</span>
    </button>
  )
}
