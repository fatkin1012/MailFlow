/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        'soft-amber': '0 20px 60px -30px rgba(251, 191, 36, 0.35)',
      },
    },
  },
  plugins: [],
};