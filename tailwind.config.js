/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        municipal: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffe',
          300: '#7cc3fd',
          400: '#36a3fa',
          500: '#0c87eb',
          600: '#006bc8',
          700: '#0155a3',
          800: '#064886',
          900: '#0a3d6f',
          950: '#072749',
        },
        gold: {
          500: '#c59b27',
          600: '#a37e19',
        }
      }
    },
  },
  plugins: [],
}
