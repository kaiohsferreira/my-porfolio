export const DEFAULT_API_BASE_URL = 'https://my-portfolio-be-production-92b1.up.railway.app'
const DEFAULT_PORTFOLIO_URL = 'https://kaioferreira.com'
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
  user?: AdminUserInfo
}

export interface AdminUserInfo {
  id: string
  fullName?: string
  hasPortfolio?: boolean
  area?: string | null
  email: string
  name?: string | null
  lastName?: string | null
  cep?: string | null
  stateId?: number | null
  stateStr?: string | null
  cityId?: number | null
  cityStr?: string | null
  addressStr?: string | null
  neighborhood?: string | null
  addressDistrict?: string | null
  number?: number | null
  complement?: string | null
  phoneNumber?: string | null
  secondaryPhoneNumber?: string | null
  genderId?: number | null
  genderStr?: string | null
  cpf?: string | null
  birthDateStr?: string | null
  birthDate?: string | null
  roles?: string | null
  rolesList?: string[] | null
  rolesId?: string[] | null
  managementsName?: string | null
  managementsId?: Array<number | string> | null
  managementsList?: Array<unknown> | null
  organizationsIds?: Array<number | string> | null
  organizationsNames?: string[] | null
  managementSelectedId?: number | string | null
  managementMatrixId?: number | string | null
  rolesStr?: string[] | null
}

