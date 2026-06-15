/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-secondary-fixed-variant": "#653e00",
        "surface-tint": "#4059aa",
        "inverse-on-surface": "#eff1f3",
        tertiary: "#00311f",
        "inverse-surface": "#2d3133",
        "outline-variant": "#c5c5d3",
        "on-secondary": "#ffffff",
        error: "#ba1a1a",
        "primary-fixed-dim": "#b6c4ff",
        "surface-bright": "#f7f9fb",
        "on-surface": "#191c1e",
        "on-error-container": "#93000a",
        "surface-container-high": "#e6e8ea",
        "secondary-fixed-dim": "#ffb95f",
        "on-error": "#ffffff",
        primary: "#00236f",
        outline: "#757682",
        secondary: "#855300",
        "error-container": "#ffdad6",
        "on-tertiary-container": "#27c38a",
        "on-tertiary": "#ffffff",
        "surface-dim": "#d8dadc",
        "on-primary-fixed-variant": "#264191",
        "tertiary-fixed-dim": "#4edea3",
        "secondary-container": "#fea619",
        "surface-container": "#eceef0",
        "primary-container": "#1e3a8a",
        "surface-container-low": "#f2f4f6",
        "on-primary": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "surface-variant": "#e0e3e5",
        "secondary-fixed": "#ffddb8",
        "on-primary-fixed": "#00164e",
        "on-surface-variant": "#444651",
        "tertiary-fixed": "#6ffbbe",
        "surface-container-highest": "#e0e3e5",
        "primary-fixed": "#dce1ff",
        "on-primary-container": "#90a8ff",
        "on-tertiary-fixed-variant": "#005236",
        "on-background": "#191c1e",
        "on-tertiary-fixed": "#002113",
        "on-secondary-container": "#684000",
        "on-secondary-fixed": "#2a1700",
        background: "#f7f9fb",
        "tertiary-container": "#004a31",
        surface: "#f7f9fb",
        "inverse-primary": "#b6c4ff",
      },
      borderRadius: {
        DEFAULT: 4, // Antes: "0.25rem" (aprox. 4px)
        lg: 8, // Antes: "0.5rem" (aprox. 8px)
        xl: 12, // Antes: "0.75rem" (aprox. 12px)
        full: 9999, // Antes: "9999px"
      },
      spacing: {
        "margin-mobile": 20, // Antes: "20px"
        base: 4, // Antes: "4px"
        "stack-sm": 8, // Antes: "8px"
        "stack-md": 16, // Antes: "16px"
        "stack-lg": 24, // Antes: "24px"
        gutter: 16, // Antes: "16px"
      },
      fontFamily: {
        "body-lg": ["Inter"],
        "headline-lg": ["Inter"],
        "title-md": ["Inter"],
        "label-lg": ["Inter"],
        "body-md": ["Inter"],
        "headline-md": ["Inter"],
        "display-hero": ["Inter"],
        "label-sm": ["Inter"],
      },
    },
  },
  plugins: [],
};
