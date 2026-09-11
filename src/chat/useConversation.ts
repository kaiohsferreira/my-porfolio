import { useCallback, useEffect, useRef, useState } from 'react'

export type TopicId = 'about' | 'skills' | 'experience' | 'projects' | 'contact'

export const TOPICS: TopicId[] = ['about', 'skills', 'experience', 'projects', 'contact']

/**
 * Falas fixas da conversa. O texto não é guardado na mensagem, só a referência: assim uma fala
 * já exibida acompanha a troca de idioma e também os dados do perfil, que chegam da API depois
 * de a conversa ter começado.
 */
export type LineId =
  | 'hello'
  | 'intro'
  | 'ask'
  | 'more'
  | 'done'
  | 'visitor-all'
  | 'visitor-restart'
  | `lead-${TopicId}`
  | `visitor-${TopicId}`

export interface ChatMessage {
  id: number
  author: 'kaio' | 'visitor'
  line?: LineId
  topic?: TopicId
}

export type Step =
  | { kind: 'say'; line: LineId; weight?: number }
  | { kind: 'show'; topic: TopicId }
  | { kind: 'visitor'; line: LineId }

/** Quanto o "digitando…" dura antes de uma fala, em milissegundos. */
function typingTime(weight: number, fast: boolean) {
  const base = Math.min(1400, Math.max(520, weight * 16))
  return fast ? Math.round(base * 0.35) : base
}

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

/**
 * Motor da conversa: executa uma fila de passos em ordem, com a pausa de digitação entre as
 * falas do Kaio. Uma fila nova só começa quando a anterior termina, e desmontar o componente
 * interrompe o que estiver em andamento.
 */
export function useConversation() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typing, setTyping] = useState(false)
  const [busy, setBusy] = useState(false)
  const nextId = useRef(1)
  const alive = useRef(true)
  const reducedMotion = useRef(false)
  const running = useRef(false)

  useEffect(() => {
    alive.current = true
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return () => {
      alive.current = false
    }
  }, [])

  const push = useCallback((message: Omit<ChatMessage, 'id'>) => {
    const id = nextId.current++
    setMessages((current) => [...current, { ...message, id }])
  }, [])

  const run = useCallback(
    async (steps: Step[], options?: { fast?: boolean }) => {
      // Trava por ref, não por estado: dois cliques rápidos acontecem antes de o React
      // re-renderizar, e o `busy` que o componente enxerga ainda seria falso no segundo.
      if (running.current) return
      running.current = true

      try {
        // Quem pediu menos movimento não precisa esperar ninguém "digitar".
        const fast = Boolean(options?.fast) || reducedMotion.current
        setBusy(true)

        for (const step of steps) {
          if (!alive.current) return

          if (step.kind === 'visitor') {
            push({ author: 'visitor', line: step.line })
            await sleep(fast ? 120 : 380)
            continue
          }

          setTyping(true)
          await sleep(step.kind === 'show' ? typingTime(70, fast) : typingTime(step.weight ?? 40, fast))
          if (!alive.current) return
          setTyping(false)

          if (step.kind === 'say') push({ author: 'kaio', line: step.line })
          else push({ author: 'kaio', topic: step.topic })

          await sleep(fast ? 160 : 420)
        }
      } finally {
        // Libera em qualquer saída, inclusive a interrupção por desmontagem.
        running.current = false
        if (alive.current) {
          setTyping(false)
          setBusy(false)
        }
      }
    },
    [push],
  )

  const reset = useCallback(() => {
    setMessages([])
    setTyping(false)
  }, [])

  /** Leitura síncrona da trava, para o componente não marcar um assunto que não vai rodar. */
  const isRunning = useCallback(() => running.current, [])

  return { messages, typing, busy, run, reset, isRunning }
}
