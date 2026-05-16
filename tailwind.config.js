/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#0A0A0A",
        ghost: "#F8F8F8",
        chalk: "#FFFFFF",
        ink: "#1A1A1A",
        signal: "#E63946",
        byte: "#2DC653",
        static: "#D0D0D0",
        glitch: "#FFD60A",
        terminal: "#00B4D8",
      },
      fontFamily: {
        bebas: ["'Bebas Neue'", "sans-serif"],
        mono: ["'Space Mono'", "monospace"],
        code: ["'JetBrains Mono'", "monospace"],
      },
      borderWidth: {
        '2': '2px',
        '3': '3px',
        '4': '4px',
      },
      boxShadow: {
        brutalist: '4px 4px 0px #0A0A0A',
        'brutalist-lg': '6px 6px 0px #0A0A0A',
        'brutalist-xl': '8px 8px 0px #0A0A0A',
        'brutalist-yellow': '4px 4px 0px #FFD60A',
      },
      animation: {
        'cursor-blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
      },
    },
  },
  plugins: [],
}
