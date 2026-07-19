/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#0F172A',
        background: '#DBE8D8',
        card: '#FFFFFF',
        primary: '#01949A',
        secondary: '#01949A',
        accent: '#06B6D4',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        heading: '#111827',
        bodyText: '#64748B',
        border: '#E2E8F0',
        sidebar: '#1E293B',
        sidebarText: '#FFFFFF',
        brand: {
          50: '#e0f7f8',
          100: '#b3edf0',
          500: '#01949A',
          600: '#01949A',
          700: '#007377'
        }
      },
      boxShadow: {
        glass: '0 24px 80px rgba(15, 23, 42, 0.08)',
        soft: '0 4px 20px rgba(15, 23, 42, 0.04)'
      }
    }
  },
  plugins: []
};
