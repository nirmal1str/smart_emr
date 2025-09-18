/** @type {import('tailwindcss').Config} */
module.exports = {
  // Use the 'class' strategy for manual toggling
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}