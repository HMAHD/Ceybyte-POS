/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ceybyte: {
          50: '#e6f3ff',
          100: '#b3d9ff',
          200: '#80bfff',
          300: '#4da6ff',
          400: '#1a8cff',
          500: '#0066cc',
          600: '#0052a3',
          700: '#003d7a',
          800: '#002952',
          900: '#001429',
          primary: '#0066cc',
        },
        status: {
          online: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
          offline: '#a3a3a3',
          processing: '#0066cc',
        },
        currency: {
          positive: '#16a34a',
          negative: '#dc2626',
          neutral: '#404040',
        },
      },
      fontFamily: {
        'sinhala': ['Nirmala UI', 'Iskoola Pota', 'Segoe UI', 'sans-serif'],
        'tamil': ['Nirmala UI', 'Latha', 'Segoe UI', 'sans-serif'],
        'multilang': ['Nirmala UI', 'Segoe UI', 'Iskoola Pota', 'Latha', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      minWidth: {
        'screen-lg': '1024px',
      },
      minHeight: {
        'screen-md': '768px',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-out',
        'slide-in': 'slideIn 300ms ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'ceybyte': '0 4px 6px -1px rgba(0, 102, 204, 0.1), 0 2px 4px -1px rgba(0, 102, 204, 0.06)',
        'status': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'ceybyte': '8px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}