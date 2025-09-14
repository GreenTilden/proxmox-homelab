/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mario Theme Colors
        'mario': {
          'classic-bg': 'var(--mario-classic-bg)',
          'classic-primary': 'var(--mario-classic-primary)',
          'classic-secondary': 'var(--mario-classic-secondary)',
          'classic-text': 'var(--mario-classic-text)',
          'classic-card': 'var(--mario-classic-card)',
          'classic-section': 'var(--mario-classic-section)',
        },
      },
      fontFamily: {
        'mario': ['Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
    },
  },
  plugins: [],
}