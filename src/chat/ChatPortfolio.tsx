import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { usePortfolioContent } from '@/context/PortfolioContentContext'
import { getSkillInitials } from '@/lib/skill-icons'
import { TOPICS, useConversation, type ChatMessage, type Step, type TopicId } from './useConversation'
import { useLines, useTopicLabels } from './useLines'
import { AboutTopic } from './topics/AboutTopic'
import { SkillsTopic } from './topics/SkillsTopic'
import { ExperienceTopic } from './topics/ExperienceTopic'
import { ProjectsTopic } from './topics/ProjectsTopic'
import { ContactTopic } from './topics/ContactTopic'
import './chat.css'

const TOPIC_VIEWS: Record<TopicId, () => ReactNode> = {
  about: () => <AboutTopic />,
  skills: () => <SkillsTopic />,
  experience: () => <ExperienceTopic />,
  projects: () => <ProjectsTopic />,
  contact: () => <ContactTopic />,
}

const OPENING: Step[] = [
  { kind: 'say', line: 'hello', weight: 30 },
  { kind: 'say', line: 'intro', weight: 70 },
  { kind: 'say', line: 'ask', weight: 25 },
]

function Avatar({ name, imageUrl, size }: { name: string; imageUrl: string | null; size: number }) {
  return imageUrl ? (
    <img className="chat-avatar" src={imageUrl} alt="" width={size} height={size} style={{ width: size, height: size }} />
  ) : (
    <span className="chat-avatar chat-avatar-initials" aria-hidden="true" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {getSkillInitials(name)}
    </span>
  )
}

/**
 * O portfólio como uma conversa.
 *
 * Tudo que antes eram seções vira resposta: o visitante escolhe um assunto, a pergunta aparece
 * do lado dele, o Kaio "digita" e responde com o conteúdo cadastrado no painel. Para quem só
 * quer ler — recrutador, na maioria das vezes — o atalho "me mostra tudo" despeja o restante
 * de uma vez, em ritmo acelerado.
 */
