/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen', 'Ubuntu', 'sans-serif'],
        mono: ['"Cascadia Code"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        surface: {
          DEFAULT: '#ffffff',
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          card: '#ffffff',
        },
        dark: {
          DEFAULT: '#0f172a',
          nav:    '#0f172a',
          card:   '#1e293b',
          border: '#334155',
        }
      },
      boxShadow: {
        'card':   '0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.04)',
        'card-md':'0 4px 16px -2px rgba(0,0,0,.08), 0 2px 8px -2px rgba(0,0,0,.04)',
        'card-lg':'0 10px 40px -4px rgba(0,0,0,.1), 0 4px 16px -4px rgba(0,0,0,.06)',
        'glow':   '0 0 24px rgba(99,102,241,.35)',
        'glow-sm':'0 0 12px rgba(99,102,241,.2)',
      },
      backgroundImage: {
        'gradient-auth':   'linear-gradient(135deg, #312e81 0%, #4f46e5 50%, #7c3aed 100%)',
        'gradient-hero':   'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
        'gradient-card':   'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        'gradient-success':'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        'gradient-warn':   'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
        'gradient-danger': 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
        'gradient-navy':   'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        'dot-pattern':     'radial-gradient(rgba(255,255,255,.15) 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot': '24px 24px',
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(99,102,241,.3)' },
          '50%':       { boxShadow: '0 0 24px rgba(99,102,241,.6)' },
        },
        'badge-bounce': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':       { transform: 'scale(1.2)' },
        },
      },
      animation: {
        'fade-in':       'fade-in .25s ease-out both',
        'slide-in-right':'slide-in-right .3s ease-out both',
        'scale-in':      'scale-in .2s ease-out both',
        'shimmer':       'shimmer 2s linear infinite',
        'pulse-glow':    'pulse-glow 2s ease-in-out infinite',
        'badge-bounce':  'badge-bounce .4s ease-in-out',
      },
    },
  },
  plugins: [],
}
