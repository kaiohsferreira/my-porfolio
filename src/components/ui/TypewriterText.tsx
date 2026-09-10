import { useEffect, useRef, useState } from 'react'

/**
 * Escreve o texto letra a letra quando o bloco chega à tela.
 *
 * O texto completo fica no DOM o tempo todo, invisível, reservando a altura: sem isso o
 * parágrafo cresceria enquanto digita e empurraria tudo que vem abaixo. O leitor de tela lê
 * essa cópia completa e ignora a animação, que não lhe serve de nada.
 *
 * A digitação é escrita direto no nó pelo ref. Um setState por caractere renderizaria o
 * componente centenas de vezes para um texto de biografia.
 */
export function TypewriterText({
  text,
  className,
  /** Milissegundos por caractere. */
  speed = 9,
}: {
  text: string
  className?: string
  speed?: number
}) {
  const wrapRef = useRef<HTMLParagraphElement>(null)
  const outRef = useRef<HTMLSpanElement>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const wrap = wrapRef.current
    const out = outRef.current
    if (!wrap || !out) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!text || reduced) {
      out.textContent = text
      setDone(true)
      return
    }

    out.textContent = ''
    setDone(false)

    let started = false
    let observerAnswered = false
    let frame = 0
    let startedAt = 0

    function reveal() {
      out!.textContent = text
      setDone(true)
    }

    function step(now: number) {
      if (!startedAt) startedAt = now
      const chars = Math.floor((now - startedAt) / speed)

      if (chars >= text.length) {
        reveal()
        return
      }

      out!.textContent = text.slice(0, chars)
      frame = requestAnimationFrame(step)
    }

    function start() {
      if (started) return
      started = true
      frame = requestAnimationFrame(step)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        observerAnswered = true
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect()
          start()
        }
      },
      { threshold: 0.25 },
    )

    observer.observe(wrap)

    /**
     * Rede de segurança. Num navegador de verdade o observador responde de imediato, mesmo que
     * o bloco ainda esteja longe da tela. Se nenhuma resposta vier, ele não funciona ali — e
     * texto nenhum pode ficar preso invisível por causa de uma animação. Já aconteceu neste
     * projeto com a revelação das seções.
     */
    const guard = window.setTimeout(() => {
      if (!observerAnswered && !started) {
        observer.disconnect()
        reveal()
      }
    }, 2000)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      window.clearTimeout(guard)
    }
  }, [text, speed])

  return (
    <p ref={wrapRef} className={className} style={{ position: 'relative' }}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" style={{ visibility: 'hidden' }}>
        {text}
      </span>
      <span aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
        <span ref={outRef} />
        {done ? null : (
          <span
            style={{
              display: 'inline-block',
              width: '0.5em',
              height: '1.05em',
              marginLeft: 2,
              verticalAlign: 'text-bottom',
              background: 'var(--green)',
              animation: 'blink 0.8s step-end infinite',
            }}
          />
        )}
      </span>
    </p>
  )
}
