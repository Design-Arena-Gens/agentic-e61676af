import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          pink: '#ff3fd8',
          blue: '#3fd8ff',
          green: '#3fff8b',
          purple: '#a23fff',
          yellow: '#fff23f'
        }
      }
    },
  },
  plugins: [],
}
export default config
