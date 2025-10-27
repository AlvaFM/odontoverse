/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      keyframes: {
        scan: {
          '0%': { top: '-25%' },      
          '100%': { top: '125%' },     
        },
      },
      animation: {
        scan: 'scan 1.5s linear infinite',
      },
      colors: {
        'scanner-blue': '#5A9BD5',     
      },
    },
  },
  plugins: [],
};
