import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import type { PortfolioProject } from '@/types'

/**
 * Mostra o projeto rodando dentro do portfólio, sem tirar o visitante do site.
 *
 * O iframe depende do site alvo permitir ser embutido: quem responde X-Frame-Options ou
 * CSP frame-ancestors é recusado pelo navegador, e não há como detectar isso de forma
 * confiável a partir daqui (o conteúdo é de outra origem). Por isso o aviso e o link para
 * abrir em aba nova ficam sempre visíveis, em vez de aparecerem só depois de falhar.
 */
export function ProjectPreviewModal({
  project,
  onClose,
}: {
  project: PortfolioProject
  onClose: () => void
}) {
  const { t } = useLanguage()
  const closeRef = useRef<HTMLButtonElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  if (!project.liveUrl) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${t('Prévia de', 'Preview of')} ${project.name}`}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.82)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        flexDirection: 'column',
        padding: 'clamp(12px, 3vw, 32px)',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--border-bright)',
          background: 'var(--bg)',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Barra superior */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface)',
            flexWrap: 'wrap',
          }}
        >
          <span
            className="font-mono"
            style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--green)' }}
          >
            {t('Prévia', 'Preview')}
          </span>

          <span
            style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginRight: 'auto' }}
          >
            {project.name}
          </span>

          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              padding: '8px 12px',
              border: '1px solid var(--border)',
              minHeight: 44,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {t('Abrir em nova aba', 'Open in new tab')} ↗
          </a>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t('Fechar prévia', 'Close preview')}
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              background: 'transparent',
              border: '1px solid var(--border)',
              padding: '8px 14px',
              minHeight: 44,
              cursor: 'pointer',
            }}
          >
            {t('Fechar', 'Close')} ✕
          </button>
        </div>

        {/* Conteúdo */}
        <div style={{ position: 'relative', flex: 1, minHeight: 0, background: 'var(--bg2)' }}>
          {!loaded ? (
            <div
              className="font-mono"
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                fontSize: 12,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                padding: 24,
                textAlign: 'center',
              }}
            >
              {t('Carregando o projeto…', 'Loading the project…')}
            </div>
          ) : null}

          <iframe
            src={project.liveUrl}
            title={`${t('Prévia de', 'Preview of')} ${project.name}`}
            onLoad={() => setLoaded(true)}
            loading="lazy"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          />
        </div>

        {/* Rodapé com a ressalva honesta */}
        <p
          className="font-mono"
          style={{
            margin: 0,
            padding: '10px 16px',
            borderTop: '1px solid var(--border)',
            background: 'var(--surface)',
            fontSize: 10.5,
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
          }}
        >
          {t(
            'Alguns sites não permitem ser exibidos aqui dentro. Se a área acima ficar vazia, use "abrir em nova aba".',
            'Some sites do not allow being displayed inside another page. If the area above stays empty, use "open in new tab".',
          )}
        </p>
      </div>
    </div>
  )
}
