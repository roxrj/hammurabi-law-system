module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#D4A574',
        'gold-dark': '#8B7355',
        primary: '#1a1a1a',
        secondary: '#2d2d2d',
        accent: '#D4A574',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        'arabic': ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
