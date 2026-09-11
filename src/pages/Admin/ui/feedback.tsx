import { useState } from 'react'
import type { Project } from '@/types'
import { inputStyle, sectionEyebrowStyle } from '../styles'
import type { IconName } from '../types'
import { Icon } from './Icon'
import { PanelCard, TagPill } from './controls'

export type AdminNoticeTone = 'error' | 'warning' | 'info'

export function getAdminNoticeMeta(message: string): {
  title: string
  eyebrow: string
  tone: AdminNoticeTone
} {
  const normalized = message.toLowerCase()

  if (normalized.includes('sessao expirou')) {
    return {
      title: 'Sessao encerrada',
      eyebrow: 'Autenticacao',
      tone: 'error',
    }
  }

  if (normalized.includes('management')) {
    return {
      title: 'Acesso incompleto',
      eyebrow: 'Configuracao do usuario',
      tone: 'warning',
    }
  }

  return {
    title: 'Falha operacional',
    eyebrow: 'Painel admin',
    tone: 'error',
  }
}

export function AdminToast({
  message,
  onClose,
}: {
  message: string
  onClose: () => void
}) {
  const meta = getAdminNoticeMeta(message)
  const palette = {
    error: {
      accent: 'linear-gradient(90deg, oklch(65% 0.22 25), oklch(78% 0.19 55))',
      border: 'oklch(65% 0.22 25 / 0.35)',
      glow: '0 24px 70px oklch(10% 0 0 / 0.55), 0 0 0 1px oklch(65% 0.22 25 / 0.12)',
      badgeBg: 'oklch(65% 0.22 25 / 0.16)',
      badgeText: 'oklch(78% 0.19 55)',
      icon: 'oklch(72% 0.2 40)',
    },
    warning: {
      accent: 'linear-gradient(90deg, oklch(78% 0.18 90), oklch(72% 0.22 160))',
      border: 'oklch(78% 0.18 90 / 0.32)',
      glow: '0 24px 70px oklch(10% 0 0 / 0.55), 0 0 0 1px oklch(78% 0.18 90 / 0.1)',
      badgeBg: 'oklch(78% 0.18 90 / 0.14)',
      badgeText: 'oklch(82% 0.16 96)',
      icon: 'oklch(78% 0.18 90)',
    },
    info: {
      accent: 'linear-gradient(90deg, var(--cyan), var(--green))',
      border: 'oklch(72% 0.25 220 / 0.3)',
      glow: '0 24px 70px oklch(10% 0 0 / 0.55), 0 0 0 1px oklch(72% 0.25 220 / 0.1)',
      badgeBg: 'var(--cyan-glow)',
      badgeText: 'var(--cyan)',
      icon: 'var(--cyan)',
    },
  }[meta.tone]

  return (
    <div
      style={{
        position: 'fixed',
        top: 18,
        right: 18,
        zIndex: 9999,
        width: 'min(460px, calc(100vw - 32px))',
        animation: 'adminNoticeIn 320ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          border: `1px solid ${palette.border}`,
          background: 'linear-gradient(180deg, rgba(18,18,28,0.98) 0%, rgba(9,9,15,0.98) 100%)',
          backdropFilter: 'blur(18px)',
          boxShadow: palette.glow,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '0 0 auto 0',
            height: 2,
            background: palette.accent,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: -48,
            right: -24,
            width: 120,
            height: 120,
            background: palette.badgeBg,
            filter: 'blur(28px)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
        <div style={{ padding: '18px 18px 16px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                border: `1px solid ${palette.border}`,
                background: palette.badgeBg,
                color: palette.icon,
                clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
              }}
            >
              <Icon name={meta.tone === 'warning' ? 'about' : 'messages'} size={18} color={palette.icon} />
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  ...sectionEyebrowStyle,
                  color: palette.badgeText,
                  marginBottom: 8,
                }}
              >
                {meta.eyebrow}
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)' }}>{meta.title}</div>
                  <p style={{ marginTop: 8, color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>{message}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar notificacao"
                  title="Fechar notificacao"
                  style={{
                    width: 34,
                    height: 34,
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                    border: '1px solid var(--border)',
                    background: 'rgba(255,255,255,0.02)',
                    color: 'var(--text-muted)',
                    transition: 'transform 0.18s ease, border-color 0.18s ease, color 0.18s ease',
                  }}
                >
                  <Icon name="close" size={15} color="currentColor" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function IconButton({ icon, label, onClick, color }: { icon: IconName; label: string; onClick: () => void; color?: string }) {
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

export function TagInput({
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

export function StatusPill({ status }: { status: Project['status'] }) {
  return <TagPill label={status === 'published' ? 'Publicado' : 'Rascunho'} color={status === 'published' ? 'green' : 'yellow'} />
}

export function MetricCard({
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
