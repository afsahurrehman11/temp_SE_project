/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF',
        secondary: '#059669',
        accent: '#F59E0B',
        'background-light': '#F9FAFB',
        'background-dark': '#111827',
        'text-light': '#1F2937',
        'text-dark': '#F9FAFB',
        'card-light': '#FFFFFF',
        'card-dark': '#1F2937',
        'border-light': '#E5E7EB',
        'border-dark': '#374151',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
        card: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
      },
      backdropBlur: {
        xl: '20px',
      },
    },
  },
  plugins: [],
}
