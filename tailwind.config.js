/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gray: {
          50: '#f9fafb',
          200: '#e5e7eb',
          400: '#9ca3af',
          500: '#6b7280',
          700: '#374151',
          800: '#333',
          900: '#000000',
        },
      },
    },
  },
  plugins: [],
}