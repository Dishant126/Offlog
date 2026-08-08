/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"Cascadia Code"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        surface: {
          DEFAULT: '#ffffff',
          50:  '#f7f8fa',
          100: '#f1f5f9',
          200: '#e2e8f0',
          card: '#ffffff',
        },
        sidebar: {
          bg:      '#111827',
          hover:   '#1f2937',
          active:  '#2563eb',
          border:  '#1f2937',
          text:    '#9ca3af',
          heading: '#6b7280',
        },
        dark: {
          DEFAULT: '#0f172a',
          nav:    '#111827',
          card:   '#1e293b',
          border: '#334155',
        },
      },
      boxShadow: {
        'card':    '0 1px 3px 0 rgba(0,0,0,.04), 0 1px 2px -1px rgba(0,0,0,.03)',
        'card-md': '0 4px 12px -2px rgba(0,0,0,.06), 0 2px 6px -2px rgba(0,0,0,.03)',
        'card-lg': '0 10px 32px -4px rgba(0,0,0,.08), 0 4px 12px -4px rgba(0,0,0,.04)',
        'sidebar': '2px 0 8px rgba(0,0,0,.1)',
      },
      backgroundImage: {
        'gradient-auth':   'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
        'gradient-hero':   'linear-gradient(135deg, #172554 0%, #1e3a8a 50%, #1e40af 100%)',
        'gradient-card':   'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
        'gradient-success':'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        'gradient-warn':   'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
        'gradient-danger': 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
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
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
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
        'badge-bounce': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':       { transform: 'scale(1.15)' },
        },
      },
      animation: {
        'fade-in':        'fade-in .3s ease-out both',
        'fade-in-up':     'fade-in-up .4s ease-out both',
        'slide-in-right': 'slide-in-right .3s ease-out both',
        'scale-in':       'scale-in .2s ease-out both',
        'badge-bounce':   'badge-bounce .4s ease-in-out',
      },
    },
  },
  plugins: [],
}
