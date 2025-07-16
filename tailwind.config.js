/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        gray: {
          750: '#2D2D2D',
          800: '#191919',
        }
      },
      letterSpacing: {
        'tight': '-0.02em',
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      spacing: {
        '18': '4.5rem',
        '34': '8.5rem',
      }
    },
  },
  plugins: [],
};