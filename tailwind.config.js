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
        // Colores personalizados elegantes (Dark Mode / Madera)
        restaurant: {
          900: '#1a1a1a', // Fondo principal muy oscuro (casi negro)
          800: '#2d2d2d', // Fondo secundario (tarjetas, sidebar)
          700: '#3d3d3d', // Bordes, separadores
          600: '#5c5c5c', // Texto secundario
          500: '#8c8c8c', // Iconos inactivos
          400: '#a3a3a3',
          300: '#d4d4d4', // Texto principal
          200: '#e5e5e5',
          100: '#f5f5f5',
          50: '#fafafa',
          // Acentos (Madera / Oro elegante)
          gold: '#c5a065',
          'gold-hover': '#b08d55',
          wood: '#5d4037',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
