/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Colores personalizados de Zingarito Kids
      colors: {
        // Colores principales de la marca
        primary: {
          50: '#f3e8ff',
          100: '#e9d5ff',
          200: '#d8b4fe',
          300: '#c084fc',
          400: '#a855f7',
          500: '#7B3FBD', // Color principal Zingarito
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#3b0764',
        },
        
        secondary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#00D9D4', // Celeste vibrante
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#FFB700', // Amarillo energético
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        
        // Colores del gradiente del logo
        gradient: {
          orange: '#FF6B35',
          yellow: '#F7931E',
          red: '#FF1744',
          pink: '#E91E63',
          purple: '#9C27B0',
          blue: '#2196F3',
          cyan: '#00BCD4',
          lightCyan: '#00E5FF',
        },
        
        // Colores específicos para productos
        product: {
          boys: '#3b82f6',    // Azul para niños
          girls: '#ec4899',   // Rosa para niñas
          unisex: '#6b7280',  // Gris para unisex
          baby: '#fbbf24',    // Amarillo para bebés
        },
        
        // Colores para estados de pedidos
        order: {
          pendiente: '#f59e0b',
          confirmado: '#3b82f6',
          preparando: '#8b5cf6',
          enviado: '#06b6d4',
          entregado: '#10b981',
          cancelado: '#ef4444',
        },
        
        // Colores para stock
        stock: {
          high: '#10b981',    // Verde - stock alto
          medium: '#f59e0b',  // Amarillo - stock medio
          low: '#ef4444',     // Rojo - stock bajo
          out: '#6b7280',     // Gris - sin stock
        },
        
        // WhatsApp verde
        whatsapp: '#25D366',
      },
      
      // Fuentes personalizadas
      fontFamily: {
        'zingarito': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'kids': ['Brush Script MT', 'Lucida Handwriting', 'cursive'],
        'mono': ['Fira Code', 'Monaco', 'Consolas', 'monospace'],
      },
      
      // Espaciado personalizado
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Bordes redondeados personalizados
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      
      // Sombras personalizadas
      boxShadow: {
        'zingarito': '0 4px 20px -2px rgba(123, 63, 189, 0.3)',
        'zingarito-lg': '0 10px 40px -4px rgba(123, 63, 189, 0.4)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 8px 25px rgba(0, 0, 0, 0.15)',
      },
      
      // Animaciones personalizadas
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
      },
      
      // Keyframes para animaciones
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'gradient-y': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center bottom'
          },
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '400% 400%',
            'background-position': 'right center'
          },
        },
      },
      
      // Configuración de gradientes
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-zingarito': 'linear-gradient(135deg, #FF6B35 0%, #E91E63 50%, #00BCD4 100%)',
        'gradient-zingarito-horizontal': 'linear-gradient(90deg, #FF6B35 0%, #F7931E 20%, #FF1744 40%, #E91E63 60%, #9C27B0 80%, #2196F3 100%)',
        'gradient-kids': 'linear-gradient(90deg, #00BCD4 0%, #00E5FF 100%)',
      },
      
      // Configuración de contenedores
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
      
      // Configuración de z-index
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      
      // Configuración de screens
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      
      // Configuración de aspect ratio
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
        '9/16': '9 / 16',
      },
      
      // Configuración de backdrop blur
      backdropBlur: {
        xs: '2px',
      },
      
      // Configuración de scrollbar (para navegadores webkit)
      scrollbar: {
        thin: 'thin',
        none: 'none',
      },
    },
  },
  plugins: [
    // Plugin para scrollbar personalizada
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-thin': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#7B3FBD #f1f1f1',
        },
        '.scrollbar-none': {
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.scrollbar-webkit': {
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#7B3FBD',
            borderRadius: '4px',
            '&:hover': {
              background: '#6d28d9',
            },
          },
        },
      }
      addUtilities(newUtilities)
    },
    
    // Plugin para utilidades adicionales
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.text-gradient': {
          background: 'linear-gradient(135deg, #FF6B35 0%, #E91E63 50%, #00BCD4 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.text-gradient-horizontal': {
          background: 'linear-gradient(90deg, #FF6B35 0%, #F7931E 20%, #FF1744 40%, #E91E63 60%, #9C27B0 80%, #2196F3 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.bg-gradient-zingarito': {
          background: 'linear-gradient(135deg, #FF6B35 0%, #E91E63 50%, #00BCD4 100%)',
        },
        '.bg-gradient-zingarito-horizontal': {
          background: 'linear-gradient(90deg, #FF6B35 0%, #F7931E 20%, #FF1744 40%, #E91E63 60%, #9C27B0 80%, #2196F3 100%)',
        },
        '.shadow-zingarito': {
          boxShadow: '0 4px 20px -2px rgba(123, 63, 189, 0.3)',
        },
        '.shadow-zingarito-lg': {
          boxShadow: '0 10px 40px -4px rgba(123, 63, 189, 0.4)',
        },
        '.card-hover': {
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
          },
        },
        '.btn-primary': {
          backgroundColor: theme('colors.primary.500'),
          color: '#ffffff',
          '&:hover': {
            backgroundColor: theme('colors.primary.600'),
          },
        },
        '.btn-secondary': {
          backgroundColor: theme('colors.secondary.500'),
          color: '#ffffff',
          '&:hover': {
            backgroundColor: theme('colors.secondary.600'),
          },
        },
        '.btn-accent': {
          backgroundColor: theme('colors.accent.500'),
          color: '#000000',
          '&:hover': {
            backgroundColor: theme('colors.accent.600'),
          },
        },
      }
      addUtilities(newUtilities)
    },
  ],
}