export function ChatPortfolio() {
  const { lang, setLang, t } = useLanguage()
  const { profile, experiences, projects } = usePortfolioContent()
  const { messages, typing, busy, run, reset, isRunning } = useConversation()
  const line = useLines()
  const labels = useTopicLabels()
  const [visited, setVisited] = useState<Set<TopicId>>(() => new Set())
  const headerRef = useRef<HTMLElement>(null)
  const dockRef = useRef<HTMLDivElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const started = useRef(false)
  /** Verdadeiro logo depois de um clique do visitante: aí a conversa sempre acompanha. */
  const followRef = useRef(true)

  // A paleta da conversa vive no body enquanto ela está montada. Assim os componentes
  // reaproveitados e o modal de prévia (que abre por portal, fora desta árvore) herdam as
  // cores novas, e o painel admin, que usa as mesmas variáveis, continua intocado.
  useLayoutEffect(() => {
    document.body.classList.add('chat-mode')
    return () => document.body.classList.remove('chat-mode')
  }, [])

  useEffect(() => {
    if (started.current) return
    started.current = true
    void run(OPENING)
  }, [run])

  /** Assuntos sem conteúdo cadastrado não viram cartão vazio: fica só a fala que explica. */
  const hasContent = useCallback(
    (topic: TopicId) => {
      if (topic === 'experience') return experiences.length > 0
      if (topic === 'projects') return projects.length > 0
      return true
    },
    [experiences.length, projects.length],
  )

  const stepsFor = useCallback(
    (topic: TopicId): Step[] => {
      const steps: Step[] = [{ kind: 'say', line: `lead-${topic}`, weight: 50 }]
      if (hasContent(topic)) steps.push({ kind: 'show', topic })
      return steps
    },
    [hasContent],
  )

  const remaining = TOPICS.filter((topic) => !visited.has(topic))

  function choose(topic: TopicId) {
    if (busy || isRunning()) return

    const next = new Set(visited).add(topic)
    setVisited(next)
    followRef.current = true

    const left = TOPICS.filter((item) => !next.has(item)).length
    void run([
      { kind: 'visitor', line: `visitor-${topic}` },
      ...stepsFor(topic),
      { kind: 'say', line: left ? 'more' : 'done', weight: left ? 25 : 60 },
    ])
  }

  function showAll() {
    if (busy || isRunning()) return

    const pending = remaining
    setVisited(new Set(TOPICS))
    followRef.current = true

    void run(
      [
        { kind: 'visitor', line: 'visitor-all' },
        ...pending.flatMap((topic) => stepsFor(topic)),
        { kind: 'say', line: 'done', weight: 60 },
      ],
      { fast: true },
    )
  }

  function restart() {
    if (busy || isRunning()) return
    reset()
    setVisited(new Set())
    window.scrollTo({ top: 0, behavior: 'smooth' })
    void run(OPENING, { fast: true })
  }

  /**
   * Acompanha a conversa sem arrancar o visitante de onde ele está lendo.
   *
   * Só rola para frente, e só se ele estiver perto do fim ou tiver acabado de clicar numa
   * resposta. Mensagem curta sobe até ficar logo acima das respostas rápidas; cartão comprido
   * (projetos, experiência) mostra o próprio começo, senão a rolagem pularia o conteúdo.
   */
  useEffect(() => {
    const log = logRef.current
    if (!log) return

    const last = log.lastElementChild as HTMLElement | null
    if (!last) return

    const headerHeight = headerRef.current?.offsetHeight ?? 0
    const dockHeight = dockRef.current?.offsetHeight ?? 0
    const nearEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 320

    if (!followRef.current && !nearEnd) return

    const rect = last.getBoundingClientRect()
    const viewBottom = window.innerHeight - dockHeight
    const available = viewBottom - headerHeight - 32

    const target =
      rect.height > available
        ? window.scrollY + rect.top - headerHeight - 16
        : window.scrollY + rect.bottom - viewBottom + 20

    if (target > window.scrollY + 4) window.scrollTo({ top: target, behavior: 'smooth' })
  }, [messages.length, typing])

  useEffect(() => {
    if (!busy) followRef.current = false
  }, [busy])

  const renderMessage = (message: ChatMessage, index: number) => {
    const previous = messages[index - 1]
    const firstOfGroup = !previous || previous.author !== message.author

    if (message.author === 'visitor') {
      return (
        <div key={message.id} className="chat-row chat-row-visitor">
          <div className="chat-bubble chat-bubble-visitor">{message.line ? line(message.line) : null}</div>
        </div>
      )
    }

    return (
      <div key={message.id} className={message.topic ? 'chat-row chat-row-kaio chat-row-topic' : 'chat-row chat-row-kaio'}>
        <span className="chat-row-avatar">
          {firstOfGroup ? <Avatar name={profile.fullName} imageUrl={profile.profileImageUrl} size={30} /> : null}
        </span>
        {message.topic ? (
          <div className="chat-card">{TOPIC_VIEWS[message.topic]()}</div>
        ) : (
          <div className="chat-bubble chat-bubble-kaio">{message.line ? line(message.line) : null}</div>
        )}
      </div>
    )
  }

  const finished = remaining.length === 0 && !busy

  return (
    <div className="chat-app">
      <header ref={headerRef} className="chat-head">
        <div className="chat-head-id">
          <Avatar name={profile.fullName} imageUrl={profile.profileImageUrl} size={40} />
          <div>
            <h1>{profile.fullName}</h1>
            <p>
              <span className="chat-status-dot" aria-hidden="true" />
              {profile.availableForWork
                ? t('Disponível para novas oportunidades', 'Open to new opportunities')
                : t('Online', 'Online')}
            </p>
          </div>
        </div>

        <div className="chat-head-actions">
          {profile.resumeFileUrl ? (
            <a className="chat-btn" href={profile.resumeFileUrl} target="_blank" rel="noopener noreferrer">
              {t('Currículo', 'Resume')} ↗
            </a>
          ) : null}
          <div className="chat-lang" role="group" aria-label={t('Idioma', 'Language')}>
            {(['pt', 'en'] as const).map((code) => (
              <button
                key={code}
                type="button"
                aria-pressed={lang === code}
                className={lang === code ? 'is-on' : undefined}
                onClick={() => setLang(code)}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="chat-main">
        <div ref={logRef} className="chat-log" role="log" aria-live="polite" aria-label={t('Conversa', 'Conversation')}>
          {messages.map(renderMessage)}
          {typing ? (
            <div className="chat-row chat-row-kaio">
              <span className="chat-row-avatar">
                {messages.at(-1)?.author !== 'kaio' ? (
                  <Avatar name={profile.fullName} imageUrl={profile.profileImageUrl} size={30} />
                ) : null}
              </span>
              <div className="chat-typing" aria-label={t('digitando', 'typing')}>
                <i />
                <i />
                <i />
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <div ref={dockRef} className="chat-dock">
        <div className="chat-dock-inner">
          {busy ? (
            <span className="chat-dock-wait">{t(`${profile.fullName.split(' ')[0]} está digitando…`, `${profile.fullName.split(' ')[0]} is typing…`)}</span>
          ) : finished ? (
            <>
              <button type="button" className="chat-chip" onClick={restart}>
                ↺ {t('Recomeçar conversa', 'Start over')}
              </button>
            </>
          ) : (
            <>
              {remaining.map((topic) => (
                <button key={topic} type="button" className="chat-chip" onClick={() => choose(topic)}>
                  {labels[topic]}
                </button>
              ))}
              {remaining.length > 1 ? (
                <button type="button" className="chat-chip chat-chip-all" onClick={showAll}>
                  {t('Me mostra tudo', 'Show me everything')} →
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
