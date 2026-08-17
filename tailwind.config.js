/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Ditto 와이어프레임 민트 계열
        primary: {
          50: "#eefcf7",
          100: "#d3f6e9",
          500: "#12a893",
          600: "#0e8a79",
        },
      },
    },
  },
  plugins: [],
};
