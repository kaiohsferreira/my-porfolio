import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import {
  MOCK_EXPERIENCES,
  MOCK_MESSAGES,
  MOCK_PROJECTS,
  MOCK_SKILLS,
  MOCK_VISITORS,
} from '@/data/mock'
import { useLanguage } from '@/context/LanguageContext'
import { readFileAsDataUrl } from '@/lib/file-utils'
import {
  DEFAULT_API_BASE_URL,
  clearAdminSession,
  createAdminProfileStat,
  createAdminSocialLink,
  deleteAdminProfileStat,
  deleteAdminSocialLink,
  getAdminPortfolioProfile,
  getAdminProfileStats,
  getAdminSocialLinks,
  getStoredAdminSession,
  isApiError,
  loginAdmin,
  removeAdminProfileImage,
  removeAdminResume,
  reorderAdminProfileStats,
  reorderAdminSocialLinks,
  saveAdminPortfolioProfile,
  storeAdminSession,
  toggleAdminSocialLink,
  updateAdminProfileStat,
  updateAdminSocialLink,
  uploadAdminProfileImage,
  uploadAdminResume,
  type AdminAuthSession,
  type PortfolioProfileAdmin,
  type PortfolioProfileSavePayload,
  type PortfolioStat,
  type PortfolioStatSavePayload,
  type ReorderItemPayload,
  type SocialLinkAdmin,
  type SocialLinkSavePayload,
} from '@/lib/portfolio-api'
import type { Experience, Message, Project, Skill, Visitor } from '@/types'

type AdminSection =
  | 'dashboard'
  | 'projects'
  | 'skills'
  | 'experiences'
  | 'messages'
  | 'visitors'
  | 'about'
  | 'links'
  | 'settings'

interface LinkItem {
  id: number
  platform: string
  label: string
  url: string
  icon: string
  active: boolean
  sortOrder: number
}

interface AboutState {
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

interface StatItem {
  id: number
  labelPt: string
  labelEn: string
  value: string
  icon: string
  sortOrder: number
}

interface SettingsState {
  apiUrl: string
  token: string
  email: string
  newPassword: string
  notifyByEmail: boolean
  weeklyVisitorsReport: boolean
}

interface NavItem {
  id: AdminSection
  label: string
  icon: IconName
  badge?: number
}

type IconName =
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

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'projects', label: 'Projetos', icon: 'projects' },
  { id: 'skills', label: 'Skills', icon: 'skills' },
  { id: 'experiences', label: 'Experiencias', icon: 'experiences' },
  { id: 'messages', label: 'Mensagens', icon: 'messages', badge: 2 },
  { id: 'visitors', label: 'Visitantes', icon: 'visitors' },
  { id: 'about', label: 'Sobre / Bio', icon: 'about' },
  { id: 'links', label: 'Links Sociais', icon: 'links' },
  { id: 'settings', label: 'Configuracoes', icon: 'settings' },
]

const ABOUT_INITIAL_STATE: AboutState = {
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

const SETTINGS_INITIAL_STATE: SettingsState = {
  apiUrl: DEFAULT_API_BASE_URL,
  token: '',
  email: '',
  newPassword: '',
  notifyByEmail: true,
  weeklyVisitorsReport: true,
}

const adminStyles = `
  .admin-page {
    --admin-sidebar-w: 248px;
    min-height: 100vh;
    background:
      radial-gradient(circle at top right, oklch(72% 0.25 160 / 0.07), transparent 28%),
      linear-gradient(180deg, var(--bg) 0%, #07070d 100%);
    color: var(--text);
    position: relative;
    cursor: default;
  }

  .admin-page * {
    cursor: inherit;
  }

  .admin-page a,
  .admin-page button {
    cursor: pointer;
  }

  .admin-page input,
  .admin-page textarea {
    cursor: text;
  }

  .admin-shell {
    min-height: 100vh;
  }

  .admin-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    width: var(--admin-sidebar-w);
    background: rgba(10, 10, 16, 0.94);
    border-right: 1px solid var(--border);
    backdrop-filter: blur(18px);
    z-index: 20;
  }

  .admin-main {
    margin-left: var(--admin-sidebar-w);
    min-height: 100vh;
    padding: 40px 40px 72px;
  }

  .admin-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
  }

  .admin-grid-3 {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
  }

  .admin-grid-4 {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 18px;
  }

  .admin-table-wrap {
    overflow-x: auto;
  }

  .admin-table {
    min-width: 720px;
  }

  .admin-muted {
    color: var(--text-muted);
  }

  .admin-dim {
    color: var(--text-dim);
  }

  .admin-status-online {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: var(--green);
    box-shadow: 0 0 14px var(--green);
    animation: adminPulse 2s ease-in-out infinite;
  }

  @keyframes adminPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.45; transform: scale(0.9); }
  }

  @media (max-width: 1100px) {
    .admin-grid-4 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 960px) {
    .admin-sidebar {
      position: static;
      width: auto;
      border-right: none;
      border-bottom: 1px solid var(--border);
    }

    .admin-main {
      margin-left: 0;
      padding: 24px 16px 48px;
    }

    .admin-grid-2,
    .admin-grid-3,
    .admin-grid-4 {
      grid-template-columns: 1fr;
    }
  }
`

const cardBaseStyle: CSSProperties = {
  background: 'linear-gradient(180deg, rgba(18,18,28,0.98) 0%, rgba(10,10,16,0.98) 100%)',
  border: '1px solid var(--border)',
  padding: 24,
  position: 'relative',
  overflow: 'hidden',
}

const sectionEyebrowStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--text-dim)',
}

const inputStyle: CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border-bright)',
  color: 'var(--text)',
  fontFamily: 'var(--font-display)',
  fontSize: 14,
  padding: '11px 14px',
  width: '100%',
  outline: 'none',
}

