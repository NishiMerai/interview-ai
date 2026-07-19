/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#0F172A',
        background: '#F8FAFC',
        card: '#FFFFFF',
        primary: '#2563EB',
        secondary: '#3B82F6',
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
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
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
