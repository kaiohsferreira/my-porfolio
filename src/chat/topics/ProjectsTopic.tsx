import { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { usePortfolioContent } from '@/context/PortfolioContentContext'
import type { PortfolioProject } from '@/types'
import { ProjectPreviewModal } from '../parts/ProjectPreviewModal'
import { SiteCoverFrame } from '../parts/SiteCoverFrame'

/** Cartões de projeto. A prévia abre o site dentro do portfólio, sem sair da conversa. */
export function ProjectsTopic() {
  const { lang, t } = useLanguage()
  const { projects } = usePortfolioContent()
  const [preview, setPreview] = useState<PortfolioProject | null>(null)

  if (!projects.length) return null

  return (
    <div className="topic topic-projects">
      {projects.map((project, index) => {
        const description = lang === 'pt' ? project.desc.pt : project.desc.en || project.desc.pt

        return (
          <article key={project.id} className="topic-project" style={{ animationDelay: `${0.12 + index * 0.14}s` }}>
            <div className="topic-project-cover">
              {project.coverImageUrl ? (
                <img
                  src={project.coverImageUrl}
                  alt={`${t('Capa do projeto', 'Cover of')} ${project.name}`}
                  width={1280}
                  height={720}
                />
              ) : project.liveUrl ? (
                <SiteCoverFrame url={project.liveUrl} name={project.name} />
              ) : (
                <span className="topic-project-initial" aria-hidden="true">
                  {project.name.slice(0, 1)}
                </span>
              )}
            </div>

            <div className="topic-project-body">
              <h4>{project.name}</h4>
              {description ? <p>{description}</p> : null}

              {project.tags.length ? (
                <ul className="topic-tags">
                  {project.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              ) : null}

              <div className="topic-project-actions">
                {project.canPreview ? (
                  <button type="button" className="chat-btn chat-btn-primary" onClick={() => setPreview(project)}>
                    {t('Abrir prévia', 'Open preview')}
                  </button>
                ) : null}
                {project.repositoryUrl ? (
                  <a className="chat-btn" href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
                    {t('Repositório', 'Repository')} ↗
                  </a>
                ) : null}
                {project.liveUrl ? (
                  <a className="chat-btn" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    {t('Ver online', 'Live site')} ↗
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        )
      })}

      {preview ? <ProjectPreviewModal project={preview} onClose={() => setPreview(null)} /> : null}
    </div>
  )
}
