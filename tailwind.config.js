/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'Arial', 'Helvetica', 'sans-serif'],
      },
      colors: {
        'morado-claro': '#b4a5fa',
        'morado-oscuro': '#8c7ddc',
        'verde-claro': '#9bfa82',
        'gris-claro': '#ededed',
        'gris-borde': '#cbcbcb',
        negro: '#000000',
        blanco: '#ffffff',
      },
    },
  },
  plugins: [],
}; 