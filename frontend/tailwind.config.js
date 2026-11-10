export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0c2a6b',
          orange: '#f26b21',
          green: '#1e9e4a',
        },
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'Tahoma', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
