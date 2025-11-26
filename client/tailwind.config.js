module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ff6b00",
      },
      fontFamily: {
        body: ["Inter", "sans-serif"],
        devanagari: ["Tiro Devanagari Hindi", "serif"],
      },
      boxShadow: {
        'soft-orange': '0 8px 30px rgba(255,107,0,0.14)',
      }
    },
  },
  plugins: [],
};
