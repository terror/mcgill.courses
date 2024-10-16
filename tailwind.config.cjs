const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./client/**/*.{html,js,svelte,ts,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Inter', ...defaultTheme.fontFamily.sans],
    },
    screens: {
      xs: '480px',
      ...defaultTheme.screens,
    },
  },
  darkMode: 'class',
  plugins: [],
};
