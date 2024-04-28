/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,css}', './public/index.html'],
  theme: {
    listStyleType: {
      square: 'square'
    },
    fontFamily: {
      main: ['Poppins', 'sans-serif']
    },
    extend: {
      colors: {
        primary: {
          200: '#ff4646',
          400: '#ee3131',
          600: '#941212'
        },
        secondary: {
          200: '#976ff3',
          400: '#885CEE'
        }
      },
      boxShadow: {
        'card': '0 1px 2px 0 rgba(60, 64, 67, .1), 0 2px 6px 2px rgba(60, 64, 67, .15)'
      },
      animation: {
        'slideDown': 'slideDown .3s ease-in-out'
      },
      keyframes: {
        'slideDown': {
          '0%': {
            opacity: 0,
            transform: 'translateY(-100%)'
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)'
          }
        }
      }
    }
  },
  plugins: [require('@tailwindcss/line-clamp')]
}
