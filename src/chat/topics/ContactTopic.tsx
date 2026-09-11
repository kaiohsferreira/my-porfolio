import { useState, type FormEvent } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { usePortfolioContent } from '@/context/PortfolioContentContext'
import { sendPublicContactMessage } from '@/lib/portfolio-api'

const EMPTY_FORM = { name: '', email: '', message: '' }

/** Formulário de contato dentro da conversa, com os links sociais cadastrados no painel. */
export function ContactTopic() {
  const { t } = useLanguage()
  const { profile, portfolioUrl } = usePortfolioContent()
  const [form, setForm] = useState(EMPTY_FORM)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  function update(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    if (error) setError('')
    if (sent) setSent(false)
  }

  async function submit(event: FormEvent) {
    event.preventDefault()

    const name = form.name.trim()
    const email = form.email.trim()
    const message = form.message.trim()

    if (!name || !email || !message) {
      setError(t('Preencha nome, email e mensagem.', 'Please fill in name, email and message.'))
      return
    }

    try {
      setSending(true)
      setError('')
      await sendPublicContactMessage({ senderName: name, senderEmail: email, body: message }, portfolioUrl)
      setSent(true)
      setForm(EMPTY_FORM)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : t('Não foi possível enviar agora. Tente de novo em instantes.', 'Could not send right now. Try again shortly.'),
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="topic topic-contact">
      <form className="topic-form" onSubmit={(event) => void submit(event)} noValidate>
        <label>
          <span>{t('Seu nome', 'Your name')}</span>
          <input
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            autoComplete="name"
            placeholder={t('Maria Silva', 'Jane Doe')}
          />
        </label>
        <label>
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            autoComplete="email"
            placeholder="maria@empresa.com"
          />
        </label>
        <label className="topic-form-full">
          <span>{t('Mensagem', 'Message')}</span>
          <textarea
            rows={4}
            value={form.message}
            onChange={(event) => update('message', event.target.value)}
            placeholder={t('Conte um pouco sobre a oportunidade ou o projeto.', 'Tell me a bit about the opportunity or project.')}
          />
        </label>

        {error ? (
          <p className="topic-form-note is-error topic-form-full" role="alert">
            {error}
          </p>
        ) : null}
        {sent ? (
          <p className="topic-form-note is-ok topic-form-full" role="status">
            {t('Mensagem enviada! Respondo assim que puder.', 'Message sent! I will reply as soon as I can.')}
          </p>
        ) : null}

        <div className="topic-form-full topic-form-actions">
          <button type="submit" className="chat-btn chat-btn-primary" disabled={sending}>
            {sending ? t('Enviando…', 'Sending…') : t('Enviar mensagem', 'Send message')}
          </button>
        </div>
      </form>

      {/* O currículo aparece aqui também porque, no celular, o botão do cabeçalho some por
          falta de espaço — e quem visita pelo telefone não pode ficar sem ele. */}
      {profile.socialLinks.length || profile.resumeFileUrl ? (
        <ul className="topic-links">
          {profile.resumeFileUrl ? (
            <li>
              <a href={profile.resumeFileUrl} target="_blank" rel="noopener noreferrer">
                {t('Currículo', 'Resume')} ↗
              </a>
            </li>
          ) : null}
          {profile.socialLinks.map((link) => (
            <li key={`${link.platform}-${link.url}`}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.label || link.platform} ↗
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
