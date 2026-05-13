export const DEFAULT_API_BASE_URL = 'https://my-portfolio-be-production-92b1.up.railway.app'
const DEFAULT_PORTFOLIO_SLUG = 'kaioferreira'
const ADMIN_AUTH_STORAGE_KEY = 'portfolio-admin-auth'

export interface ApiResponseEnvelope<T> {
  success: boolean
  number: number
  object: T
  message?: string | null
}

export interface AdminAuthSession {
  token: string
  refreshToken: string
  expiration?: string
  accepted?: boolean
}

export interface PortfolioProfilePublic {
  fullName: string
  headline: string | null
  headlineEn: string | null
  location: string | null
  bioPt: string | null
  bioEn: string | null
  availableForWork: boolean
  sinceYear: number | null
  profileImageUrl: string | null
  resumeFileUrl: string | null
  stats: PortfolioStat[]
  socialLinks: SocialLinkPublic[]
}

export interface PortfolioProfileAdmin extends PortfolioProfilePublic {
  id: number
  managementId: number
}

export interface PortfolioProfileSavePayload {
  fullName: string
  headline?: string | null
  headlineEn?: string | null
  location?: string | null
  bioPt?: string | null
  bioEn?: string | null
  availableForWork: boolean
  sinceYear?: number | null
}

export interface PortfolioStat {
  id: number
  labelPt: string
  labelEn: string | null
  value: string
  icon: string | null
  sortOrder: number
}

export interface PortfolioStatSavePayload {
  labelPt: string
  labelEn?: string | null
  value: string
  icon?: string | null
  sortOrder: number
}

export interface ReorderItemPayload {
  id: number
  sortOrder: number
}

export interface SocialLinkPublic {
  platform: string
  label: string | null
  url: string
  icon: string | null
  sortOrder: number
}

export interface SocialLinkAdmin extends SocialLinkPublic {
  id: number
  managementId: number
  isActive: boolean
}

export interface SocialLinkSavePayload {
  platform: string
  label?: string | null
  url: string
  icon?: string | null
  isActive: boolean
  sortOrder: number
}

export interface FilePayload {
  file: string
  name: string
}

class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function getApiBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || DEFAULT_API_BASE_URL
}

export function getPortfolioSlug() {
  const explicitSlug = (import.meta.env.VITE_PORTFOLIO_SLUG as string | undefined)?.trim()
  if (explicitSlug) return explicitSlug

  if (typeof window === 'undefined') return DEFAULT_PORTFOLIO_SLUG

  const parts = window.location.hostname.toLowerCase().split('.').filter(Boolean)
  if (!parts.length) return DEFAULT_PORTFOLIO_SLUG

  if (parts[0] === 'localhost' || parts[0] === '127' || parts[0] === '0') {
    return DEFAULT_PORTFOLIO_SLUG
  }

  const filteredParts = parts.filter((part) => part !== 'www' && part !== 'admin')
  return filteredParts[0] || DEFAULT_PORTFOLIO_SLUG
}

function getDefaultHeaders(token?: string) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  if (token) headers.Authorization = `Bearer ${token}`

  return headers
}

async function parseResponse<T>(response: Response, unwrapEnvelope = true): Promise<T> {
  const isJson = response.headers.get('content-type')?.includes('application/json')
  const body = isJson ? await response.json() : null

  if (!response.ok) {
    const message = body?.message || body?.title || response.statusText || 'Erro ao comunicar com a API'
    throw new ApiError(message, response.status)
  }

  if (!unwrapEnvelope) return body as T

  const envelope = body as ApiResponseEnvelope<T>
  if (!envelope?.success) {
    throw new ApiError(envelope?.message || 'A API retornou uma falha inesperada', response.status)
  }

  return envelope.object
}

