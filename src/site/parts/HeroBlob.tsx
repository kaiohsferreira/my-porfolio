import { useEffect, useRef } from 'react'

/**
 * Hospeda a escultura 3D da abertura. O Three.js vem por import dinâmico: a página aparece
 * primeiro e a forma entra quando o pedaço dela chega. Sem WebGL, fica o degradê do CSS.
 */
export function HeroBlob() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let cancelled = false
    let dispose: (() => void) | undefined

    import('./heroBlobScene')
      .then(({ mountBlob }) => {
        if (!cancelled) dispose = mountBlob(host)
      })
      .catch(() => {
        /* sem WebGL ou falha ao carregar: o degradê do CSS continua no lugar */
      })

    return () => {
      cancelled = true
      dispose?.()
    }
  }, [])

  return <div ref={hostRef} className="depth-blob" aria-hidden="true" />
}
