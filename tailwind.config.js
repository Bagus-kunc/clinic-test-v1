/** @type {import('tailwindcss').Config} */

const primeui = require('tailwindcss-primeui');

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        'gray-scorpion': '#505047',
        'gray-dark': '#757575',
        'gray-text': '#687489',
        'blue-hover': '#85a7daa8',
        'blue-selected': '#000080',
      },
    },
  },
  darkMode: 'class',
  plugins: [primeui],
};
