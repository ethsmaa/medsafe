/** @type {import('tailwindcss').Config} */
module.exports = {
	// NOTE: Update this to include the paths to all of your component files.
	content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: {
				primary: "#0F766E",
				"background-light": "#F3F8F7",
				"background-dark": "#0F1A19",
				"surface-light": "#FFFFFF",
				"surface-dark": "#16211F",
				"text-main-light": "#142E2C",
				"text-main-dark": "#E8F0EF",
				"text-sub-light": "#5A716F",
				"text-sub-dark": "#90A6A3",
				"border-light": "#DCE6E4",
				"border-dark": "#2C3A39",
				"success-light": "#15803D",
				"success-dark": "#34d399",
				"error-light": "#DC2626",
				"error-dark": "#f87171",
				"warning-light": "#D97706",
				"warning-dark": "#fbbf24",
				"info-light": "#2563EB",
				"info-dark": "#60a5fa",
				"primary-soft-light": "#CFEDE9",
				"primary-soft-dark": "#163E3A",
			},
			fontFamily: {
				sans: ["Inter", "sans-serif"],
			},
		},
	},
	plugins: [],
};
