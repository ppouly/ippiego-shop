// tailwind.config.js

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#FF6B6B",
        "primary-dark": "#FF6B6B",
        background: "#ffffff",
        "background-dark": "#ffffff",
        text: "#222222",
        "text-dark": "#222222",
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};
