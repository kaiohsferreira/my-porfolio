import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react'
import { SkillMonogram } from '@/components/ui/SkillMonogram'
import {
  getSkillIconUrls,
  normalizeSkillIconName,
  searchSkillIcons,
  type SkillIconSearchResult,
} from '@/lib/skill-icons'
import { cardBaseStyle, inputStyle, sectionEyebrowStyle } from '../styles'
import type { IconName } from '../types'
import { Icon } from './Icon'

export function PanelCard({ children, accent, style }: { children: ReactNode; accent?: string; style?: CSSProperties }) {
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

/**
 * Título de cada seção. O número ("08 /") vinha do visual de terminal e saiu; o parâmetro
 * continua aceito para as chamadas existentes não precisarem mudar.
 */
export function SectionTitle({ title, action }: { num?: string; title: string; action?: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        marginBottom: 28,
      }}
    >
      <h2 style={{ fontSize: 32, letterSpacing: '-0.02em', color: 'var(--text)', lineHeight: 1.15, margin: 0 }}>
        {title}
      </h2>
      {action}
    </div>
  )
}

export function ButtonPrimary({
  children,
  icon,
  onClick,
  type = 'button',
  small = false,
  disabled = false,
}: {
  children: ReactNode
  icon?: IconName
  onClick?: () => void
  type?: 'button' | 'submit'
  small?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="admin-btn admin-btn-primary"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        border: 'none',
        borderRadius: 999,
        background: disabled ? 'rgba(130, 140, 160, 0.28)' : 'var(--green)',
        color: '#fff',
        padding: small ? '8px 14px' : '11px 20px',
        fontFamily: 'var(--font-display)',
        fontSize: small ? 13 : 14,
        fontWeight: 500,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {icon ? <Icon name={icon} size={15} color="#fff" /> : null}
      <span className="admin-btn-label">{children}</span>
    </button>
  )
}

export function ButtonOutline({
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
      className="admin-btn admin-btn-outline"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        border: '1px solid var(--border-bright)',
        borderRadius: 999,
        background: 'var(--surface)',
        color: 'var(--text)',
        padding: small ? '8px 14px' : '11px 20px',
        fontFamily: 'var(--font-display)',
        fontSize: small ? 13 : 14,
        fontWeight: 500,
      }}
    >
      {icon ? <Icon name={icon} size={15} color="currentColor" /> : null}
      <span className="admin-btn-label">{children}</span>
    </button>
  )
}

