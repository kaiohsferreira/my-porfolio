import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '@/context/LanguageContext'
import { buildPreviewUrl } from '@/lib/site-preview'
import type { PortfolioProject } from '@/types'

/**
 * Mostra o projeto rodando dentro do portfólio, numa janela de navegador, sem tirar o visitante
 * do site.
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
  // deixar o visitante olhando para um anel girando para sempre.
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

  let host = project.liveUrl
  try {
    host = new URL(project.liveUrl).hostname.replace(/^www\./, '')
  } catch {
    /* URL malformada no cadastro: mostra como veio */
  }

  // Portal no body: o modal fica fora da cena 3D, onde transform nos ancestrais quebraria o
  // position: fixed.
  return createPortal(
    <div
      className="pv-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`${t('Prévia de', 'Preview of')} ${project.name}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="pv-window">
        <header className="pv-bar">
          <span className="pv-lights" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>

          <div className="pv-title">
            <strong>{project.name}</strong>
            <span className="pv-host">
              <span className="pv-lock" aria-hidden="true" />
              {host}
            </span>
          </div>

          <a className="site-btn pv-open" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
            <span className="pv-open-label">{t('Abrir em nova aba', 'Open in new tab')}</span> ↗
          </a>
          <button ref={closeRef} type="button" className="pv-close" onClick={onClose} aria-label={t('Fechar prévia', 'Close preview')}>
            ✕
          </button>
        </header>

        <div className="pv-body">
          {!loaded || unavailable ? (
            <div className="pv-state">
              {unavailable ? (
                <>
                  <p>{t('Este projeto não pôde ser exibido aqui dentro.', 'This project could not be displayed here.')}</p>
                  <a className="site-btn site-btn-primary" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    {t('Abrir em nova aba', 'Open in new tab')} ↗
                  </a>
                </>
              ) : (
                <>
                  <span className="pv-spinner" aria-hidden="true" />
                  <p>{t('Carregando o projeto…', 'Loading the project…')}</p>
                </>
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
          />
        </div>

        <p className="pv-note">
          {t(
            'Alguns sites não permitem ser exibidos dentro de outra página. Se a área ficar em branco, use “Abrir em nova aba”.',
            'Some sites do not allow being shown inside another page. If the area stays blank, use “Open in new tab”.',
          )}
        </p>
      </div>
    </div>,
    document.body,
  )
}