async function apiRequest<T>(
  path: string,
  options: {
    method?: string
    body?: unknown
    token?: string
    unwrapEnvelope?: boolean
  } = {},
) {
  const { method = 'GET', body, token, unwrapEnvelope = true } = options

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers: {
      ...getDefaultHeaders(token),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  return parseResponse<T>(response, unwrapEnvelope)
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function getStoredAdminSession() {
  if (typeof window === 'undefined') return null

  const raw = window.localStorage.getItem(ADMIN_AUTH_STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AdminAuthSession
  } catch {
    window.localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY)
    return null
  }
}

export function storeAdminSession(session: AdminAuthSession) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function clearAdminSession() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY)
}

export async function loginAdmin(email: string, password: string) {
  return apiRequest<AdminAuthSession>('/Account/Login', {
    method: 'POST',
    body: { email, password },
    unwrapEnvelope: false,
  })
}

export async function getPublicPortfolioProfile(slug = getPortfolioSlug()) {
  return apiRequest<PortfolioProfilePublic>(`/public/portfolio/${slug}/profile`)
}

export async function getAdminPortfolioProfile(token: string) {
  try {
    return await apiRequest<PortfolioProfileAdmin>('/admin/portfolio/profile', { token })
  } catch (error) {
    if (isApiError(error) && error.status === 404) {
      return null
    }

    throw error
  }
}

export async function saveAdminPortfolioProfile(token: string, payload: PortfolioProfileSavePayload) {
  return apiRequest<void>('/admin/portfolio/profile', {
    method: 'PUT',
    token,
    body: payload,
  })
}

export async function uploadAdminProfileImage(token: string, payload: FilePayload) {
  return apiRequest<void>('/admin/portfolio/profile/image', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function removeAdminProfileImage(token: string) {
  return apiRequest<void>('/admin/portfolio/profile/image', {
    method: 'DELETE',
    token,
  })
}

export async function uploadAdminResume(token: string, payload: FilePayload) {
  return apiRequest<void>('/admin/portfolio/profile/resume', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function removeAdminResume(token: string) {
  return apiRequest<void>('/admin/portfolio/profile/resume', {
    method: 'DELETE',
    token,
  })
}

export async function getAdminProfileStats(token: string) {
  return apiRequest<PortfolioStat[]>('/admin/portfolio/profile/stats', { token })
}

export async function createAdminProfileStat(token: string, payload: PortfolioStatSavePayload) {
  return apiRequest<void>('/admin/portfolio/profile/stats', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function updateAdminProfileStat(token: string, id: number, payload: PortfolioStatSavePayload) {
  return apiRequest<void>(`/admin/portfolio/profile/stats/${id}`, {
    method: 'PUT',
    token,
    body: payload,
  })
}

export async function deleteAdminProfileStat(token: string, id: number) {
  return apiRequest<void>(`/admin/portfolio/profile/stats/${id}`, {
    method: 'DELETE',
    token,
  })
}

export async function reorderAdminProfileStats(token: string, items: ReorderItemPayload[]) {
  return apiRequest<void>('/admin/portfolio/profile/stats/reorder', {
    method: 'PUT',
    token,
    body: items,
  })
}

export async function getAdminSocialLinks(token: string) {
  return apiRequest<SocialLinkAdmin[]>('/admin/portfolio/social-link', { token })
}

export async function createAdminSocialLink(token: string, payload: SocialLinkSavePayload) {
  return apiRequest<void>('/admin/portfolio/social-link', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function updateAdminSocialLink(token: string, id: number, payload: SocialLinkSavePayload) {
  return apiRequest<void>(`/admin/portfolio/social-link/${id}`, {
    method: 'PUT',
    token,
    body: payload,
  })
}

export async function deleteAdminSocialLink(token: string, id: number) {
  return apiRequest<void>(`/admin/portfolio/social-link/${id}`, {
    method: 'DELETE',
    token,
  })
}

export async function toggleAdminSocialLink(token: string, id: number) {
  return apiRequest<void>(`/admin/portfolio/social-link/${id}/toggle`, {
    method: 'PATCH',
    token,
  })
}

export async function reorderAdminSocialLinks(token: string, items: ReorderItemPayload[]) {
  return apiRequest<void>('/admin/portfolio/social-link/reorder', {
    method: 'PUT',
    token,
    body: items,
  })
}
