/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        grass: {
          300: '#9bc99b',
          500: '#4f9866',
          700: '#286343',
          900: '#163d2b',
        },
        sky: {
          300: '#b9dcf5',
        },
        cream: {
          100: '#f8f5eb',
        },
        wood: {
          700: '#5b3b2b',
        },
        ink: {
          900: '#1d2b24',
        },
      },
      backdropBlur: {
        xs: '2px',
        glass: '14px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(15, 40, 27, 0.15)',
        'glass-hover': '0 12px 40px 0 rgba(15, 40, 27, 0.22)',
      },
    },
  },
  plugins: [],
}
