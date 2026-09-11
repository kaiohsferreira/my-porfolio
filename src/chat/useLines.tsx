import type { ReactNode } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { usePortfolioContent } from '@/context/PortfolioContentContext'
import type { LineId, TopicId } from './useConversation'

/** Rótulo curto de cada assunto, usado nos botões de resposta rápida. */
export function useTopicLabels(): Record<TopicId, string> {
  const { t } = useLanguage()

  return {
    about: t('Sobre mim', 'About me'),
    skills: t('Skills', 'Skills'),
    experience: t('Experiência', 'Experience'),
    projects: t('Projetos', 'Projects'),
    contact: t('Contato', 'Contact'),
  }
}

/**
 * Resolve a fala na hora de desenhar, a partir do idioma e do perfil atuais. Nada é fixado no
 * momento em que a mensagem nasce, então trocar para inglês reescreve a conversa inteira.
 */
export function useLines() {
  const { t } = useLanguage()
  const { profile, experiences, projects, skills } = usePortfolioContent()

  const firstName = profile.fullName.trim().split(/\s+/)[0] || 'Kaio'
  const headline = t(profile.headline || 'Desenvolvedor Full Stack', profile.headlineEn || profile.headline || 'Full Stack Developer')

  return function line(id: LineId): ReactNode {
    switch (id) {
      case 'hello':
        return (
          <>
            {t('Oi! Eu sou o', "Hi! I'm")} <strong>{profile.fullName}</strong> 👋
          </>
        )

      case 'intro': {
        // O lugar chega do painel como texto livre, e em português a preposição depende dele
        // ("no Brasil", "em Belo Horizonte", "na Bahia"). Em vez de errar a gramática, o lugar
        // entra sem preposição, marcado pelo alfinete.
        const { location, sinceYear } = profile
        const since = sinceYear ? t(`construindo sistemas desde ${sinceYear}`, `building systems since ${sinceYear}`) : ''

        let tail = ''
        if (location && since) tail = ` 📍 ${location} · ${since}.`
        else if (location) tail = ` 📍 ${location}.`
        else if (since) tail = ` ${since.charAt(0).toUpperCase()}${since.slice(1)}.`

        return `${headline}.${tail}`
      }

      case 'ask':
        return t('Por onde você quer começar?', 'Where would you like to start?')

      case 'more':
        return t('Quer ver mais alguma coisa?', 'Anything else you would like to see?')

      case 'done':
        return t(
          `Isso é tudo por enquanto. Obrigado pela visita — se quiser conversar de verdade, é só me chamar. 🙂`,
          `That is everything for now. Thanks for stopping by — if you want to talk for real, just reach out. 🙂`,
        )

      case 'visitor-all':
        return t('Me mostra tudo de uma vez', 'Show me everything at once')

      case 'visitor-restart':
        return t('Vamos recomeçar', "Let's start over")

      case 'visitor-about':
        return t(`Quero te conhecer melhor, ${firstName}`, `I'd like to know you better, ${firstName}`)
      case 'visitor-skills':
        return t('Com o que você trabalha?', 'What do you work with?')
      case 'visitor-experience':
        return t('Onde você já trabalhou?', 'Where have you worked?')
      case 'visitor-projects':
        return t('Me mostra seus projetos', 'Show me your projects')
      case 'visitor-contact':
        return t('Como falo com você?', 'How can I reach you?')

      case 'lead-about':
        return t('Claro! Um pouco sobre mim:', 'Sure! A little about me:')
      case 'lead-skills':
        return t(
          `Estas são as ${skills.length} tecnologias com que trabalho. Passe o mouse para ver meu nível em cada uma — e pode arrastar para os lados.`,
          `These are the ${skills.length} technologies I work with. Hover to see my level in each — and feel free to drag sideways.`,
        )
      case 'lead-experience':
        return experiences.length
          ? t('Esta é a minha trajetória até aqui:', 'This is my journey so far:')
          : t('Minha trajetória ainda está sendo escrita por aqui.', 'My journey is still being written here.')
      case 'lead-projects':
        return projects.length
          ? t(
              'Aqui estão alguns projetos. Dá para abrir cada um sem sair da conversa.',
              'Here are some projects. You can open each one without leaving the conversation.',
            )
          : t('Os projetos estão chegando em breve.', 'Projects are coming soon.')
      case 'lead-contact':
        return t('Pode me escrever por aqui mesmo, ou pelos links abaixo:', 'You can write to me right here, or through the links below:')

      default:
        return null
    }
  }
}