function getNextId(values: Array<{ id: number }>) {
  return values.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

function mapProfileToAboutState(profile: PortfolioProfileAdmin | null): AboutState {
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

function mapStatToItem(stat: PortfolioStat): StatItem {
  return {
    id: stat.id,
    labelPt: stat.labelPt,
    labelEn: stat.labelEn || '',
    value: stat.value,
    icon: stat.icon || '',
    sortOrder: stat.sortOrder,
  }
}

function mapLinkToItem(link: SocialLinkAdmin): LinkItem {
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

function withProtocol(url: string) {
  if (!url) return '#'
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) return url
  return `https://${url}`
}

function Icon({ name, size = 16, color = 'currentColor' }: { name: IconName; size?: number; color?: string }) {
  const baseProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (name) {
    case 'dashboard':
      return (
        <svg {...baseProps}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      )
    case 'projects':
      return (
        <svg {...baseProps}>
          <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
        </svg>
      )
    case 'skills':
      return (
        <svg {...baseProps}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      )
    case 'experiences':
      return (
        <svg {...baseProps}>
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
      )
    case 'messages':
      return (
        <svg {...baseProps}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    case 'visitors':
      return (
        <svg {...baseProps}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case 'about':
      return (
        <svg {...baseProps}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      )
    case 'links':
      return (
        <svg {...baseProps}>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      )
    case 'settings':
      return (
        <svg {...baseProps}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82 2 2 0 1 1-2.83 2.83 1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51 2 2 0 1 1-4 0 1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33 2 2 0 1 1-2.83-2.83A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.6-1 2 2 0 1 1 0-4 1.65 1.65 0 0 0 1.6-1 1.65 1.65 0 0 0-.33-1.82 2 2 0 1 1 2.83-2.83 1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51 2 2 0 1 1 4 0 1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33 2 2 0 1 1 2.83 2.83A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.6 1 2 2 0 1 1 0 4 1.65 1.65 0 0 0-1.6 1z" />
        </svg>
      )
    case 'plus':
      return (
        <svg {...baseProps}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )
    case 'edit':
      return (
        <svg {...baseProps}>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
        </svg>
      )
    case 'trash':
      return (
        <svg {...baseProps}>
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      )
    case 'logout':
      return (
        <svg {...baseProps}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      )
    case 'check':
      return (
        <svg {...baseProps} strokeWidth={2.3}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )
    case 'close':
      return (
        <svg {...baseProps} strokeWidth={2.3}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )
    case 'globe':
      return (
        <svg {...baseProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
        </svg>
      )
    case 'mail':
      return (
        <svg {...baseProps}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <polyline points="3,7 12,13 21,7" />
        </svg>
      )
    case 'search':
      return (
        <svg {...baseProps}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      )
    case 'arrowLeft':
      return (
        <svg {...baseProps} strokeWidth={2}>
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      )
    case 'monitor':
      return (
        <svg {...baseProps}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      )
    case 'smartphone':
      return (
        <svg {...baseProps}>
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      )
    case 'tablet':
      return (
        <svg {...baseProps}>
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      )
    case 'star':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    case 'trending':
      return (
        <svg {...baseProps} strokeWidth={2}>
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      )
    default:
      return null
  }
}

function PanelCard({ children, accent, style }: { children: ReactNode; accent?: string; style?: CSSProperties }) {
  return (
    <div style={{ ...cardBaseStyle, ...style }}>
      {accent ? (
        <div
          style={{
            position: 'absolute',
            inset: '0 0 auto 0',
            height: 2,
            background: accent,
          }}
        />
      ) : null}
      {children}
    </div>
  )
}

function SectionTitle({ num, title, action }: { num: string; title: string; action?: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        marginBottom: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
        <span style={{ ...sectionEyebrowStyle, color: 'var(--green)' }}>{num}</span>
        <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)' }}>{title}</h2>
      </div>
      {action}
    </div>
  )
}

function ButtonPrimary({
  children,
  icon,
  onClick,
  type = 'button',
  small = false,
}: {
  children: ReactNode
  icon?: IconName
  onClick?: () => void
  type?: 'button' | 'submit'
  small?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        border: 'none',
        background: 'var(--green)',
        color: 'var(--bg)',
        padding: small ? '9px 12px' : '12px 16px',
        fontFamily: 'var(--font-mono)',
        fontSize: small ? 11 : 12,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        clipPath: 'polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))',
      }}
    >
      {icon ? <Icon name={icon} size={14} color="var(--bg)" /> : null}
      {children}
    </button>
  )
}

function ButtonOutline({
  children,
  icon,
  onClick,
  small = false,
}: {
  children: ReactNode
  icon?: IconName
  onClick?: () => void
  small?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        border: '1px solid var(--border-bright)',
        background: 'transparent',
        color: 'var(--text)',
        padding: small ? '9px 12px' : '12px 16px',
        fontFamily: 'var(--font-mono)',
        fontSize: small ? 11 : 12,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        clipPath: 'polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))',
      }}
    >
      {icon ? <Icon name={icon} size={14} color="var(--text)" /> : null}
      {children}
    </button>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={sectionEyebrowStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 5,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={sectionEyebrowStyle}>{label}</label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
      />
    </div>
  )
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        width: '100%',
        background: 'transparent',
        border: '1px solid var(--border)',
        padding: '12px 14px',
        color: 'var(--text)',
      }}
    >
      <span style={{ fontSize: 14, textAlign: 'left' }}>{label}</span>
      <span
        style={{
          position: 'relative',
          width: 40,
          height: 22,
          borderRadius: 999,
          background: checked ? 'var(--green)' : 'var(--surface2)',
          transition: 'background 0.2s ease',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: checked ? 21 : 3,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: checked ? 'var(--bg)' : 'var(--text-muted)',
            transition: 'left 0.2s ease',
          }}
        />
      </span>
    </button>
  )
}

function TagPill({ label, color = 'green' }: { label: string; color?: 'green' | 'cyan' | 'red' | 'yellow' }) {
  const palette = {
    green: {
      text: 'var(--green)',
      background: 'var(--green-glow)',
      border: 'oklch(72% 0.25 160 / 0.35)',
    },
    cyan: {
      text: 'var(--cyan)',
      background: 'var(--cyan-glow)',
      border: 'oklch(72% 0.25 220 / 0.35)',
    },
    red: {
      text: 'oklch(65% 0.22 25)',
      background: 'oklch(65% 0.22 25 / 0.14)',
      border: 'oklch(65% 0.22 25 / 0.35)',
    },
    yellow: {
      text: 'oklch(78% 0.18 90)',
      background: 'oklch(78% 0.18 90 / 0.14)',
      border: 'oklch(78% 0.18 90 / 0.35)',
    },
  }[color]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: `1px solid ${palette.border}`,
        background: palette.background,
        color: palette.text,
        padding: '3px 10px',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
      }}
    >
      {label}
    </span>
  )
}

function IconButton({ icon, label, onClick, color }: { icon: IconName; label: string; onClick: () => void; color?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        width: 34,
        height: 34,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: '1px solid var(--border)',
        color: color ?? 'var(--text-muted)',
      }}
    >
      <Icon name={icon} size={15} color={color ?? 'currentColor'} />
    </button>
  )
}

function TagInput({
  label,
  tags,
  onChange,
}: {
  label: string
  tags: string[]
  onChange: (next: string[]) => void
}) {
  const [draft, setDraft] = useState('')

  function commit(raw: string) {
    const value = raw.trim()
    if (!value) return
    if (!tags.includes(value)) onChange([...tags, value])
    setDraft('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={sectionEyebrowStyle}>{label}</label>
      <div
        style={{
          ...inputStyle,
          minHeight: 48,
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          paddingBlock: 8,
        }}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--cyan-glow)',
              border: '1px solid oklch(72% 0.25 220 / 0.35)',
              color: 'var(--cyan)',
              padding: '4px 8px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
            }}
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((current) => current !== tag))}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                fontSize: 14,
                lineHeight: 1,
                padding: 0,
              }}
            >
              x
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault()
              commit(draft)
            }
            if (event.key === 'Backspace' && !draft && tags.length) {
              onChange(tags.slice(0, -1))
            }
          }}
          onBlur={() => commit(draft)}
          placeholder={tags.length ? '' : 'Digite e pressione Enter'}
          style={{
            flex: 1,
            minWidth: 160,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: 'var(--text)',
            fontFamily: 'var(--font-display)',
            fontSize: 14,
          }}
        />
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: Project['status'] }) {
  return <TagPill label={status === 'published' ? 'Publicado' : 'Rascunho'} color={status === 'published' ? 'green' : 'yellow'} />
}

function MetricCard({
  label,
  value,
  sub,
  icon,
  color = 'var(--green)',
}: {
  label: string
  value: string | number
  sub: string
  icon: IconName
  color?: string
}) {
  return (
    <PanelCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <div style={sectionEyebrowStyle}>{label}</div>
          <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.04em', marginTop: 12, color: 'var(--text)' }}>{value}</div>
          <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>{sub}</div>
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            display: 'grid',
            placeItems: 'center',
            border: '1px solid var(--border)',
            background: 'rgba(255,255,255,0.02)',
            color,
          }}
        >
          <Icon name={icon} size={18} color={color} />
        </div>
      </div>
    </PanelCard>
  )
}

function LoginScreen({ onLogin }: { onLogin: (session: AdminAuthSession) => void }) {
  const [email, setEmail] = useState('kaio@dev.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Informe email e senha para acessar o painel.')
      return
    }

    try {
      setLoading(true)
      setError('')

      const session = await loginAdmin(email.trim(), password)
      if (!session?.token) {
        setError('A API nao retornou um token valido.')
        return
      }

      onLogin(session)
    } catch (loginError) {
      setError(isApiError(loginError) ? loginError.message : 'Nao foi possivel autenticar no backend.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="admin-page"
      style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '100vh',
        padding: 16,
      }}
    >
      <style>{adminStyles}</style>
      <PanelCard
        accent="linear-gradient(to right, var(--green), var(--cyan))"
        style={{ width: 'min(100%, 520px)', padding: 32 }}
      >
        <div style={sectionEyebrowStyle}>Painel privado</div>
        <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.03em', marginTop: 12 }}>KAIO.ADMIN</h1>
        <p style={{ marginTop: 10, fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>
          Area administrativa isolada para gestao do portfolio, conteudo e configuracoes do painel.
        </p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28 }}>
          <TextField label="Email" value={email} onChange={setEmail} placeholder="voce@dominio.com" type="email" />
          <TextField label="Senha" value={password} onChange={setPassword} placeholder="Digite sua senha" type="password" />
          {error ? <div style={{ color: 'oklch(65% 0.22 25)', fontSize: 13 }}>{error}</div> : null}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <span style={{ ...sectionEyebrowStyle, color: 'var(--green)' }}>Acesso restrito</span>
            <ButtonPrimary type="submit">{loading ? 'entrando...' : 'Entrar no painel'}</ButtonPrimary>
          </div>
        </form>
      </PanelCard>
    </div>
  )
}

