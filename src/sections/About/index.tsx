import { useLanguage } from '@/context/LanguageContext'
import { usePortfolioContent } from '@/context/PortfolioContentContext'
import { SectionHeader } from '@/components/ui/SectionHeader'

const FALLBACK_SKILLS = ['HTML', 'CSS', 'JS', 'C#', 'Python', 'MySQL']

export function About() {
  const { lang, t } = useLanguage()
  const { profile } = usePortfolioContent()
  const headline = lang === 'pt' ? profile.headline : profile.headlineEn || profile.headline
  const biography = lang === 'pt' ? profile.bioPt : profile.bioEn || profile.bioPt

  return (
    <section
      id="about"
      className="border-t"
      style={{ padding: '140px 48px', background: 'var(--bg2)', borderColor: 'var(--border)' }}
    >
      <SectionHeader num="01" title={t('Sobre mim', 'About me')} />

      <div className="about-grid-cols grid gap-20" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
        <div className="reveal">
          <div className="space-y-5 text-[17px] leading-[1.75]" style={{ color: 'var(--text-muted)' }}>
            <p>
              {lang === 'pt' ? 'Sou' : "I'm"}{' '}
              <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{profile.fullName}</strong>
              {headline ? (
                <>
                  {' '}
                  {lang === 'pt' ? 'e atuo como' : 'and I work as'}{' '}
                  <span style={{ color: 'var(--green)' }}>{headline}</span>.
                </>
              ) : null}
            </p>
            <p>{biography}</p>
            <p>
              {profile.location ? (
                <>
                  {lang === 'pt' ? 'Baseado em' : 'Based in'}{' '}
                  <strong style={{ color: 'var(--text)' }}>{profile.location}</strong>.
                </>
              ) : null}
              {profile.sinceYear ? (
                <>
                  {' '}
                  {lang === 'pt' ? 'Construindo minha trajetoria desde' : 'Building my path since'}{' '}
                  <span style={{ color: 'var(--green)' }}>{profile.sinceYear}</span>.
                </>
              ) : null}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-0.5 mt-12">
            {profile.stats.map((stat) => (
              <div
                key={stat.id}
                className="stat-box border p-6"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div
                  className="text-[36px] font-bold leading-none mb-1 tracking-tight"
                  style={{ color: 'var(--green)' }}
                >
                  {stat.value}
                </div>
                <div
                  className="font-mono text-[11px] tracking-[0.08em] uppercase"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {lang === 'pt' ? stat.labelPt : stat.labelEn || stat.labelPt}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="reveal reveal-delay-2 border rounded-lg overflow-hidden"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div
            className="flex items-center gap-2 px-4 py-3 border-b"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--border)' }}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#febc2e' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#28c840' }} />
            <span className="font-mono text-[11px] ml-2 tracking-[0.05em]" style={{ color: 'var(--text-dim)' }}>
              profile.json
            </span>
          </div>

          <div className="p-6 font-mono text-[13px] leading-[1.8] space-y-0">
            <div className="flex gap-3">
              <span style={{ color: 'var(--green)' }}>$</span>
              <span style={{ color: 'var(--cyan)' }}>cat profile.json</span>
            </div>
            <div className="mt-3" style={{ color: 'var(--border-bright)' }}>{'{'}</div>

            {[
              { key: 'name', value: `"${profile.fullName}"` },
              { key: 'role', value: `"${headline || (lang === 'pt' ? 'Desenvolvedor Web' : 'Web Developer')}"` },
              { key: 'since', value: String(profile.sinceYear ?? 2023) },
              { key: 'location', value: `"${profile.location || 'Brasil'}"` },
            ].map((row, index) => (
              <div key={row.key} className="pl-6 flex gap-0">
                <span style={{ color: 'var(--green)' }}>"{row.key}"</span>
                <span style={{ color: 'var(--text-dim)' }}>: </span>
                <span style={{ color: 'var(--text)' }}>{row.value}</span>
                {index < 3 ? <span style={{ color: 'var(--text-dim)' }}>,</span> : null}
              </div>
            ))}

            <div className="pl-6 flex gap-0">
              <span style={{ color: 'var(--green)' }}>"status"</span>
              <span style={{ color: 'var(--text-dim)' }}>: </span>
              <span style={{ color: '#28c840' }}>
                "{profile.availableForWork ? 'open to work' : 'currently unavailable'}"
              </span>
              <span style={{ color: 'var(--text-dim)' }}>,</span>
            </div>

            <div className="pl-6">
              <span style={{ color: 'var(--green)' }}>"skills"</span>
              <span style={{ color: 'var(--text-dim)' }}>: </span>
              <span style={{ color: 'var(--border-bright)' }}>{'['}</span>
            </div>
            <div className="pl-12">
              {FALLBACK_SKILLS.slice(0, 3).map((skill, index) => (
                <span key={skill}>
                  <span style={{ color: 'var(--text)' }}>"{skill}"</span>
                  {index < 2 ? <span style={{ color: 'var(--text-dim)' }}>, </span> : null}
                </span>
              ))}
              <span style={{ color: 'var(--text-dim)' }}>,</span>
            </div>
            <div className="pl-12">
              {FALLBACK_SKILLS.slice(3).map((skill, index) => (
                <span key={skill}>
                  <span style={{ color: 'var(--text)' }}>"{skill}"</span>
                  {index < FALLBACK_SKILLS.slice(3).length - 1 ? <span style={{ color: 'var(--text-dim)' }}>, </span> : null}
                </span>
              ))}
            </div>
            <div className="pl-6" style={{ color: 'var(--border-bright)' }}>{']'}</div>
            <div style={{ color: 'var(--border-bright)' }}>{'}'}</div>

            <div className="mt-3 pl-6 text-[12px]" style={{ color: 'var(--text-dim)' }}>
              # {profile.availableForWork
                ? t('disponivel para novas oportunidades', 'available for new opportunities')
                : t('acompanhe novidades por aqui', 'stay tuned for updates here')}
            </div>
            <div className="flex mt-1">
              <span style={{ color: 'var(--green)' }}>$ </span>
              <span
                className="inline-block w-0.5 h-[1em] align-middle ml-1"
                style={{ background: 'var(--green)', animation: 'blink 0.8s step-end infinite' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
