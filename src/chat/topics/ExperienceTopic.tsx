import { useLanguage } from '@/context/LanguageContext'
import { usePortfolioContent } from '@/context/PortfolioContentContext'

/**
 * O período chega como texto livre do painel ("2025 - Atual"), então a única forma de achar o
 * cargo em curso é procurar a palavra. Não achar só tira o destaque.
 */
const CURRENT_PERIOD = /\b(atual|atualmente|presente|present|current|hoje|now)\b/i

/**
 * Linha do tempo compacta. A linha se desenha de cima para baixo e cada cargo entra em
 * sequência, na ordem de sortOrder definida no painel.
 */
export function ExperienceTopic() {
  const { t } = useLanguage()
  const { experiences } = usePortfolioContent()

  if (!experiences.length) return null

  return (
    <ol className="topic topic-exp">
      {experiences.map((experience, index) => {
        const current = Boolean(experience.period && CURRENT_PERIOD.test(experience.period))

        return (
          <li
            key={experience.id}
            className={current ? 'topic-exp-item is-current' : 'topic-exp-item'}
            style={{ animationDelay: `${0.15 + index * 0.18}s` }}
          >
            <span className="topic-exp-dot" aria-hidden="true" />
            <div className="topic-exp-head">
              <span className="topic-exp-period">{experience.period || '—'}</span>
              {current ? <span className="topic-exp-badge">{t('atual', 'current')}</span> : null}
            </div>
            <h4>{experience.role}</h4>
            <span className="topic-exp-company">{experience.company}</span>
            {experience.description ? <p>{experience.description}</p> : null}
          </li>
        )
      })}
    </ol>
  )
}
