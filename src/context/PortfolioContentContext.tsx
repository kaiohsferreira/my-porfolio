import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  getPortfolioSlug,
  getPublicPortfolioProfile,
  isApiError,
  type PortfolioProfilePublic,
} from '@/lib/portfolio-api'

interface PortfolioContentContextValue {
  profile: PortfolioProfilePublic
  loading: boolean
  error: string | null
  slug: string
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

export function PortfolioContentProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [slug] = useState(() => getPortfolioSlug())

  async function loadProfile() {
    try {
      setLoading(true)
      setError(null)

      const nextProfile = await getPublicPortfolioProfile(slug)
      setProfile({ ...DEFAULT_PROFILE, ...nextProfile })
    } catch (loadError) {
      const message =
        isApiError(loadError) ? loadError.message : 'Nao foi possivel carregar os dados publicos do portfolio.'

      setError(message)
      setProfile(DEFAULT_PROFILE)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProfile()
  }, [slug])

  return (
    <PortfolioContentContext.Provider
      value={{
        profile,
        loading,
        error,
        slug,
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
