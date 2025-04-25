/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        pixel: ["'Press Start 2P'", "cursive"],
      },
      scale: {
        '101': '1.01', // 2% más grande
      }
    },
  },
  plugins: [],
};

