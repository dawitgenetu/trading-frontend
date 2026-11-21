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
          bg: '#0d1718',
          sidebar: '#122022',
          card: '#172a2d',
          cardBorder: '#274245',
          hover: '#20393c',
        },
        brand: {
          teal: '#274245',
          tealDark: '#122022',
          tealSurface: '#172a2d',
          tealBorder: '#2e4f53',
          tealHover: '#223c3f',
          gold: '#DFD6AE',
          goldLight: '#EDE6C7',
          goldDark: '#C9BE8C',
          goldMuted: '#A0966C',
        },
        primary: {
          DEFAULT: '#DFD6AE',
          hover: '#EDE6C7',
          light: '#F5F0D6',
          dark: '#C9BE8C',
        },
        profit: {
          DEFAULT: '#34D399',
          bg: 'rgba(52, 211, 153, 0.12)',
          hover: '#10B981',
          border: 'rgba(52, 211, 153, 0.3)',
        },
        loss: {
          DEFAULT: '#F87171',
          bg: 'rgba(248, 113, 113, 0.12)',
          hover: '#EF4444',
          border: 'rgba(248, 113, 113, 0.3)',
        },
        accent: {
          blue: '#38BDF8',
          amber: '#DFD6AE',
          purple: '#A855F7',
        }
      },
      fontFamily: {
        sans: ['"JetBrains Mono"', 'monospace'],
        display: ['"JetBrains Mono"', 'monospace'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -4px rgba(223, 214, 174, 0.25)',
        'teal-glow': '0 0 35px -5px rgba(39, 66, 69, 0.4)',
        'luxury': '0 10px 30px -10px rgba(11, 19, 21, 0.6), 0 0 0 1px rgba(46, 79, 83, 0.5)',
      }
    },
  },
  plugins: [],
}
