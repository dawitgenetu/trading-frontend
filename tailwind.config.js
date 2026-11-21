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
        background: '#0B1120',
        card: {
          DEFAULT: '#1E293B',
          border: '#334155',
          hover: '#24344D',
        },
        dark: {
          bg: '#0B1120',
          sidebar: '#0B1120',
          card: '#1E293B',
          cardBorder: '#334155',
          hover: '#24344D',
        },
        brand: {
          DEFAULT: '#D6A84B',
          hover: '#E5BC65',
          light: '#F4DF9F',
          dark: '#B88B32',
          muted: '#94A3B8',
          // backward compatibility aliases
          gold: '#D6A84B',
          goldLight: '#F4DF9F',
          goldDark: '#B88B32',
          goldMuted: '#94A3B8',
          teal: '#1E293B',
          tealDark: '#0B1120',
          tealSurface: '#1E293B',
          tealBorder: '#334155',
          tealHover: '#24344D',
        },
        primary: {
          DEFAULT: '#D6A84B',
          hover: '#E5BC65',
          light: '#F4DF9F',
          dark: '#B88B32',
        },
        profit: {
          DEFAULT: '#10B981',
          bg: 'rgba(16, 185, 129, 0.12)',
          hover: '#059669',
          border: 'rgba(16, 185, 129, 0.3)',
        },
        loss: {
          DEFAULT: '#EF4444',
          bg: 'rgba(239, 68, 68, 0.12)',
          hover: '#DC2626',
          border: 'rgba(239, 68, 68, 0.3)',
        },
        text: {
          DEFAULT: '#F8FAFC',
          muted: '#94A3B8',
        },
        accent: {
          blue: '#38BDF8',
          gold: '#D6A84B',
          amber: '#D6A84B',
          purple: '#A855F7',
        }
      },
      fontFamily: {
        sans: ['"JetBrains Mono"', 'monospace'],
        display: ['"JetBrains Mono"', 'monospace'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'brand-glow': '0 0 25px -4px rgba(214, 168, 75, 0.35)',
        'gold-glow': '0 0 25px -4px rgba(214, 168, 75, 0.35)',
        'luxury': '0 10px 30px -10px rgba(11, 17, 32, 0.8), 0 0 0 1px rgba(51, 65, 85, 0.6)',
      }
    },
  },
  plugins: [],
}
