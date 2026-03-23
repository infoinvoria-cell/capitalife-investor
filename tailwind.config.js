/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: "#0A0F1A",
          surface: "#0F1624",
          card: "rgba(255,255,255,0.04)",
          line: "rgba(255,255,255,0.08)",
          text: "#FFFFFF",
          muted: "rgba(255,255,255,0.65)",
          goldLight: "#ECDBA6",
          gold: "#D9B84C",
          risk: "#FF4D4D"
        }
      },
      fontFamily: {
        sans: ["var(--font-figtree)", "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 48px rgba(0, 0, 0, 0.28)"
      },
      borderRadius: {
        xl2: "28px"
      },
      backgroundImage: {
        ambient:
          "radial-gradient(circle at top left, rgba(236,219,166,0.08), transparent 24%), radial-gradient(circle at bottom right, rgba(217,184,76,0.05), transparent 28%), linear-gradient(180deg, #0A0F1A 0%, #0F1624 100%)"
      }
    }
  },
  plugins: []
};
