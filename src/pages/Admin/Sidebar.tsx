import type { AdminUserInfo } from '@/lib/portfolio-api'
import { getAdminDisplayName } from './mappers'
import { sectionEyebrowStyle } from './styles'
import { type AdminSection, NAV_ITEMS } from './types'
import { Icon } from './ui/Icon'
import { TagPill } from './ui/controls'
import { IconButton } from './ui/feedback'

export function Sidebar({
  active,
  currentUser,
  unreadMessages,
  onNav,
  onLogout,
}: {
  active: AdminSection
  currentUser: AdminUserInfo | null
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
            <div style={{ fontSize: 14, fontWeight: 600 }}>{getAdminDisplayName(currentUser)}</div>
            <div style={{ ...sectionEyebrowStyle, marginTop: 4 }}>{currentUser?.email || 'admin'}</div>
          </div>
          <IconButton icon="logout" label="Sair" onClick={onLogout} />
        </div>
      </div>
    </aside>
  )
}
