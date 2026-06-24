/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        uam: {
          50:  '#ebfafb',
          100: '#ccf0f3',
          200: '#99dde2',
          300: '#66cad1',
          400: '#33b7c0',
          500: '#0099a8',
          600: '#007a86',
          700: '#005c64',
          800: '#003d43',
          900: '#001f22',
        },
        gold: {
          400: '#E8C547',
          500: '#C9A227',
          600: '#A6841E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
