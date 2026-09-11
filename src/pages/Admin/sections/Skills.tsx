import { type FormEvent, useMemo, useState } from 'react'
import type { Skill } from '@/types'
import { sectionEyebrowStyle } from '../styles'
import { Icon } from '../ui/Icon'
import {
  ButtonOutline,
  ButtonPrimary,
  IconAsset,
  IconCombobox,
  PanelCard,
  SectionTitle,
  TextField,
} from '../ui/controls'
import { IconButton } from '../ui/feedback'

export function SkillsList({
  skills,
  onCreate,
  onEdit,
  onDelete,
}: {
  skills: Skill[]
  onCreate: () => void
  onEdit: (skill: Skill) => void
  onDelete: (id: number) => Promise<void>
}) {
  const groups = useMemo(() => {
    return skills.reduce<Record<string, Skill[]>>((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = []
      acc[skill.category].push(skill)
      return acc
    }, {})
  }, [skills])
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState('')

  return (
    <div>
      <SectionTitle
        num="02 /"
        title="Skills"
        action={<ButtonPrimary icon="plus" onClick={onCreate}>nova skill</ButtonPrimary>}
      />

      {error ? <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{error}</div> : null}
      <div className="admin-grid-3">
        {Object.entries(groups).map(([category, items]) => (
          <PanelCard key={category}>
            <div style={sectionEyebrowStyle}>{category}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
              {items.map((skill) => (
                <div key={skill.id} style={{ border: '1px solid var(--border)', padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <IconAsset iconName={skill.iconName} size={22} fallbackName={skill.name} />
                      <strong>{skill.name}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <IconButton icon="edit" label="Editar skill" onClick={() => onEdit(skill)} />
                      <IconButton
                        icon="trash"
                        label="Remover skill"
                        color="var(--danger)"
                        onClick={() =>
                          void (async () => {
                            try {
                              setBusyId(skill.id)
                              setError('')
                              await onDelete(skill.id)
                            } catch (deleteError) {
                              setError(deleteError instanceof Error ? deleteError.message : 'Nao foi possivel remover a skill.')
                            } finally {
                              setBusyId(null)
                            }
                          })()
                        }
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <div style={{ height: 8, background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                      <div style={{ width: `${skill.level}%`, height: '100%', background: 'linear-gradient(to right, var(--green), var(--cyan))' }} />
                    </div>
                    <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                      {skill.level}% {busyId === skill.id ? '· sincronizando...' : ''}
                    </div>
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

export function SkillForm({
  skill,
  onBack,
  onSave,
}: {
  skill: Skill | null
  onBack: () => void
  onSave: (skill: Skill) => Promise<void>
}) {
  const isNew = skill === null
  const [form, setForm] = useState<Skill>(skill ?? { id: 0, name: '', category: '', iconName: '', level: 50 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')
      await onSave({ ...form, level: Number(form.level) })
      onBack()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Nao foi possivel salvar a skill.')
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
            fontFamily: 'var(--font-display)',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <Icon name="arrowLeft" size={14} color="currentColor" />
          Voltar
        </button>
      </div>

      <SectionTitle num={isNew ? '02 / NEW' : '02 / EDIT'} title={isNew ? 'Nova skill' : `Editar: ${form.name || 'skill'}`} />

      <form onSubmit={submit} className="admin-grid-2">
        <PanelCard accent="linear-gradient(to right, var(--cyan), transparent)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <TextField label="Nome" value={form.name} onChange={(value) => setForm({ ...form, name: value })} placeholder="React, TypeScript, Node.js..." />
            <TextField label="Categoria" value={form.category} onChange={(value) => setForm({ ...form, category: value })} placeholder="Frontend, Backend, DevOps..." />
            <IconCombobox
              label="Icone"
              value={form.iconName}
              onChange={(value) => setForm({ ...form, iconName: value })}
              suggestedQuery={form.name || form.category}
            />
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    display: 'grid',
                    placeItems: 'center',
                    border: '1px solid var(--border)',
                    background: 'rgba(40, 34, 64, 0.028)',
                  }}
                >
                  <IconAsset iconName={form.iconName} size={30} fallbackName={form.name} />
                </div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{form.name || 'Skill sem nome'}</div>
              </div>
              <div style={{ marginTop: 8, color: 'var(--text-muted)' }}>{form.category || 'Categoria ainda nao definida'}</div>
              <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                {form.iconName || 'icone nao selecionado'}
              </div>
              <div style={{ marginTop: 18 }}>
                <div style={{ height: 10, background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                  <div style={{ width: `${Math.max(0, Math.min(100, form.level))}%`, height: '100%', background: 'linear-gradient(to right, var(--green), var(--cyan))' }} />
                </div>
                <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--green)' }}>{form.level}%</div>
              </div>
            </div>
          </PanelCard>
          {error ? <div style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</div> : null}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <ButtonOutline onClick={onBack}>cancelar</ButtonOutline>
            <ButtonPrimary type="submit">{saving ? 'salvando...' : isNew ? 'criar skill' : 'salvar skill'}</ButtonPrimary>
          </div>
        </div>
      </form>
    </div>
  )
}
