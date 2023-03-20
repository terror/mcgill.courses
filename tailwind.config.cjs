const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./client/**/*.{html,js,tsx,ts}'],
  theme: {
    fontFamily: {
      sans: ['Inter', ...defaultTheme.fontFamily.sans],
    },
  },
  plugins: [],
};
