import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#050816',
        foreground: '#f8fafc',
        card: '#111827',
        accent: '#f43f5e',
        secondary: '#0f172a'
      },
      boxShadow: {
        glow: '0 0 40px rgba(244, 63, 94, 0.35)'
      }
    }
  },
  plugins: []
};

export default config;