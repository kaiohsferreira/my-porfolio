import { type FormEvent, useEffect, useState } from 'react'
import {
  type AdminAuthSession,
  type AdminUserInfo,
  checkPortfolioSetupUrl,
  getPortfolioUrl,
  getStoredAdminSession,
  isApiError,
  loginAdmin,
  type PortfolioProfileSavePayload,
  type PortfolioSetupUrlCheck,
} from '@/lib/portfolio-api'
import {
  buildUserLocation,
  createInitialOnboardingProfileState,
  getAdminDisplayName,
  hasValidManagementSelection,
  isValidPortfolioUrl,
  mapOnboardingProfileToPayload,
  normalizePortfolioUrl,
} from './mappers'
import { adminStyles, sectionEyebrowStyle } from './styles'
import type { OnboardingProfileState } from './types'
import {
  ButtonOutline,
  ButtonPrimary,
  PanelCard,
  TagPill,
  TextAreaField,
  TextField,
  ToggleField,
} from './ui/controls'

export function LoginScreen({ onLogin }: { onLogin: (session: AdminAuthSession) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Informe email e senha para acessar o painel.')
      return
    }

    try {
      setLoading(true)
      setError('')

      const session = await loginAdmin(email.trim(), password)
      if (!session?.token) {
        setError('A API não retornou um token válido.')
        return
      }

      onLogin(session)
    } catch (loginError) {
      setError(isApiError(loginError) ? loginError.message : 'Não foi possível entrar agora. Tente de novo em instantes.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="admin-page"
      style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '100vh',
        padding: 16,
      }}
    >
      <style>{adminStyles}</style>
      <PanelCard
        accent="linear-gradient(to right, var(--green), var(--cyan))"
        style={{ width: 'min(100%, 520px)', padding: 32 }}
      >
        <div style={sectionEyebrowStyle}>Painel do portfólio</div>
        <h1 style={{ fontSize: 36, letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: 10 }}>Bem-vindo de volta</h1>
        <p style={{ marginTop: 10, fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>
          Entre para atualizar seus projetos, skills, experiências e tudo o que aparece na conversa pública.
        </p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28 }}>
          <TextField label="Email" value={email} onChange={setEmail} placeholder="voce@dominio.com" type="email" />
          <TextField label="Senha" value={password} onChange={setPassword} placeholder="Digite sua senha" type="password" />
          {error ? <div style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</div> : null}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <span style={{ ...sectionEyebrowStyle, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span className="admin-status-online" aria-hidden="true" />
              Acesso restrito
            </span>
            <ButtonPrimary type="submit">{loading ? 'Entrando…' : 'Entrar no painel'}</ButtonPrimary>
          </div>
        </form>
      </PanelCard>
    </div>
  )
}

export function PortfolioSetupScreen({
  currentUser,
  onCreateSetup,
  onCreateProfile,
}: {
  currentUser: AdminUserInfo | null
  onCreateSetup: (payload: { name: string; portfolioUrl: string }) => Promise<void>
  onCreateProfile: (payload: PortfolioProfileSavePayload) => Promise<void>
}) {
  const suggestedName = getAdminDisplayName(currentUser)
  const hasManagement = hasValidManagementSelection(currentUser)
  const [step, setStep] = useState<'setup' | 'profile'>(() => (hasManagement ? 'profile' : 'setup'))
  const [name, setName] = useState(suggestedName === 'Administrador' ? '' : suggestedName)
  const [portfolioUrl, setPortfolioUrl] = useState(() => getPortfolioUrl())
  const [profile, setProfile] = useState<OnboardingProfileState>(() => createInitialOnboardingProfileState(currentUser))
  const [urlState, setUrlState] = useState<PortfolioSetupUrlCheck | null>(null)
  const [isCheckingUrl, setIsCheckingUrl] = useState(false)
  const [isSubmittingSetup, setIsSubmittingSetup] = useState(false)
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (hasManagement) {
      setStep('profile')
      setProfile((current) => ({
        ...current,
        fullName: current.fullName.trim() ? current.fullName : suggestedName === 'Administrador' ? '' : suggestedName,
        location: current.location.trim() ? current.location : buildUserLocation(currentUser) || '',
      }))
    }
  }, [currentUser, hasManagement, suggestedName])

  useEffect(() => {
    if (step !== 'setup') return

    const normalizedUrl = normalizePortfolioUrl(portfolioUrl)

    if (!normalizedUrl) {
      setUrlState(null)
      setIsCheckingUrl(false)
      return
    }

    if (!isValidPortfolioUrl(normalizedUrl)) {
      setUrlState({
        available: false,
        message: 'Informe uma URL valida com http:// ou https://.',
      })
      setIsCheckingUrl(false)
      return
    }

    setIsCheckingUrl(true)
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        try {
          const result = await onCheckUrl(normalizedUrl)
          setUrlState(result)
        } catch (urlError) {
          setUrlState({
            available: false,
            message: urlError instanceof Error ? urlError.message : 'Nao foi possivel validar a URL agora.',
          })
        } finally {
          setIsCheckingUrl(false)
        }
      })()
    }, 400)

    return () => {
      window.clearTimeout(timeoutId)
      setIsCheckingUrl(false)
    }

    async function onCheckUrl(nextUrl: string) {
      const token = getStoredAdminSession()?.token
      if (!token) throw new Error('Sessao nao encontrada para validar a URL.')
      return checkPortfolioSetupUrl(token, nextUrl)
    }
  }, [portfolioUrl, step])

  const normalizedUrl = normalizePortfolioUrl(portfolioUrl)
  const canSubmitSetup =
    name.trim().length >= 2 &&
    isValidPortfolioUrl(normalizedUrl) &&
    !!urlState?.available &&
    !isCheckingUrl &&
    !isSubmittingSetup

  const canSubmitProfile = profile.fullName.trim().length >= 2 && !isSubmittingProfile

  async function submitSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!name.trim()) {
      setError('Informe o nome de exibicao do portfolio.')
      return
    }

    if (!isValidPortfolioUrl(normalizedUrl)) {
      setError('Informe uma URL valida antes de continuar.')
      return
    }

    if (!urlState?.available) {
      setError(urlState?.message || 'Escolha uma URL disponivel para continuar.')
      return
    }

    try {
      setIsSubmittingSetup(true)
      setError('')
      await onCreateSetup({ name: name.trim(), portfolioUrl: normalizedUrl })
      setProfile((current) => ({
        ...current,
        fullName: current.fullName.trim() ? current.fullName : name.trim(),
      }))
      setStep('profile')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Nao foi possivel criar o portfolio.')
    } finally {
      setIsSubmittingSetup(false)
    }
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!profile.fullName.trim()) {
      setError('Informe o nome completo exibido no portfolio.')
      return
    }

    try {
      setIsSubmittingProfile(true)
      setError('')
      await onCreateProfile(mapOnboardingProfileToPayload(profile))
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Nao foi possivel salvar o perfil inicial do portfolio.')
    } finally {
      setIsSubmittingProfile(false)
    }
  }

  return (
    <div
      className="admin-page"
      style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '100vh',
        padding: 16,
      }}
    >
      <style>{adminStyles}</style>
      <PanelCard
        accent="linear-gradient(to right, var(--green), var(--cyan))"
        style={{ width: 'min(100%, 680px)', padding: 32 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {step === 'profile' ? (
            <ButtonOutline
              icon="arrowLeft"
              small
              onClick={() => {
                setStep('setup')
                setError('')
              }}
            >
              Voltar
            </ButtonOutline>
          ) : null}
          <div style={sectionEyebrowStyle}>Onboarding do portfolio</div>
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.03em', marginTop: 12 }}>
          {step === 'setup' ? 'Crie seu portfolio' : 'Complete seu perfil inicial'}
        </h1>
        <p style={{ marginTop: 10, fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>
          {step === 'setup'
            ? 'Seu usuario autenticou com sucesso, mas ainda nao possui um portfolio criado. Antes de acessar o painel, precisamos configurar o nome publico e a URL principal da sua pagina.'
            : 'A base inicial ja foi preparada. Agora preencha os dados principais do perfil para concluir a criacao do portfolio e liberar o painel.'}
        </p>

        <div
          style={{
            marginTop: 22,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
          }}
        >
          <PanelCard style={{ padding: 18 }}>
            <div style={sectionEyebrowStyle}>Usuario</div>
            <div style={{ marginTop: 10, fontSize: 15, fontWeight: 600 }}>{getAdminDisplayName(currentUser)}</div>
            <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-muted)' }}>{currentUser?.email}</div>
          </PanelCard>
          <PanelCard style={{ padding: 18 }}>
            <div style={sectionEyebrowStyle}>Status</div>
            <div style={{ marginTop: 10 }}>
              <TagPill label={step === 'setup' ? 'portfolio pendente' : 'perfil em configuracao'} color="yellow" />
            </div>
            <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>
              {step === 'setup' ? 'Configure agora para liberar o admin.' : 'Mais um passo e o painel sera liberado.'}
            </div>
          </PanelCard>
          <PanelCard style={{ padding: 18 }}>
            <div style={sectionEyebrowStyle}>{step === 'setup' ? 'URL do portfolio' : 'Etapa atual'}</div>
            <div style={{ marginTop: 10, fontSize: 14, color: 'var(--text)', wordBreak: 'break-word' }}>
              {step === 'setup' ? normalizedUrl || 'https://seu-dominio.com' : 'Perfil principal / PortfolioProfile'}
            </div>
            <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>
              {step === 'setup'
                ? 'Essa URL sera usada pelo site publico para resolver seu portfolio.'
                : 'Os campos abaixo serao enviados para o endpoint de save do perfil principal.'}
            </div>
          </PanelCard>
        </div>

        {step === 'setup' ? (
          <form onSubmit={submitSetup} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28 }}>
            <TextField
              label="Nome do portfolio"
              value={name}
              onChange={(value) => {
                setName(value)
                setError('')
              }}
              placeholder="Ex: Kaio Ferreira"
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <TextField
                label="URL publica do portfolio"
                value={portfolioUrl}
                onChange={(value) => {
                  setPortfolioUrl(normalizePortfolioUrl(value))
                  setError('')
                }}
                placeholder="Ex: https://kaioferreira.com"
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {isCheckingUrl ? <TagPill label="validando url" color="cyan" /> : null}
                {!isCheckingUrl && urlState?.available ? <TagPill label="url disponivel" color="green" /> : null}
                {!isCheckingUrl && urlState && !urlState.available ? <TagPill label="url indisponivel" color="red" /> : null}
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {urlState?.message || 'Use a URL completa com protocolo, por exemplo https://kaioferreira.com.'}
                </span>
              </div>
            </div>

            {error ? <div style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</div> : null}

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: 8 }}>
              <span style={{ ...sectionEyebrowStyle, color: 'var(--cyan)' }}>Setup inicial obrigatorio</span>
              <ButtonPrimary type="submit" disabled={!canSubmitSetup}>
                {isSubmittingSetup ? 'criando base inicial...' : 'Continuar para o perfil'}
              </ButtonPrimary>
            </div>
          </form>
        ) : (
          <form onSubmit={submitProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28 }}>
            <div className="admin-grid-2">
              <TextField
                label="Nome completo"
                value={profile.fullName}
                onChange={(value) => {
                  setProfile((current) => ({ ...current, fullName: value }))
                  setError('')
                }}
                placeholder="Ex: Kaio Ferreira"
              />
              <TextField
                label="Localizacao"
                value={profile.location}
                onChange={(value) => {
                  setProfile((current) => ({ ...current, location: value }))
                  setError('')
                }}
                placeholder="Ex: Brasil"
              />
            </div>

            <div className="admin-grid-2">
              <TextField
                label="Headline PT"
                value={profile.headline}
                onChange={(value) => {
                  setProfile((current) => ({ ...current, headline: value }))
                  setError('')
                }}
                placeholder="Ex: Desenvolvedor Full Stack"
              />
              <TextField
                label="Headline EN"
                value={profile.headlineEn}
                onChange={(value) => {
                  setProfile((current) => ({ ...current, headlineEn: value }))
                  setError('')
                }}
                placeholder="Ex: Full Stack Developer"
              />
            </div>

            <div className="admin-grid-2">
              <TextAreaField
                label="Bio PT"
                value={profile.bioPt}
                onChange={(value) => {
                  setProfile((current) => ({ ...current, bioPt: value }))
                  setError('')
                }}
                rows={5}
              />
              <TextAreaField
                label="Bio EN"
                value={profile.bioEn}
                onChange={(value) => {
                  setProfile((current) => ({ ...current, bioEn: value }))
                  setError('')
                }}
                rows={5}
              />
            </div>

            <div className="admin-grid-2" style={{ alignItems: 'end' }}>
              <TextField
                label="Ano de inicio"
                value={profile.sinceYear}
                onChange={(value) => {
                  setProfile((current) => ({ ...current, sinceYear: value }))
                  setError('')
                }}
                placeholder="Ex: 2023"
                type="number"
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={sectionEyebrowStyle}>Disponibilidade</label>
                <ToggleField
                  label={profile.availableForWork ? 'Disponivel para trabalho' : 'Indisponivel no momento'}
                  checked={profile.availableForWork}
                  onChange={(value) => {
                    setProfile((current) => ({ ...current, availableForWork: value }))
                    setError('')
                  }}
                />
              </div>
            </div>

            {error ? <div style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</div> : null}

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: 8 }}>
              <span style={{ ...sectionEyebrowStyle, color: 'var(--green)' }}>Etapa 2: criacao do perfil principal</span>
              <ButtonPrimary type="submit" disabled={!canSubmitProfile}>
                {isSubmittingProfile ? 'finalizando portfolio...' : 'Finalizar criacao do portfolio'}
              </ButtonPrimary>
            </div>
          </form>
        )}
      </PanelCard>
    </div>
  )
}
