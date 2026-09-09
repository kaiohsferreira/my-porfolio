import { useLanguage } from '@/context/LanguageContext'
import { usePortfolioContent } from '@/context/PortfolioContentContext'
import { SectionHeader } from '@/components/ui/SectionHeader'

/**
 * Linha do tempo profissional, alimentada pelo que está cadastrado no painel.
 *
 * A ordem é a do campo sortOrder, ou seja, a curadoria feita no admin — não a data, que chega
 * como texto livre ("2023 - 2025", "2025 - Atual") e não dá para ordenar com segurança.
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

      <div className="reveal" style={{ maxWidth: 900 }}>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {experiences.map((experience, index) => {
            const last = index === experiences.length - 1

            return (
              <li
                key={experience.id}
                style={{
                  position: 'relative',
                  paddingLeft: 34,
                  paddingBottom: last ? 0 : 44,
                }}
              >
                {/* Traço vertical ligando os cargos. O último não continua para lugar nenhum. */}
                {last ? null : (
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: 5,
                      top: 18,
                      bottom: 0,
                      width: 1,
                      background: 'var(--border-bright)',
                    }}
                  />
                )}

                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 7,
                    width: 11,
                    height: 11,
                    borderRadius: '50%',
                    border: '1px solid var(--green)',
                    background: 'var(--bg)',
                  }}
                />

                {experience.period ? (
                  <span
                    className="font-mono"
                    style={{
                      display: 'block',
                      fontSize: 11,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'var(--green)',
                      marginBottom: 8,
                    }}
                  >
                    {experience.period}
                  </span>
                ) : null}

                <h3
                  style={{
                    fontSize: 'clamp(17px,2vw,21px)',
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                    color: 'var(--text)',
                    margin: 0,
                  }}
                >
                  {experience.role}
                </h3>

                <span
                  className="font-mono"
                  style={{ display: 'block', fontSize: 13, color: 'var(--cyan)', marginTop: 4 }}
                >
                  {experience.company}
                </span>

                {experience.description ? (
                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: 1.75,
                      color: 'var(--text-muted)',
                      marginTop: 12,
                      maxWidth: '68ch',
                    }}
                  >
                    {experience.description}
                  </p>
                ) : null}
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
