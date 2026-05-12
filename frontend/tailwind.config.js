/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Sora', 'sans-serif'] },
      animation: { 'slide-up': 'slideUp 0.2s ease-out' },
      keyframes: { slideUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } } },
    },
  },
  plugins: [],
};
