import { useState } from 'react'
import type { ReorderItemPayload } from '@/lib/portfolio-api'
import type { Experience } from '@/types'
import { sectionEyebrowStyle } from '../styles'
import {
  ButtonOutline,
  ButtonPrimary,
  PanelCard,
  SectionTitle,
  TextAreaField,
  TextField,
} from '../ui/controls'
import { IconButton } from '../ui/feedback'

export function ExperiencesSection({
  experiences,
  onSaveExperience,
  onDeleteExperience,
  onReorderExperiences,
  onPrepareExperience,
}: {
  experiences: Experience[]
  onSaveExperience: (experience: Experience) => Promise<void>
  onDeleteExperience: (id: number) => Promise<void>
  onReorderExperiences: (items: ReorderItemPayload[]) => Promise<void>
  onPrepareExperience: (experience: Experience) => Promise<Experience>
}) {
  const [editing, setEditing] = useState<Experience | null>(null)
  const [form, setForm] = useState<Experience>({ id: 0, role: '', company: '', period: '', desc: '', sortOrder: 1 })
  const [busyId, setBusyId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function startCreate() {
    setEditing(null)
    setForm({ id: 0, role: '', company: '', period: '', desc: '', sortOrder: experiences.length + 1 })
  }

  async function startEdit(experience: Experience) {
    try {
      setBusyId(experience.id)
      setError('')
      const prepared = await onPrepareExperience(experience)
      setEditing(prepared)
      setForm(prepared)
    } catch (prepareError) {
      setError(prepareError instanceof Error ? prepareError.message : 'Nao foi possivel carregar a experiencia para edicao.')
    } finally {
      setBusyId(null)
    }
  }

  async function save() {
    if (!form.role.trim()) return

    try {
      setSaving(true)
      setError('')
      await onSaveExperience(form)
      startCreate()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Nao foi possivel salvar a experiencia.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: number) {
    try {
      setBusyId(id)
      setError('')
      await onDeleteExperience(id)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Nao foi possivel remover a experiencia.')
    } finally {
      setBusyId(null)
    }
  }

  async function move(id: number, direction: -1 | 1) {
    const ordered = [...experiences].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    const index = ordered.findIndex((item) => item.id === id)
    const nextIndex = index + direction

    if (index < 0 || nextIndex < 0 || nextIndex >= ordered.length) return

    const next = [...ordered]
    ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]

    try {
      setBusyId(id)
      setError('')
      await onReorderExperiences(next.map((item, idx) => ({ id: item.id, sortOrder: idx + 1 })))
    } catch (reorderError) {
      setError(reorderError instanceof Error ? reorderError.message : 'Nao foi possivel reordenar as experiencias.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <SectionTitle
        num="03 /"
        title="Experiências"
        action={<ButtonPrimary icon="plus" onClick={startCreate}>nova experiencia</ButtonPrimary>}
      />

      {error ? <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{error}</div> : null}
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
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <IconButton icon="edit" label="Editar experiencia" onClick={() => void startEdit(experience)} />
                    <ButtonOutline small onClick={() => void move(experience.id, -1)}>subir</ButtonOutline>
                    <ButtonOutline small onClick={() => void move(experience.id, 1)}>descer</ButtonOutline>
                    <IconButton
                      icon="trash"
                      label="Remover experiencia"
                      color="var(--danger)"
                      onClick={() => void remove(experience.id)}
                    />
                  </div>
                </div>
                <p style={{ marginTop: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>{experience.desc}</p>
                {busyId === experience.id ? <div style={{ marginTop: 8, ...sectionEyebrowStyle }}>sincronizando...</div> : null}
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
              <ButtonPrimary onClick={() => void save()}>{saving ? 'salvando...' : editing ? 'atualizar' : 'salvar'}</ButtonPrimary>
            </div>
          </div>
        </PanelCard>
      </div>
    </div>
  )
}
