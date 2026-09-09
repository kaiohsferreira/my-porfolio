import { useLanguage } from '@/context/LanguageContext'
import { usePortfolioContent } from '@/context/PortfolioContentContext'
import { SectionHeader } from '@/components/ui/SectionHeader'

/**
 * O período chega como texto livre do painel ("2025 - Atual", "2023 - 2025"), então a única
 * forma de saber qual cargo está em curso é procurar a palavra. Não achar não quebra nada: o
 * item apenas não recebe o destaque.
 */
const CURRENT_PERIOD = /\b(atual|atualmente|presente|present|current|hoje|now)\b/i

/**
 * Linha do tempo profissional, alimentada pelo que está cadastrado no painel.
 *
 * A ordem é a do campo sortOrder, ou seja, a curadoria feita no admin — não a data, que chega
 * como texto livre e não dá para ordenar com segurança.
 *
 * Sem cadastro, a seção inteira desaparece: não existe lista estática de reserva aqui, porque
 * experiência é dado biográfico e inventar uma seria pior do que não mostrar nada.
 */
export function Experience() {
  const { t } = useLanguage()
  const { experiences } = usePortfolioContent()

  if (!experiences.length) return null

  return (
    <section
      id="experience"
      className="border-t"
      style={{ padding: '140px 48px', background: 'var(--bg)', borderColor: 'var(--border)' }}
    >
      <SectionHeader num="03" title={t('Experiência', 'Experience')} />

      <ol className="exp-list">
        {experiences.map((experience, index) => {
          const isCurrent = Boolean(experience.period && CURRENT_PERIOD.test(experience.period))

          return (
            <li
              key={experience.id}
              className="exp-item reveal"
              // Escalonamento curto: quando dois cargos entram na tela juntos eles aparecem em
              // sequência; quando entram separados, o atraso é imperceptível.
              style={{ transitionDelay: `${Math.min(index, 4) * 0.08}s` }}
            >
              <div className="exp-period">{experience.period || '—'}</div>

              <div className="exp-rail" aria-hidden="true">
                <span className="exp-rail-line" />
                <span className={isCurrent ? 'exp-marker exp-marker-current' : 'exp-marker'} />
              </div>

              <div className="exp-card">
                <span className="exp-index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>

                {isCurrent ? (
                  <div className="exp-badge">
                    <span aria-hidden="true" />
                    {t('Cargo atual', 'Current role')}
                  </div>
                ) : null}

                <h3 className="exp-role">{experience.role}</h3>
                <span className="exp-company">{experience.company}</span>

                {experience.description ? <p className="exp-desc">{experience.description}</p> : null}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