export function TextField({
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

export function TextAreaField({
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

export function IconAsset({
  iconName,
  size = 28,
  /** Nome da habilidade, usado para as iniciais quando não há ícone. */
  fallbackName,
}: {
  iconName: string
  size?: number
  fallbackName?: string
}) {
  const urls = getSkillIconUrls(iconName, size)
  const [index, setIndex] = useState(0)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setIndex(0)
    setFailed(false)
  }, [iconName])

  // O mesmo monograma que o carrossel usa, para o painel mostrar exatamente o que o visitante
  // vai ver quando a habilidade não tiver ícone.
  if (!iconName.trim() || !urls.length || failed) {
    return <SkillMonogram name={fallbackName || iconName} size={size} />
  }

  return (
    <img
      src={urls[index]}
      alt={iconName}
      width={size}
      height={size}
      loading="lazy"
      onError={() => {
        if (index < urls.length - 1) setIndex((current) => current + 1)
        else setFailed(true)
      }}
    />
  )
}

export function IconCombobox({
  label,
  value,
  onChange,
  suggestedQuery,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  suggestedQuery: string
}) {
  const [query, setQuery] = useState(suggestedQuery)
  const [results, setResults] = useState<SkillIconSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setSearchError('')
      setIsSearching(false)
      return
    }

    const timeoutId = window.setTimeout(() => {
      void (async () => {
        try {
          setIsSearching(true)
          setSearchError('')
          const nextResults = await searchSkillIcons(query)
          setResults(nextResults)
        } catch (error) {
          setResults([])
          setSearchError(error instanceof Error ? error.message : 'Nao foi possivel carregar os icones.')
        } finally {
          setIsSearching(false)
        }
      })()
    }, 320)

    return () => window.clearTimeout(timeoutId)
  }, [query])

  useEffect(() => {
    if (!query.trim() && suggestedQuery.trim()) {
      setQuery(suggestedQuery)
    }
  }, [query, suggestedQuery])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label style={sectionEyebrowStyle}>{label}</label>
      <div
        style={{
          border: '1px solid var(--border)',
          background: 'rgba(40, 34, 64, 0.014)',
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 48,
              height: 48,
              display: 'grid',
              placeItems: 'center',
              border: '1px solid var(--border-bright)',
              background: 'var(--bg2)',
              flexShrink: 0,
            }}
          >
            <IconAsset iconName={value} size={28} />
          </div>

          <div style={{ flex: '1 1 260px', minWidth: 0 }}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar icone: react, node, docker, aws..."
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {isSearching ? <TagPill label="buscando icones" color="cyan" /> : null}
          {value ? <TagPill label={value} color="green" /> : <TagPill label="nenhum icone selecionado" color="yellow" />}
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {searchError || 'Selecione um icone visual. O valor salvo sera no formato prefix:name.'}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 10,
            maxHeight: 260,
            overflowY: 'auto',
          }}
        >
          {results.map((result) => {
            const selected = value === result.iconName

            return (
              <button
                key={result.sourceIcon}
                type="button"
                onClick={() => onChange(normalizeSkillIconName(result.iconName))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  border: `1px solid ${selected ? 'rgba(107, 91, 176, 0.35)' : 'var(--border)'}`,
                  background: selected ? 'var(--green-glow)' : 'rgba(40, 34, 64, 0.014)',
                  color: selected ? 'var(--green)' : 'var(--text)',
                  padding: '10px 12px',
                  textAlign: 'left',
                }}
              >
                <img src={result.svgUrl} alt={result.iconName} width={22} height={22} loading="lazy" />
                <span style={{ fontSize: 11, lineHeight: 1.4, wordBreak: 'break-word' }}>{result.iconName}</span>
              </button>
            )
          })}
          {!isSearching && !results.length && query.trim().length >= 2 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Nenhum icone encontrado para essa busca.</div>
          ) : null}
          {!isSearching && query.trim().length < 2 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Digite pelo menos 2 caracteres para buscar icones.</div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function extractAssetLabelFromUrl(url: string | null) {
  if (!url) return ''

  try {
    const parsed = new URL(url)
    const raw = parsed.pathname.split('/').filter(Boolean).at(-1) || ''
    return decodeURIComponent(raw)
  } catch {
    const raw = url.split('/').filter(Boolean).at(-1) || ''
    return raw
  }
}

export function AssetUploadField({
  label,
  hint,
  accept,
  assetType,
  currentUrl,
  pendingName,
  busy,
  onPick,
  onRemove,
}: {
  label: string
  hint: string
  accept: string
  assetType: 'image' | 'resume'
  currentUrl: string | null
  pendingName: string
  busy: boolean
  onPick: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const currentLabel = pendingName || extractAssetLabelFromUrl(currentUrl)
  const hasAsset = Boolean(currentUrl || pendingName)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label style={sectionEyebrowStyle}>{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onPick}
        style={{ display: 'none' }}
      />

      <div
        style={{
          border: '1px solid var(--border)',
          background: 'var(--bg3)',
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          minHeight: 124,
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 52,
              height: 52,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              border: '1px solid var(--border-bright)',
              background: 'rgba(40, 34, 64, 0.028)',
              overflow: 'hidden',
            }}
          >
            {assetType === 'image' && currentUrl ? (
              <img src={currentUrl} alt="Preview da foto de perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Icon name={assetType === 'image' ? 'about' : 'mail'} size={18} color="var(--text-dim)" />
            )}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
              {hasAsset ? currentLabel || (assetType === 'image' ? 'Foto pronta para uso' : 'Curriculo pronto para uso') : hint}
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {busy
                ? assetType === 'image'
                  ? 'Enviando foto de perfil...'
                  : 'Enviando curriculo...'
                : hasAsset
                  ? assetType === 'image'
                    ? 'Voce pode trocar a imagem atual ou remover o arquivo salvo.'
                    : 'Voce pode trocar o curriculo atual ou remover o arquivo salvo.'
                  : assetType === 'image'
                    ? 'Envie JPG, PNG ou WEBP para atualizar sua foto de perfil.'
                    : 'Envie PDF, DOC ou DOCX para disponibilizar seu curriculo.'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <ButtonPrimary
            small
            icon="plus"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            {hasAsset ? 'trocar arquivo' : 'escolher arquivo'}
          </ButtonPrimary>
          <ButtonOutline onClick={() => { if (!busy) onRemove() }} small>
            {assetType === 'image' ? 'remover foto' : 'remover curriculo'}
          </ButtonOutline>
        </div>
      </div>
    </div>
  )
}

export function ToggleField({
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

export function TagPill({ label, color = 'green' }: { label: string; color?: 'green' | 'cyan' | 'red' | 'yellow' }) {
  const palette = {
    green: {
      text: 'var(--green)',
      background: 'var(--green-glow)',
      border: 'rgba(107, 91, 176, 0.35)',
    },
    cyan: {
      text: 'var(--cyan)',
      background: 'var(--cyan-glow)',
      border: 'rgba(90, 147, 173, 0.35)',
    },
    red: {
      text: 'var(--danger)',
      background: 'rgba(179, 69, 59, 0.14)',
      border: 'rgba(179, 69, 59, 0.35)',
    },
    yellow: {
      text: 'var(--warning)',
      background: 'rgba(168, 116, 26, 0.14)',
      border: 'rgba(168, 116, 26, 0.35)',
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
        fontFamily: 'var(--font-display)',
        fontSize: 13,
        fontWeight: 500,
        borderRadius: 999,
      }}
    >
      {label}
    </span>
  )
}
