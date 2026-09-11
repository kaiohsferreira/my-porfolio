import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '@/context/LanguageContext'
import { buildPreviewUrl } from '@/lib/site-preview'
import type { PortfolioProject } from '@/types'

/**
 * Acima da navbar (z-1000) e da textura de ruído (z-9990), abaixo do cursor
 * customizado (z-9998/9999), que deve continuar visível sobre o modal.
 */
const Z_MODAL = 9995

/**
 * Mostra o projeto rodando dentro do portfólio, sem tirar o visitante do site.
 *
 * O iframe depende de o site alvo permitir ser embutido: quem responde X-Frame-Options ou
 * CSP frame-ancestors é recusado pelo navegador, que ainda assim dispara `load` e deixa a
 * própria página de erro no lugar — aquela área em branco.
 *
 * Essa recusa NÃO é detectável daqui: o Chrome trata até a própria página de erro como outra
 * origem, então ler `contentWindow.location` lança SecurityError tanto no frame recusado
 * quanto no que carregou. Por isso o link de abrir em aba nova e o aviso do rodapé ficam
 * sempre visíveis, em vez de aparecerem só depois de uma falha que não temos como perceber.
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
  const [stalled, setStalled] = useState(false)

  /** Mostra a saída alternativa quando o projeto não vai aparecer aqui dentro. */
  const unavailable = stalled && !loaded

  // Se o site não der sinal nesse tempo, troca o "Carregando" por uma saída útil em vez de
  // deixar o visitante olhando para um spinner eterno.
  useEffect(() => {
    if (loaded) return
    const timer = window.setTimeout(() => setStalled(true), 8000)
    return () => window.clearTimeout(timer)
  }, [loaded])

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

  if (!project.liveUrl || typeof document === 'undefined') return null

  // Renderizado num portal no body. Além de resolver a sobreposição da navbar, tira o modal
  // de dentro da seção: qualquer ancestral com transform/filter/will-change viraria bloco de
  // contenção e quebraria o position:fixed — o carrossel logo acima já usa will-change.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${t('Prévia de', 'Preview of')} ${project.name}`}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: Z_MODAL,
        background: 'rgba(0,0,0,0.82)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        flexDirection: 'column',
        padding: 'clamp(10px, 2.5vw, 28px)',
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
        {/* Barra superior. Em tela estreita o título ocupa a linha inteira e os dois
            controles descem juntos, em vez de espremerem o nome do projeto. */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px 14px',
            padding: '10px 14px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface)',
            flexWrap: 'wrap',
            flex: '0 0 auto',
          }}
        >
          <span
            className="font-mono"
            style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--green)', flex: '0 0 auto' }}
          >
            {t('Prévia', 'Preview')}
          </span>

          <span
            title={project.name}
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text)',
              marginRight: 'auto',
              flex: '1 1 12ch',
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
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
          {!loaded || unavailable ? (
            <div
              className="font-mono"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 1,
                // Opaco: enquanto não há sinal de carga, esconde o frame em branco por baixo.
                background: 'var(--bg2)',
                display: 'grid',
                placeItems: 'center',
                alignContent: 'center',
                gap: 16,
                fontSize: 12,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                padding: 24,
                textAlign: 'center',
              }}
            >
              {unavailable ? (
                <>
                  <span style={{ maxWidth: '46ch', lineHeight: 1.7 }}>
                    {t(
                      'Este projeto não pôde ser exibido aqui dentro.',
                      'This project could not be displayed inside the page.',
                    )}
                  </span>
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 11,
                      letterSpacing: '0.08em',
                      color: 'var(--green)',
                      textDecoration: 'none',
                      border: '1px solid var(--green)',
                      padding: '12px 18px',
                      minHeight: 44,
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    {t('Abrir em nova aba', 'Open in new tab')} ↗
                  </a>
                </>
              ) : (
                <span>{t('Carregando o projeto…', 'Loading the project…')}</span>
              )}
            </div>
          ) : null}

          <iframe
            src={buildPreviewUrl(project.liveUrl) ?? project.liveUrl}
            title={`${t('Prévia de', 'Preview of')} ${project.name}`}
            onLoad={() => setLoaded(true)}
            // Sem loading="lazy" de propósito. O modal é um overlay fixo criado por portal,
            // e a heurística de proximidade da viewport não o considera elegível: o frame
            // simplesmente nunca começava a carregar e a área ficava vazia. Aqui o lazy não
            // economizaria nada — o iframe só existe enquanto o modal está aberto.
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
    </div>,
    document.body,
  )
}