interface ApiEnvelopeShape<T> {
  success?: boolean
  object?: T
  message?: string | null
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
  photoUrl?: string | null
  resumeUrl?: string | null
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
  profileImage?: FilePayload | null
  resumeFile?: FilePayload | null
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

export interface DashboardSummary {
  publishedProjectsCount: number
  skillsCount: number
  unreadMessagesCount: number
  visitorsThisMonth: number
  visitorsLastMonth: number
  visitorGrowthPercent: number
  recentMessages: ContactMessageAdmin[]
  featuredProjects: AdminProject[]
}

export interface PortfolioSetupUrlCheck {
  available: boolean
  message: string
}

export interface PortfolioSetupCreatePayload {
  name: string
  portfolioUrl: string
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

export interface AdminProject {
  id: number
  title: string
  description: string | null
  repositoryUrl: string | null
  liveUrl: string | null
  tags: string[]
  status: 'RASCUNHO' | 'PUBLICADO'
  isFeatured: boolean
  createdAt?: string | null
  updatedAt?: string | null
}

export interface AdminProjectSavePayload {
  title: string
  description?: string | null
  repositoryUrl?: string | null
  liveUrl?: string | null
  tags: string[]
  status: 'RASCUNHO' | 'PUBLICADO'
  isFeatured: boolean
}

export interface AdminSkill {
  id: number
  name: string
  category: string | null
  iconName?: string | null
  level: number
  sortOrder: number
}

export interface AdminSkillSavePayload {
  name: string
  category?: string | null
  iconName?: string | null
  level: number
  sortOrder: number
}

export interface AdminExperience {
  id: number
  role: string
  company: string
  period: string | null
  description: string | null
  sortOrder: number
}

export interface AdminExperienceSavePayload {
  role: string
  company: string
  period?: string | null
  description?: string | null
  sortOrder: number
}

export interface PublicContactMessagePayload {
  senderName: string
  senderEmail: string
  body: string
}

export interface ContactMessageAdmin {
  id: number
  senderName: string
  senderEmail: string
  body: string
  isRead: boolean
  createdAt: string
}

export interface VisitorTopPage {
  page: string
  count: number
}

export interface VisitorMonthlyPoint {
  month: string
  count: number
}

export interface VisitorStatsAdmin {
  totalThisMonth: number
  totalLastMonth: number
  growthPercent: number
  uniqueSessionsThisMonth: number
  topCountry: string | null
  topPages: VisitorTopPage[]
  monthlyChart: VisitorMonthlyPoint[]
}

/**
 * Os nomes aqui precisam bater com ResetPasswordSignInVO no backend
 * (OldPassword / NewPassword). O ASP.NET casa por nome, sem diferenciar maiúsculas,
 * então oldPassword/newPassword servem — currentPassword, não.
 */
export interface ResetPasswordPayload {
  oldPassword: string
  newPassword: string
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

export function getPortfolioUrl() {
  const explicitUrl = (import.meta.env.VITE_PORTFOLIO_URL as string | undefined)?.trim()
  if (explicitUrl) return explicitUrl

  if (typeof window === 'undefined') return DEFAULT_PORTFOLIO_URL

  const { protocol, hostname } = window.location
  const normalizedProtocol = protocol === 'http:' || protocol === 'https:' ? protocol : 'https:'
  const parts = hostname.toLowerCase().split('.').filter(Boolean)
  if (!parts.length) return DEFAULT_PORTFOLIO_URL

  if (parts[0] === 'localhost' || parts[0] === '127' || parts[0] === '0') {
    return DEFAULT_PORTFOLIO_URL
  }

  const normalizedHost =
    parts[0] === 'admin' || parts[0] === 'www'
      ? parts.slice(1).join('.')
      : hostname.toLowerCase()
  return `${normalizedProtocol}//${normalizedHost}`
}

/**
 * URLs a tentar, em ordem, para achar o portfólio na API.
 *
 * O backend casa a URL por igualdade exata contra o campo cadastrado, então o domínio de
 * onde o site é servido precisa ser o mesmo que está no cadastro. Quando não é (deploy
 * num domínio novo, preview da Vercel, .com contra .com.br), a derivação pelo hostname
 * devolve 404 e o site cairia calado no conteúdo de exemplo. Tentar também a URL canônica
 * evita isso. Defina VITE_PORTFOLIO_URL para fixar uma só e pular a tentativa.
 */
export function getPortfolioUrlCandidates() {
  const candidates = [getPortfolioUrl(), DEFAULT_PORTFOLIO_URL]
  return candidates.filter((url, index) => url && candidates.indexOf(url) === index)
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

function unwrapApiBody<T>(body: T | ApiEnvelopeShape<T>) {
  const maybeEnvelope = body as ApiEnvelopeShape<T>
  if (maybeEnvelope && typeof maybeEnvelope === 'object' && 'object' in maybeEnvelope) {
    if (maybeEnvelope.success === false) {
      throw new ApiError(maybeEnvelope.message || 'A API retornou uma falha inesperada', 400)
    }

    return maybeEnvelope.object as T
  }

  return body as T
}

function normalizeErrorMessage(message: string) {
  return message
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function isMissingProfileError(error: unknown) {
  if (!isApiError(error)) return false
  if (error.status !== 400 && error.status !== 404) return false

  const message = normalizeErrorMessage(error.message || '')
  return message.includes('perfil') && (message.includes('nao encontrado') || message.includes('not found'))
}

function normalizePortfolioProfile<T extends PortfolioProfilePublic>(profile: T): T {
  return {
    ...profile,
    profileImageUrl: profile.profileImageUrl ?? profile.photoUrl ?? null,
    resumeFileUrl: profile.resumeFileUrl ?? profile.resumeUrl ?? null,
    stats: profile.stats ?? [],
    socialLinks: profile.socialLinks ?? [],
  }
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
  const session = await apiRequest<AdminAuthSession | ApiEnvelopeShape<AdminAuthSession>>('/Account/Login', {
    method: 'POST',
    body: { email, password },
    unwrapEnvelope: false,
  })

  return unwrapApiBody(session)
}

export async function getAdminUserInfo(token: string) {
  const candidatePaths = ['/Account/UserInfo', '/Account/userinfo', '/UserInfo']
  let lastError: unknown = null

  for (const path of candidatePaths) {
    try {
      const response = await apiRequest<AdminUserInfo | ApiEnvelopeShape<AdminUserInfo>>(path, {
        token,
        unwrapEnvelope: false,
      })

      return unwrapApiBody(response)
    } catch (error) {
      if (isApiError(error) && error.status === 404) {
        lastError = error
        continue
      }

      throw error
    }
  }

  if (lastError instanceof Error) throw lastError
  throw new Error('Nao foi possivel localizar o endpoint UserInfo no backend.')
}

export async function checkPortfolioSetupUrl(token: string, portfolioUrl: string) {
  const encodedUrl = encodeURIComponent(portfolioUrl)
  return apiRequest<PortfolioSetupUrlCheck>(`/PortfolioSetup/CheckUrl?url=${encodedUrl}`, {
    token,
  })
}

export async function createPortfolioSetup(token: string, payload: PortfolioSetupCreatePayload) {
  return apiRequest<void>('/PortfolioSetup/Create', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function getPublicPortfolioProfile(portfolioUrl = getPortfolioUrl()) {
  const encodedUrl = encodeURIComponent(portfolioUrl)
  const profile = await apiRequest<PortfolioProfilePublic>(`/PublicPortfolioProfile/Get?url=${encodedUrl}`)
  return normalizePortfolioProfile(profile)
}

export async function getPublicSocialLinks(portfolioUrl = getPortfolioUrl()) {
  const encodedUrl = encodeURIComponent(portfolioUrl)
  return apiRequest<SocialLinkPublic[]>(`/PublicSocialLink/GetActive?url=${encodedUrl}`)
}

export async function getPublicSkills(portfolioUrl = getPortfolioUrl()) {
  const encodedUrl = encodeURIComponent(portfolioUrl)
  return apiRequest<AdminSkill[]>(`/PublicSkill/GetAll?url=${encodedUrl}`)
}

/** Somente os projetos com status PUBLICADO. O backend filtra; rascunhos nunca saem daqui. */
export async function getPublicProjects(portfolioUrl = getPortfolioUrl()) {
  const encodedUrl = encodeURIComponent(portfolioUrl)
  const projects = await apiRequest<AdminProject[]>(`/PublicProject/GetPublished?url=${encodedUrl}`)
  return (projects ?? []).map((project) => ({
    ...project,
    tags: project.tags ?? [],
  }))
}

export async function sendPublicContactMessage(payload: PublicContactMessagePayload, portfolioUrl = getPortfolioUrl()) {
  const encodedUrl = encodeURIComponent(portfolioUrl)
  return apiRequest<void>(`/PublicContactMessage/Send?url=${encodedUrl}`, {
    method: 'POST',
    body: payload,
  })
}

export async function getAdminPortfolioProfile(token: string) {
  try {
    const profile = await apiRequest<PortfolioProfileAdmin>('/PortfolioProfile/Get', { token })
    return normalizePortfolioProfile(profile)
  } catch (error) {
    if (isMissingProfileError(error)) {
      return null
    }

    throw error
  }
}

export async function prepareAdminPortfolioProfile(token: string) {
  return getAdminPortfolioProfile(token)
}

export async function saveAdminPortfolioProfile(token: string, payload: PortfolioProfileSavePayload) {
  return apiRequest<void>('/PortfolioProfile/Save', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function uploadAdminProfileImage(token: string, payload: FilePayload) {
  return apiRequest<void>('/PortfolioProfile/UploadImage', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function removeAdminProfileImage(token: string) {
  return apiRequest<void>('/PortfolioProfile/RemoveImage', {
    method: 'POST',
    token,
  })
}

export async function uploadAdminResume(token: string, payload: FilePayload) {
  return apiRequest<void>('/PortfolioProfile/UploadResume', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function removeAdminResume(token: string) {
  return apiRequest<void>('/PortfolioProfile/RemoveResume', {
    method: 'POST',
    token,
  })
}

export async function getAdminProfileStats(token: string) {
  try {
    return await apiRequest<PortfolioStat[]>('/ProfileStat/GetAll', { token })
  } catch (error) {
    if (isMissingProfileError(error)) {
      return []
    }

    throw error
  }
}

export async function createAdminProfileStat(token: string, payload: PortfolioStatSavePayload) {
  return apiRequest<void>('/ProfileStat/Save', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function prepareAdminProfileStat(token: string, id: number) {
  return apiRequest<PortfolioStat>(`/ProfileStat/Prepare?id=${encodeURIComponent(String(id))}`, { token })
}

export async function updateAdminProfileStat(token: string, id: number, payload: PortfolioStatSavePayload) {
  return apiRequest<void>(`/ProfileStat/Update/${id}`, {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function deleteAdminProfileStat(token: string, id: number) {
  return apiRequest<void>(`/ProfileStat/Delete/${id}`, {
    method: 'POST',
    token,
  })
}

export async function reorderAdminProfileStats(token: string, items: ReorderItemPayload[]) {
  return apiRequest<void>('/ProfileStat/Reorder', {
    method: 'POST',
    token,
    body: items,
  })
}

export async function getAdminSocialLinks(token: string) {
  return apiRequest<SocialLinkAdmin[]>('/SocialLink/GetAll', { token })
}

export async function createAdminSocialLink(token: string, payload: SocialLinkSavePayload) {
  return apiRequest<void>('/SocialLink/Save', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function prepareAdminSocialLink(token: string, id: number) {
  return apiRequest<SocialLinkAdmin>(`/SocialLink/Prepare?id=${encodeURIComponent(String(id))}`, { token })
}

export async function updateAdminSocialLink(token: string, id: number, payload: SocialLinkSavePayload) {
  return apiRequest<void>(`/SocialLink/Update/${id}`, {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function deleteAdminSocialLink(token: string, id: number) {
  return apiRequest<void>(`/SocialLink/Delete/${id}`, {
    method: 'POST',
    token,
  })
}

export async function toggleAdminSocialLink(token: string, id: number) {
  return apiRequest<void>(`/SocialLink/Toggle/${id}`, {
    method: 'POST',
    token,
  })
}

export async function reorderAdminSocialLinks(token: string, items: ReorderItemPayload[]) {
  return apiRequest<void>('/SocialLink/Reorder', {
    method: 'POST',
    token,
    body: items,
  })
}

export async function getAdminDashboard(token: string) {
  return apiRequest<DashboardSummary>('/Dashboard/Get', { token })
}

export async function getAdminProjects(token: string) {
  return apiRequest<AdminProject[]>('/Project/GetAll', { token })
}

export async function createAdminProject(token: string, payload: AdminProjectSavePayload) {
  return apiRequest<void>('/Project/Save', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function prepareAdminProject(token: string, id: number) {
  return apiRequest<AdminProject>(`/Project/Prepare?id=${encodeURIComponent(String(id))}`, { token })
}

export async function updateAdminProject(token: string, id: number, payload: AdminProjectSavePayload) {
  return apiRequest<void>(`/Project/Update/${id}`, {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function deleteAdminProject(token: string, id: number) {
  return apiRequest<void>(`/Project/Delete/${id}`, {
    method: 'POST',
    token,
  })
}

export async function getAdminSkills(token: string) {
  return apiRequest<AdminSkill[]>('/Skill/GetAll', { token })
}

export async function createAdminSkill(token: string, payload: AdminSkillSavePayload) {
  return apiRequest<void>('/Skill/Save', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function prepareAdminSkill(token: string, id: number) {
  return apiRequest<AdminSkill>(`/Skill/Prepare?id=${encodeURIComponent(String(id))}`, { token })
}

export async function updateAdminSkill(token: string, id: number, payload: AdminSkillSavePayload) {
  return apiRequest<void>(`/Skill/Update/${id}`, {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function deleteAdminSkill(token: string, id: number) {
  return apiRequest<void>(`/Skill/Delete/${id}`, {
    method: 'POST',
    token,
  })
}

export async function reorderAdminSkills(token: string, items: ReorderItemPayload[]) {
  return apiRequest<void>('/Skill/Reorder', {
    method: 'POST',
    token,
    body: items,
  })
}

export async function getAdminExperiences(token: string) {
  return apiRequest<AdminExperience[]>('/Experience/GetAll', { token })
}

export async function createAdminExperience(token: string, payload: AdminExperienceSavePayload) {
  return apiRequest<void>('/Experience/Save', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function prepareAdminExperience(token: string, id: number) {
  return apiRequest<AdminExperience>(`/Experience/Prepare?id=${encodeURIComponent(String(id))}`, { token })
}

export async function updateAdminExperience(token: string, id: number, payload: AdminExperienceSavePayload) {
  return apiRequest<void>(`/Experience/Update/${id}`, {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function deleteAdminExperience(token: string, id: number) {
  return apiRequest<void>(`/Experience/Delete/${id}`, {
    method: 'POST',
    token,
  })
}

export async function reorderAdminExperiences(token: string, items: ReorderItemPayload[]) {
  return apiRequest<void>('/Experience/Reorder', {
    method: 'POST',
    token,
    body: items,
  })
}

export async function getAdminMessages(token: string) {
  return apiRequest<ContactMessageAdmin[]>('/ContactMessage/GetAll', { token })
}

export async function prepareAdminMessage(token: string, id: number) {
  return apiRequest<ContactMessageAdmin>(`/ContactMessage/Prepare?id=${encodeURIComponent(String(id))}`, { token })
}

export async function markAdminMessageAsRead(token: string, id: number) {
  return apiRequest<void>(`/ContactMessage/MarkAsRead/${id}`, {
    method: 'POST',
    token,
  })
}

export async function deleteAdminMessage(token: string, id: number) {
  return apiRequest<void>(`/ContactMessage/Delete/${id}`, {
    method: 'POST',
    token,
  })
}

export async function getAdminVisitorStats(token: string) {
  return apiRequest<VisitorStatsAdmin>('/Visitor/GetStats', { token })
}

export async function resetAdminPassword(token: string, payload: ResetPasswordPayload) {
  return apiRequest<void>('/Account/ResetPasswordSignIn', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function saveAdminAccount(token: string, payload: Record<string, unknown>) {
  return apiRequest<void>('/Account/Save', {
    method: 'POST',
    token,
    body: payload,
  })
}
