import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { PortfolioContentProvider } from '@/context/PortfolioContentContext'
import { PortfolioPage } from '@/pages/Portfolio'

const AdminPage = lazy(async () => {
  const module = await import('@/pages/Admin')
  return { default: module.AdminPage }
})

function getRuntimeFlags() {
  if (typeof window === 'undefined') {
    return {
      isAdminHost: false,
      allowLocalAdminRoute: false,
    }
  }

  const hostname = window.location.hostname.toLowerCase()
  const isLocalHost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0'

  const isAdminHost = hostname === 'admin.kaioferreira.com.br' || hostname.startsWith('admin.')

  return {
    isAdminHost,
    allowLocalAdminRoute: isLocalHost,
  }
}

export function App() {
  const { isAdminHost, allowLocalAdminRoute } = getRuntimeFlags()

  const adminFallback = (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#050508',
        color: '#e8e8f0',
        fontFamily: '"DM Mono", monospace',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        fontSize: 12,
      }}
    >
      Carregando admin...
    </div>
  )

  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Suspense fallback={adminFallback}>
            {isAdminHost ? (
              <Routes>
                <Route path="*" element={<AdminPage />} />
              </Routes>
            ) : (
              <Routes>
                <Route
                  path="/"
                  element={(
                    <PortfolioContentProvider>
                      <PortfolioPage />
                    </PortfolioContentProvider>
                  )}
                />
                {allowLocalAdminRoute ? <Route path="/admin/*" element={<AdminPage />} /> : null}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            )}
          </Suspense>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  )
}
