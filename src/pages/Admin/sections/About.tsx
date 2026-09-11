import { useEffect, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import type {
  PortfolioProfileSavePayload,
  PortfolioStatSavePayload,
  ReorderItemPayload,
} from '@/lib/portfolio-api'
import { sectionEyebrowStyle } from '../styles'
import type { AboutState, StatItem } from '../types'
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
import { IconButton } from '../ui/feedback'

export function AboutSection({
  about,
  setAbout,
  stats,
  onSave,
  onUploadImage,
  onRemoveImage,
  onUploadResume,
  onRemoveResume,
  onCreateStat,
  onPrepareStat,
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
  onPrepareStat: (stat: StatItem) => Promise<StatItem>
  onUpdateStat: (id: number, payload: PortfolioStatSavePayload) => Promise<void>
  onDeleteStat: (id: number) => Promise<void>
  onReorderStats: (items: ReorderItemPayload[]) => Promise<void>
}) {
  const { lang } = useLanguage()
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [assetBusy, setAssetBusy] = useState<'image' | 'resume' | null>(null)
  const [assetNames, setAssetNames] = useState({ image: '', resume: '' })
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

  useEffect(() => {
    if (about.profileImageUrl) {
      setAssetNames((current) => current.image ? { ...current, image: '' } : current)
    }
  }, [about.profileImageUrl])

  useEffect(() => {
    if (about.resumeFileUrl) {
      setAssetNames((current) => current.resume ? { ...current, resume: '' } : current)
    }
  }, [about.resumeFileUrl])

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
      setAssetBusy(type)
      setAssetNames((current) => ({ ...current, [type]: file.name }))
      setError('')
      if (type === 'image') await onUploadImage(file)
      else await onUploadResume(file)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Nao foi possivel enviar o arquivo.')
      setAssetNames((current) => ({ ...current, [type]: '' }))
    } finally {
      setAssetBusy(null)
      event.target.value = ''
    }
  }

  async function handleRemoveAsset(type: 'image' | 'resume') {
    try {
      setAssetBusy(type)
      setError('')
      if (type === 'image') await onRemoveImage()
      else await onRemoveResume()
      setAssetNames((current) => ({ ...current, [type]: '' }))
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Nao foi possivel remover o arquivo.')
    }
    finally {
      setAssetBusy(null)
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

  async function editStat(stat: StatItem) {
    try {
      setStatsBusy(true)
      setError('')
      const prepared = await onPrepareStat(stat)
      setStatForm(prepared)
      setEditingStatId(prepared.id)
    } catch (prepareError) {
      setError(prepareError instanceof Error ? prepareError.message : 'Nao foi possivel carregar a estatistica para edicao.')
    } finally {
      setStatsBusy(false)
    }
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
              <AssetUploadField
                label="Foto de perfil"
                hint="Nenhuma foto enviada ainda"
                accept="image/*"
                assetType="image"
                currentUrl={about.profileImageUrl}
                pendingName={assetNames.image}
                busy={assetBusy === 'image'}
                onPick={(event) => void handleFileChange(event, 'image')}
                onRemove={() => void handleRemoveAsset('image')}
              />
              <AssetUploadField
                label="Curriculo"
                hint="Nenhum curriculo enviado ainda"
                accept=".pdf,.doc,.docx"
                assetType="resume"
                currentUrl={about.resumeFileUrl}
                pendingName={assetNames.resume}
                busy={assetBusy === 'resume'}
                onPick={(event) => void handleFileChange(event, 'resume')}
                onRemove={() => void handleRemoveAsset('resume')}
              />
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
                      onClick={() => void editStat(stat)}
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
