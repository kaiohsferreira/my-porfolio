import { useLanguage } from '@/context/LanguageContext'
import { usePortfolioContent } from '@/context/PortfolioContentContext'
import { TypewriterText } from '@/components/ui/TypewriterText'
import { getSkillInitials } from '@/lib/skill-icons'

/**
 * Foto, biografia digitada e os números do perfil.
 *
 * `reached` remonta a máquina de escrever quando a câmera chega neste cartão: sem isso a
 * digitação já teria acontecido lá atrás, com o cartão ainda distante e apagado no fundo.
 */
export function AboutTopic({ reached = true }: { reached?: boolean }) {
  const { lang, t } = useLanguage()
  const { profile } = usePortfolioContent()
  const biography = lang === 'pt' ? profile.bioPt : profile.bioEn || profile.bioPt

  return (
    <div className="topic topic-about">
      {profile.profileImageUrl ? (
        <img className="topic-about-photo" src={profile.profileImageUrl} alt={profile.fullName} width={180} height={225} />
      ) : (
        <span className="topic-about-photo topic-about-initials" aria-hidden="true">
          {getSkillInitials(profile.fullName)}
        </span>
      )}

      <div className="topic-about-text">
        {biography ? (
          <TypewriterText key={reached ? 'on' : 'off'} className="topic-about-bio" text={biography} />
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
    </div>
  )
}
