/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{html,ts}"
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: '#00CFFF', // Bright cyan blue from logo
            light: '#4DDAFF',
            dark: '#00A3CC'
          },
          gray: {
            100: '#cdd9e5',   // strong text / headings
            200: '#adbac7',   // primary body text
            300: '#909dab',   // secondary text
            400: '#768390',   // muted text
            500: '#636e7b',   // placeholder / disabled
            600: '#444c56',   // subtle dividers
            700: '#2d333b',   // elevated surfaces
            800: '#22272e',   // card / panel backgrounds
            900: '#161b22',   // section backgrounds
            950: '#0d1117'    // page canvas (GitHub dark)
          },
          dark: {
            background: '#0d1117',
            surface: '#161b22',
            card: '#22272e',
            border: '#444c56'
          }
        },
        textColor: {
          primary: '#FFFFFF',
          secondary: 'rgba(255, 255, 255, 0.7)',
          disabled: 'rgba(255, 255, 255, 0.5)',
          'on-primary': '#1A1A1A'
        },
        backgroundColor: {
          dark: '#121212',
          surface: '#1E1E1E',
          card: '#252525'
        },
        borderColor: {
          dark: '#333333'
        },
        boxShadow: {
          'card': '0 4px 6px rgba(0, 0, 0, 0.1)',
          'card-hover': '0 10px 15px rgba(0, 0, 0, 0.2)'
        }
      }
    },
    plugins: []
  }
