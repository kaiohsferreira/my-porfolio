export interface Project {
  id: number
  title: string
  desc: string
  tags: string[]
  repo: string
  liveUrl: string
  featured: boolean
  status: 'published' | 'draft'
  thumb: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

/**
 * Projeto como a vitrine pública o consome. Serve tanto ao que vem da API quanto ao
 * catálogo local usado como fallback, para o carrossel não ter que conhecer as duas formas.
 */
export interface PortfolioProject {
  id: number
  name: string
  /** Rótulo curto acima do nome. Só o catálogo local tem; da API vem null. */
  type: { pt: string; en: string } | null
  desc: { pt: string; en: string }
  tags: string[]
  repositoryUrl: string | null
  liveUrl: string | null
  featured: boolean
}

export interface Skill {
  id: number
  name: string
  category: string
  iconName: string
  level: number
  sortOrder?: number
}

export interface Experience {
  id: number
  role: string
  company: string
  period: string
  desc: string
  sortOrder?: number
}

export interface Message {
  id: number
  name: string
  email: string
  msg: string
  date: string
  read: boolean
  createdAt?: string | null
}

export interface Visitor {
  id: number
  country: string
  city: string
  page: string
  time: string
  device: 'Desktop' | 'Mobile' | 'Tablet'
}

export interface SocialLink {
  id: number
  label: string
  url: string
  icon: string
}

export type Theme = 'green' | 'cyan' | 'purple' | 'orange' | 'red' | 'blue'

export type Language = 'pt' | 'en'
