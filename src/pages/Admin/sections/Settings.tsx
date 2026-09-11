import { useState } from 'react'
import { sectionEyebrowStyle } from '../styles'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, type SettingsState } from '../types'
import { ButtonPrimary, PanelCard, SectionTitle, TextField } from '../ui/controls'

export function SettingsSection({
  settings,
  setSettings,
  accountEmail,
  onChangePassword,
}: {
  settings: SettingsState
  setSettings: React.Dispatch<React.SetStateAction<SettingsState>>
  accountEmail: string
  onChangePassword: () => Promise<void>
}) {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const current = settings.currentPassword
  const next = settings.newPassword
  const confirm = settings.confirmPassword

  /** Valida com as mesmas regras do backend, para o erro chegar sem custar uma requisicao. */
  function validate(): string {
    if (!current || !next || !confirm) return 'Preencha a senha atual, a nova senha e a confirmacao.'
    if (next.length < PASSWORD_MIN_LENGTH) return `A nova senha precisa de pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`
    if (next.length > PASSWORD_MAX_LENGTH) return `A nova senha pode ter no maximo ${PASSWORD_MAX_LENGTH} caracteres.`
    if (next === current) return 'A nova senha precisa ser diferente da atual.'
    if (next !== confirm) return 'A confirmacao nao confere com a nova senha.'
    return ''
  }

  function update(field: keyof SettingsState, value: string) {
    setSettings((state) => ({ ...state, [field]: value }))
    if (error) setError('')
  }

  async function submit() {
    const invalid = validate()
    if (invalid) {
      setError(invalid)
      return
    }

    try {
      setSaving(true)
      setError('')
      await onChangePassword()
      setSaved(true)
      setTimeout(() => setSaved(false), 2400)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Nao foi possivel alterar a senha.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <SectionTitle num="08 /" title="Configuracoes" />

      <div className="admin-grid-2">
        <PanelCard accent="linear-gradient(to right, var(--green), var(--cyan))">
          <div style={sectionEyebrowStyle}>Alterar senha</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 18 }}>
            <TextField
              label="Senha atual"
              value={current}
              onChange={(value) => update('currentPassword', value)}
              type="password"
            />
            <TextField
              label="Nova senha"
              value={next}
              onChange={(value) => update('newPassword', value)}
              placeholder={`de ${PASSWORD_MIN_LENGTH} a ${PASSWORD_MAX_LENGTH} caracteres`}
              type="password"
            />
            <TextField
              label="Confirmar nova senha"
              value={confirm}
              onChange={(value) => update('confirmPassword', value)}
              type="password"
            />

            {error ? (
              <div role="alert" style={{ color: 'oklch(65% 0.22 25)', fontSize: 13, lineHeight: 1.6 }}>
                {error}
              </div>
            ) : null}
            {saved ? (
              <div role="status" style={{ color: 'var(--green)', fontSize: 13, lineHeight: 1.6 }}>
                Senha alterada. Use a nova senha no proximo login.
              </div>
            ) : null}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <ButtonPrimary onClick={() => void submit()}>
                {saving ? 'alterando...' : 'alterar senha'}
              </ButtonPrimary>
            </div>
          </div>
        </PanelCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <PanelCard>
            <div style={sectionEyebrowStyle}>Conta</div>
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={sectionEyebrowStyle}>Email</span>
              <span style={{ fontSize: 15, color: 'var(--text)', wordBreak: 'break-all' }}>
                {accountEmail || '—'}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, marginTop: 6 }}>
                O email identifica a conta no login e nao pode ser trocado por aqui: a API nao
                expoe endpoint para isso.
              </span>
            </div>
          </PanelCard>

        </div>
      </div>
    </div>
  )
}
