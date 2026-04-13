/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],

  theme: {
    extend: {

      colors: {
        "scanner-blue": "#5A9BD5",
      },

      keyframes: {
        scan: {
          "0%": { top: "-25%" },
          "100%": { top: "125%" },
        },

        scanLine: {
          "0%": { transform: "translateY(-70px)" },
          "100%": { transform: "translateY(70px)" },
        },
      },

      animation: {
        scan: "scan 1.5s linear infinite",
        "scan-line": "scanLine 1.0s linear infinite",
      },

    },
  },

  plugins: [],
};