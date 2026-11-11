/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        risk: {
          high: 'oklch(0.55 0.22 25)',
          'high-bg': 'rgba(239, 68, 68, 0.12)',
          'high-border': 'rgba(239, 68, 68, 0.35)',
          medium: 'oklch(0.75 0.18 60)',
          'medium-bg': 'rgba(245, 158, 11, 0.12)',
          'medium-border': 'rgba(245, 158, 11, 0.35)',
          low: 'oklch(0.65 0.18 155)',
          'low-bg': 'rgba(16, 185, 129, 0.12)',
          'low-border': 'rgba(16, 185, 129, 0.35)',
        },
        tiet: {
          dark: '#0c0e14',
          surface: '#121620',
          card: '#161b26',
          cardHover: '#1c2230',
          border: '#232b3c',
          borderLight: '#323d54',
          accent: '#6366f1',
          crimson: '#e11d48',
          gold: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"Geist Mono"', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-red': '0 0 24px -4px rgba(239, 68, 68, 0.4)',
        'glow-amber': '0 0 24px -4px rgba(245, 158, 11, 0.4)',
        'glow-emerald': '0 0 24px -4px rgba(16, 185, 129, 0.4)',
      }
    },
  },
  plugins: [],
}
