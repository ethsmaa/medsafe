/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "primary": "#d99696",
        "background-light": "#f8f6f6",
        "background-dark": "#1e1414",
        "surface-light": "#ffffff",
        "surface-dark": "#2d2424",
        "text-main-light": "#161313",
        "text-main-dark": "#f0ecec",
        "text-sub-light": "#6b5e5e",
        "text-sub-dark": "#a09090",
        "border-light": "#e3dede",
        "border-dark": "#4a3e3e",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
