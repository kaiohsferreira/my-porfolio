import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  getPortfolioUrl,
  getPortfolioUrlCandidates,
  getPublicPortfolioProfile,
  getPublicProjects,
  getPublicSkills,
  getPublicSocialLinks,
  isApiError,
  type AdminProject,
  type AdminSkill,
  type PortfolioProfilePublic,
} from '@/lib/portfolio-api'
import type { PortfolioProject, Skill } from '@/types'
import { PROJECTS_DATA, SKILLS_DATA } from '@/data/portfolio'

interface PortfolioContentContextValue {
  profile: PortfolioProfilePublic
  skills: Skill[]
  projects: PortfolioProject[]
  loading: boolean
  error: string | null
  portfolioUrl: string
  refresh: () => Promise<void>
}

const DEFAULT_PROFILE: PortfolioProfilePublic = {
  fullName: 'Kaio Henrique',
  headline: 'Desenvolvedor Full Stack',
  headlineEn: 'Full Stack Developer',
  location: 'Brasil',
  bioPt:
    'Desenvolvedor Full Stack apaixonado por criar experiencias digitais com foco em performance, clareza visual e manutencao a longo prazo.',
  bioEn:
    'Full Stack developer focused on building digital experiences with performance, visual clarity and long-term maintainability.',
  availableForWork: true,
  sinceYear: 2023,
  profileImageUrl: null,
  resumeFileUrl: null,
  stats: [
    { id: 1, labelPt: 'Anos de estudo', labelEn: 'Years studying', value: '2+', icon: 'calendar', sortOrder: 1 },
    { id: 2, labelPt: 'Tecnologias', labelEn: 'Technologies', value: '9', icon: 'code', sortOrder: 2 },
    { id: 3, labelPt: 'Vontade de crescer', labelEn: 'Drive to grow', value: '∞', icon: 'spark', sortOrder: 3 },
    { id: 4, labelPt: 'Comprometido', labelEn: 'Committed', value: '100%', icon: 'check', sortOrder: 4 },
  ],
  socialLinks: [
    { platform: 'GitHub', label: 'GitHub', url: 'https://github.com/', icon: 'github', sortOrder: 1 },
    { platform: 'LinkedIn', label: 'LinkedIn', url: 'https://linkedin.com/', icon: 'linkedin', sortOrder: 2 },
  ],
}

const PortfolioContentContext = createContext<PortfolioContentContextValue | null>(null)

function mapPublicSkill(skill: AdminSkill): Skill {
  return {
    id: skill.id,
    name: skill.name,
    category: skill.category || 'Sem categoria',
    iconName: skill.iconName || '',
    level: skill.level,
    sortOrder: skill.sortOrder,
  }
}

const DEFAULT_SKILLS: Skill[] = SKILLS_DATA.map((skill, index) => ({
  id: index + 1,
  name: skill.name,
  category: 'Skills',
  iconName: skill.iconName,
  level: 0,
  sortOrder: index,
}))

/** Catálogo local, usado só quando a API não devolve nenhum projeto publicado. */
const DEFAULT_PROJECTS: PortfolioProject[] = PROJECTS_DATA.map((project) => ({
  id: project.id,
  name: project.name,
  type: project.type,
  desc: project.desc,
  tags: project.tags,
  repositoryUrl: null,
  liveUrl: null,
  featured: false,
  coverImageUrl: null,
  canPreview: false,
}))

/** Compara duas URLs por host, ignorando www e diferença de maiúsculas. */
function isSameSite(a: string | null, b: string | null) {
  if (!a || !b) return false

  try {
    const hostA = new URL(a).hostname.toLowerCase().replace(/^www\./, '')
    const hostB = new URL(b).hostname.toLowerCase().replace(/^www\./, '')
    return hostA === hostB
  } catch {
    return false
  }
}

/**
 * O backend guarda uma descrição só por projeto, sem par pt/en como o perfil tem.
 * Até existir esse campo, o mesmo texto serve os dois idiomas.
 */
