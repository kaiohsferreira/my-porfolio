import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  getPortfolioUrl,
  getPublicPortfolioProfile,
  getPublicSkills,
  getPublicSocialLinks,
  isApiError,
  type AdminSkill,
  type PortfolioProfilePublic,
} from '@/lib/portfolio-api'
import type { Skill } from '@/types'
import { SKILLS_DATA } from '@/data/portfolio'

interface PortfolioContentContextValue {
  profile: PortfolioProfilePublic
  skills: Skill[]
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

export function PortfolioContentProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [skills, setSkills] = useState<Skill[]>(DEFAULT_SKILLS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [portfolioUrl] = useState(() => getPortfolioUrl())

  async function loadProfile() {
    try {
      setLoading(true)
      setError(null)

      const [nextProfile, socialLinks, publicSkillsResult] = await Promise.all([
        getPublicPortfolioProfile(portfolioUrl),
        getPublicSocialLinks(portfolioUrl),
        getPublicSkills(portfolioUrl).catch(() => null),
      ])

      setProfile({
        ...DEFAULT_PROFILE,
        ...nextProfile,
        socialLinks: socialLinks.length ? socialLinks : nextProfile.socialLinks,
      })
      setSkills(
        publicSkillsResult?.length
          ? publicSkillsResult.map(mapPublicSkill).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          : DEFAULT_SKILLS,
      )
    } catch (loadError) {
      const message =
        isApiError(loadError) ? loadError.message : 'Nao foi possivel carregar os dados publicos do portfolio.'

      setError(message)
      setProfile(DEFAULT_PROFILE)
      setSkills(DEFAULT_SKILLS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProfile()
  }, [portfolioUrl])

  return (
    <PortfolioContentContext.Provider
      value={{
        profile,
        skills,
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
