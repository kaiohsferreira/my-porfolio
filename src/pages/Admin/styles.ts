import type { CSSProperties } from 'react'

/**
 * Estilos do painel.
 *
 * A paleta vem do globals.css (body.admin-mode), a mesma da conversa pública: o painel e o
 * portfólio agora são um produto só. Aqui ficam o esqueleto — barra lateral, área principal,
 * grades — e os detalhes que estilo inline não alcança, como foco de campo e hover.
 */
export const adminStyles = `
  .admin-page {
    --admin-sidebar-w: 256px;
    --admin-radius: 18px;
    --admin-shadow: 0 1px 2px rgba(40, 34, 64, 0.04), 0 10px 28px rgba(40, 34, 64, 0.05);
    min-height: 100vh;
    background:
      radial-gradient(900px 480px at 100% 0%, rgba(107, 91, 176, 0.07), transparent 70%),
      var(--bg);
    color: var(--text);
    font-family: var(--font-display);
    position: relative;
    cursor: default;
  }

  .admin-page * { cursor: inherit; }
  .admin-page a,
  .admin-page button { cursor: pointer; }
  .admin-page input,
  .admin-page textarea { cursor: text; }

  .admin-page h1,
  .admin-page h2,
  .admin-page h3 { font-family: var(--font-serif); font-weight: 500; }

  /* Campos: fundo levemente tingido em repouso, branco com anel lavanda no foco. */
  .admin-page input:not([type='checkbox']):not([type='radio']):not([type='file']),
  .admin-page textarea,
  .admin-page select {
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .admin-page input:not([type='checkbox']):not([type='radio']):not([type='file']):focus,
  .admin-page textarea:focus,
  .admin-page select:focus {
    border-color: var(--green) !important;
    background: var(--surface) !important;
    box-shadow: 0 0 0 4px var(--green-glow);
  }
  .admin-page input::placeholder,
  .admin-page textarea::placeholder { color: var(--text-dim); }

  .admin-page button:focus-visible,
  .admin-page a:focus-visible { outline: 2px solid var(--green); outline-offset: 2px; }

  /* Rótulo dos botões: a caixa alta forçada saiu, fica só a primeira letra maiúscula. */
  .admin-btn-label { display: inline-block; }
  .admin-btn-label::first-letter { text-transform: uppercase; }
  .admin-btn { transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s, box-shadow 0.2s; }
  .admin-btn-primary:not(:disabled):hover { background: #5b4c9d !important; box-shadow: 0 8px 20px rgba(107, 91, 176, 0.25); }
  .admin-btn-outline:hover { border-color: var(--green) !important; color: var(--green) !important; }

  .admin-shell { min-height: 100vh; }

  .admin-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    width: var(--admin-sidebar-w);
    background: var(--surface);
    border-right: 1px solid var(--border);
    z-index: 20;
  }

  .admin-nav-item { transition: background 0.2s, color 0.2s; }
  .admin-nav-item:hover { background: var(--bg3) !important; color: var(--text) !important; }

  .admin-main {
    margin-left: var(--admin-sidebar-w);
    min-height: 100vh;
    padding: 40px 48px 72px;
    max-width: calc(1240px + var(--admin-sidebar-w));
  }

  .admin-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }

  .admin-grid-3 {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .admin-grid-4 {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }

  .admin-table-wrap { overflow-x: auto; }
  .admin-table { min-width: 720px; }
  .admin-muted { color: var(--text-muted); }
  .admin-dim { color: var(--text-dim); }

  .admin-status-online {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: var(--success);
    box-shadow: 0 0 0 3px rgba(47, 138, 95, 0.16);
  }

  /* Entrada suave de cada tela ao trocar de seção. */
  .admin-main > * { animation: adminIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) both; }
  @keyframes adminIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: none; }
  }

  @keyframes adminNoticeIn {
    0% { opacity: 0; transform: translate3d(0, -14px, 0) scale(0.98); }
    100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
  }

  @media (max-width: 1100px) {
    .admin-grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
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

    /* No celular os nove itens empilhados ocupariam a tela antes do conteúdo: o menu vira
       uma faixa horizontal que rola com o dedo. */
    .admin-brand { padding: 16px 16px 6px !important; }
    .admin-nav {
      flex-direction: row !important;
      overflow-x: auto;
      overflow-y: hidden !important;
      gap: 6px !important;
      padding: 8px 12px 12px !important;
      scrollbar-width: none;
    }
    .admin-nav::-webkit-scrollbar { display: none; }
    .admin-nav button { flex-shrink: 0; }

    .admin-grid-2,
    .admin-grid-3,
    .admin-grid-4 { grid-template-columns: 1fr; }
  }

  @media (prefers-reduced-motion: reduce) {
    .admin-main > * { animation: none; }
  }
`

export const cardBaseStyle: CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--admin-radius)',
  boxShadow: 'var(--admin-shadow)',
  padding: 24,
  position: 'relative',
  overflow: 'hidden',
}

/** Rótulo de campo e de bloco: discreto, em caixa normal. */
export const sectionEyebrowStyle: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 12.5,
  fontWeight: 500,
  letterSpacing: '0.01em',
  color: 'var(--text-muted)',
}

export const inputStyle: CSSProperties = {
  background: 'var(--bg3)',
  border: '1px solid transparent',
  borderRadius: 12,
  color: 'var(--text)',
  fontFamily: 'var(--font-display)',
  fontSize: 14.5,
  padding: '11px 14px',
  width: '100%',
  outline: 'none',
}
