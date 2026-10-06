/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf8f0',
          100: '#faefd9',
          200: '#f4dbb2',
          300: '#ecc17f',
          400: '#e3a24a',
          500: '#d4862a',
          600: '#b86a1f',
          700: '#98521c',
          800: '#7c421e',
          900: '#67381b',
          950: '#391c0c',
        },
        neutral: {
          50:  '#f8f7f4',
          100: '#eeece6',
          200: '#dddacf',
          300: '#c6c1b0',
          400: '#aba590',
          500: '#928b76',
          600: '#7a7362',
          700: '#635d50',
          800: '#534e44',
          900: '#46423b',
          950: '#262319',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      screens: {
        xs: '480px',
      },
    },
  },
  plugins: [],
}
