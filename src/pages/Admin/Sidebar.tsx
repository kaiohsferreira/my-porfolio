import type { AdminUserInfo } from '@/lib/portfolio-api'
import { getSkillInitials } from '@/lib/skill-icons'
import { getAdminDisplayName } from './mappers'
import { type AdminSection, NAV_ITEMS } from './types'
import { Icon } from './ui/Icon'
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
  const displayName = getAdminDisplayName(currentUser)

  return (
    <aside className="admin-sidebar">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="admin-brand" style={{ padding: '26px 22px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            aria-hidden="true"
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              color: '#fff',
              fontFamily: 'var(--font-serif)',
              fontSize: 15,
              background: 'linear-gradient(145deg, #8676c8, #5a93ad)',
            }}
          >
            {getSkillInitials(displayName)}
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, lineHeight: 1.2 }}>Painel</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>do seu portfólio</div>
          </div>
        </div>

        <nav className="admin-nav" style={{ padding: '6px 12px', display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === active
            const badge = item.id === 'messages' ? unreadMessages : item.badge

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNav(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={isActive ? undefined : 'admin-nav-item'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: 'none',
                  background: isActive ? 'var(--green-glow)' : 'transparent',
                  color: isActive ? 'var(--green)' : 'var(--text-muted)',
                  textAlign: 'left',
                  fontFamily: 'var(--font-display)',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 11 }}>
                  <Icon name={item.icon} size={17} color="currentColor" />
                  {item.label}
                </span>
                {badge ? (
                  <span
                    style={{
                      minWidth: 22,
                      height: 22,
                      padding: '0 7px',
                      borderRadius: 999,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: '#fff',
                      background: 'var(--green)',
                    }}
                  >
                    {badge}
                  </span>
                ) : null}
              </button>
            )
          })}
        </nav>

        <div
          style={{
            margin: 12,
            padding: '12px 14px',
            borderRadius: 14,
            background: 'var(--bg3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser?.email || 'admin'}
            </div>
          </div>
          <IconButton icon="logout" label="Sair" onClick={onLogout} />
        </div>
      </div>
    </aside>
  )
}
