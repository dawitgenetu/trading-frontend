/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B1120',
          sidebar: '#111827',
          card: '#172033',
          cardBorder: '#1E293B',
          hover: '#1E293B',
        },
        primary: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          light: '#818CF8',
          dark: '#4338CA',
        },
        profit: {
          DEFAULT: '#22C55E',
          bg: 'rgba(34, 197, 94, 0.1)',
          hover: '#16A34A',
          border: 'rgba(34, 197, 94, 0.25)',
        },
        loss: {
          DEFAULT: '#EF4444',
          bg: 'rgba(239, 68, 68, 0.1)',
          hover: '#DC2626',
          border: 'rgba(239, 68, 68, 0.25)',
        },
        accent: {
          blue: '#38BDF8',
          amber: '#F59E0B',
          purple: '#A855F7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
