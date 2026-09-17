import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { usePortfolioContent } from '@/context/PortfolioContentContext'
import type { PortfolioProject } from '@/types'
import { ProjectPreviewModal } from '../parts/ProjectPreviewModal'
import { SiteCoverFrame } from '../parts/SiteCoverFrame'

/** Quanto o dedo ou o mouse precisa arrastar para trocar de projeto, em px. */
const SWIPE = 40

/**
 * Carrossel 3D de projetos: as capas ficam em leque, a da frente centrada e as vizinhas viradas
 * para trás. Os detalhes do projeto da frente ficam embaixo, planos — botão dentro de elemento
 * girado é alvo difícil, e aqui estão justamente as ações que importam.
 */
export function ProjectsTopic() {
  const { lang, t } = useLanguage()
  const { projects } = usePortfolioContent()
  const [index, setIndex] = useState(0)
  const [preview, setPreview] = useState<PortfolioProject | null>(null)
  const dragStart = useRef<number | null>(null)

  const count = projects.length
  if (!count) return null

  const current = projects[Math.min(index, count - 1)]
  const description = lang === 'pt' ? current.desc.pt : current.desc.en || current.desc.pt
  // Com três ou mais a roda gira sem fim; com menos, dar a volta mostraria o mesmo dos dois lados.
  const wraps = count >= 3
  const go = (next: number) => setIndex(wraps ? (next + count) % count : Math.max(0, Math.min(count - 1, next)))

  /** Distância com sinal até o projeto da frente, pelo caminho mais curto quando a roda gira. */
  const offsetOf = (i: number) => {
    let o = i - index
    if (wraps) {
      if (o > count / 2) o -= count
      if (o < -count / 2) o += count
    }
    return o
  }

  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') go(index + 1)
    if (event.key === 'ArrowLeft') go(index - 1)
  }

  const onPointerDown = (event: PointerEvent) => {
    dragStart.current = event.clientX
  }
  const onPointerUp = (event: PointerEvent) => {
    if (dragStart.current === null) return
    const delta = event.clientX - dragStart.current
    dragStart.current = null
    if (delta <= -SWIPE) go(index + 1)
    if (delta >= SWIPE) go(index - 1)
  }

  return (
    <div className="topic topic-projects">
      <div
        className="pc-stage"
        role="group"
        aria-roledescription={t('carrossel', 'carousel')}
        aria-label={t('Projetos', 'Projects')}
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={() => {
          dragStart.current = null
        }}
      >
        <div className="pc-track">
          {projects.map((project, i) => {
            const o = offsetOf(i)
            const far = Math.abs(o)

            return (
              <button
                key={project.id}
                type="button"
                className={o === 0 ? 'pc-item is-front' : 'pc-item'}
                aria-label={project.name}
                aria-current={o === 0 ? 'true' : undefined}
                tabIndex={o === 0 ? -1 : 0}
                onClick={() => go(i)}
                style={{
                  transform: `translate(-50%, -50%) translateX(${o * 64}%) translateZ(${far * -240}px) rotateY(${o * -38}deg)`,
                  opacity: far > 2 ? 0 : 1 - far * 0.28,
                  zIndex: 10 - far,
                  visibility: far > 2 ? 'hidden' : 'visible',
                }}
              >
                <span className="pc-cover">
                  {project.coverImageUrl ? (
                    <img src={project.coverImageUrl} alt="" width={1280} height={800} draggable={false} />
                  ) : project.liveUrl ? (
                    <SiteCoverFrame url={project.liveUrl} name={project.name} />
                  ) : (
                    <span className="topic-project-initial" aria-hidden="true">
                      {project.name.slice(0, 1)}
                    </span>
                  )}
                </span>
                <span className="pc-name">{project.name}</span>
              </button>
            )
          })}
        </div>

        {count > 1 ? (
          <>
            <button type="button" className="pc-arrow pc-prev" onClick={() => go(index - 1)} aria-label={t('Projeto anterior', 'Previous project')}>
              ←
            </button>
            <button type="button" className="pc-arrow pc-next" onClick={() => go(index + 1)} aria-label={t('Próximo projeto', 'Next project')}>
              →
            </button>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <div className="pc-dots">
          {projects.map((project, i) => (
            <button
              key={project.id}
              type="button"
              className={i === index ? 'is-on' : undefined}
              aria-label={project.name}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => go(i)}
            />
          ))}
        </div>
      ) : null}

      <div key={current.id} className="pc-details" aria-live="polite">
        <h3>{current.name}</h3>
        {description ? <p>{description}</p> : null}

        {current.tags.length ? (
          <ul className="topic-tags">
            {current.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        ) : null}

        <div className="topic-project-actions">
          {current.canPreview ? (
            <button type="button" className="site-btn site-btn-primary" onClick={() => setPreview(current)}>
              {t('Abrir prévia', 'Open preview')}
            </button>
          ) : null}
          {current.repositoryUrl ? (
            <a className="site-btn" href={current.repositoryUrl} target="_blank" rel="noopener noreferrer">
              {t('Repositório', 'Repository')} ↗
            </a>
          ) : null}
          {current.liveUrl ? (
            <a className="site-btn" href={current.liveUrl} target="_blank" rel="noopener noreferrer">
              {t('Ver online', 'Live site')} ↗
            </a>
          ) : null}
        </div>
      </div>

      {preview ? <ProjectPreviewModal project={preview} onClose={() => setPreview(null)} /> : null}
    </div>
  )
}
