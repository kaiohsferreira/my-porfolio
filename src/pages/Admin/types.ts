export type AdminSection =
  | 'dashboard'
  | 'projects'
  | 'skills'
  | 'experiences'
  | 'messages'
  | 'visitors'
  | 'about'
  | 'links'
  | 'settings'

export interface LinkItem {
  id: number
  platform: string
  label: string
  url: string
  icon: string
  active: boolean
  sortOrder: number
}

export interface AboutState {
  fullName: string
  headline: string
  headlineEn: string
  location: string
  bioPt: string
  bioEn: string
  availableForWork: boolean
  sinceYear: string
  profileImageUrl: string | null
  resumeFileUrl: string | null
}

export interface OnboardingProfileState {
  fullName: string
  headline: string
  headlineEn: string
  location: string
  bioPt: string
  bioEn: string
  availableForWork: boolean
  sinceYear: string
}

export interface StatItem {
  id: number
  labelPt: string
  labelEn: string
  value: string
  icon: string
  sortOrder: number
}

/**
 * A tela de configuracoes so guarda a troca de senha.
 *
 * A URL da API e o token de sessao sairam daqui: um e configuracao de build, o outro e a
 * credencial da propria sessao. Nenhum dos dois deveria trafegar entre backend e tela, e muito
 * menos aparecer num campo. O email fica visivel, mas somente para leitura: nao existe endpoint
 * que troque o email da conta (o UpdateUserLogIntoVO do backend nem carrega esse campo).
 */
export interface SettingsState {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

/** Mesmos limites do ResetPasswordSignInVO, para o erro aparecer antes da viagem ao servidor. */
export const PASSWORD_MIN_LENGTH = 6
export const PASSWORD_MAX_LENGTH = 50

export interface NavItem {
  id: AdminSection
  label: string
  icon: IconName
  badge?: number
}

export type IconName =
  | 'dashboard'
  | 'projects'
  | 'skills'
  | 'experiences'
  | 'messages'
  | 'visitors'
  | 'about'
  | 'links'
  | 'settings'
  | 'plus'
  | 'edit'
  | 'trash'
  | 'logout'
  | 'check'
  | 'close'
  | 'globe'
  | 'mail'
  | 'search'
  | 'arrowLeft'
  | 'monitor'
  | 'smartphone'
  | 'tablet'
  | 'star'
  | 'trending'

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Início', icon: 'dashboard' },
  { id: 'projects', label: 'Projetos', icon: 'projects' },
  { id: 'skills', label: 'Skills', icon: 'skills' },
  { id: 'experiences', label: 'Experiências', icon: 'experiences' },
  { id: 'messages', label: 'Mensagens', icon: 'messages', badge: 2 },
  { id: 'visitors', label: 'Visitantes', icon: 'visitors' },
  { id: 'about', label: 'Perfil', icon: 'about' },
  { id: 'links', label: 'Links sociais', icon: 'links' },
  { id: 'settings', label: 'Configurações', icon: 'settings' },
]

export const ABOUT_INITIAL_STATE: AboutState = {
  fullName: 'Kaio Henrique',
  headline: 'Desenvolvedor Full Stack',
  headlineEn: 'Full Stack Developer',
  location: 'Brasil',
  bioPt: 'Desenvolvedor Full Stack apaixonado por criar experiencias digitais com foco em performance, clareza visual e manutencao a longo prazo.',
  bioEn: 'Full Stack developer focused on building digital experiences with performance, visual clarity and long-term maintainability.',
  availableForWork: true,
  sinceYear: '2023',
  profileImageUrl: null,
  resumeFileUrl: null,
}

export const SETTINGS_INITIAL_STATE: SettingsState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}
