/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        pixel: ["PixelFont","sans-serif"],
        introducing: ["IntroducingFont","sans-serif"],
        headersfont: ["HeaderFont","sans-serif"],
        buttonsfont: ["ButtonFont","sans-serif"],
      }
      
    },
  },
  plugins: [],
}