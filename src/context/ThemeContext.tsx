import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { THEMES, type ThemeConfig } from '@/data/portfolio'

interface ThemeContextValue {
  /** Configuração completa do tema ativo. */
  theme: ThemeConfig
  themeId: string
  setThemeId: (id: string) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const DEFAULT_THEME_ID = 'green'

/** Escreve as cores do tema nas variáveis CSS que o site inteiro consome. */
function applyTheme(theme: ThemeConfig) {
  const root = document.documentElement.style

  root.setProperty('--bg', theme.bg)
  root.setProperty('--bg2', theme.bg2)
  root.setProperty('--bg3', theme.bg3)
  root.setProperty('--surface', theme.surface)
  root.setProperty('--border', theme.border)
  root.setProperty('--border-bright', theme.borderBright)
  root.setProperty('--text', theme.text)
  root.setProperty('--text-muted', theme.textMuted)
  root.setProperty('--text-dim', theme.textDim)
  root.setProperty('--green', theme.green)
  root.setProperty('--cyan', theme.cyan)
  root.setProperty('--green-glow', theme.greenGlow)
  root.setProperty('--cyan-glow', theme.cyanGlow)
}

/**
 * Guarda o tema escolhido e o aplica.
 *
 * A escolha vinha de um estado local dentro da Navbar, que escrevia as variáveis CSS direto no
 * :root. Funcionava para pintar, mas deixava o tema invisível para o resto da aplicação — e a
 * Hero precisa saber qual herói está ativo para desenhar o emblema correspondente.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState(DEFAULT_THEME_ID)

  const theme = THEMES.find((item) => item.id === themeId) ?? THEMES[0]

  const setThemeId = useCallback((id: string) => {
    if (THEMES.some((item) => item.id === id)) setThemeIdState(id)
  }, [])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, themeId, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
