import { useEffect, useState, useRef } from 'react'

/** Elementos em que a mira vira colchetes, sinalizando que ali se clica. */
const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, summary'

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function updateEnabled() {
      const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
      setEnabled(isFinePointer && window.innerWidth > 900)
    }

    updateEnabled()
    window.addEventListener('resize', updateEnabled)
    return () => window.removeEventListener('resize', updateEnabled)
  }, [])

  useEffect(() => {
    if (!enabled) return

    const cursor = cursorRef.current
    if (!cursor) return

    let mx = 0, my = 0
    let rafId: number

    /**
     * Some a mira enquanto o ponteiro está sobre um iframe (a prévia de projeto).
     *
     * Dentro do iframe quem recebe os eventos é o documento embutido, então o mousemove daqui
     * para de chegar e a mira ficaria parada no meio da tela, como se tivesse travado. O
     * documento embutido tem cursor próprio — o `cursor: none` global não atravessa para
     * dentro dele —, então o visitante não fica sem cursor nenhum.
     */
    const isFrame = (target: EventTarget | null) =>
      target instanceof HTMLElement && target.tagName === 'IFRAME'

    const setHidden = (hidden: boolean) => {
      cursor.dataset.hidden = hidden ? 'true' : 'false'
    }

    const setInteractive = (target: EventTarget | null) => {
      const over = target instanceof Element && target.closest(INTERACTIVE) !== null
      cursor.dataset.interactive = over ? 'true' : 'false'
    }

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      // Receber mousemove significa que o ponteiro voltou para o documento principal. Isso
      // também religa a mira quando o modal é fechado com o ponteiro em cima do iframe,
      // caso em que o mouseout nunca chega porque o elemento deixa de existir.
      setHidden(isFrame(e.target))
      setInteractive(e.target)
    }

    const onOver = (e: MouseEvent) => {
      if (isFrame(e.target)) setHidden(true)
    }

    const onDown = () => { cursor.dataset.pressed = 'true' }
    const onUp = () => { cursor.dataset.pressed = 'false' }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('mouseup', onUp)

    // A mira acompanha o ponteiro sem suavização: atraso numa cruz de precisão lê como
    // travamento, não como enfeite. O quadro só existe para não escrever no estilo a cada
    // evento de mouse.
    function animate() {
      cursor!.style.transform = `translate3d(${mx}px, ${my}px, 0)`
      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mouseup', onUp)
      cancelAnimationFrame(rafId)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div ref={cursorRef} id="cursor" data-hidden="false" data-interactive="false" data-pressed="false">
      <span className="cursor-line cursor-line-h" />
      <span className="cursor-line cursor-line-v" />
      <span className="cursor-bracket cursor-bracket-l">[</span>
      <span className="cursor-bracket cursor-bracket-r">]</span>
    </div>
  )
}
