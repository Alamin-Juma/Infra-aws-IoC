 /** @type {import('tailwindcss').Config} */
 export default {
  darkMode: 'class',
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {},
    
  },
  plugins: [
    require("rippleui")
  ],
  rippleui: {
		removeThemes: ["dark"],
	}
}

