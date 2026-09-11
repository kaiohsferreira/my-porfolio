import type { CSSProperties } from 'react'

export const adminStyles = `
  .admin-page {
    --admin-sidebar-w: 248px;
    min-height: 100vh;
    background:
      radial-gradient(circle at top right, oklch(72% 0.25 160 / 0.07), transparent 28%),
      linear-gradient(180deg, var(--bg) 0%, #07070d 100%);
    color: var(--text);
    position: relative;
    cursor: default;
  }

  .admin-page * {
    cursor: inherit;
  }

  .admin-page a,
  .admin-page button {
    cursor: pointer;
  }

  .admin-page input,
  .admin-page textarea {
    cursor: text;
  }

  .admin-shell {
    min-height: 100vh;
  }

  .admin-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    width: var(--admin-sidebar-w);
    background: rgba(10, 10, 16, 0.94);
    border-right: 1px solid var(--border);
    backdrop-filter: blur(18px);
    z-index: 20;
  }

  .admin-main {
    margin-left: var(--admin-sidebar-w);
    min-height: 100vh;
    padding: 40px 40px 72px;
  }

  .admin-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
  }

  .admin-grid-3 {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
  }

  .admin-grid-4 {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 18px;
  }

  .admin-table-wrap {
    overflow-x: auto;
  }

  .admin-table {
    min-width: 720px;
  }

  .admin-muted {
    color: var(--text-muted);
  }

  .admin-dim {
    color: var(--text-dim);
  }

  .admin-status-online {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: var(--green);
    box-shadow: 0 0 14px var(--green);
    animation: adminPulse 2s ease-in-out infinite;
  }

  @keyframes adminPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.45; transform: scale(0.9); }
  }

  @keyframes adminNoticeIn {
    0% {
      opacity: 0;
      transform: translate3d(0, -14px, 0) scale(0.98);
    }
    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale(1);
    }
  }

  @media (max-width: 1100px) {
    .admin-grid-4 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 960px) {
    .admin-sidebar {
      position: static;
      width: auto;
      border-right: none;
      border-bottom: 1px solid var(--border);
    }

    .admin-main {
      margin-left: 0;
      padding: 24px 16px 48px;
    }

    .admin-grid-2,
    .admin-grid-3,
    .admin-grid-4 {
      grid-template-columns: 1fr;
    }
  }
`

export const cardBaseStyle: CSSProperties = {
  background: 'linear-gradient(180deg, rgba(18,18,28,0.98) 0%, rgba(10,10,16,0.98) 100%)',
  border: '1px solid var(--border)',
  padding: 24,
  position: 'relative',
  overflow: 'hidden',
}

export const sectionEyebrowStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--text-dim)',
}

export const inputStyle: CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border-bright)',
  color: 'var(--text)',
  fontFamily: 'var(--font-display)',
  fontSize: 14,
  padding: '11px 14px',
  width: '100%',
  outline: 'none',
}
