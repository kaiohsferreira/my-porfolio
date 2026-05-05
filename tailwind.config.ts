import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        bg: {
          DEFAULT: '#050508',
          2: '#0a0a10',
          3: '#0f0f18',
        },
        surface: {
          DEFAULT: '#12121c',
          2: '#1a1a26',
        },
        green: {
          DEFAULT: 'oklch(72% 0.25 160)',
          glow: 'oklch(72% 0.25 160 / 0.15)',
        },
        cyan: {
          DEFAULT: 'oklch(72% 0.25 220)',
          glow: 'oklch(72% 0.25 220 / 0.15)',
        },
        red: {
          accent: 'oklch(65% 0.22 25)',
          glow: 'oklch(65% 0.22 25 / 0.15)',
        },
        yellow: {
          accent: 'oklch(78% 0.18 90)',
          glow: 'oklch(78% 0.18 90 / 0.12)',
        },
        text: {
          DEFAULT: '#e8e8f0',
          muted: '#6b6b80',
          dim: '#3a3a4a',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          bright: 'rgba(255,255,255,0.12)',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        blink: 'blink 0.8s step-end infinite',
        glitch1: 'glitch1 3.5s infinite',
        glitch2: 'glitch2 3.5s infinite',
        'scroll-pulse': 'scrollPulse 2s ease-in-out infinite',
        'float-particle': 'floatParticle linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        glitch1: {
          '0%, 90%, 100%': { transform: 'translate(0)' },
          '92%': { transform: 'translate(-2px, 1px)' },
          '94%': { transform: 'translate(2px, -1px)' },
          '96%': { transform: 'translate(-1px, 2px)' },
        },
        glitch2: {
          '0%, 90%, 100%': { transform: 'translate(0)' },
          '92%': { transform: 'translate(2px, -1px)' },
          '94%': { transform: 'translate(-2px, 1px)' },
          '96%': { transform: 'translate(1px, -2px)' },
        },
        scrollPulse: {
          '0%': { left: '-100%' },
          '100%': { left: '100%' },
        },
        floatParticle: {
          from: { transform: 'translateY(100vh)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          to: { transform: 'translateY(-100px)', opacity: '0' },
        },
      },
      clipPath: {
        chip: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
        'chip-sm': 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))',
        'chip-xs': 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
      },
    },
  },
  plugins: [],
} satisfies Config
