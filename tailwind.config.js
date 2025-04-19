/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Custom colors for our dark theme
        slate: {
          900: '#0f172a', // Background
          800: '#1e293b', // Card background
          700: '#334155', // Input background
          600: '#475569', // Secondary button
          500: '#64748b', // Border
          400: '#94a3b8', // Secondary text
          300: '#cbd5e1', // Muted text
          200: '#e2e8f0', // Primary text
        },
        blue: {
          700: '#1d4ed8', // Primary button hover
          600: '#2563eb', // Primary button
          500: '#3b82f6', // Primary accent
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};