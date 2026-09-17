import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ButtonOutline, ButtonPrimary } from './controls'

/** Moldura na proporção 4:5 da foto do "Sobre mim" do site. */
const FRAME_W = 280
const FRAME_H = 350
/** Tamanho do arquivo gerado: o dobro da moldura já cobre telas de alta densidade no site. */
const OUT_W = 800
const OUT_H = 1000
const MAX_ZOOM = 4

/**
 * Recorte da foto de perfil antes do envio. A moldura fica parada; arrastar move a foto e o
 * controle (ou a roda do mouse) aproxima. A imagem sempre cobre a moldura inteira, então o
 * recorte nunca sai com borda vazia.
 */
export function PhotoCropModal({
  file,
  onCancel,
  onConfirm,
}: {
  file: File
  onCancel: () => void
  onConfirm: (cropped: File) => void
}) {
  const [src] = useState(() => URL.createObjectURL(file))
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const imgRef = useRef<HTMLImageElement>(null)
  const dragRef = useRef<{ px: number; py: number; x: number; y: number } | null>(null)

  useEffect(() => () => URL.revokeObjectURL(src), [src])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  const base = natural ? Math.max(FRAME_W / natural.w, FRAME_H / natural.h) : 1
  const scale = base * zoom
  const dw = (natural?.w ?? 0) * scale
  const dh = (natural?.h ?? 0) * scale

  function clamp(x: number, y: number, w = dw, h = dh) {
    return { x: Math.min(0, Math.max(FRAME_W - w, x)), y: Math.min(0, Math.max(FRAME_H - h, y)) }
  }

  function applyZoom(next: number) {
    if (!natural) return
    const z = Math.min(MAX_ZOOM, Math.max(1, next))
    const nextScale = base * z
    // Aproxima em torno do centro da moldura, não do canto da foto.
    const cx = (FRAME_W / 2 - pos.x) / scale
    const cy = (FRAME_H / 2 - pos.y) / scale
    setZoom(z)
    setPos(clamp(FRAME_W / 2 - cx * nextScale, FRAME_H / 2 - cy * nextScale, natural.w * nextScale, natural.h * nextScale))
  }

  function confirm() {
    const img = imgRef.current
    if (!img || !natural) return
    const canvas = document.createElement('canvas')
    canvas.width = OUT_W
    canvas.height = OUT_H
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, -pos.x / scale, -pos.y / scale, FRAME_W / scale, FRAME_H / scale, 0, 0, OUT_W, OUT_H)

    // PNG mantém transparência; o resto vira JPEG, bem menor para foto.
    const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
    const name = file.name.replace(/\.[^.]+$/, '') + (type === 'image/png' ? '.png' : '.jpg')
    canvas.toBlob((blob) => blob && onConfirm(new File([blob], name, { type })), type, 0.92)
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ajustar foto de perfil"
      onClick={(event) => event.target === event.currentTarget && onCancel()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        background: 'rgba(30, 26, 48, 0.45)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: 24,
          width: 'min(360px, 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          boxShadow: '0 24px 60px rgba(40, 34, 64, 0.2)',
        }}
      >
        <div style={{ alignSelf: 'stretch' }}>
          <strong style={{ fontSize: 18 }}>Ajustar foto</strong>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
            Arraste para posicionar e use o zoom para escolher a área.
          </p>
        </div>

        <div
          tabIndex={0}
          aria-label="Área do recorte. Setas movem a foto; + e - mudam o zoom."
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId)
            dragRef.current = { px: event.clientX, py: event.clientY, x: pos.x, y: pos.y }
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current
            if (drag) setPos(clamp(drag.x + event.clientX - drag.px, drag.y + event.clientY - drag.py))
          }}
          onPointerUp={() => (dragRef.current = null)}
          onPointerCancel={() => (dragRef.current = null)}
          onWheel={(event) => applyZoom(zoom - event.deltaY * 0.002)}
          onKeyDown={(event) => {
            const step = 10
            const moves: Record<string, [number, number]> = {
              ArrowLeft: [step, 0],
              ArrowRight: [-step, 0],
              ArrowUp: [0, step],
              ArrowDown: [0, -step],
            }
            if (moves[event.key]) {
              event.preventDefault()
              setPos(clamp(pos.x + moves[event.key][0], pos.y + moves[event.key][1]))
            } else if (event.key === '+' || event.key === '=') applyZoom(zoom + 0.1)
            else if (event.key === '-') applyZoom(zoom - 0.1)
          }}
          style={{
            position: 'relative',
            width: FRAME_W,
            flexShrink: 0,
            height: FRAME_H,
            overflow: 'hidden',
            borderRadius: 22,
            background: 'var(--bg)',
            cursor: 'grab',
            touchAction: 'none',
            userSelect: 'none',
            outlineOffset: 3,
          }}
        >
          <img
            ref={imgRef}
            src={src}
            alt=""
            draggable={false}
            onLoad={(event) => {
              const { naturalWidth: w, naturalHeight: h } = event.currentTarget
              const s = Math.max(FRAME_W / w, FRAME_H / h)
              setNatural({ w, h })
              setPos({ x: (FRAME_W - w * s) / 2, y: (FRAME_H - h * s) / 2 })
            }}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: dw || undefined,
              height: dh || undefined,
              maxWidth: 'none',
              transform: `translate(${pos.x}px, ${pos.y}px)`,
              visibility: natural ? 'visible' : 'hidden',
              pointerEvents: 'none',
            }}
          />
          {/* Grade de terços para ajudar a centralizar o rosto. */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              backgroundImage:
                'linear-gradient(to right, transparent 33.2%, rgba(255,255,255,.45) 33.3%, transparent 33.5%, transparent 66.5%, rgba(255,255,255,.45) 66.6%, transparent 66.8%), linear-gradient(to bottom, transparent 33.2%, rgba(255,255,255,.45) 33.3%, transparent 33.5%, transparent 66.5%, rgba(255,255,255,.45) 66.6%, transparent 66.8%)',
            }}
          />
        </div>

        <label style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--text-muted)' }}>
          Zoom
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(event) => applyZoom(Number(event.target.value))}
            style={{ flex: 1, accentColor: 'var(--green)' }}
          />
        </label>

        <div style={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <ButtonOutline onClick={onCancel}>Cancelar</ButtonOutline>
          <ButtonPrimary onClick={confirm} disabled={!natural}>
            Usar recorte
          </ButtonPrimary>
        </div>
      </div>
    </div>,
    document.body,
  )
}
