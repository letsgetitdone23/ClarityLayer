import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom Claude-like colors can be referenced here if needed, 
        // but we'll define CSS custom variables in globals.css as specified in Section 9.
      },
    },
  },
  plugins: [],
};
export default config;