function Sidebar({
  active,
  unreadMessages,
  onNav,
  onLogout,
}: {
  active: AdminSection
  unreadMessages: number
  onNav: (section: AdminSection) => void
  onLogout: () => void
}) {
  return (
    <aside className="admin-sidebar">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', color: 'var(--green)' }}>
            KAIO<span style={{ color: 'var(--text-muted)' }}>.</span>ADMIN
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.6 }}>
            Gestao do portfolio em um painel dedicado para conteudo, contatos e metricas.
          </div>
        </div>

        <nav style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflowY: 'auto' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === active
            const badge = item.id === 'messages' ? unreadMessages : item.badge
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNav(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '12px 14px',
                  background: isActive ? 'var(--green-glow)' : 'transparent',
                  border: `1px solid ${isActive ? 'oklch(72% 0.25 160 / 0.28)' : 'transparent'}`,
                  color: isActive ? 'var(--green)' : 'var(--text-muted)',
                  textAlign: 'left',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <Icon name={item.icon} size={16} color={isActive ? 'var(--green)' : 'currentColor'} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {item.label}
                  </span>
                </span>
                {badge ? <TagPill label={String(badge)} color={isActive ? 'green' : 'cyan'} /> : null}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: 16, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Kaio Henrique</div>
            <div style={{ ...sectionEyebrowStyle, marginTop: 4 }}>admin</div>
          </div>
          <IconButton icon="logout" label="Sair" onClick={onLogout} />
        </div>
      </div>
    </aside>
  )
}

