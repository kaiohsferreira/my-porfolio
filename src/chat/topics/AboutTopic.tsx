import { useLanguage } from '@/context/LanguageContext'
import { usePortfolioContent } from '@/context/PortfolioContentContext'
import { TypewriterText } from '@/components/ui/TypewriterText'

/** Biografia digitada, seguida dos números do perfil. */
export function AboutTopic() {
  const { lang, t } = useLanguage()
  const { profile } = usePortfolioContent()
  const biography = lang === 'pt' ? profile.bioPt : profile.bioEn || profile.bioPt

  return (
    <div className="topic topic-about">
      {biography ? (
        <TypewriterText className="topic-about-bio" text={biography} />
      ) : (
        <p className="topic-about-bio">{t('Minha biografia ainda está sendo escrita.', 'My bio is still being written.')}</p>
      )}

      {profile.stats.length ? (
        <div className="topic-stats">
          {profile.stats.map((stat) => (
            <div key={stat.id} className="topic-stat">
              <strong>{stat.value}</strong>
              <span>{lang === 'pt' ? stat.labelPt : stat.labelEn || stat.labelPt}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
