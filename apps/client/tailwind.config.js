/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        textmuted: "#B1B1B1",     // small text
        primary: "#343C6A",       // headings
        chart1: "#1814F3",        // main chart colour + buttons
        chart2: "#16DBCC",      // chart accent colour  // secondary elements
        button: "#1814F3"        // button colour
      },
    },
  },
  plugins: [],
};

