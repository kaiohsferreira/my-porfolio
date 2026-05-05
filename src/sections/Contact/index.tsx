import { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { SectionHeader } from '@/components/ui/SectionHeader'

const GithubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.4.6.1.82-.26.82-.58v-2c-3.34.72-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
)

const LinkedinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.25 2.36 4.25 5.43v6.31zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46C23.21 24 24 23.23 24 22.27V1.73C24 .77 23.21 0 22.23 0z"/>
  </svg>
)

export function Contact() {
  const { t } = useLanguage()
  const [form, setForm] = useState({ fname: '', lname: '', email: '', msg: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); setSubmitted(true) }, 1000)
  }

  const contactLinks = [
    { href: 'mailto:santferreira.kaio@gmail.com', icon: '✉', label: 'santferreira.kaio@gmail.com' },
    { href: 'https://github.com/', icon: <GithubIcon />, label: 'GitHub', target: '_blank' },
    { href: 'https://linkedin.com/', icon: <LinkedinIcon />, label: 'LinkedIn', target: '_blank' },
  ]

  return (
    <section
      id="contact"
      className="border-t relative overflow-hidden"
      style={{ padding: '140px 48px', borderColor: 'var(--border)' }}
    >
      {/* Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: 600, height: 600, background: 'radial-gradient(circle, oklch(72% 0.25 160 / 0.04) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <SectionHeader num="04" title={t('Contato', 'Contact')} />

      <div
        className="contact-grid-cols relative z-10 grid gap-20"
        style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}
      >
        {/* Left */}
        <div className="reveal">
          <h2
            className="font-bold tracking-[-0.03em] leading-none mb-6"
            style={{ fontSize: 'clamp(36px,5vw,64px)', color: 'var(--text)' }}
          >
            {t('Vamos', "Let's")}<br />
            <span style={{ color: 'var(--green)' }}>{t('trabalhar juntos', 'work together')}</span>
          </h2>
          <p
            className="font-mono text-[14px] leading-[1.7] mb-10"
            style={{ color: 'var(--text-muted)' }}
          >
            {t(
              'Aberto a oportunidades, freelas e colaborações.\nMe manda uma mensagem!',
              'Open to opportunities, freelance and collaborations.\nSend me a message!'
            ).split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
          </p>

          <div className="flex flex-col gap-3">
            {contactLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.target}
                rel={l.target ? 'noopener noreferrer' : undefined}
                className="contact-link-item flex items-center gap-4 font-mono text-[13px] no-underline border p-4"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                <div
                  className="contact-link-icon-box w-8 h-8 border flex items-center justify-center text-[14px] transition-colors duration-200"
                  style={{ borderColor: 'var(--border)' }}
                >
                  {l.icon}
                </div>
                <span>{l.label}</span>
              </a>
            ))}

            {/* CV download */}
            <a
              href="#"
              className="contact-link-item flex items-center gap-4 font-mono text-[13px] font-medium tracking-[0.08em] no-underline border p-4 mt-2 transition-all duration-200"
              style={{ background: 'var(--green)', borderColor: 'var(--green)', color: 'var(--bg)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--cyan)'; e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.boxShadow = '0 8px 32px oklch(72% 0.25 220 / 0.3)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--green)'; e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <span>⬇</span>
              <span>{t('Baixar Currículo', 'Download Resume')}</span>
            </a>
          </div>
        </div>

        {/* Right — form */}
        <div className="reveal reveal-delay-2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'fname', label: t('Nome', 'First Name'), type: 'text' },
                { id: 'lname', label: t('Sobrenome', 'Last Name'), type: 'text' },
              ].map((f) => (
                <div key={f.id} className="flex flex-col gap-1.5">
                  <label className="font-mono text-[11px] tracking-[0.1em] uppercase" style={{ color: 'var(--text-muted)' }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    className="form-input-field"
                    value={form[f.id as keyof typeof form]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.id]: e.target.value }))}
                    required
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[11px] tracking-[0.1em] uppercase" style={{ color: 'var(--text-muted)' }}>Email</label>
              <input
                type="email"
                className="form-input-field"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[11px] tracking-[0.1em] uppercase" style={{ color: 'var(--text-muted)' }}>
                {t('Mensagem', 'Message')}
              </label>
              <textarea
                className="form-input-field resize-none"
                rows={5}
                value={form.msg}
                onChange={(e) => setForm((p) => ({ ...p, msg: e.target.value }))}
                required
              />
            </div>

            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-[10px]" style={{ color: 'var(--text-dim)' }}>
                {t('Todos os campos são obrigatórios', 'All fields are required')}
              </span>
              <button
                type="submit"
                disabled={loading}
                className="clip-chip font-mono text-[13px] font-medium tracking-[0.08em] px-7 py-[14px] border-none transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60"
                style={{ background: 'var(--green)', color: 'var(--bg)', cursor: 'pointer' }}
                onMouseEnter={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = 'var(--cyan)' } }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--green)' }}
              >
                {loading ? '...' : t('Enviar →', 'Send →')}
              </button>
            </div>

            {submitted && (
              <div
                className="font-mono text-[12px] p-3 border mt-1"
                style={{ color: 'var(--green)', borderColor: 'var(--green)', background: 'var(--green-glow)' }}
              >
                {t('✓ Mensagem enviada! Retornarei em breve.', "✓ Message sent! I'll get back to you soon.")}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
