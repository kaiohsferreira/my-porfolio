import { type FormEvent, useMemo, useState } from 'react'
import { readFileAsDataUrl } from '@/lib/file-utils'
import type { Project } from '@/types'
import { withProtocol } from '../mappers'
import { inputStyle, sectionEyebrowStyle } from '../styles'
import { Icon } from '../ui/Icon'
import {
  AssetUploadField,
  ButtonOutline,
  ButtonPrimary,
  PanelCard,
  SectionTitle,
  TagPill,
  TextAreaField,
  TextField,
  ToggleField,
} from '../ui/controls'
import { IconButton, StatusPill, TagInput } from '../ui/feedback'

export function ProjectsList({
  projects,
  onCreate,
  onEdit,
  onDelete,
}: {
  projects: Project[]
  onCreate: () => void
  onEdit: (project: Project) => void
  onDelete: (id: number) => Promise<void>
}) {
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState('')

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
        {error ? <div style={{ color: 'oklch(65% 0.22 25)', fontSize: 13, marginBottom: 16 }}>{error}</div> : null}
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
                        onClick={() =>
                          void (async () => {
                            try {
                              setBusyId(project.id)
                              setError('')
                              await onDelete(project.id)
                            } catch (deleteError) {
                              setError(deleteError instanceof Error ? deleteError.message : 'Nao foi possivel remover o projeto.')
                            } finally {
                              setBusyId(null)
                            }
                          })()
                        }
                      />
                    </div>
                    {busyId === project.id ? <div style={{ marginTop: 8, ...sectionEyebrowStyle }}>sincronizando...</div> : null}
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

export function ProjectForm({
  project,
  onBack,
  onSave,
  onRemoveCover,
}: {
  project: Project | null
  onBack: () => void
  onSave: (project: Project) => Promise<void>
  onRemoveCover: (id: number) => Promise<void>
}) {
  const isNew = project === null
  const [form, setForm] = useState<Project>(
    project ?? {
      id: 0,
      title: '',
      desc: '',
      tags: [],
      repo: '',
      liveUrl: '',
      featured: false,
      status: 'draft',
      thumb: null,
      coverFile: null,
    },
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [coverBusy, setCoverBusy] = useState(false)

  async function pickCover(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('A capa precisa ser um arquivo de imagem.')
      return
    }

    try {
      setCoverBusy(true)
      setError('')
      const base64 = await readFileAsDataUrl(file)
      setForm((current) => ({
        ...current,
        coverFile: { name: file.name, file: base64 },
        thumb: base64,
      }))
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : 'Nao foi possivel ler a imagem.')
    } finally {
      setCoverBusy(false)
    }
  }

  async function dropCover() {
    // Projeto ainda nao salvo so tem a capa em memoria; nao ha o que remover no servidor.
    if (form.id <= 0) {
      setForm((current) => ({ ...current, coverFile: null, thumb: null }))
      return
    }

    try {
      setCoverBusy(true)
      setError('')
      await onRemoveCover(form.id)
      setForm((current) => ({ ...current, coverFile: null, thumb: null }))
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Nao foi possivel remover a capa.')
    } finally {
      setCoverBusy(false)
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')
      await onSave(form)
      onBack()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Nao foi possivel salvar o projeto.')
    } finally {
      setSaving(false)
    }
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
            <TextField label="URL ao vivo" value={form.liveUrl} onChange={(value) => setForm({ ...form, liveUrl: value })} placeholder="https://site.com/projeto" />
            <TagInput label="Tags" tags={form.tags} onChange={(tags) => setForm({ ...form, tags })} />
            <AssetUploadField
              label="Capa do projeto"
              hint="Imagem exibida no card do site. Recomendado 16:9, por exemplo 1280x720."
              accept="image/*"
              assetType="image"
              currentUrl={form.thumb}
              pendingName={form.coverFile?.name ?? ''}
              busy={coverBusy}
              onPick={pickCover}
              onRemove={dropCover}
            />
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
              {form.liveUrl ? (
                <a href={withProtocol(form.liveUrl)} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 16, color: 'var(--cyan)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  abrir projeto
                </a>
              ) : null}
            </div>
          </PanelCard>

          {error ? <div style={{ color: 'oklch(65% 0.22 25)', fontSize: 13 }}>{error}</div> : null}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <ButtonOutline onClick={onBack}>cancelar</ButtonOutline>
            <ButtonPrimary type="submit">{saving ? 'salvando...' : isNew ? 'criar projeto' : 'salvar projeto'}</ButtonPrimary>
          </div>
        </div>
      </form>
    </div>
  )
}
