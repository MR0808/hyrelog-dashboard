import type { Config } from "tailwindcss";

// Tailwind CSS v4 uses CSS-first configuration, but this config file is still supported
// for compatibility. The main configuration is in globals.css using @theme directive.
const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Tailwind v4: Most theme configuration moved to CSS (@theme in globals.css)
  // This config is kept for plugins and content paths
  theme: {
    extend: {
      // Custom colors and utilities can still be defined here
      // But prefer CSS variables in globals.css for Tailwind v4
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
