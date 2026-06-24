import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-background": "#f7ddd0",
        "error": "#ffb4ab",
        "error-container": "#93000a",
        "primary-fixed": "#ffe088",
        "on-surface-variant": "#d0c5af",
        "surface-container-low": "#261911",
        "on-secondary-fixed": "#00210c",
        "on-tertiary": "#003351",
        "on-secondary-fixed-variant": "#005228",
        "on-tertiary-fixed": "#001d31",
        "primary": "#f2ca50",
        "on-primary-fixed-variant": "#574500",
        "inverse-surface": "#f7ddd0",
        "inverse-primary": "#735c00",
        "tertiary": "#a3d3ff",
        "surface-variant": "#413129",
        "on-primary-fixed": "#241a00",
        "surface-container-lowest": "#170b05",
        "primary-fixed-dim": "#e9c349",
        "primary-container": "#d4af37",
        "surface-container": "#2a1d15",
        "secondary-fixed-dim": "#4ae183",
        "on-surface": "#f7ddd0",
        "surface-container-highest": "#413129",
        "surface": "#1d1009",
        "on-primary-container": "#554300",
        "inverse-on-surface": "#3d2d24",
        "on-error-container": "#ffdad6",
        "on-primary": "#3c2f00",
        "surface-tint": "#e9c349",
        "secondary-fixed": "#6bfe9c",
        "outline": "#99907c",
        "surface-container-high": "#36271e",
        "tertiary-fixed": "#cce5ff",
        "on-secondary-container": "#00431f",
        "tertiary-container": "#5fbaff",
        "secondary": "#4ae183",
        "tertiary-fixed-dim": "#92ccff",
        "on-tertiary-fixed-variant": "#004b73",
        "on-error": "#690005",
        "outline-variant": "#4d4635",
        "surface-dim": "#1d1009",
        "surface-bright": "#46362d",
        "secondary-container": "#06bb63",
        "on-tertiary-container": "#004970",
        "on-secondary": "#003919",
        "background": "#1d1009"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      spacing: {
        "unit": "8px",
        "gutter": "16px",
        "stone-margin": "32px",
        "container-padding": "24px"
      },
      fontFamily: {
        "display-lg": ["var(--font-eb-garamond)", "serif"],
        "headline-lg-mobile": ["var(--font-eb-garamond)", "serif"],
        "body-md": ["var(--font-source-serif-4)", "serif"],
        "label-sm": ["var(--font-space-mono)", "monospace"],
        "headline-lg": ["var(--font-eb-garamond)", "serif"]
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg-mobile": ["28px", { lineHeight: "36px", fontWeight: "600" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.1em", fontWeight: "500" }],
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "600" }]
      }
    },
  },
  plugins: [],
};
export default config;
