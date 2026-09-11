import { useEffect, useState } from 'react'
import { readFileAsDataUrl } from '@/lib/file-utils'
import {
  type AdminAuthSession,
  type AdminUserInfo,
  clearAdminSession,
  createAdminExperience,
  createAdminProfileStat,
  createAdminProject,
  createAdminSkill,
  createAdminSocialLink,
  createPortfolioSetup,
  type DashboardSummary,
  deleteAdminExperience,
  deleteAdminMessage,
  deleteAdminProfileStat,
  deleteAdminProject,
  deleteAdminSkill,
  deleteAdminSocialLink,
  getAdminDashboard,
  getAdminExperiences,
  getAdminMessages,
  getAdminProfileStats,
  getAdminProjects,
  getAdminSkills,
  getAdminSocialLinks,
  getAdminUserInfo,
  getAdminVisitorStats,
  getStoredAdminSession,
  isApiError,
  markAdminMessageAsRead,
  type PortfolioProfileSavePayload,
  type PortfolioStatSavePayload,
  prepareAdminExperience,
  prepareAdminMessage,
  prepareAdminPortfolioProfile,
  prepareAdminProfileStat,
  prepareAdminProject,
  prepareAdminSkill,
  prepareAdminSocialLink,
  removeAdminProfileImage,
  removeAdminProjectCover,
  removeAdminResume,
  reorderAdminExperiences,
  reorderAdminProfileStats,
  reorderAdminSocialLinks,
  type ReorderItemPayload,
  resetAdminPassword,
  saveAdminPortfolioProfile,
  type SocialLinkSavePayload,
  storeAdminSession,
  toggleAdminSocialLink,
  updateAdminExperience,
  updateAdminProfileStat,
  updateAdminProject,
  updateAdminSkill,
  updateAdminSocialLink,
  uploadAdminProfileImage,
  uploadAdminResume,
  type VisitorStatsAdmin,
} from '@/lib/portfolio-api'
import type { Experience, Message, Project, Skill } from '@/types'
import { Sidebar } from './Sidebar'
import {
  getEmptyLoadedSections,
  hasValidManagementSelection,
  mapExperienceToItem,
  mapExperienceToPayload,
  mapLinkToItem,
  mapMessageToItem,
  mapProfileToAboutState,
  mapProjectToItem,
  mapProjectToPayload,
  mapSkillToItem,
  mapSkillToPayload,
  mapStatToItem,
  shouldShowPortfolioSetup,
} from './mappers'
import { LoginScreen, PortfolioSetupScreen } from './screens'
import { AboutSection } from './sections/About'
import { Dashboard } from './sections/Dashboard'
import { ExperiencesSection } from './sections/Experiences'
import { LinksSection } from './sections/Links'
import { MessagesSection } from './sections/Messages'
import { ProjectForm, ProjectsList } from './sections/Projects'
import { SettingsSection } from './sections/Settings'
import { SkillForm, SkillsList } from './sections/Skills'
import { VisitorsSection } from './sections/Visitors'
import { adminStyles } from './styles'
import {
  ABOUT_INITIAL_STATE,
  type AboutState,
  type AdminSection,
  type LinkItem,
  SETTINGS_INITIAL_STATE,
  type SettingsState,
  type StatItem,
} from './types'
import { AdminToast } from './ui/feedback'

