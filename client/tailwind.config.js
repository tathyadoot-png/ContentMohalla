/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./common/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- BASE COLORS ---
        'antique-paper': 'var(--color-antique-paper)', // #F7F4EF (Light BG) / #1A1A1A (Dark BG)
        'inky-charcoal': 'var(--color-inky-charcoal)', // #2C3E50 (Light Text) / #E2DED7 (Dark Text)
        'muted-saffron': 'var(--color-muted-saffron)', // #C27B22 (Accent) / #FFCF5C (Dark Accent)
        
        // --- KALIGHAT/MADHUBANI ACCENTS ---
        'kalighat-red': 'var(--color-kalighat-red)',
        'kalighat-indigo': 'var(--color-kalighat-indigo)',
        
        // --- UI COLORS ---
        'ui-text-light': 'var(--color-ui-text-light)', // Metadata/Secondary Text
        'border-subtle': 'var(--color-border-subtle)', // Light borders
      },
      fontFamily: {
        // Mapped from app/globals.css
        'devanagari': ['Tiro Devanagari Hindi', 'serif'],
        'playfair-display': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};
