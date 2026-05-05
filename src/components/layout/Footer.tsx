import { useLanguage } from '@/context/LanguageContext'

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer
      className="flex items-center justify-between px-12 py-8 border-t"
      style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
    >
      <div className="font-mono text-[11px] tracking-[0.06em]" style={{ color: 'var(--text-dim)' }}>
        <span>© 2026</span>
        {' — '}
        <span style={{ color: 'var(--text-muted)' }}>Kaio Henrique</span>
        {' — '}
        <span>{t('Feito com', 'Made with')}</span>{' '}
        <span style={{ color: 'var(--green)' }}>♥</span>
      </div>

      <div
        className="flex items-center gap-2 font-mono text-[11px] tracking-[0.06em]"
        style={{ color: 'var(--text-dim)' }}
      >
        <div className="status-dot" />
        <span>{t('Disponível para trabalho', 'Available for work')}</span>
      </div>
    </footer>
  )
}
