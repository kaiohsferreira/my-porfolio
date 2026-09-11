import type {
  AdminExperience,
  AdminExperienceSavePayload,
  AdminProject,
  AdminProjectSavePayload,
  AdminSkill,
  AdminSkillSavePayload,
  AdminUserInfo,
  ContactMessageAdmin,
  PortfolioProfileAdmin,
  PortfolioProfileSavePayload,
  PortfolioStat,
  SocialLinkAdmin,
} from '@/lib/portfolio-api'
import type { Experience, Message, Project, Skill } from '@/types'
import {
  ABOUT_INITIAL_STATE,
  type AboutState,
  type LinkItem,
  type OnboardingProfileState,
  type StatItem,
} from './types'

export function mapProfileToAboutState(profile: PortfolioProfileAdmin | null): AboutState {
  if (!profile) return ABOUT_INITIAL_STATE

  return {
    fullName: profile.fullName || '',
    headline: profile.headline || '',
    headlineEn: profile.headlineEn || '',
    location: profile.location || '',
    bioPt: profile.bioPt || '',
    bioEn: profile.bioEn || '',
    availableForWork: profile.availableForWork,
    sinceYear: profile.sinceYear ? String(profile.sinceYear) : '',
    profileImageUrl: profile.profileImageUrl || null,
    resumeFileUrl: profile.resumeFileUrl || null,
  }
}

export function mapStatToItem(stat: PortfolioStat): StatItem {
  return {
    id: stat.id,
    labelPt: stat.labelPt,
    labelEn: stat.labelEn || '',
    value: stat.value,
    icon: stat.icon || '',
    sortOrder: stat.sortOrder,
  }
}

export function mapProjectToItem(project: AdminProject): Project {
  return {
    id: project.id,
    title: project.title,
    desc: project.description || '',
    tags: project.tags || [],
    repo: project.repositoryUrl || '',
    liveUrl: project.liveUrl || '',
    featured: project.isFeatured,
    status: project.status === 'PUBLICADO' ? 'published' : 'draft',
    thumb: project.coverImageUrl || null,
    coverFile: null,
    createdAt: project.createdAt || null,
    updatedAt: project.updatedAt || null,
  }
}

export function mapProjectToPayload(project: Project): AdminProjectSavePayload {
  return {
    title: project.title.trim(),
    description: project.desc.trim() || null,
    repositoryUrl: project.repo.trim() || null,
    liveUrl: project.liveUrl.trim() || null,
    tags: project.tags,
    status: project.status === 'published' ? 'PUBLICADO' : 'RASCUNHO',
    isFeatured: project.featured,
    coverImage: project.coverFile ?? null,
  }
}

export function mapSkillToItem(skill: AdminSkill): Skill {
  return {
    id: skill.id,
    name: skill.name,
    category: skill.category || 'Sem categoria',
    iconName: skill.iconName || '',
    level: skill.level,
    sortOrder: skill.sortOrder,
  }
}

export function mapSkillToPayload(skill: Skill, fallbackSortOrder: number): AdminSkillSavePayload {
  return {
    name: skill.name.trim(),
    category: skill.category.trim() || null,
    iconName: skill.iconName.trim() || null,
    level: skill.level,
    sortOrder: skill.sortOrder ?? fallbackSortOrder,
  }
}

export function mapExperienceToItem(experience: AdminExperience): Experience {
  return {
    id: experience.id,
    role: experience.role,
    company: experience.company,
    period: experience.period || '',
    desc: experience.description || '',
    sortOrder: experience.sortOrder,
  }
}

export function mapExperienceToPayload(experience: Experience, fallbackSortOrder: number): AdminExperienceSavePayload {
  return {
    role: experience.role.trim(),
    company: experience.company.trim(),
    period: experience.period.trim() || null,
    description: experience.desc.trim() || null,
    sortOrder: experience.sortOrder ?? fallbackSortOrder,
  }
}

