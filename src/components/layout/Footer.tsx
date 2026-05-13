import { useLanguage } from '@/context/LanguageContext'
import { usePortfolioContent } from '@/context/PortfolioContentContext'

export function Footer() {
  const { t } = useLanguage()
  const { profile } = usePortfolioContent()

  return (
    <footer
      className="footer-wrap flex items-center justify-between px-12 py-8 border-t"
      style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
    >
      <div className="footer-meta font-mono text-[11px] tracking-[0.06em]" style={{ color: 'var(--text-dim)' }}>
        <span>(c) 2026</span>
        <span className="footer-separator"> - </span>
        <span style={{ color: 'var(--text-muted)' }}>{profile.fullName}</span>
        <span className="footer-separator"> - </span>
        <span>{t('Feito com', 'Made with')}</span>{' '}
        <span style={{ color: 'var(--green)' }}>love</span>
      </div>

      <div
        className="footer-status flex items-center gap-2 font-mono text-[11px] tracking-[0.06em]"
        style={{ color: 'var(--text-dim)' }}
      >
        <div className="status-dot" />
        <span>
          {profile.availableForWork
            ? t('Disponivel para trabalho', 'Available for work')
            : t('Indisponivel no momento', 'Currently unavailable')}
        </span>
      </div>
    </footer>
  )
}
