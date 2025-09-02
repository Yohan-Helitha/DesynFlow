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
      },
    },
  },
  plugins: [],
}
