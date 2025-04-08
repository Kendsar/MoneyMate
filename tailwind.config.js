/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4e598c',
          50: '#f5f6f9',
          100: '#ebedf3',
          200: '#d2d6e4',
          300: '#adb4cd',
          400: '#808bb2',
          500: '#4e598c',
          600: '#454e7e',
          700: '#3a4169',
          800: '#333857',
          900: '#2d314b',
        },
        accent: {
          DEFAULT: '#f9c784',
          50: '#fff9f0',
          100: '#fef2e1',
          200: '#fde4c3',
          300: '#f9c784',
          400: '#f7b05c',
          500: '#f59834',
          600: '#e17a1f',
          700: '#bb611b',
          800: '#964d1c',
          900: '#7b4019',
        },
      },
    },
  },
  plugins: [],
};