function Dashboard({
  projects,
  skills,
  messages,
  visitors,
  onNav,
}: {
  projects: Project[]
  skills: Skill[]
  messages: Message[]
  visitors: Visitor[]
  onNav: (section: AdminSection) => void
}) {
  const unread = messages.filter((message) => !message.read).length
  const chartData = [38, 52, 45, 61, 58, 72, 68, 85, 79, 91, 87, 94]
  const maxChart = Math.max(...chartData)
  const featuredProjects = projects.filter((project) => project.featured).slice(0, 3)
  const recentMessages = messages.slice(0, 3)
  const liveVisitors = visitors.slice(0, 5)

  return (
    <div>
      <SectionTitle num="00 /" title="Dashboard" />

      <div className="admin-grid-4">
        <MetricCard label="Projetos" value={projects.length} sub={`${projects.filter((project) => project.status === 'published').length} publicados`} icon="projects" />
        <MetricCard label="Skills" value={skills.length} sub="mapeadas no painel" icon="skills" color="var(--cyan)" />
        <MetricCard label="Mensagens" value={messages.length} sub={`${unread} nao lidas`} icon="messages" color="oklch(78% 0.18 90)" />
        <MetricCard label="Visitantes" value="1.2k" sub="+18% em relacao ao mes anterior" icon="visitors" color="var(--cyan)" />
      </div>

      <div className="admin-grid-2" style={{ marginTop: 24 }}>
        <PanelCard accent="linear-gradient(to right, var(--green), transparent)">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
            <div>
              <div style={sectionEyebrowStyle}>Visitantes por mes</div>
              <h3 style={{ fontSize: 20, marginTop: 8 }}>Tendencia de acesso</h3>
            </div>
            <TagPill label="ano atual" color="cyan" />
          </div>
          <div style={{ display: 'flex', alignItems: 'end', gap: 8, height: 220 }}>
            {chartData.map((value, index) => (
              <div key={`${value}-${index}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'end', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: '100%',
                    height: `${(value / maxChart) * 170}px`,
                    background:
                      index === chartData.length - 1
                        ? 'linear-gradient(180deg, var(--green), var(--cyan))'
                        : 'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
                    border: '1px solid var(--border)',
                  }}
                />
                <span style={{ ...sectionEyebrowStyle, color: index === chartData.length - 1 ? 'var(--green)' : 'var(--text-dim)' }}>{index + 1}</span>
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard accent="linear-gradient(to right, var(--cyan), transparent)">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
            <div>
              <div style={sectionEyebrowStyle}>Mensagens recentes</div>
              <h3 style={{ fontSize: 20, marginTop: 8 }}>Ultimos contatos</h3>
            </div>
            <ButtonOutline small onClick={() => onNav('messages')}>ver todas</ButtonOutline>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentMessages.map((message) => (
              <div key={message.id} style={{ border: '1px solid var(--border)', padding: 16, background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <strong style={{ fontSize: 15 }}>{message.name}</strong>
                  {message.read ? <TagPill label="Lida" color="cyan" /> : <TagPill label="Nova" color="green" />}
                </div>
                <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{message.email}</div>
                <p style={{ marginTop: 10, fontSize: 13, lineHeight: 1.7, color: 'var(--text-muted)' }}>{message.msg}</p>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>

      <div className="admin-grid-2" style={{ marginTop: 24 }}>
        <PanelCard>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="admin-status-online" />
              <span style={sectionEyebrowStyle}>Visitantes ao vivo</span>
            </div>
            <ButtonOutline small onClick={() => onNav('visitors')}>detalhes</ButtonOutline>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {liveVisitors.map((visitor) => (
              <div key={visitor.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon name="globe" size={14} color="var(--text-dim)" />
                  <div>
                    <div style={{ fontSize: 14 }}>{visitor.city}, {visitor.country}</div>
                    <div style={{ ...sectionEyebrowStyle, marginTop: 4 }}>{visitor.page}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: visitor.time === 'Agora' ? 'var(--green)' : 'var(--text-muted)' }}>
                  <Icon
                    name={visitor.device === 'Desktop' ? 'monitor' : visitor.device === 'Mobile' ? 'smartphone' : 'tablet'}
                    size={14}
                    color="currentColor"
                  />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{visitor.time}</span>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
            <div>
              <div style={sectionEyebrowStyle}>Projetos em destaque</div>
              <h3 style={{ fontSize: 20, marginTop: 8 }}>Selecao principal</h3>
            </div>
            <ButtonOutline small onClick={() => onNav('projects')}>gerenciar</ButtonOutline>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {featuredProjects.map((project) => (
              <div key={project.id} style={{ border: '1px solid var(--border)', padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <strong>{project.title}</strong>
                  <Icon name="star" size={15} color="var(--green)" />
                </div>
                <p style={{ marginTop: 10, fontSize: 13, lineHeight: 1.7, color: 'var(--text-muted)' }}>{project.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                  {project.tags.map((tag) => (
                    <TagPill key={`${project.id}-${tag}`} label={tag} color="cyan" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>
    </div>
  )
}

function ProjectsList({
  projects,
  setProjects,
  onCreate,
  onEdit,
}: {
  projects: Project[]
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>
  onCreate: () => void
  onEdit: (project: Project) => void
}) {
  const [query, setQuery] = useState('')

  const filteredProjects = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return projects
    return projects.filter((project) =>
      [project.title, project.desc, project.repo, project.tags.join(' ')].some((value) => value.toLowerCase().includes(normalized)),
    )
  }, [projects, query])

  return (
    <div>
      <SectionTitle
        num="01 /"
        title="Projetos"
        action={<ButtonPrimary icon="plus" onClick={onCreate}>novo projeto</ButtonPrimary>}
      />

      <PanelCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <span style={{ position: 'absolute', left: 14, top: 13, color: 'var(--text-dim)' }}>
              <Icon name="search" size={14} color="currentColor" />
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar projetos..."
              style={{ ...inputStyle, paddingLeft: 38 }}
            />
          </div>
          <TagPill label={`${filteredProjects.length} itens`} color="cyan" />
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Projeto', 'Stack', 'Status', 'Repo', 'Acoes'].map((header) => (
                  <th
                    key={header}
                    style={{
                      textAlign: 'left',
                      padding: '0 0 12px',
                      borderBottom: '1px solid var(--border)',
                      ...sectionEyebrowStyle,
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id}>
                  <td style={{ padding: '16px 12px 16px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600 }}>{project.title}</div>
                    <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{project.desc}</div>
                    {project.featured ? <div style={{ marginTop: 10 }}><TagPill label="Destaque" color="green" /></div> : null}
                  </td>
                  <td style={{ padding: '16px 12px 16px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {project.tags.map((tag) => (
                        <TagPill key={`${project.id}-${tag}`} label={tag} color="cyan" />
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '16px 12px 16px 0', borderBottom: '1px solid var(--border)' }}>
                    <StatusPill status={project.status} />
                  </td>
                  <td style={{ padding: '16px 12px 16px 0', borderBottom: '1px solid var(--border)' }}>
                    <a
                      href={withProtocol(project.repo)}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: 12, textDecoration: 'none' }}
                    >
                      {project.repo}
                    </a>
                  </td>
                  <td style={{ padding: '16px 0 16px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <IconButton icon="edit" label="Editar projeto" onClick={() => onEdit(project)} />
                      <IconButton
                        icon="trash"
                        label="Remover projeto"
                        color="oklch(65% 0.22 25)"
                        onClick={() => setProjects((current) => current.filter((item) => item.id !== project.id))}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </div>
  )
}

function ProjectForm({
  project,
  onBack,
  onSave,
}: {
  project: Project | null
  onBack: () => void
  onSave: (project: Project) => void
}) {
  const isNew = project === null
  const [form, setForm] = useState<Project>(
    project ?? {
      id: 0,
      title: '',
      desc: '',
      tags: [],
      repo: '',
      featured: false,
      status: 'draft',
      thumb: null,
    },
  )

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave(form)
    onBack()
  }

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          <Icon name="arrowLeft" size={14} color="currentColor" />
          voltar
        </button>
      </div>

      <SectionTitle num={isNew ? '01 / NEW' : '01 / EDIT'} title={isNew ? 'Novo Projeto' : `Editar: ${form.title || 'projeto'}`} />

      <form onSubmit={submit} className="admin-grid-2">
        <PanelCard accent="linear-gradient(to right, var(--green), transparent)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <TextField label="Titulo" value={form.title} onChange={(value) => setForm({ ...form, title: value })} placeholder="Nome do projeto" />
            <TextAreaField label="Descricao" value={form.desc} onChange={(value) => setForm({ ...form, desc: value })} rows={7} />
            <TextField label="Repositorio" value={form.repo} onChange={(value) => setForm({ ...form, repo: value })} placeholder="github.com/usuario/repo" />
            <TagInput label="Tags" tags={form.tags} onChange={(tags) => setForm({ ...form, tags })} />
          </div>
        </PanelCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <PanelCard>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={sectionEyebrowStyle}>Status</label>
                <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, status: 'draft' })}
                    style={{
                      border: '1px solid var(--border-bright)',
                      background: form.status === 'draft' ? 'oklch(78% 0.18 90 / 0.14)' : 'transparent',
                      color: form.status === 'draft' ? 'oklch(78% 0.18 90)' : 'var(--text-muted)',
                      padding: '9px 12px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    rascunho
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, status: 'published' })}
                    style={{
                      border: '1px solid var(--border-bright)',
                      background: form.status === 'published' ? 'var(--green-glow)' : 'transparent',
                      color: form.status === 'published' ? 'var(--green)' : 'var(--text-muted)',
                      padding: '9px 12px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    publicado
                  </button>
                </div>
              </div>

              <ToggleField
                label="Marcar como destaque no dashboard"
                checked={form.featured}
                onChange={(featured) => setForm({ ...form, featured })}
              />
            </div>
          </PanelCard>

          <PanelCard>
            <div style={sectionEyebrowStyle}>Preview</div>
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{form.title || 'Sem titulo'}</div>
              <div style={{ marginTop: 10 }}>
                <StatusPill status={form.status} />
              </div>
              <p style={{ marginTop: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>{form.desc || 'A descricao vai aparecer aqui conforme voce editar o projeto.'}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                {form.tags.length
                  ? form.tags.map((tag) => <TagPill key={tag} label={tag} color="cyan" />)
                  : <TagPill label="Sem tags" color="yellow" />}
              </div>
            </div>
          </PanelCard>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <ButtonOutline onClick={onBack}>cancelar</ButtonOutline>
            <ButtonPrimary type="submit">{isNew ? 'criar projeto' : 'salvar projeto'}</ButtonPrimary>
          </div>
        </div>
      </form>
    </div>
  )
}

function SkillsList({
  skills,
  setSkills,
  onCreate,
  onEdit,
}: {
  skills: Skill[]
  setSkills: React.Dispatch<React.SetStateAction<Skill[]>>
  onCreate: () => void
  onEdit: (skill: Skill) => void
}) {
  const groups = useMemo(() => {
    return skills.reduce<Record<string, Skill[]>>((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = []
      acc[skill.category].push(skill)
      return acc
    }, {})
  }, [skills])

  return (
    <div>
      <SectionTitle
        num="02 /"
        title="Skills"
        action={<ButtonPrimary icon="plus" onClick={onCreate}>nova skill</ButtonPrimary>}
      />

      <div className="admin-grid-3">
        {Object.entries(groups).map(([category, items]) => (
          <PanelCard key={category}>
            <div style={sectionEyebrowStyle}>{category}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
              {items.map((skill) => (
                <div key={skill.id} style={{ border: '1px solid var(--border)', padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <strong>{skill.name}</strong>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <IconButton icon="edit" label="Editar skill" onClick={() => onEdit(skill)} />
                      <IconButton
                        icon="trash"
                        label="Remover skill"
                        color="oklch(65% 0.22 25)"
                        onClick={() => setSkills((current) => current.filter((item) => item.id !== skill.id))}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <div style={{ height: 8, background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                      <div style={{ width: `${skill.level}%`, height: '100%', background: 'linear-gradient(to right, var(--green), var(--cyan))' }} />
                    </div>
                    <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{skill.level}%</div>
                  </div>
                </div>
              ))}
            </div>
          </PanelCard>
        ))}
      </div>
    </div>
  )
}

function SkillForm({
  skill,
  onBack,
  onSave,
}: {
  skill: Skill | null
  onBack: () => void
  onSave: (skill: Skill) => void
}) {
  const isNew = skill === null
  const [form, setForm] = useState<Skill>(skill ?? { id: 0, name: '', category: '', level: 50 })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({ ...form, level: Number(form.level) })
    onBack()
  }

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          <Icon name="arrowLeft" size={14} color="currentColor" />
          voltar
        </button>
      </div>

      <SectionTitle num={isNew ? '02 / NEW' : '02 / EDIT'} title={isNew ? 'Nova Skill' : `Editar: ${form.name || 'skill'}`} />

      <form onSubmit={submit} className="admin-grid-2">
        <PanelCard accent="linear-gradient(to right, var(--cyan), transparent)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <TextField label="Nome" value={form.name} onChange={(value) => setForm({ ...form, name: value })} placeholder="React, TypeScript, Node.js..." />
            <TextField label="Categoria" value={form.category} onChange={(value) => setForm({ ...form, category: value })} placeholder="Frontend, Backend, DevOps..." />
            <TextField
              label="Nivel"
              value={String(form.level)}
              onChange={(value) => setForm({ ...form, level: Number(value) || 0 })}
              placeholder="0 a 100"
              type="number"
            />
          </div>
        </PanelCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <PanelCard>
            <div style={sectionEyebrowStyle}>Preview</div>
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{form.name || 'Skill sem nome'}</div>
              <div style={{ marginTop: 8, color: 'var(--text-muted)' }}>{form.category || 'Categoria ainda nao definida'}</div>
              <div style={{ marginTop: 18 }}>
                <div style={{ height: 10, background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                  <div style={{ width: `${Math.max(0, Math.min(100, form.level))}%`, height: '100%', background: 'linear-gradient(to right, var(--green), var(--cyan))' }} />
                </div>
                <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--green)' }}>{form.level}%</div>
              </div>
            </div>
          </PanelCard>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <ButtonOutline onClick={onBack}>cancelar</ButtonOutline>
            <ButtonPrimary type="submit">{isNew ? 'criar skill' : 'salvar skill'}</ButtonPrimary>
          </div>
        </div>
      </form>
    </div>
  )
}

function ExperiencesSection({
  experiences,
  setExperiences,
}: {
  experiences: Experience[]
  setExperiences: React.Dispatch<React.SetStateAction<Experience[]>>
}) {
  const [editing, setEditing] = useState<Experience | null>(null)
  const [form, setForm] = useState<Experience>({ id: 0, role: '', company: '', period: '', desc: '' })

  function startCreate() {
    setEditing(null)
    setForm({ id: 0, role: '', company: '', period: '', desc: '' })
  }

  function startEdit(experience: Experience) {
    setEditing(experience)
    setForm(experience)
  }

  function save() {
    if (!form.role.trim()) return
    if (editing) {
      setExperiences((current) => current.map((item) => (item.id === editing.id ? form : item)))
    } else {
      setExperiences((current) => [...current, { ...form, id: getNextId(current) }])
    }
    startCreate()
  }

  return (
    <div>
      <SectionTitle
        num="03 /"
        title="Experiencias"
        action={<ButtonPrimary icon="plus" onClick={startCreate}>nova experiencia</ButtonPrimary>}
      />

      <div className="admin-grid-2">
        <PanelCard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {experiences.map((experience) => (
              <div key={experience.id} style={{ border: '1px solid var(--border)', padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{experience.role}</div>
                    <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-muted)' }}>{experience.company} · {experience.period}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <IconButton icon="edit" label="Editar experiencia" onClick={() => startEdit(experience)} />
                    <IconButton
                      icon="trash"
                      label="Remover experiencia"
                      color="oklch(65% 0.22 25)"
                      onClick={() => setExperiences((current) => current.filter((item) => item.id !== experience.id))}
                    />
                  </div>
                </div>
                <p style={{ marginTop: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>{experience.desc}</p>
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard accent="linear-gradient(to right, var(--green), var(--cyan))">
          <div style={sectionEyebrowStyle}>{editing ? 'Editando experiencia' : 'Nova experiencia'}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 18 }}>
            <TextField label="Cargo" value={form.role} onChange={(value) => setForm({ ...form, role: value })} />
            <TextField label="Empresa" value={form.company} onChange={(value) => setForm({ ...form, company: value })} />
            <TextField label="Periodo" value={form.period} onChange={(value) => setForm({ ...form, period: value })} placeholder="2023 - Atual" />
            <TextAreaField label="Descricao" value={form.desc} onChange={(value) => setForm({ ...form, desc: value })} rows={5} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <ButtonOutline onClick={startCreate}>limpar</ButtonOutline>
              <ButtonPrimary onClick={save}>{editing ? 'atualizar' : 'salvar'}</ButtonPrimary>
            </div>
          </div>
        </PanelCard>
      </div>
    </div>
  )
}

function MessagesSection({
  messages,
  setMessages,
}: {
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
}) {
  const [selectedId, setSelectedId] = useState<number | null>(messages[0]?.id ?? null)

  const selected = messages.find((message) => message.id === selectedId) ?? null

  function openMessage(id: number) {
    setSelectedId(id)
    setMessages((current) => current.map((message) => (message.id === id ? { ...message, read: true } : message)))
  }

  return (
    <div>
      <SectionTitle num="04 /" title="Mensagens" />

      <div className="admin-grid-2">
        <PanelCard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((message) => (
              <button
                key={message.id}
                type="button"
                onClick={() => openMessage(message.id)}
                style={{
                  border: `1px solid ${selectedId === message.id ? 'oklch(72% 0.25 160 / 0.28)' : 'var(--border)'}`,
                  background: selectedId === message.id ? 'var(--green-glow)' : 'transparent',
                  color: 'var(--text)',
                  padding: 16,
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <strong>{message.name}</strong>
                  {message.read ? <TagPill label="Lida" color="cyan" /> : <TagPill label="Nova" color="green" />}
                </div>
                <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{message.email}</div>
                <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {message.msg.length > 100 ? `${message.msg.slice(0, 100)}...` : message.msg}
                </div>
              </button>
            ))}
          </div>
        </PanelCard>

        <PanelCard accent="linear-gradient(to right, var(--cyan), transparent)">
          {selected ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={sectionEyebrowStyle}>Mensagem selecionada</div>
                  <h3 style={{ fontSize: 22, marginTop: 8 }}>{selected.name}</h3>
                </div>
                <TagPill label={selected.read ? 'Lida' : 'Nova'} color={selected.read ? 'cyan' : 'green'} />
              </div>
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
                  <Icon name="mail" size={14} color="currentColor" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{selected.email}</span>
                </div>
                <div style={{ ...sectionEyebrowStyle }}>{selected.date}</div>
                <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8 }}>{selected.msg}</p>
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>Selecione uma mensagem para visualizar.</div>
          )}
        </PanelCard>
      </div>
    </div>
  )
}

function VisitorsSection({ visitors }: { visitors: Visitor[] }) {
  const topPages = [
    { page: '/', views: 624 },
    { page: '/projects', views: 389 },
    { page: '/about', views: 214 },
  ]

  return (
    <div>
      <SectionTitle num="05 /" title="Visitantes" />

      <div className="admin-grid-4">
        <MetricCard label="Visitantes ativos" value={visitors.length} sub="feed em tempo real" icon="visitors" />
        <MetricCard label="Taxa de retorno" value="32%" sub="visitantes recorrentes" icon="trending" color="oklch(78% 0.18 90)" />
        <MetricCard label="Top origem" value="Brasil" sub="maior volume atual" icon="globe" color="var(--cyan)" />
        <MetricCard label="Tempo medio" value="08m" sub="permanencia por sessao" icon="dashboard" color="var(--cyan)" />
      </div>

      <div className="admin-grid-2" style={{ marginTop: 24 }}>
        <PanelCard>
          <div style={sectionEyebrowStyle}>Top paginas</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
            {topPages.map((item) => (
              <div key={item.page} style={{ border: '1px solid var(--border)', padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>{item.page}</span>
                  <TagPill label={`${item.views} views`} color="green" />
                </div>
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard accent="linear-gradient(to right, var(--green), transparent)">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span className="admin-status-online" />
            <span style={sectionEyebrowStyle}>Feed ao vivo</span>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Localizacao', 'Pagina', 'Dispositivo', 'Tempo'].map((header) => (
                    <th key={header} style={{ textAlign: 'left', paddingBottom: 12, borderBottom: '1px solid var(--border)', ...sectionEyebrowStyle }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visitors.map((visitor) => (
                  <tr key={visitor.id}>
                    <td style={{ padding: '14px 12px 14px 0', borderBottom: '1px solid var(--border)' }}>{visitor.city}, {visitor.country}</td>
                    <td style={{ padding: '14px 12px 14px 0', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>{visitor.page}</td>
                    <td style={{ padding: '14px 12px 14px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <Icon
                          name={visitor.device === 'Desktop' ? 'monitor' : visitor.device === 'Mobile' ? 'smartphone' : 'tablet'}
                          size={14}
                          color="var(--text-dim)"
                        />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{visitor.device}</span>
                      </span>
                    </td>
                    <td style={{ padding: '14px 0 14px 0', borderBottom: '1px solid var(--border)', color: visitor.time === 'Agora' ? 'var(--green)' : 'var(--text-muted)' }}>{visitor.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelCard>
      </div>
    </div>
  )
}

function AboutSection({
  about,
  setAbout,
  stats,
  onSave,
  onUploadImage,
  onRemoveImage,
  onUploadResume,
  onRemoveResume,
  onCreateStat,
  onUpdateStat,
  onDeleteStat,
  onReorderStats,
}: {
  about: AboutState
  setAbout: React.Dispatch<React.SetStateAction<AboutState>>
  stats: StatItem[]
  onSave: (payload: PortfolioProfileSavePayload) => Promise<void>
  onUploadImage: (file: File) => Promise<void>
  onRemoveImage: () => Promise<void>
  onUploadResume: (file: File) => Promise<void>
  onRemoveResume: () => Promise<void>
  onCreateStat: (payload: PortfolioStatSavePayload) => Promise<void>
  onUpdateStat: (id: number, payload: PortfolioStatSavePayload) => Promise<void>
  onDeleteStat: (id: number) => Promise<void>
  onReorderStats: (items: ReorderItemPayload[]) => Promise<void>
}) {
  const { lang } = useLanguage()
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [statsBusy, setStatsBusy] = useState(false)
  const [editingStatId, setEditingStatId] = useState<number | null>(null)
  const [statForm, setStatForm] = useState<StatItem>({
    id: 0,
    labelPt: '',
    labelEn: '',
    value: '',
    icon: '',
    sortOrder: stats.length + 1,
  })

  async function save() {
    try {
      setSaving(true)
      setError('')

      await onSave({
        fullName: about.fullName,
        headline: about.headline,
        headlineEn: about.headlineEn,
        location: about.location,
        bioPt: about.bioPt,
        bioEn: about.bioEn,
        availableForWork: about.availableForWork,
        sinceYear: about.sinceYear ? Number(about.sinceYear) : null,
      })

      setSaved(true)
      setTimeout(() => setSaved(false), 1800)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Nao foi possivel salvar o perfil.')
    } finally {
      setSaving(false)
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'resume') {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setError('')
      if (type === 'image') await onUploadImage(file)
      else await onUploadResume(file)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Nao foi possivel enviar o arquivo.')
    } finally {
      event.target.value = ''
    }
  }

  async function handleRemoveAsset(type: 'image' | 'resume') {
    try {
      setError('')
      if (type === 'image') await onRemoveImage()
      else await onRemoveResume()
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Nao foi possivel remover o arquivo.')
    }
  }

  function resetStatForm() {
    setEditingStatId(null)
    setStatForm({
      id: 0,
      labelPt: '',
      labelEn: '',
      value: '',
      icon: '',
      sortOrder: stats.length + 1,
    })
  }

  async function saveStat() {
    try {
      setStatsBusy(true)
      setError('')

      const payload: PortfolioStatSavePayload = {
        labelPt: statForm.labelPt,
        labelEn: statForm.labelEn || null,
        value: statForm.value,
        icon: statForm.icon || null,
        sortOrder: statForm.sortOrder,
      }

      if (editingStatId) await onUpdateStat(editingStatId, payload)
      else await onCreateStat(payload)

      resetStatForm()
    } catch (statError) {
      setError(statError instanceof Error ? statError.message : 'Nao foi possivel salvar a estatistica.')
    } finally {
      setStatsBusy(false)
    }
  }

  async function removeStat(id: number) {
    try {
      setStatsBusy(true)
      setError('')
      await onDeleteStat(id)
      if (editingStatId === id) resetStatForm()
    } catch (statError) {
      setError(statError instanceof Error ? statError.message : 'Nao foi possivel remover a estatistica.')
    } finally {
      setStatsBusy(false)
    }
  }

  async function moveStat(id: number, direction: -1 | 1) {
    const ordered = [...stats].sort((a, b) => a.sortOrder - b.sortOrder)
    const index = ordered.findIndex((item) => item.id === id)
    const nextIndex = index + direction

    if (index < 0 || nextIndex < 0 || nextIndex >= ordered.length) return

    const next = [...ordered]
    ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]

    try {
      setStatsBusy(true)
      await onReorderStats(next.map((item, idx) => ({ id: item.id, sortOrder: idx + 1 })))
    } catch (statError) {
      setError(statError instanceof Error ? statError.message : 'Nao foi possivel reordenar as estatisticas.')
    } finally {
      setStatsBusy(false)
    }
  }

  return (
    <div>
      <SectionTitle num="06 /" title="Sobre / Bio" />

      <div className="admin-grid-2">
        <PanelCard accent="linear-gradient(to right, var(--green), var(--cyan))">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="admin-grid-2">
              <TextField label="Nome" value={about.fullName} onChange={(value) => setAbout({ ...about, fullName: value })} />
              <TextField label="Headline PT" value={about.headline} onChange={(value) => setAbout({ ...about, headline: value })} />
            </div>
            <TextField label="Headline EN" value={about.headlineEn} onChange={(value) => setAbout({ ...about, headlineEn: value })} />
            <TextField label="Localizacao" value={about.location} onChange={(value) => setAbout({ ...about, location: value })} />
            <TextField label="Ano de inicio" value={about.sinceYear} onChange={(value) => setAbout({ ...about, sinceYear: value })} type="number" />
            <TextAreaField label="Bio PT" value={about.bioPt} onChange={(value) => setAbout({ ...about, bioPt: value })} rows={6} />
            <TextAreaField label="Bio EN" value={about.bioEn} onChange={(value) => setAbout({ ...about, bioEn: value })} rows={6} />
            <ToggleField
              label="Disponivel para trabalho"
              checked={about.availableForWork}
              onChange={(availableForWork) => setAbout({ ...about, availableForWork })}
            />
            <div className="admin-grid-2">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={sectionEyebrowStyle}>Foto de perfil</label>
                <input type="file" accept="image/*" onChange={(event) => void handleFileChange(event, 'image')} />
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <ButtonOutline onClick={() => void handleRemoveAsset('image')}>remover foto</ButtonOutline>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={sectionEyebrowStyle}>Curriculo</label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(event) => void handleFileChange(event, 'resume')} />
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <ButtonOutline onClick={() => void handleRemoveAsset('resume')}>remover curriculo</ButtonOutline>
                </div>
              </div>
            </div>
            {error ? <div style={{ color: 'oklch(65% 0.22 25)', fontSize: 13 }}>{error}</div> : null}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <ButtonPrimary onClick={() => void save()}>{saving ? 'salvando...' : saved ? 'salvo' : 'salvar bio'}</ButtonPrimary>
            </div>
          </div>
        </PanelCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <PanelCard>
            <div style={sectionEyebrowStyle}>Preview</div>
            <div style={{ marginTop: 18 }}>
              {about.profileImageUrl ? (
                <img
                  src={about.profileImageUrl}
                  alt={about.fullName}
                  style={{ width: 92, height: 92, objectFit: 'cover', border: '1px solid var(--border)', marginBottom: 18 }}
                />
              ) : null}
              <div style={{ fontSize: 26, fontWeight: 700 }}>{about.fullName}</div>
              <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>
                {lang === 'pt' ? about.headline : about.headlineEn || about.headline}
              </div>
              <div style={{ marginTop: 8, color: 'var(--text-muted)' }}>{about.location}</div>
              <p style={{ marginTop: 18, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                {lang === 'pt' ? about.bioPt : about.bioEn || about.bioPt}
              </p>
              <div style={{ marginTop: 18 }}>
                <TagPill label={about.availableForWork ? 'Open to work' : 'Indisponivel'} color={about.availableForWork ? 'green' : 'yellow'} />
              </div>
              {about.resumeFileUrl ? (
                <a
                  href={about.resumeFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-block', marginTop: 16, color: 'var(--green)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: 12 }}
                >
                  abrir curriculo
                </a>
              ) : null}
            </div>
          </PanelCard>

          <PanelCard>
            <div style={sectionEyebrowStyle}>Resumo do bloco</div>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <span>Nome, headline e localizacao alimentam o Hero e o bloco principal do portfolio.</span>
              <span>As bios PT/EN ja sao usadas pelo site publico conforme o idioma escolhido.</span>
              <span>Foto, curriculo e disponibilidade saem do backend da sprint 1.</span>
            </div>
          </PanelCard>
        </div>
      </div>

      <PanelCard style={{ marginTop: 24 }}>
        <SectionTitle
          num="06B /"
          title="Estatisticas"
          action={<ButtonOutline onClick={resetStatForm}>nova estatistica</ButtonOutline>}
        />

        <div className="admin-grid-2">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats.length ? stats.map((stat, index) => (
              <div key={stat.id} style={{ border: '1px solid var(--border)', padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{stat.value}</div>
                    <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                      {stat.labelPt}
                      {stat.labelEn ? ` / ${stat.labelEn}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <ButtonOutline
                      small
                      onClick={() => {
                        setStatForm(stat)
                        setEditingStatId(stat.id)
                      }}
                    >
                      editar
                    </ButtonOutline>
                    <ButtonOutline small onClick={() => void moveStat(stat.id, -1)}>{index === 0 ? 'topo' : 'subir'}</ButtonOutline>
                    <ButtonOutline small onClick={() => void moveStat(stat.id, 1)}>{index === stats.length - 1 ? 'base' : 'descer'}</ButtonOutline>
                    <IconButton icon="trash" label="Remover estatistica" color="oklch(65% 0.22 25)" onClick={() => void removeStat(stat.id)} />
                  </div>
                </div>
              </div>
            )) : <div style={{ color: 'var(--text-muted)' }}>Nenhuma estatistica cadastrada ainda.</div>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <TextField label="Label PT" value={statForm.labelPt} onChange={(value) => setStatForm({ ...statForm, labelPt: value })} />
            <TextField label="Label EN" value={statForm.labelEn} onChange={(value) => setStatForm({ ...statForm, labelEn: value })} />
            <TextField label="Valor" value={statForm.value} onChange={(value) => setStatForm({ ...statForm, value })} />
            <TextField label="Icone" value={statForm.icon} onChange={(value) => setStatForm({ ...statForm, icon: value })} />
            <TextField
              label="Ordem"
              value={String(statForm.sortOrder)}
              onChange={(value) => setStatForm({ ...statForm, sortOrder: Number(value) || 0 })}
              type="number"
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <ButtonOutline onClick={resetStatForm}>limpar</ButtonOutline>
              <ButtonPrimary onClick={() => void saveStat()}>{statsBusy ? 'salvando...' : editingStatId ? 'atualizar' : 'salvar'}</ButtonPrimary>
            </div>
          </div>
        </div>
      </PanelCard>
    </div>
  )
}

function LinksSection({
  links,
  setLinks,
  onCreateLink,
  onUpdateLink,
  onDeleteLink,
  onToggleLink,
  onReorderLinks,
}: {
  links: LinkItem[]
  setLinks: React.Dispatch<React.SetStateAction<LinkItem[]>>
  onCreateLink: (payload: SocialLinkSavePayload) => Promise<void>
  onUpdateLink: (id: number, payload: SocialLinkSavePayload) => Promise<void>
  onDeleteLink: (id: number) => Promise<void>
  onToggleLink: (id: number) => Promise<void>
  onReorderLinks: (items: ReorderItemPayload[]) => Promise<void>
}) {
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)

  async function saveLink(link: LinkItem) {
    try {
      setBusyId(link.id)
      setError('')

      const payload: SocialLinkSavePayload = {
        platform: link.platform,
        label: link.label || null,
        url: link.url,
        icon: link.icon || null,
        isActive: link.active,
        sortOrder: link.sortOrder,
      }

      if (link.id > 0) await onUpdateLink(link.id, payload)
      else await onCreateLink(payload)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Nao foi possivel salvar o link.')
    } finally {
      setBusyId(null)
    }
  }

  async function removeLink(link: LinkItem) {
    if (link.id <= 0) {
      setLinks((current) => current.filter((item) => item.id !== link.id))
      return
    }

    try {
      setBusyId(link.id)
      setError('')
      await onDeleteLink(link.id)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Nao foi possivel remover o link.')
    } finally {
      setBusyId(null)
    }
  }

  async function toggleLink(link: LinkItem) {
    if (link.id <= 0) {
      setLinks((current) => current.map((item) => (item.id === link.id ? { ...item, active: !item.active } : item)))
      return
    }

    try {
      setBusyId(link.id)
      setError('')
      await onToggleLink(link.id)
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'Nao foi possivel alterar o status do link.')
    } finally {
      setBusyId(null)
    }
  }

  async function moveLink(id: number, direction: -1 | 1) {
    const ordered = [...links].sort((a, b) => a.sortOrder - b.sortOrder)
    const index = ordered.findIndex((item) => item.id === id)
    const nextIndex = index + direction

    if (index < 0 || nextIndex < 0 || nextIndex >= ordered.length) return

    const next = [...ordered]
    ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]

    try {
      setBusyId(id)
      setError('')
      await onReorderLinks(next.filter((item) => item.id > 0).map((item, idx) => ({ id: item.id, sortOrder: idx + 1 })))
    } catch (reorderError) {
      setError(reorderError instanceof Error ? reorderError.message : 'Nao foi possivel reordenar os links.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <SectionTitle
        num="07 /"
        title="Links Sociais"
        action={
          <ButtonPrimary
            icon="plus"
            onClick={() =>
              setLinks((current) => [
                ...current,
                { id: -Date.now(), platform: 'Novo Link', label: '', url: '', icon: '', active: true, sortOrder: current.length + 1 },
              ])
            }
          >
            adicionar link
          </ButtonPrimary>
        }
      />

      {error ? <div style={{ color: 'oklch(65% 0.22 25)', fontSize: 13, marginBottom: 16 }}>{error}</div> : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 760 }}>
        {[...links].sort((a, b) => a.sortOrder - b.sortOrder).map((link, index) => (
          <PanelCard key={link.id} style={{ padding: 18 }}>
            <div className="admin-grid-3" style={{ alignItems: 'center' }}>
              <TextField
                label="Plataforma"
                value={link.platform}
                onChange={(value) =>
                  setLinks((current) => current.map((item) => (item.id === link.id ? { ...item, platform: value } : item)))
                }
              />
              <TextField
                label="Label"
                value={link.label}
                onChange={(value) =>
                  setLinks((current) => current.map((item) => (item.id === link.id ? { ...item, label: value } : item)))
                }
              />
              <TextField
                label="URL"
                value={link.url}
                onChange={(value) =>
                  setLinks((current) => current.map((item) => (item.id === link.id ? { ...item, url: value } : item)))
                }
              />
            </div>
            <div className="admin-grid-3" style={{ alignItems: 'center', marginTop: 16 }}>
              <TextField
                label="Icone"
                value={link.icon}
                onChange={(value) =>
                  setLinks((current) => current.map((item) => (item.id === link.id ? { ...item, icon: value } : item)))
                }
              />
              <TextField
                label="Ordem"
                value={String(link.sortOrder)}
                onChange={(value) =>
                  setLinks((current) => current.map((item) => (item.id === link.id ? { ...item, sortOrder: Number(value) || 0 } : item)))
                }
                type="number"
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={sectionEyebrowStyle}>Ativo</label>
                <ToggleField
                  label={link.active ? 'Ativo no portfolio' : 'Oculto no portfolio'}
                  checked={link.active}
                  onChange={(active) =>
                    setLinks((current) => current.map((item) => (item.id === link.id ? { ...item, active } : item)))
                  }
                />
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <a href={withProtocol(link.url)} target="_blank" rel="noreferrer" style={{ color: 'var(--green)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                {link.url || 'sem url'}
              </a>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <ButtonOutline small onClick={() => void moveLink(link.id, -1)}>{index === 0 ? 'topo' : 'subir'}</ButtonOutline>
                <ButtonOutline small onClick={() => void moveLink(link.id, 1)}>{index === links.length - 1 ? 'base' : 'descer'}</ButtonOutline>
                <ButtonOutline small onClick={() => void toggleLink(link)}>{busyId === link.id ? '...' : link.active ? 'ocultar' : 'ativar'}</ButtonOutline>
                <ButtonPrimary small onClick={() => void saveLink(link)}>{busyId === link.id ? 'salvando...' : 'salvar'}</ButtonPrimary>
                <IconButton
                  icon="trash"
                  label="Remover link"
                  color="oklch(65% 0.22 25)"
                  onClick={() => void removeLink(link)}
                />
              </div>
            </div>
          </PanelCard>
        ))}
      </div>
    </div>
  )
}

function SettingsSection({
  settings,
  setSettings,
}: {
  settings: SettingsState
  setSettings: React.Dispatch<React.SetStateAction<SettingsState>>
}) {
  const [saved, setSaved] = useState(false)

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div>
      <SectionTitle num="08 /" title="Configuracoes" />

      <div className="admin-grid-2">
        <PanelCard accent="linear-gradient(to right, var(--green), var(--cyan))">
          <div style={sectionEyebrowStyle}>Conexao e seguranca</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 18 }}>
            <TextField label="URL da API" value={settings.apiUrl} onChange={(value) => setSettings({ ...settings, apiUrl: value })} />
            <TextField label="Token" value={settings.token} onChange={(value) => setSettings({ ...settings, token: value })} type="password" />
            <TextField label="Email da conta" value={settings.email} onChange={(value) => setSettings({ ...settings, email: value })} type="email" />
            <TextField label="Nova senha" value={settings.newPassword} onChange={(value) => setSettings({ ...settings, newPassword: value })} type="password" />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <ButtonPrimary onClick={save}>{saved ? 'salvo' : 'salvar configuracoes'}</ButtonPrimary>
            </div>
          </div>
        </PanelCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <PanelCard>
            <div style={sectionEyebrowStyle}>Notificacoes</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
              <ToggleField
                label="Enviar email quando chegar nova mensagem"
                checked={settings.notifyByEmail}
                onChange={(notifyByEmail) => setSettings({ ...settings, notifyByEmail })}
              />
              <ToggleField
                label="Gerar relatorio semanal de visitantes"
                checked={settings.weeklyVisitorsReport}
                onChange={(weeklyVisitorsReport) => setSettings({ ...settings, weeklyVisitorsReport })}
              />
            </div>
          </PanelCard>

          <PanelCard>
            <div style={sectionEyebrowStyle}>Notas de deploy</div>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <span>Este painel foi preparado para rodar na raiz do subdominio de admin.</span>
              <span>No dominio principal, a rota do admin nao fica aberta para acesso publico.</span>
              <span>PortfolioProfile, ProfileStat e SocialLink ja estao consumindo o backend da sprint 1.</span>
            </div>
          </PanelCard>
        </div>
      </div>
    </div>
  )
}

