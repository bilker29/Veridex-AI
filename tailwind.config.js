/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090B10",
        surface: "#10131E",
        "surface-card": "rgba(22, 27, 42, 0.75)",
        "surface-card-hover": "rgba(30, 37, 58, 0.85)",
        monad: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#836EF9",
          600: "#7056f7",
          700: "#5a3ce6",
          800: "#472cc4",
          900: "#200052",
        },
        cyber: {
          cyan: "#00F0FF",
          emerald: "#00F5A0",
          pink: "#FF007A",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-cyber": "linear-gradient(135deg, #836EF9 0%, #00F0FF 100%)",
        "gradient-monad": "linear-gradient(135deg, #200052 0%, #836EF9 50%, #00F0FF 100%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2.5s ease-in-out infinite alternate",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 15px rgba(131, 110, 249, 0.3)" },
          "100%": { boxShadow: "0 0 35px rgba(0, 240, 255, 0.6)" },
        },
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        }
      }
    },
  },
  plugins: [],
};
