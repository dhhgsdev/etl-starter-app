// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#171717',
        surface: '#1f1f1f',
        surfaceAlt: '#232323',
        surfaceHover: '#2a2a2a',
      },
    },
  },
  plugins: [],
}

