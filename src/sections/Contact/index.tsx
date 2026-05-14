import { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { usePortfolioContent } from '@/context/PortfolioContentContext'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { sendPublicContactMessage } from '@/lib/portfolio-api'

const GithubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.4.6.1.82-.26.82-.58v-2c-3.34.72-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
)

const LinkedinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.25 2.36 4.25 5.43v6.31zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46C23.21 24 24 23.23 24 22.27V1.73C24 .77 23.21 0 22.23 0z" />
  </svg>
)

function getSocialIcon(name: string) {
  const key = name.toLowerCase()

  if (key.includes('github')) return <GithubIcon />
  if (key.includes('linkedin')) return <LinkedinIcon />
  if (key.includes('email') || key.includes('mail')) return 'mail'
  if (key.includes('whatsapp')) return 'wa'

  return 'link'
}

export function Contact() {
  const { t } = useLanguage()
  const { profile, portfolioUrl } = usePortfolioContent()
  const [form, setForm] = useState({ fname: '', lname: '', email: '', msg: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      setLoading(false)
      setError('')
      setSubmitted(false)

      const senderName = [form.fname.trim(), form.lname.trim()].filter(Boolean).join(' ').trim()
      if (!senderName) {
        setError(t('Informe nome e sobrenome.', 'Please enter first and last name.'))
        return
      }

      setLoading(true)
      await sendPublicContactMessage(
        {
          senderName,
          senderEmail: form.email.trim(),
          body: form.msg.trim(),
        },
        portfolioUrl,
      )

      setSubmitted(true)
      setForm({ fname: '', lname: '', email: '', msg: '' })
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : t('Nao foi possivel enviar a mensagem agora.', 'Could not send the message right now.'),
      )
    } finally {
      setLoading(false)
    }
  }

  const contactLinks = profile.socialLinks.length
    ? profile.socialLinks.map((link) => ({
        href: link.url,
        icon: getSocialIcon(link.icon || link.platform),
        label: link.label || link.platform,
        target: '_blank',
      }))
    : [
        { href: 'https://github.com/', icon: <GithubIcon />, label: 'GitHub', target: '_blank' },
        { href: 'https://linkedin.com/', icon: <LinkedinIcon />, label: 'LinkedIn', target: '_blank' },
      ]

  return (
    <section
      id="contact"
      className="border-t relative overflow-hidden"
      style={{ padding: '140px 48px', borderColor: 'var(--border)' }}
    >
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
        <div className="reveal">
          <h2
            className="font-bold tracking-[-0.03em] leading-none mb-6"
            style={{ fontSize: 'clamp(36px,5vw,64px)', color: 'var(--text)' }}
          >
            {t('Vamos', "Let's")}
            <br />
            <span style={{ color: 'var(--green)' }}>{t('trabalhar juntos', 'work together')}</span>
          </h2>
          <p
            className="font-mono text-[14px] leading-[1.7] mb-10"
            style={{ color: 'var(--text-muted)' }}
          >
            {t(
              'Aberto a oportunidades, freelas e colaboracoes.\nMe manda uma mensagem!',
              'Open to opportunities, freelance work and collaborations.\nSend me a message!',
            )
              .split('\n')
              .map((line, index) => (
                <span key={line}>
                  {line}
                  {index === 0 ? <br /> : null}
                </span>
              ))}
          </p>

          <div className="flex flex-col gap-3">
            {contactLinks.map((link) => (
              <a
                key={`${link.href}-${link.label}`}
                href={link.href}
                target={link.target}
                rel={link.target ? 'noopener noreferrer' : undefined}
                className="contact-link-item flex items-center gap-4 font-mono text-[13px] no-underline border p-4"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                <div
                  className="contact-link-icon-box w-8 h-8 border flex items-center justify-center text-[14px] transition-colors duration-200"
                  style={{ borderColor: 'var(--border)' }}
                >
                  {link.icon}
                </div>
                <span>{link.label}</span>
              </a>
            ))}

            {profile.resumeFileUrl ? (
              <a
                href={profile.resumeFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link-item contact-link-cta flex items-center gap-4 font-mono text-[13px] font-medium tracking-[0.08em] no-underline border p-4 mt-2 transition-all duration-200"
                style={{ background: 'var(--green)', borderColor: 'var(--green)', color: 'var(--bg)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--cyan)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--green)'
                }}
              >
                <span>cv</span>
                <span>{t('Baixar Curriculo', 'Download Resume')}</span>
              </a>
            ) : null}
          </div>
        </div>

        <div className="reveal reveal-delay-2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'fname', label: t('Nome', 'First Name'), type: 'text' },
                { id: 'lname', label: t('Sobrenome', 'Last Name'), type: 'text' },
              ].map((field) => (
                <div key={field.id} className="flex flex-col gap-1.5">
                  <label className="font-mono text-[11px] tracking-[0.1em] uppercase" style={{ color: 'var(--text-muted)' }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    className="form-input-field"
                    value={form[field.id as keyof typeof form]}
                    onChange={(event) => setForm((current) => ({ ...current, [field.id]: event.target.value }))}
                    required
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[11px] tracking-[0.1em] uppercase" style={{ color: 'var(--text-muted)' }}>
                Email
              </label>
              <input
                type="email"
                className="form-input-field"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
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
                onChange={(event) => setForm((current) => ({ ...current, msg: event.target.value }))}
                required
              />
            </div>

            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-[10px]" style={{ color: 'var(--text-dim)' }}>
                {t('Todos os campos sao obrigatorios', 'All fields are required')}
              </span>
              <button
                type="submit"
                disabled={loading}
                className="clip-chip font-mono text-[12px] font-medium tracking-[0.08em] px-5 py-3 border-none transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60"
                style={{ background: 'var(--green)', color: 'var(--bg)', cursor: 'pointer' }}
                onMouseEnter={(event) => {
                  if (!event.currentTarget.disabled) event.currentTarget.style.background = 'var(--cyan)'
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = 'var(--green)'
                }}
              >
                {loading ? '...' : t('Enviar ->', 'Send ->')}
              </button>
            </div>

            {error ? (
              <div
                className="font-mono text-[12px] p-3 border mt-1"
                style={{ color: 'oklch(65% 0.22 25)', borderColor: 'oklch(65% 0.22 25 / 0.55)', background: 'oklch(65% 0.22 25 / 0.12)' }}
              >
                {error}
              </div>
            ) : null}

            {submitted ? (
              <div
                className="font-mono text-[12px] p-3 border mt-1"
                style={{ color: 'var(--green)', borderColor: 'var(--green)', background: 'var(--green-glow)' }}
              >
                {t('Mensagem enviada! Retornarei em breve.', "Message sent! I'll get back to you soon.")}
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  )
}
