import { useEffect, useState, useRef } from 'react'

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const cursorRef = useRef<HTMLDivElement>(null)
  const ringRef   = useRef<HTMLDivElement>(null)

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
    const ring   = ringRef.current
    if (!cursor || !ring) return

    let mx = 0, my = 0, rx = 0, ry = 0
    let rafId: number

    /**
     * Some o cursor desenhado enquanto o ponteiro está sobre um iframe (a prévia de projeto).
     *
     * Dentro do iframe quem recebe os eventos é o documento embutido, então o mousemove daqui
     * para de chegar e o ponto ficaria parado no meio da tela, como se tivesse travado. O
     * documento embutido tem cursor próprio — o `cursor: none` global não atravessa para
     * dentro dele —, então o visitante não fica sem cursor nenhum.
     */
    const isFrame = (target: EventTarget | null) =>
      target instanceof HTMLElement && target.tagName === 'IFRAME'

    const setHidden = (hidden: boolean) => {
      // String vazia devolve o valor da folha de estilo (o anel tem opacidade 0.5).
      cursor.style.opacity = hidden ? '0' : ''
      ring.style.opacity = hidden ? '0' : ''
    }

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      // Receber mousemove significa que o ponteiro voltou para o documento principal. Isso
      // também religa o cursor quando o modal é fechado com o ponteiro em cima do iframe,
      // caso em que o mouseout nunca chega porque o elemento deixa de existir.
      setHidden(isFrame(e.target))
    }

    const onOver = (e: MouseEvent) => {
      if (isFrame(e.target)) setHidden(true)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)

    function animate() {
      cursor!.style.left = mx + 'px'
      cursor!.style.top  = my + 'px'
      rx += (mx - rx) * 0.12
      ry += (my - ry) * 0.12
      ring!.style.left = rx + 'px'
      ring!.style.top  = ry + 'px'
      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      cancelAnimationFrame(rafId)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div ref={cursorRef} id="cursor" />
      <div ref={ringRef}   id="cursor-ring" />
    </>
  )
}