export function formatAdminDate(value: string | null | undefined) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export function mapMessageToItem(message: ContactMessageAdmin): Message {
  return {
    id: message.id,
    name: message.senderName,
    email: message.senderEmail,
    msg: message.body,
    date: formatAdminDate(message.createdAt),
    read: message.isRead,
    createdAt: message.createdAt,
  }
}

export function hasValidManagementSelection(user: AdminUserInfo | null) {
  if (!user) return false

  const value = user.managementSelectedId
  if (value === null || value === undefined) return false

  if (typeof value === 'number') return value > 0
  if (typeof value === 'string') {
    const normalized = value.trim()
    if (!normalized || normalized === '0') return false
    const asNumber = Number(normalized)
    if (!Number.isNaN(asNumber)) return asNumber > 0
    return true
  }

  return true
}

export function shouldShowPortfolioSetup(user: AdminUserInfo | null) {
  if (!user) return false
  if (user.hasPortfolio === false) return true
  if (user.hasPortfolio === true) return false
  if (hasValidManagementSelection(user)) return false

  const managementIdsCount = Array.isArray(user.managementsId) ? user.managementsId.length : 0
  const managementListCount = Array.isArray(user.managementsList) ? user.managementsList.length : 0

  return managementIdsCount === 0 && managementListCount === 0
}

export function getAdminDisplayName(user: AdminUserInfo | null) {
  if (!user) return 'Administrador'
  return user.fullName || [user.name, user.lastName].filter(Boolean).join(' ').trim() || user.email || 'Administrador'
}

export function buildUserLocation(user: AdminUserInfo | null) {
  if (!user) return null

  const city = user.cityStr?.trim()
  const state = user.stateStr?.trim()

  if (city && state) return `${city}, ${state}`
  if (city) return city
  if (state) return state

  return null
}

export function createInitialOnboardingProfileState(user: AdminUserInfo | null): OnboardingProfileState {
  const suggestedName = getAdminDisplayName(user)

  return {
    fullName: suggestedName === 'Administrador' ? '' : suggestedName,
    headline: '',
    headlineEn: '',
    location: buildUserLocation(user) || '',
    bioPt: '',
    bioEn: '',
    availableForWork: true,
    sinceYear: '',
  }
}

export function toNullableTrimmedText(value: string) {
  const normalized = value.trim()
  return normalized || null
}

export function mapOnboardingProfileToPayload(profile: OnboardingProfileState): PortfolioProfileSavePayload {
  return {
    fullName: profile.fullName.trim(),
    headline: toNullableTrimmedText(profile.headline),
    headlineEn: toNullableTrimmedText(profile.headlineEn),
    location: toNullableTrimmedText(profile.location),
    bioPt: toNullableTrimmedText(profile.bioPt),
    bioEn: toNullableTrimmedText(profile.bioEn),
    availableForWork: profile.availableForWork,
    sinceYear: profile.sinceYear.trim() ? Number(profile.sinceYear) : null,
    profileImage: null,
    resumeFile: null,
  }
}

export function getEmptyLoadedSections() {
  return {
    dashboard: false,
    projects: false,
    skills: false,
    experiences: false,
    messages: false,
    visitors: false,
    about: false,
    links: false,
  }
}

export function mapLinkToItem(link: SocialLinkAdmin): LinkItem {
  return {
    id: link.id,
    platform: link.platform,
    label: link.label || '',
    url: link.url,
    icon: link.icon || '',
    active: link.isActive,
    sortOrder: link.sortOrder,
  }
}

export function withProtocol(url: string) {
  if (!url) return '#'
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) return url
  return `https://${url}`
}

export function normalizePortfolioUrl(value: string) {
  return value.trim()
}

export function isValidPortfolioUrl(portfolioUrl: string) {
  try {
    const parsed = new URL(portfolioUrl)
    return (parsed.protocol === 'https:' || parsed.protocol === 'http:') && !!parsed.hostname
  } catch {
    return false
  }
}