/**
 * Busca o conteúdo público na primeira URL candidata que a API reconhecer.
 * Só um 404 (portfólio não encontrado naquela URL) faz tentar a próxima; qualquer outra
 * falha sobe, para não mascarar API fora do ar como "portfólio inexistente".
 */
async function loadFromFirstResolvableUrl() {
  const candidates = getPortfolioUrlCandidates()
  let lastNotFound: unknown = null

  for (const url of candidates) {
    try {
      const [nextProfile, socialLinks, publicSkillsResult, publicProjectsResult] = await Promise.all([
        getPublicPortfolioProfile(url),
        getPublicSocialLinks(url).catch(() => null),
        getPublicSkills(url).catch(() => null),
        getPublicProjects(url).catch(() => null),
      ])

      return { url, nextProfile, socialLinks, publicSkillsResult, publicProjectsResult }
    } catch (error) {
      if (isApiError(error) && error.status === 404) {
        lastNotFound = error
        continue
      }

      throw error
    }
  }

  throw lastNotFound ?? new Error('Nenhuma URL de portfolio pode ser resolvida.')
}

function mapPublicProject(project: AdminProject): PortfolioProject {
  const description = project.description?.trim() || ''
  const liveUrl = project.liveUrl?.trim() || null

  return {
    id: project.id,
    name: project.title,
    type: null,
    desc: { pt: description, en: description },
    tags: project.tags ?? [],
    repositoryUrl: project.repositoryUrl?.trim() || null,
    liveUrl,
    featured: Boolean(project.isFeatured),
    coverImageUrl: project.coverImageUrl?.trim() || null,
    canPreview: Boolean(liveUrl),
  }
}

export function PortfolioContentProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [skills, setSkills] = useState<Skill[]>(DEFAULT_SKILLS)
  const [projects, setProjects] = useState<PortfolioProject[]>(DEFAULT_PROJECTS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [portfolioUrl, setPortfolioUrl] = useState(() => getPortfolioUrl())

  async function loadProfile() {
    try {
      setLoading(true)
      setError(null)

      const { url, nextProfile, socialLinks, publicSkillsResult, publicProjectsResult } = await loadFromFirstResolvableUrl()
      setPortfolioUrl(url)

      setProfile({
        ...DEFAULT_PROFILE,
        ...nextProfile,
        socialLinks: socialLinks?.length ? socialLinks : nextProfile.socialLinks,
      })
      setSkills(
        publicSkillsResult?.length
          ? publicSkillsResult.map(mapPublicSkill).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          : DEFAULT_SKILLS,
      )
      // O card do próprio portfólio sai da lista: ele apontaria para o site em que o
      // visitante já está e não pode ser embutido dentro de si mesmo.
      const visibleProjects = (publicProjectsResult ?? [])
        .map(mapPublicProject)
        .filter((project) => !isSameSite(project.liveUrl, url))

      setProjects(visibleProjects.length ? visibleProjects : DEFAULT_PROJECTS)
    } catch (loadError) {
      const message =
        isApiError(loadError) ? loadError.message : 'Nao foi possivel carregar os dados publicos do portfolio.'

      setError(message)
      setProfile(DEFAULT_PROFILE)
      setSkills(DEFAULT_SKILLS)
      setProjects(DEFAULT_PROJECTS)
    } finally {
      setLoading(false)
    }
  }

  // Carrega uma vez na montagem. A URL do portfólio é resolvida dentro do próprio load
  // (ver loadFromFirstResolvableUrl), então depender dela aqui recarregaria em vão.
  useEffect(() => {
    void loadProfile()
  }, [])

  return (
    <PortfolioContentContext.Provider
      value={{
        profile,
        skills,
        projects,
        loading,
        error,
        portfolioUrl,
        refresh: loadProfile,
      }}
    >
      {children}
    </PortfolioContentContext.Provider>
  )
}

export function usePortfolioContent() {
  const ctx = useContext(PortfolioContentContext)
  if (!ctx) throw new Error('usePortfolioContent must be used inside PortfolioContentProvider')
  return ctx
}
