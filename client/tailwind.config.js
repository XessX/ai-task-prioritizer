/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        primary: '#2563eb', // blue-600
        danger: '#dc2626',  // red-600
        success: '#16a34a', // green-600
      },
      container: {
        center: true,
        padding: '1rem',
      },
    },
  },
  plugins: [],
}
