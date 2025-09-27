/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cream-primary': '#FFF8E8',
        'cream-light': '#F7EED3',
        'brown-primary': '#674636',
        'green-primary': '#AAB396',
        'brown-primary-300': '#A76D5D',
        'red-brown': '#8C3B2D',
        'brown-secondary': '#8C5E4B',
        'green-secondary': '#8C9A7A',
        'soft-green': '#8FA382',
        'dark-brown': '#732C1D',
        'warm-brown': '#C9A77C'
      },
    },
  },
  plugins: [],
}
