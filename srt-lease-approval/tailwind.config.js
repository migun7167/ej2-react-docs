/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        srt: {
          navy: '#1a2d5a',
          'navy-dark': '#0f1e3d',
          'navy-light': '#2a4080',
          red: '#c0272d',
          'red-dark': '#a01e23',
          'red-light': '#e03040',
          gold: '#d4a017',
          'gold-light': '#f0c040',
          'gold-dark': '#b08010',
        }
      },
      fontFamily: {
        thai: ['Sarabun', 'Noto Sans Thai', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