export function AdminPage() {
  const [authSession, setAuthSession] = useState<AdminAuthSession | null>(() => getStoredAdminSession())
  const [currentUser, setCurrentUser] = useState<AdminUserInfo | null>(() => getStoredAdminSession()?.user || null)
  const [page, setPage] = useState<AdminSection>('dashboard')
  const [projectEdit, setProjectEdit] = useState<Project | null | undefined>(undefined)
  const [skillEdit, setSkillEdit] = useState<Skill | null | undefined>(undefined)
  const [adminError, setAdminError] = useState('')
  const [dismissedAdminError, setDismissedAdminError] = useState(false)
  const [isBootstrapping, setIsBootstrapping] = useState(false)
  const [loadedAdminSections, setLoadedAdminSections] = useState(getEmptyLoadedSections)

  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null)
  const [visitorStats, setVisitorStats] = useState<VisitorStatsAdmin | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [about, setAbout] = useState<AboutState>(ABOUT_INITIAL_STATE)
  const [profileStats, setProfileStats] = useState<StatItem[]>([])
  const [links, setLinks] = useState<LinkItem[]>([])
  const [settings, setSettings] = useState<SettingsState>(SETTINGS_INITIAL_STATE)

  const unreadMessages = messages.length
    ? messages.filter((message) => !message.read).length
    : (dashboardData?.unreadMessagesCount ?? 0)
  const loggedIn = Boolean(authSession?.token)
  const visibleAdminError = adminError && !dismissedAdminError ? adminError : ''

  useEffect(() => {
    if (!adminError) {
      setDismissedAdminError(false)
      return
    }

    setDismissedAdminError(false)
  }, [adminError])

  useEffect(() => {
    if (!authSession?.token) return

    void bootstrapAdminSession(authSession.token)
  }, [authSession?.token])

  function handleUnauthorized() {
    clearAdminSession()
    setAuthSession(null)
    setCurrentUser(null)
    setPage('dashboard')
    setDashboardData(null)
    setVisitorStats(null)
    setProjects([])
    setSkills([])
    setExperiences([])
    setMessages([])
    setAbout(ABOUT_INITIAL_STATE)
    setProfileStats([])
    setLinks([])
    setLoadedAdminSections(getEmptyLoadedSections())
    setSettings(SETTINGS_INITIAL_STATE)
    setAdminError('Sua sessao expirou. Entre novamente.')
  }

  function persistSession(session: AdminAuthSession) {
    storeAdminSession(session)
    setAuthSession(session)
    setCurrentUser(session.user || null)
  }

  async function bootstrapAdminSession(token: string) {
    try {
      setIsBootstrapping(true)
      setAdminError('')

      const userInfo = await getAdminUserInfo(token)
      const nextSession: AdminAuthSession = {
        ...(authSession || { token, refreshToken: '' }),
        token,
        user: userInfo,
      }

      persistSession(nextSession)

      if (shouldShowPortfolioSetup(userInfo)) {
        setAdminError('')
        setAbout(ABOUT_INITIAL_STATE)
        setProfileStats([])
        setLinks([])
        setLoadedAdminSections(getEmptyLoadedSections())
        return
      }

      if (!hasValidManagementSelection(userInfo)) {
        setAdminError('Seu usuario autenticou com sucesso, mas ainda nao possui um management selecionado para acessar os endpoints admin do portfolio.')
        setAbout(ABOUT_INITIAL_STATE)
        setProfileStats([])
        setLinks([])
        setLoadedAdminSections(getEmptyLoadedSections())
        return
      }
    } catch (loadError) {
      if (isApiError(loadError) && loadError.status === 401) {
        handleUnauthorized()
        return
      }

      setAdminError(loadError instanceof Error ? loadError.message : 'Nao foi possivel validar a sessao do admin.')
    } finally {
      setIsBootstrapping(false)
    }
  }

  async function loadAboutData(token: string) {
    try {
      setAdminError('')

      const [profile, stats] = await Promise.all([
        prepareAdminPortfolioProfile(token),
        getAdminProfileStats(token),
      ])

      setAbout(mapProfileToAboutState(profile))
      setProfileStats(stats.map(mapStatToItem))
      setLoadedAdminSections((current) => ({ ...current, about: true }))
    } catch (loadError) {
      if (isApiError(loadError) && loadError.status === 401) {
        handleUnauthorized()
        return
      }

      setAdminError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar os dados do backend.')
    }
  }

  async function loadDashboardData(token: string) {
    try {
      setAdminError('')

      const [dashboard, visitors] = await Promise.all([
        getAdminDashboard(token),
        getAdminVisitorStats(token),
      ])

      setDashboardData(dashboard)
      setVisitorStats(visitors)
      setLoadedAdminSections((current) => ({ ...current, dashboard: true, visitors: true }))
    } catch (loadError) {
      if (isApiError(loadError) && loadError.status === 401) {
        handleUnauthorized()
        return
      }

      setAdminError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar o dashboard.')
    }
  }

  async function loadProjectsData(token: string) {
    try {
      setAdminError('')

      const nextProjects = await getAdminProjects(token)
      setProjects(nextProjects.map(mapProjectToItem))
      setLoadedAdminSections((current) => ({ ...current, projects: true }))
    } catch (loadError) {
      if (isApiError(loadError) && loadError.status === 401) {
        handleUnauthorized()
        return
      }

      setAdminError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar os projetos.')
    }
  }

  async function loadSkillsData(token: string) {
    try {
      setAdminError('')

      const nextSkills = await getAdminSkills(token)
      setSkills(nextSkills.map(mapSkillToItem).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)))
      setLoadedAdminSections((current) => ({ ...current, skills: true }))
    } catch (loadError) {
      if (isApiError(loadError) && loadError.status === 401) {
        handleUnauthorized()
        return
      }

      setAdminError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar as skills.')
    }
  }

  async function loadExperiencesData(token: string) {
    try {
      setAdminError('')

      const nextExperiences = await getAdminExperiences(token)
      setExperiences(nextExperiences.map(mapExperienceToItem).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)))
      setLoadedAdminSections((current) => ({ ...current, experiences: true }))
    } catch (loadError) {
      if (isApiError(loadError) && loadError.status === 401) {
        handleUnauthorized()
        return
      }

      setAdminError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar as experiencias.')
    }
  }

  async function loadMessagesData(token: string) {
    try {
      setAdminError('')

      const nextMessages = await getAdminMessages(token)
      setMessages(nextMessages.map(mapMessageToItem))
      setLoadedAdminSections((current) => ({ ...current, messages: true }))
    } catch (loadError) {
      if (isApiError(loadError) && loadError.status === 401) {
        handleUnauthorized()
        return
      }

      setAdminError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar as mensagens.')
    }
  }

  async function loadVisitorsData(token: string) {
    try {
      setAdminError('')

      const stats = await getAdminVisitorStats(token)
      setVisitorStats(stats)
      setLoadedAdminSections((current) => ({ ...current, visitors: true }))
    } catch (loadError) {
      if (isApiError(loadError) && loadError.status === 401) {
        handleUnauthorized()
        return
      }

      setAdminError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar os visitantes.')
    }
  }

  async function loadLinksData(token: string) {
    try {
      setAdminError('')

      const socialLinks = await getAdminSocialLinks(token)
      setLinks(socialLinks.map(mapLinkToItem))
      setLoadedAdminSections((current) => ({ ...current, links: true }))
    } catch (loadError) {
      if (isApiError(loadError) && loadError.status === 401) {
        handleUnauthorized()
        return
      }

      setAdminError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar os links do backend.')
    }
  }

  useEffect(() => {
    if (!authSession?.token) return
    if (!currentUser) return
    if (shouldShowPortfolioSetup(currentUser)) return
    if (!hasValidManagementSelection(currentUser)) return
    if (page === 'dashboard' && !loadedAdminSections.dashboard) {
      void loadDashboardData(authSession.token)
      return
    }

    if (page === 'projects' && !loadedAdminSections.projects) {
      void loadProjectsData(authSession.token)
      return
    }

    if (page === 'skills' && !loadedAdminSections.skills) {
      void loadSkillsData(authSession.token)
      return
    }

    if (page === 'experiences' && !loadedAdminSections.experiences) {
      void loadExperiencesData(authSession.token)
      return
    }

    if (page === 'messages' && !loadedAdminSections.messages) {
      void loadMessagesData(authSession.token)
      return
    }

    if (page === 'visitors' && !loadedAdminSections.visitors) {
      void loadVisitorsData(authSession.token)
      return
    }

    if (page === 'about' && !loadedAdminSections.about) {
      void loadAboutData(authSession.token)
      return
    }

    if (page === 'links' && !loadedAdminSections.links) {
      void loadLinksData(authSession.token)
    }
  }, [
    authSession?.token,
    currentUser,
    loadedAdminSections.about,
    loadedAdminSections.dashboard,
    loadedAdminSections.experiences,
    loadedAdminSections.links,
    loadedAdminSections.messages,
    loadedAdminSections.projects,
    loadedAdminSections.skills,
    loadedAdminSections.visitors,
    page,
  ])

  function navigate(nextPage: AdminSection) {
    setPage(nextPage)
    setProjectEdit(undefined)
    setSkillEdit(undefined)
  }

  function requireToken() {
    const token = authSession?.token
    if (!token) throw new Error('Sessao nao encontrada. Faca login novamente.')
    return token
  }

  async function createInitialPortfolio(payload: { name: string; portfolioUrl: string }) {
    try {
      const token = requireToken()

      setLoadedAdminSections(getEmptyLoadedSections())
      setAdminError('')

      await createPortfolioSetup(token, payload)
      await bootstrapAdminSession(token)
    } catch (createError) {
      if (isApiError(createError) && createError.status === 401) {
        handleUnauthorized()
        return
      }

      throw createError
    }
  }

  async function createInitialPortfolioProfile(payload: PortfolioProfileSavePayload) {
    try {
      requireManagementAccess()
      const token = requireToken()

      setAdminError('')
      await saveAdminPortfolioProfile(token, payload)
      markSectionsUnloaded('about')
      await bootstrapAdminSession(token)
    } catch (createError) {
      if (isApiError(createError) && createError.status === 401) {
        handleUnauthorized()
        return
      }

      throw createError
    }
  }

  function requireManagementAccess() {
    if (!hasValidManagementSelection(currentUser)) {
      throw new Error('Seu usuario esta autenticado, mas o backend retornou managementSelectedId invalido para o painel admin.')
    }
  }

  async function runProtectedAction(action: (token: string) => Promise<void>) {
    try {
      requireManagementAccess()
      const token = requireToken()
      await action(token)
    } catch (actionError) {
      if (isApiError(actionError) && actionError.status === 401) {
        handleUnauthorized()
        return
      }

      throw actionError
    }
  }

  async function runProtectedQuery<T>(query: (token: string) => Promise<T>) {
    try {
      requireManagementAccess()
      const token = requireToken()
      return await query(token)
    } catch (queryError) {
      if (isApiError(queryError) && queryError.status === 401) {
        handleUnauthorized()
        return null
      }

      throw queryError
    }
  }

  async function loadPreparedRecord<T>(query: (token: string) => Promise<T>, fallback: T) {
    try {
      const prepared = await runProtectedQuery(query)
      return prepared ?? fallback
    } catch (prepareError) {
      if (isApiError(prepareError) && (prepareError.status === 404 || prepareError.status === 405)) {
        return fallback
      }

      throw prepareError
    }
  }

  function markSectionsUnloaded(...sections: Array<keyof ReturnType<typeof getEmptyLoadedSections>>) {
    setLoadedAdminSections((current) => {
      const next = { ...current }

      sections.forEach((section) => {
        next[section] = false
      })

      return next
    })
  }

  async function removeProjectCover(id: number) {
    await runProtectedAction(async (token) => {
      await removeAdminProjectCover(token, id)
      markSectionsUnloaded('projects', 'dashboard')
      await loadProjectsData(token)
    })
  }

  async function saveProject(project: Project) {
    await runProtectedAction(async (token) => {
      const payload = mapProjectToPayload(project)

      if (project.id > 0) await updateAdminProject(token, project.id, payload)
      else await createAdminProject(token, payload)

      markSectionsUnloaded('projects', 'dashboard')
      await loadProjectsData(token)
    })
  }

  async function removeProject(id: number) {
    await runProtectedAction(async (token) => {
      await deleteAdminProject(token, id)
      markSectionsUnloaded('projects', 'dashboard')
      await loadProjectsData(token)
    })
  }

  async function editProject(project: Project) {
    const prepared = await loadPreparedRecord(
      (token) => prepareAdminProject(token, project.id).then(mapProjectToItem),
      project,
    )

    setProjectEdit(prepared)
  }

  async function saveSkill(skill: Skill) {
    await runProtectedAction(async (token) => {
      const payload = mapSkillToPayload(skill, skills.length + 1)

      if (skill.id > 0) await updateAdminSkill(token, skill.id, payload)
      else await createAdminSkill(token, payload)

      markSectionsUnloaded('skills', 'dashboard')
      await loadSkillsData(token)
    })
  }

  async function removeSkill(id: number) {
    await runProtectedAction(async (token) => {
      await deleteAdminSkill(token, id)
      markSectionsUnloaded('skills', 'dashboard')
      await loadSkillsData(token)
    })
  }

  async function editSkill(skill: Skill) {
    const prepared = await loadPreparedRecord(
      (token) => prepareAdminSkill(token, skill.id).then(mapSkillToItem),
      skill,
    )

    setSkillEdit(prepared)
  }

  async function saveExperience(experience: Experience) {
    await runProtectedAction(async (token) => {
      const payload = mapExperienceToPayload(experience, experiences.length + 1)

      if (experience.id > 0) await updateAdminExperience(token, experience.id, payload)
      else await createAdminExperience(token, payload)

      markSectionsUnloaded('experiences')
      await loadExperiencesData(token)
    })
  }

  async function removeExperience(id: number) {
    await runProtectedAction(async (token) => {
      await deleteAdminExperience(token, id)
      markSectionsUnloaded('experiences')
      await loadExperiencesData(token)
    })
  }

  async function reorderExperiences(items: ReorderItemPayload[]) {
    await runProtectedAction(async (token) => {
      await reorderAdminExperiences(token, items)
      markSectionsUnloaded('experiences')
      await loadExperiencesData(token)
    })
  }

  async function prepareExperienceForEdit(experience: Experience) {
    return loadPreparedRecord(
      (token) => prepareAdminExperience(token, experience.id).then(mapExperienceToItem),
      experience,
    )
  }

  async function openMessage(id: number) {
    const selectedMessage = messages.find((message) => message.id === id)
    if (!selectedMessage) return null

    const prepared = await loadPreparedRecord(
      (token) => prepareAdminMessage(token, id).then(mapMessageToItem),
      selectedMessage,
    )

    if (!prepared.read) {
      await runProtectedAction(async (token) => {
        await markAdminMessageAsRead(token, id)
        setMessages((current) => current.map((message) => (message.id === id ? { ...message, read: true } : message)))
        markSectionsUnloaded('dashboard')
      })
    }

    return { ...prepared, read: true }
  }

  async function removeMessage(id: number) {
    await runProtectedAction(async (token) => {
      await deleteAdminMessage(token, id)
      markSectionsUnloaded('messages', 'dashboard')
      await loadMessagesData(token)
    })
  }

  /**
   * A senha vai sem trim: espaco na ponta faz parte da credencial, e recortar aqui criaria
   * uma senha que o login depois nao aceita.
   */
  async function changePassword() {
    await runProtectedAction(async (token) => {
      await resetAdminPassword(token, {
        oldPassword: settings.currentPassword,
        newPassword: settings.newPassword,
      })

      setSettings(SETTINGS_INITIAL_STATE)
    })
  }

  async function saveAbout(payload: PortfolioProfileSavePayload) {
    await runProtectedAction(async (token) => {
      await saveAdminPortfolioProfile(token, payload)
      markSectionsUnloaded('about')
      await loadAboutData(token)
    })
  }

  async function uploadProfileAsset(file: File, type: 'image' | 'resume') {
    await runProtectedAction(async (token) => {
      const base64 = await readFileAsDataUrl(file)
      const payload = { name: file.name, file: base64 }

      if (type === 'image') await uploadAdminProfileImage(token, payload)
      else await uploadAdminResume(token, payload)

      markSectionsUnloaded('about')
      await loadAboutData(token)
    })
  }

  async function removeProfileAsset(type: 'image' | 'resume') {
    await runProtectedAction(async (token) => {
      if (type === 'image') await removeAdminProfileImage(token)
      else await removeAdminResume(token)

      markSectionsUnloaded('about')
      await loadAboutData(token)
    })
  }

  async function createStat(payload: PortfolioStatSavePayload) {
    await runProtectedAction(async (token) => {
      await createAdminProfileStat(token, payload)
      markSectionsUnloaded('about')
      await loadAboutData(token)
    })
  }

  async function prepareStatForEdit(stat: StatItem) {
    return loadPreparedRecord(
      (token) => prepareAdminProfileStat(token, stat.id).then(mapStatToItem),
      stat,
    )
  }

  async function updateStat(id: number, payload: PortfolioStatSavePayload) {
    await runProtectedAction(async (token) => {
      await updateAdminProfileStat(token, id, payload)
      markSectionsUnloaded('about')
      await loadAboutData(token)
    })
  }

  async function deleteStat(id: number) {
    await runProtectedAction(async (token) => {
      await deleteAdminProfileStat(token, id)
      markSectionsUnloaded('about')
      await loadAboutData(token)
    })
  }

  async function reorderStats(items: ReorderItemPayload[]) {
    await runProtectedAction(async (token) => {
      await reorderAdminProfileStats(token, items)
      markSectionsUnloaded('about')
      await loadAboutData(token)
    })
  }

  async function createLink(payload: SocialLinkSavePayload) {
    await runProtectedAction(async (token) => {
      await createAdminSocialLink(token, payload)
      markSectionsUnloaded('links')
      await loadLinksData(token)
    })
  }

  async function prepareLinkForEdit(link: LinkItem) {
    return loadPreparedRecord(
      (token) => prepareAdminSocialLink(token, link.id).then(mapLinkToItem),
      link,
    )
  }

  async function updateLink(id: number, payload: SocialLinkSavePayload) {
    await runProtectedAction(async (token) => {
      await updateAdminSocialLink(token, id, payload)
      markSectionsUnloaded('links')
      await loadLinksData(token)
    })
  }

  async function deleteLink(id: number) {
    await runProtectedAction(async (token) => {
      await deleteAdminSocialLink(token, id)
      markSectionsUnloaded('links')
      await loadLinksData(token)
    })
  }

  async function toggleLink(id: number) {
    await runProtectedAction(async (token) => {
      await toggleAdminSocialLink(token, id)
      markSectionsUnloaded('links')
      await loadLinksData(token)
    })
  }

  async function reorderLinks(items: ReorderItemPayload[]) {
    await runProtectedAction(async (token) => {
      await reorderAdminSocialLinks(token, items)
      markSectionsUnloaded('links')
      await loadLinksData(token)
    })
  }

  function renderContent() {
    if (page === 'projects') {
      if (projectEdit !== undefined) {
        return <ProjectForm project={projectEdit} onBack={() => setProjectEdit(undefined)} onSave={saveProject} onRemoveCover={removeProjectCover} />
      }

      return (
        <ProjectsList
          projects={projects}
          onCreate={() => setProjectEdit(null)}
          onEdit={(project) => void editProject(project)}
          onDelete={removeProject}
        />
      )
    }

    if (page === 'skills') {
      if (skillEdit !== undefined) {
        return <SkillForm skill={skillEdit} onBack={() => setSkillEdit(undefined)} onSave={saveSkill} />
      }

      return (
        <SkillsList
          skills={skills}
          onCreate={() => setSkillEdit(null)}
          onEdit={(skill) => void editSkill(skill)}
          onDelete={removeSkill}
        />
      )
    }

    if (page === 'experiences') {
      return (
        <ExperiencesSection
          experiences={experiences}
          onSaveExperience={saveExperience}
          onDeleteExperience={removeExperience}
          onReorderExperiences={reorderExperiences}
          onPrepareExperience={prepareExperienceForEdit}
        />
      )
    }

    if (page === 'messages') {
      return <MessagesSection messages={messages} onOpenMessage={openMessage} onDeleteMessage={removeMessage} />
    }

    if (page === 'visitors') {
      return <VisitorsSection visitorStats={visitorStats} />
    }

    if (page === 'about') {
      return (
        <AboutSection
          about={about}
          setAbout={setAbout}
          stats={profileStats}
          onSave={saveAbout}
          onUploadImage={(file) => uploadProfileAsset(file, 'image')}
          onRemoveImage={() => removeProfileAsset('image')}
          onUploadResume={(file) => uploadProfileAsset(file, 'resume')}
          onRemoveResume={() => removeProfileAsset('resume')}
          onCreateStat={createStat}
          onPrepareStat={prepareStatForEdit}
          onUpdateStat={updateStat}
          onDeleteStat={deleteStat}
          onReorderStats={reorderStats}
        />
      )
    }

    if (page === 'links') {
      return (
        <LinksSection
          links={links}
          setLinks={setLinks}
          onCreateLink={createLink}
          onPrepareLink={prepareLinkForEdit}
          onUpdateLink={updateLink}
          onDeleteLink={deleteLink}
          onToggleLink={toggleLink}
          onReorderLinks={reorderLinks}
        />
      )
    }

    if (page === 'settings') {
      return (
        <SettingsSection
          settings={settings}
          setSettings={setSettings}
          accountEmail={currentUser?.email || ''}
          onChangePassword={changePassword}
        />
      )
    }

    return <Dashboard dashboard={dashboardData} visitorStats={visitorStats} onNav={navigate} />
  }

  if (!loggedIn) {
    return (
      <>
        {visibleAdminError ? <AdminToast message={visibleAdminError} onClose={() => setDismissedAdminError(true)} /> : null}
        <LoginScreen
          onLogin={(session) => {
            setPage('dashboard')
            setLoadedAdminSections(getEmptyLoadedSections())
            persistSession(session)
            setAdminError('')
          }}
        />
      </>
    )
  }

  if (shouldShowPortfolioSetup(currentUser)) {
    return (
      <>
        {visibleAdminError ? <AdminToast message={visibleAdminError} onClose={() => setDismissedAdminError(true)} /> : null}
        <PortfolioSetupScreen
          currentUser={currentUser}
          onCreateSetup={createInitialPortfolio}
          onCreateProfile={createInitialPortfolioProfile}
        />
      </>
    )
  }

  return (
    <div className="admin-page">
      <style>{adminStyles}</style>
      {visibleAdminError ? <AdminToast message={visibleAdminError} onClose={() => setDismissedAdminError(true)} /> : null}
      <div className="admin-shell">
        <Sidebar
          active={page}
          currentUser={currentUser}
          unreadMessages={unreadMessages}
          onNav={navigate}
          onLogout={() => {
            clearAdminSession()
            setAuthSession(null)
            setCurrentUser(null)
            setPage('dashboard')
            setDashboardData(null)
            setVisitorStats(null)
            setProjects([])
            setSkills([])
            setExperiences([])
            setMessages([])
            setAbout(ABOUT_INITIAL_STATE)
            setProfileStats([])
            setLinks([])
            setLoadedAdminSections(getEmptyLoadedSections())
            setSettings(SETTINGS_INITIAL_STATE)
          }}
        />
        <main className="admin-main">
          {isBootstrapping ? <div style={{ color: 'var(--text-muted)', marginBottom: 16 }}>Validando sessao e carregando UserInfo...</div> : null}
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
