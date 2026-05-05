import { useLanguage } from '@/context/LanguageContext'
import { SectionHeader } from '@/components/ui/SectionHeader'

const STATS = [
  { num: '2+', labelPt: 'Anos de estudo',     labelEn: 'Years studying'  },
  { num: '9',  labelPt: 'Tecnologias',         labelEn: 'Technologies'   },
  { num: '∞',  labelPt: 'Vontade de crescer',  labelEn: 'Drive to grow'  },
  { num: '100%', labelPt: 'Comprometido',       labelEn: 'Committed'      },
]

export function About() {
  const { lang, t } = useLanguage()

  return (
    <section
      id="about"
      className="border-t"
      style={{ padding: '140px 48px', background: 'var(--bg2)', borderColor: 'var(--border)' }}
    >
      <SectionHeader num="01" title={t('Sobre mim', 'About me')} />

      <div className="about-grid-cols grid gap-20" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
        {/* Left — text + stats */}
        <div className="reveal">
          <div className="space-y-5 text-[17px] leading-[1.75]" style={{ color: 'var(--text-muted)' }}>
            {lang === 'pt' ? (
              <>
                <p>
                  Sou <strong style={{ color: 'var(--text)', fontWeight: 600 }}>Kaio Henrique</strong>, desenvolvedor web e técnico em informática. Comecei minha jornada em{' '}
                  <span style={{ color: 'var(--green)' }}>2023</span> com muita vontade de aprender e evoluir na área de tecnologia.
                </p>
                <p>
                  Trabalho com tecnologias como{' '}
                  <strong style={{ color: 'var(--text)' }}>HTML, CSS, JavaScript, C#, Python e MySQL</strong>. Também tenho experiência com desenvolvimento de jogos usando{' '}
                  <strong style={{ color: 'var(--text)' }}>Unity</strong> e domínio em ferramentas de escritório como{' '}
                  <strong style={{ color: 'var(--text)' }}>Excel</strong>.
                </p>
                <p>
                  Estou em busca de oportunidades para mostrar meu potencial e crescer profissionalmente. Cada linha de código é uma oportunidade de criar algo novo.
                </p>
              </>
            ) : (
              <>
                <p>
                  I'm <strong style={{ color: 'var(--text)', fontWeight: 600 }}>Kaio Henrique</strong>, a web developer and computer technician. I started my journey in{' '}
                  <span style={{ color: 'var(--green)' }}>2023</span> with a strong drive to learn and grow in tech.
                </p>
                <p>
                  I work with technologies like{' '}
                  <strong style={{ color: 'var(--text)' }}>HTML, CSS, JavaScript, C#, Python and MySQL</strong>. I also have experience with game development using{' '}
                  <strong style={{ color: 'var(--text)' }}>Unity</strong> and proficiency in office tools like{' '}
                  <strong style={{ color: 'var(--text)' }}>Excel</strong>.
                </p>
                <p>
                  I'm looking for opportunities to show my potential and grow professionally. Every line of code is a chance to create something new.
                </p>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-0.5 mt-12">
            {STATS.map((s) => (
              <div
                key={s.num}
                className="stat-box border p-6"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div
                  className="text-[36px] font-bold leading-none mb-1 tracking-tight"
                  style={{ color: 'var(--green)' }}
                >
                  {s.num}
                </div>
                <div
                  className="font-mono text-[11px] tracking-[0.08em] uppercase"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {lang === 'pt' ? s.labelPt : s.labelEn}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — terminal */}
        <div
          className="reveal reveal-delay-2 border rounded-lg overflow-hidden"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {/* Terminal bar */}
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

          {/* Terminal body */}
          <div className="p-6 font-mono text-[13px] leading-[1.8] space-y-0">
            <div className="flex gap-3">
              <span style={{ color: 'var(--green)' }}>$</span>
              <span style={{ color: 'var(--cyan)' }}>cat profile.json</span>
            </div>
            <div className="mt-3" style={{ color: 'var(--border-bright)' }}>{'{'}</div>

            {[
              { key: 'name',     val: '"Kaio Henrique"' },
              { key: 'role',     val: lang === 'pt' ? '"Desenvolvedor Web"' : '"Web Developer"' },
              { key: 'since',    val: '2023',           noQuotes: true },
              { key: 'location', val: '"Brasil 🇧🇷"' },
            ].map((row, i) => (
              <div key={row.key} className="pl-6 flex gap-0">
                <span style={{ color: 'var(--green)' }}>"{row.key}"</span>
                <span style={{ color: 'var(--text-dim)' }}>: </span>
                <span style={{ color: 'var(--text)' }}>{row.val}</span>
                {i < 3 && <span style={{ color: 'var(--text-dim)' }}>,</span>}
              </div>
            ))}

            <div className="pl-6 flex gap-0">
              <span style={{ color: 'var(--green)' }}>"status"</span>
              <span style={{ color: 'var(--text-dim)' }}>: </span>
              <span style={{ color: '#28c840' }}>"open to work"</span>
              <span style={{ color: 'var(--text-dim)' }}>,</span>
            </div>

            <div className="pl-6">
              <span style={{ color: 'var(--green)' }}>"skills"</span>
              <span style={{ color: 'var(--text-dim)' }}>: </span>
              <span style={{ color: 'var(--border-bright)' }}>{'['}</span>
            </div>
            <div className="pl-12">
              <span style={{ color: 'var(--text)' }}>"HTML"</span>
              <span style={{ color: 'var(--text-dim)' }}>, </span>
              <span style={{ color: 'var(--text)' }}>"CSS"</span>
              <span style={{ color: 'var(--text-dim)' }}>, </span>
              <span style={{ color: 'var(--text)' }}>"JS"</span>
              <span style={{ color: 'var(--text-dim)' }}>,</span>
            </div>
            <div className="pl-12">
              <span style={{ color: 'var(--text)' }}>"C#"</span>
              <span style={{ color: 'var(--text-dim)' }}>, </span>
              <span style={{ color: 'var(--text)' }}>"Python"</span>
              <span style={{ color: 'var(--text-dim)' }}>, </span>
              <span style={{ color: 'var(--text)' }}>"MySQL"</span>
            </div>
            <div className="pl-6" style={{ color: 'var(--border-bright)' }}>{']'}</div>
            <div style={{ color: 'var(--border-bright)' }}>{'}'}</div>

            <div className="mt-3 pl-6 text-[12px]" style={{ color: 'var(--text-dim)' }}>
              # {t('disponível para novas oportunidades', 'available for new opportunities')}
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