export function AdminPage() {
  const [authSession, setAuthSession] = useState<AdminAuthSession | null>(() => getStoredAdminSession())
  const [page, setPage] = useState<AdminSection>('dashboard')
  const [projectEdit, setProjectEdit] = useState<Project | null | undefined>(undefined)
  const [skillEdit, setSkillEdit] = useState<Skill | null | undefined>(undefined)
  const [adminError, setAdminError] = useState('')

  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS)
  const [skills, setSkills] = useState<Skill[]>(MOCK_SKILLS)
  const [experiences, setExperiences] = useState<Experience[]>(MOCK_EXPERIENCES)
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES)
  const [visitors] = useState<Visitor[]>(MOCK_VISITORS)
  const [about, setAbout] = useState<AboutState>(ABOUT_INITIAL_STATE)
  const [profileStats, setProfileStats] = useState<StatItem[]>([])
  const [links, setLinks] = useState<LinkItem[]>([])
  const [settings, setSettings] = useState<SettingsState>(() => ({
    ...SETTINGS_INITIAL_STATE,
    token: getStoredAdminSession()?.token || '',
  }))

  const unreadMessages = messages.filter((message) => !message.read).length
  const loggedIn = Boolean(authSession?.token)

  useEffect(() => {
    if (!authSession?.token) return

    void loadPortfolioData(authSession.token)
  }, [authSession?.token])

  function handleUnauthorized() {
    clearAdminSession()
    setAuthSession(null)
    setSettings((current) => ({ ...current, token: '' }))
    setAdminError('Sua sessao expirou. Entre novamente.')
  }

  async function loadPortfolioData(token: string) {
    try {
      setAdminError('')

      const [profile, stats, socialLinks] = await Promise.all([
        getAdminPortfolioProfile(token),
        getAdminProfileStats(token),
        getAdminSocialLinks(token),
      ])

      setAbout(mapProfileToAboutState(profile))
      setProfileStats(stats.map(mapStatToItem))
      setLinks(socialLinks.map(mapLinkToItem))
    } catch (loadError) {
      if (isApiError(loadError) && loadError.status === 401) {
        handleUnauthorized()
        return
      }

      setAdminError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar os dados do backend.')
    }
  }

  function navigate(nextPage: AdminSection) {
    setPage(nextPage)
    setProjectEdit(undefined)
    setSkillEdit(undefined)
  }

  function saveProject(project: Project) {
    if (!project.id) {
      setProjects((current) => [...current, { ...project, id: getNextId(current) }])
      return
    }

    setProjects((current) => current.map((item) => (item.id === project.id ? project : item)))
  }

  function saveSkill(skill: Skill) {
    if (!skill.id) {
      setSkills((current) => [...current, { ...skill, id: getNextId(current) }])
      return
    }

    setSkills((current) => current.map((item) => (item.id === skill.id ? skill : item)))
  }

  function requireToken() {
    const token = authSession?.token
    if (!token) throw new Error('Sessao nao encontrada. Faca login novamente.')
    return token
  }

  async function saveAbout(payload: PortfolioProfileSavePayload) {
    const token = requireToken()
    await saveAdminPortfolioProfile(token, payload)
    await loadPortfolioData(token)
  }

  async function uploadProfileAsset(file: File, type: 'image' | 'resume') {
    const token = requireToken()
    const base64 = await readFileAsDataUrl(file)
    const payload = { name: file.name, file: base64 }

    if (type === 'image') await uploadAdminProfileImage(token, payload)
    else await uploadAdminResume(token, payload)

    await loadPortfolioData(token)
  }

  async function removeProfileAsset(type: 'image' | 'resume') {
    const token = requireToken()
    if (type === 'image') await removeAdminProfileImage(token)
    else await removeAdminResume(token)

    await loadPortfolioData(token)
  }

  async function createStat(payload: PortfolioStatSavePayload) {
    const token = requireToken()
    await createAdminProfileStat(token, payload)
    await loadPortfolioData(token)
  }

  async function updateStat(id: number, payload: PortfolioStatSavePayload) {
    const token = requireToken()
    await updateAdminProfileStat(token, id, payload)
    await loadPortfolioData(token)
  }

  async function deleteStat(id: number) {
    const token = requireToken()
    await deleteAdminProfileStat(token, id)
    await loadPortfolioData(token)
  }

  async function reorderStats(items: ReorderItemPayload[]) {
    const token = requireToken()
    await reorderAdminProfileStats(token, items)
    await loadPortfolioData(token)
  }

  async function createLink(payload: SocialLinkSavePayload) {
    const token = requireToken()
    await createAdminSocialLink(token, payload)
    await loadPortfolioData(token)
  }

  async function updateLink(id: number, payload: SocialLinkSavePayload) {
    const token = requireToken()
    await updateAdminSocialLink(token, id, payload)
    await loadPortfolioData(token)
  }

  async function deleteLink(id: number) {
    const token = requireToken()
    await deleteAdminSocialLink(token, id)
    await loadPortfolioData(token)
  }

  async function toggleLink(id: number) {
    const token = requireToken()
    await toggleAdminSocialLink(token, id)
    await loadPortfolioData(token)
  }

  async function reorderLinks(items: ReorderItemPayload[]) {
    const token = requireToken()
    await reorderAdminSocialLinks(token, items)
    await loadPortfolioData(token)
  }

  function renderContent() {
    if (page === 'projects') {
      if (projectEdit !== undefined) {
        return <ProjectForm project={projectEdit} onBack={() => setProjectEdit(undefined)} onSave={saveProject} />
      }

      return (
        <ProjectsList
          projects={projects}
          setProjects={setProjects}
          onCreate={() => setProjectEdit(null)}
          onEdit={(project) => setProjectEdit(project)}
        />
      )
    }

    if (page === 'skills') {
      if (skillEdit !== undefined) {
        return <SkillForm skill={skillEdit} onBack={() => setSkillEdit(undefined)} onSave={saveSkill} />
      }

      return (
        <SkillsList
          skills={skills}
          setSkills={setSkills}
          onCreate={() => setSkillEdit(null)}
          onEdit={(skill) => setSkillEdit(skill)}
        />
      )
    }

    if (page === 'experiences') {
      return <ExperiencesSection experiences={experiences} setExperiences={setExperiences} />
    }

    if (page === 'messages') {
      return <MessagesSection messages={messages} setMessages={setMessages} />
    }

    if (page === 'visitors') {
      return <VisitorsSection visitors={visitors} />
    }

    if (page === 'about') {
      return (
        <AboutSection
          about={about}
          setAbout={setAbout}
          stats={profileStats}
          onSave={saveAbout}
          onUploadImage={(file) => uploadProfileAsset(file, 'image')}
          onRemoveImage={() => removeProfileAsset('image')}
          onUploadResume={(file) => uploadProfileAsset(file, 'resume')}
          onRemoveResume={() => removeProfileAsset('resume')}
          onCreateStat={createStat}
          onUpdateStat={updateStat}
          onDeleteStat={deleteStat}
          onReorderStats={reorderStats}
        />
      )
    }

    if (page === 'links') {
      return (
        <LinksSection
          links={links}
          setLinks={setLinks}
          onCreateLink={createLink}
          onUpdateLink={updateLink}
          onDeleteLink={deleteLink}
          onToggleLink={toggleLink}
          onReorderLinks={reorderLinks}
        />
      )
    }

    if (page === 'settings') {
      return <SettingsSection settings={settings} setSettings={setSettings} />
    }

    return <Dashboard projects={projects} skills={skills} messages={messages} visitors={visitors} onNav={navigate} />
  }

  if (!loggedIn) {
    return (
      <>
        {adminError ? <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, color: 'oklch(65% 0.22 25)' }}>{adminError}</div> : null}
        <LoginScreen
          onLogin={(session) => {
            storeAdminSession(session)
            setAuthSession(session)
            setSettings((current) => ({ ...current, token: session.token }))
            setAdminError('')
          }}
        />
      </>
    )
  }

  return (
    <div className="admin-page">
      <style>{adminStyles}</style>
      <div className="admin-shell">
        <Sidebar
          active={page}
          unreadMessages={unreadMessages}
          onNav={navigate}
          onLogout={() => {
            clearAdminSession()
            setAuthSession(null)
            setSettings((current) => ({ ...current, token: '' }))
          }}
        />
        <main className="admin-main">
          {adminError ? <div style={{ color: 'oklch(65% 0.22 25)', marginBottom: 16 }}>{adminError}</div> : null}
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
