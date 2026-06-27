/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        srt: {
          navy:      '#1B2F5E',
          'navy-d':  '#0F1E3D',
          'navy-l':  '#2A4080',
          red:       '#C0272D',
          'red-d':   '#9B1F24',
          'red-l':   '#E03040',
          gold:      '#D4A017',
          'gold-l':  '#F0C040',
        },
      },
      fontFamily: { sans: ['Sarabun', 'sans-serif'] },
    },
  },
  plugins: [],
}
