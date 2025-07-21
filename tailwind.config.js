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
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        'sinhala': ['Nirmala UI', 'Iskoola Pota', 'Segoe UI', 'sans-serif'],
        'tamil': ['Nirmala UI', 'Latha', 'Segoe UI', 'sans-serif'],
        'multilang': ['Nirmala UI', 'Segoe UI', 'Iskoola Pota', 'Latha', 'sans-serif'],
        'pos': ['Consolas', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}