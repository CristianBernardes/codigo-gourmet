/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-red': '#D62828',
        'secondary-orange': '#F77F00',
        'dark-gray': '#2B2D42',
        'light-gray': '#F5F5F5',
        'healthy-green': '#4CAF50',
      },
    },
  },
  plugins: [],
}
