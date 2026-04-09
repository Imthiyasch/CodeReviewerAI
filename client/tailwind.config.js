/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        surface: {
          DEFAULT: '#f8f9fb', // Base light grey
          low: '#f3f4f6',
          lowest: '#ffffff',
          high: '#e7e8ea',
          dim: '#d9dadc',
        },
        inverse: {
          surface: '#2e3132', // Dark almost-black
          on: '#f0f1f3',
        },
        brand: {
          secondary: '#9d4300', // Deep warm orange
          container: '#fd761a', // Bright orange gradient end
          fixed: '#ffdbca', // Soft light orange wash
        },
        outline: {
          DEFAULT: '#8c7164',
          variant: '#e0c0b1',
        },
        text: {
          main: '#191c1e', // Dark mode text / primary on light
          variant: '#584237', // Subtext
        },
        primary: {
          DEFAULT: '#575e70',
          container: '#939aae',
          fixed: '#dce2f7',
        },
        danger: '#ba1a1a',
        success: '#10b981',
      },
      backgroundImage: {
        'brand-glow': 'linear-gradient(135deg, #fd761a 0%, #9d4300 100%)',
        'stripe-wash': 'linear-gradient(180deg, rgba(253, 118, 26, 0.05) 0%, rgba(157, 67, 0, 0.02) 100%)',
      },
      boxShadow: {
        'elevation-soft': '0 20px 40px rgba(88, 66, 55, 0.06)',
        'btn': '0 4px 14px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
// force reload
