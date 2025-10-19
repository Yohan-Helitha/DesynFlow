/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
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
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Brown/Cream Theme Colors
        'brown-primary': {
          50: '#fefdf8',
          100: '#fefaed',
          200: '#fcf3d6',
          300: '#f9e7b3',
          400: '#f5d180',
          500: '#d4a574',
          600: '#b8935a',
          700: '#8b6914',
          800: '#6b4f0a',
          900: '#4a3508',
          DEFAULT: '#8b6914'
        },
        'cream': {
          'primary': '#fefdf8',
          'light': '#fefaed',
          'medium': '#fcf3d6',
          DEFAULT: '#fefdf8'
        },
        'brown-secondary': {
          50: '#f7f4f0',
          100: '#ede5d9',
          200: '#d4c4b0',
          300: '#b8a082',
          400: '#9d7f59',
          500: '#8b6914',
          600: '#75570f',
          700: '#5e460c',
          800: '#473508',
          900: '#2f2405',
          DEFAULT: '#75570f'
        }
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}