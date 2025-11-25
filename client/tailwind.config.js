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
"theme-bg": "var(--bg-color)",
"theme-text": "var(--text-color)",
"theme-primary": "var(--primary-color)",
"theme-primary-light": "var(--primary-light)",
"theme-primary-dark": "var(--primary-dark)",
"theme-border": "var(--border-color)",
"theme-border-strong": "var(--border-strong)",
"theme-shadow": "var(--shadow-color)",
"theme-hover-bg": "var(--hover-bg)",
"theme-hover-text": "var(--hover-text)",
"antique-paper": "var(--color-antique-paper)",
"inky-charcoal": "var(--color-inky-charcoal)",
"muted-saffron": "var(--color-muted-saffron)",
"kalighat-red": "var(--color-kalighat-red)",
"kalighat-indigo": "var(--color-kalighat-indigo)",
"ui-text-light": "var(--color-ui-text-light)",
"border-subtle": "var(--color-border-subtle)",
},
fontFamily: {
body: ["Hind", "sans-serif"],
heading: ["Gotu", "serif"],
devanagari: ["Tiro Devanagari Hindi", "serif"],
"playfair-display": ["Playfair Display", "serif"],
inter: ["Inter", "sans-serif"],
},
keyframes: {
shimmer: { "100%": { transform: "translateX(100%)" } },
},
},
},
plugins: [],
};