// tailwind.config.js
module.exports = {
    content: [
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class", // 핵심!!
    theme: {
      extend: {
        colors: {
          primary: "#FF6B6B",
          "primary-dark": "#FF6B6B",
          background: "#F7F2EB",
          "background-dark": "#F7F2EB",
          text: "#222222",
          "text-dark": "#222222",
          fontFamily: {
            sans: ['Arial', 'Helvetica', 'sans-serif'],
          },          
        },
      },
    },
    plugins: [],
  };
  