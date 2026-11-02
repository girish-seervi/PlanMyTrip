/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#173F35',
          dark: '#102B24',
          light: '#21574A',
          hover: '#13352D'
        },
        mint: {
          DEFAULT: '#DCEFE5',
          light: '#EDF7F1',
          dark: '#B7DEC9',
          accent: '#A1D3B8'
        },
        offwhite: {
          DEFAULT: '#F7F7F2',
          light: '#FCFCF9',
          dark: '#EBEBE5'
        },
        warmorange: {
          DEFAULT: '#F1A66A',
          light: '#F8C296',
          dark: '#D98947',
          hover: '#E59553'
        },
        charcoal: {
          DEFAULT: '#252B29',
          light: '#3C4441',
          muted: '#626B67',
          border: '#D8DDD9'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(23, 63, 53, 0.06), 0 2px 6px -1px rgba(23, 63, 53, 0.04)',
        'card': '0 10px 30px -4px rgba(23, 63, 53, 0.08), 0 4px 8px -2px rgba(23, 63, 53, 0.04)',
        'elevated': '0 20px 40px -6px rgba(23, 63, 53, 0.12), 0 8px 16px -4px rgba(23, 63, 53, 0.06)'
      }
    },
  },
  plugins: [],
}
