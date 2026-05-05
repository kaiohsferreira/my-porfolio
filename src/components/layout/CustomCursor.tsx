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

    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY }
    document.addEventListener('mousemove', onMove)

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
