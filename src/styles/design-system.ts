export const ds = {

  // ─── CORES ───────────────────────────────────────────────
  colors: {
    bg: {
      void:    '#05050a',   // fundo mais profundo (body)
      base:    '#09090f',   // fundo principal das páginas
      surface: '#0f0f1a',   // cards, containers
      elevated:'#141422',   // cards em hover, modais
      input:   '#0d0d1c',   // campos de formulário
      overlay: '#000000cc', // overlay de modais (80% opacidade)
    },
    border: {
      subtle:  'rgba(255,255,255,0.05)',  // bordas padrão — quase invisíveis
      default: 'rgba(255,255,255,0.08)',  // bordas hover
      strong:  'rgba(255,255,255,0.12)',  // bordas de foco
      accent:  'rgba(139,92,246,0.30)',   // bordas roxas (accent)
    },
    accent: {
      purple:     '#8b5cf6',
      purpleDim:  'rgba(139,92,246,0.12)',
      purpleGlow: 'rgba(139,92,246,0.06)',
      green:      '#22c55e',
      greenDim:   'rgba(34,197,94,0.12)',
    },
    status: {
      pending:  { bg: 'rgba(234,179,8,0.12)',  text: '#facc15', border: 'rgba(234,179,8,0.25)'  },
      paid:     { bg: 'rgba(34,197,94,0.12)',   text: '#4ade80', border: 'rgba(34,197,94,0.25)'  },
      failed:   { bg: 'rgba(239,68,68,0.12)',   text: '#f87171', border: 'rgba(239,68,68,0.25)'  },
      refunded: { bg: 'rgba(59,130,246,0.12)',  text: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
      active:   { bg: 'rgba(34,197,94,0.12)',   text: '#4ade80', border: 'rgba(34,197,94,0.25)'  },
      inactive: { bg: 'rgba(100,116,139,0.12)', text: '#94a3b8', border: 'rgba(100,116,139,0.2)' },
    },
    text: {
      primary:   '#f1f5f9',
      secondary: '#64748b',
      muted:     '#334155',
      accent:    '#a78bfa',
    },
  },

  // ─── BORDER RADIUS ───────────────────────────────────────
  radius: {
    sm:   '8px',
    md:   '12px',
    lg:   '16px',
    xl:   '20px',
    full: '9999px',
  },

  // ─── SOMBRAS ─────────────────────────────────────────────
  shadow: {
    card:   '0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)',
    modal:  '0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)',
    accent: '0 0 24px rgba(139,92,246,0.15)',
    glow:   '0 0 40px rgba(139,92,246,0.08)',
  },

  // ─── TRANSIÇÕES ──────────────────────────────────────────
  transition: {
    fast:   'all 0.15s cubic-bezier(0.4,0,0.2,1)',
    normal: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
    slow:   'all 0.35s cubic-bezier(0.4,0,0.2,1)',
  },
}
