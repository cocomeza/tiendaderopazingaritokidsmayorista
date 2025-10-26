// =====================================================
// ZINGARITO KIDS - CONFIGURACIÓN DE COLORES Y ESTILOS
// =====================================================

export const zingaritoColors = {
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
  
  // Colores funcionales
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Colores neutros
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // WhatsApp verde
  whatsapp: '#25D366',
  
  // Colores específicos para productos
  product: {
    boys: '#3b82f6',    // Azul para niños
    girls: '#ec4899',   // Rosa para niñas
    unisex: '#6b7280',  // Gris para unisex
    baby: '#fbbf24',    // Amarillo para bebés
  },
  
  // Colores para estados de pedidos
  orderStatus: {
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
  }
};

// Configuración de tipografías
export const zingaritoFonts = {
  // Fuente principal (para ZINGARITO)
  primary: {
    family: 'Inter, system-ui, -apple-system, sans-serif',
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    }
  },
  
  // Fuente secundaria (para KIDS)
  secondary: {
    family: '"Brush Script MT", "Lucida Handwriting", cursive',
    weights: {
      normal: 400,
      bold: 700,
    }
  },
  
  // Fuente para código
  mono: {
    family: '"Fira Code", "Monaco", "Consolas", monospace',
  }
};

// Configuración de espaciado
export const zingaritoSpacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
};

// Configuración de bordes redondeados
export const zingaritoRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

// Configuración de sombras
export const zingaritoShadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
};

// Configuración de animaciones
export const zingaritoAnimations = {
  // Transiciones suaves
  transition: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
  
  // Animaciones específicas
  bounce: 'bounce 1s infinite',
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  spin: 'spin 1s linear infinite',
  
  // Animaciones personalizadas
  fadeIn: 'fadeIn 0.5s ease-in-out',
  slideUp: 'slideUp 0.3s ease-out',
  slideDown: 'slideDown 0.3s ease-out',
};

// Configuración de breakpoints
export const zingaritoBreakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Configuración de z-index
export const zingaritoZIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070,
};

// Configuración específica para componentes
export const zingaritoComponents = {
  // Header
  header: {
    height: '4rem', // 64px
    backgroundColor: zingaritoColors.primary[500],
    textColor: '#ffffff',
  },
  
  // Sidebar
  sidebar: {
    width: '16rem', // 256px
    backgroundColor: zingaritoColors.gray[50],
    borderColor: zingaritoColors.gray[200],
  },
  
  // Cards
  card: {
    backgroundColor: '#ffffff',
    borderColor: zingaritoColors.gray[200],
    borderRadius: zingaritoRadius.lg,
    shadow: zingaritoShadows.md,
    padding: zingaritoSpacing.lg,
  },
  
  // Buttons
  button: {
    primary: {
      backgroundColor: zingaritoColors.primary[500],
      textColor: '#ffffff',
      hoverColor: zingaritoColors.primary[600],
    },
    secondary: {
      backgroundColor: zingaritoColors.secondary[500],
      textColor: '#ffffff',
      hoverColor: zingaritoColors.secondary[600],
    },
    accent: {
      backgroundColor: zingaritoColors.accent[500],
      textColor: '#000000',
      hoverColor: zingaritoColors.accent[600],
    },
  },
  
  // Form inputs
  input: {
    borderColor: zingaritoColors.gray[300],
    focusBorderColor: zingaritoColors.primary[500],
    errorBorderColor: zingaritoColors.error,
    borderRadius: zingaritoRadius.md,
  },
  
  // Product cards
  productCard: {
    backgroundColor: '#ffffff',
    borderColor: zingaritoColors.gray[200],
    borderRadius: zingaritoRadius.lg,
    shadow: zingaritoShadows.sm,
    hoverShadow: zingaritoShadows.lg,
  },
  
  // Status badges
  statusBadge: {
    borderRadius: zingaritoRadius.full,
    padding: `${zingaritoSpacing.sm} ${zingaritoSpacing.md}`,
    fontSize: '0.875rem',
    fontWeight: zingaritoFonts.primary.weights.medium,
  },
};

// Configuración de temas
export const zingaritoThemes = {
  light: {
    background: '#ffffff',
    surface: zingaritoColors.gray[50],
    text: zingaritoColors.gray[900],
    textSecondary: zingaritoColors.gray[600],
    border: zingaritoColors.gray[200],
  },
  
  dark: {
    background: zingaritoColors.gray[900],
    surface: zingaritoColors.gray[800],
    text: zingaritoColors.gray[100],
    textSecondary: zingaritoColors.gray[400],
    border: zingaritoColors.gray[700],
  },
};

// Configuración de la marca
export const zingaritoBrand = {
  name: 'Zingarito Kids',
  tagline: 'Ropa infantil de calidad',
  description: 'Tienda mayorista especializada en ropa infantil',
  website: 'https://zingaritokids.com',
  email: 'zingaritokids@gmail.com',
  phone: '+54 340 749 8045',
  whatsapp: '543407498045',
  address: 'San Martín 17, Villa Ramallo, Buenos Aires, Argentina',
  
  // Configuración de redes sociales
  social: {
    instagram: '@zingaritokids',
    facebook: 'Zingarito Kids',
    tiktok: '@zingaritokids',
  },
  
  // Configuración de horarios
  hours: {
    monday: '9:00-18:00',
    tuesday: '9:00-18:00',
    wednesday: '9:00-18:00',
    thursday: '9:00-18:00',
    friday: '9:00-18:00',
    saturday: '9:00-13:00',
    sunday: 'Cerrado',
  },
  
  // Configuración de métodos de pago
  paymentMethods: [
    'Transferencia bancaria',
    'Efectivo',
    'MercadoPago',
  ],
  
  // Configuración de envío
  shipping: {
    cost: 0,
    freeThreshold: 50000,
    estimatedDays: '3-5 días hábiles',
  },
  
  // Configuración de pedidos mayoristas
  wholesale: {
    minQuantity: 5,
    minAmount: 0,
    discountPercentage: 10, // Descuento por compra mayorista
  },
};

export default {
  colors: zingaritoColors,
  fonts: zingaritoFonts,
  spacing: zingaritoSpacing,
  radius: zingaritoRadius,
  shadows: zingaritoShadows,
  animations: zingaritoAnimations,
  breakpoints: zingaritoBreakpoints,
  zIndex: zingaritoZIndex,
  components: zingaritoComponents,
  themes: zingaritoThemes,
  brand: zingaritoBrand,
};
