import { useState } from 'react'
import type { ReorderItemPayload, SocialLinkSavePayload } from '@/lib/portfolio-api'
import { withProtocol } from '../mappers'
import { sectionEyebrowStyle } from '../styles'
import type { LinkItem } from '../types'
import {
  ButtonOutline,
  ButtonPrimary,
  PanelCard,
  SectionTitle,
  TextField,
  ToggleField,
} from '../ui/controls'
import { IconButton } from '../ui/feedback'

export function LinksSection({
  links,
  setLinks,
  onCreateLink,
  onPrepareLink,
  onUpdateLink,
  onDeleteLink,
  onToggleLink,
  onReorderLinks,
}: {
  links: LinkItem[]
  setLinks: React.Dispatch<React.SetStateAction<LinkItem[]>>
  onCreateLink: (payload: SocialLinkSavePayload) => Promise<void>
  onPrepareLink: (link: LinkItem) => Promise<LinkItem>
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

  async function editLink(link: LinkItem) {
    if (link.id <= 0) return

    try {
      setBusyId(link.id)
      setError('')
      const prepared = await onPrepareLink(link)
      setLinks((current) => current.map((item) => (item.id === link.id ? prepared : item)))
    } catch (prepareError) {
      setError(prepareError instanceof Error ? prepareError.message : 'Nao foi possivel carregar o link para edicao.')
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
                {link.id > 0 ? <ButtonOutline small onClick={() => void editLink(link)}>editar</ButtonOutline> : null}
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
