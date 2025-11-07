// =====================================================
// CONFIGURACIÓN DE TALLAS - Zingarito Kids
// =====================================================
// Todas las tallas disponibles en el sistema
// Organizadas por tipo de producto
// =====================================================

export const PRODUCT_SIZES = {
  // Tallas para BEBÉS
  BEBES: [
    '1BB',
    '2BB',
    '3BB',
    '4BB',
    '5BB'
  ],

  // Tallas para NIÑOS (numéricas)
  NINOS: [
    '4',
    '6',
    '8',
    '10',
    '12',
    '14',
    '16'
  ],

  // Tallas para ADULTOS (letras)
  ADULTOS: [
    'S',
    'M',
    'L',
    'XL',
    'XXL'
  ],

  // Tallas para ZAPATOS (números del 17 al 44)
  ZAPATOS: Array.from({ length: 28 }, (_, i) => (i + 17).toString()),

  // Todas las tallas combinadas (para uso general)
  ALL: [
    // Bebés
    '1BB', '2BB', '3BB', '4BB', '5BB',
    // Niños
    '4', '6', '8', '10', '12', '14', '16',
    // Adultos
    'S', 'M', 'L', 'XL', 'XXL',
    // Zapatos
    ...Array.from({ length: 28 }, (_, i) => (i + 17).toString())
  ]
} as const;

// Función helper para obtener tallas por tipo
export function getSizesByType(type: 'BEBES' | 'NINOS' | 'ADULTOS' | 'ZAPATOS' | 'ALL'): string[] {
  return PRODUCT_SIZES[type] || PRODUCT_SIZES.ALL;
}

// Función para validar si una talla es válida
export function isValidSize(size: string): boolean {
  return PRODUCT_SIZES.ALL.includes(size);
}

// Función para determinar el tipo de talla
export function getSizeType(size: string): 'BEBES' | 'NINOS' | 'ADULTOS' | 'ZAPATOS' | 'UNKNOWN' {
  if (PRODUCT_SIZES.BEBES.includes(size)) return 'BEBES';
  if (PRODUCT_SIZES.NINOS.includes(size)) return 'NINOS';
  if (PRODUCT_SIZES.ADULTOS.includes(size)) return 'ADULTOS';
  if (PRODUCT_SIZES.ZAPATOS.includes(size)) return 'ZAPATOS';
  return 'UNKNOWN';
}

