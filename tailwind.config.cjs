const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./client/**/*.{html,js,svelte,ts,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Inter', ...defaultTheme.fontFamily.sans],
    },
  },
  darkMode: 'class',
  plugins: [],
};
