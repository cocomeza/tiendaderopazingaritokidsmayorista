// =====================================================
// CONFIGURACIÓN DE COLORES - Zingarito Kids
// =====================================================
// Todos los colores disponibles en el sistema
// Basado en el CSV de Tienda Nube
// =====================================================

export const PRODUCT_COLORS = [
  // Colores básicos
  'Blanco',
  'Negro',
  'Gris',
  'Beige',
  'Crema',
  'Natural',
  
  // Colores primarios
  'Azul',
  'Azul Marino',
  'Celeste',
  'Aqua',
  'Rojo',
  'Amarillo',
  'Verde',
  'Verde Militar',
  'Verde Musgo',
  'Rosa',
  'Fucsia',
  'Naranja',
  'Coral',
  
  // Colores especiales
  'Tostado',
  'Oliva',
  'Mostaza',
  'Manteca',
  'Ladrillo',
  'Borravino',
  
  // Colores con rayas y estampados
  'Azul Raya Blanca',
  'Azul Raya Celeste',
  'Blanca Raya Amarilla',
  'Blanca Raya Lila',
  'Blanca Raya Negra',
  'Blanca Raya Roja',
  'Blanca Raya Verde',
  'Gris Raya Blanca',
  'Gris Raya Negra',
  'Negra Raya Blanca',
  'Negra Raya Fucsia',
  'Negra Raya Roja',
  'Negra Raya Turquesa',
  'Negro Raya Blanca',
  'Negro Raya Gris',
  'Rosa Raya Blanca',
  
  // Estampados y diseños especiales
  'Batik',
  'Estrella Aqua y Gris',
  'Estrella Gris y Crema',
  'Estrella Negra y Mostaza',
  'Estrella Negras y Negro',
  'Estrellas Rosa y Crema',
  'Gaspeado Raya Fucsia',
  'Negro - Cocodrilo',
  'Negro Rayo',
  
  // Variaciones con smile/surf
  'Crema Smile',
  'Fucsia Smile',
  'Fucsia Zinga Surf',
  'Negro Smile',
  'Smile',
  
  // Variaciones de rosa
  'Rosa Chicle',
  'Rosa Viejo',
  
  // Variaciones de crema
  'Crema Surf Board',
  
  // Variaciones de rojo
  'Rojo Fantasmas',
  
  // Combinaciones
  'Beige + Multicolor',
  'Gris + Multicolor',
  'Gris Melange'
] as const;

// Colores básicos (para filtros rápidos)
export const BASIC_COLORS = [
  'Blanco',
  'Negro',
  'Gris',
  'Azul',
  'Rojo',
  'Verde',
  'Amarillo',
  'Rosa'
] as const;

// Función helper para obtener todos los colores
export function getAllColors(): string[] {
  return [...PRODUCT_COLORS];
}

// Función para obtener colores básicos
export function getBasicColors(): string[] {
  return [...BASIC_COLORS];
}

// Función para validar si un color es válido
export function isValidColor(color: string): boolean {
  return PRODUCT_COLORS.includes(color as any);
}

// Función para normalizar nombres de colores (case-insensitive)
export function normalizeColorName(color: string): string | null {
  const normalized = color.trim();
  const found = PRODUCT_COLORS.find(
    c => c.toLowerCase() === normalized.toLowerCase()
  );
  return found || null;
}

// Mapeo de colores a códigos hex (para visualización)
export const COLOR_HEX_MAP: Record<string, string> = {
  'Blanco': '#FFFFFF',
  'Negro': '#000000',
  'Gris': '#808080',
  'Beige': '#F5F5DC',
  'Crema': '#FFFDD0',
  'Natural': '#F5E6D3',
  'Azul': '#0000FF',
  'Azul Marino': '#000080',
  'Celeste': '#87CEEB',
  'Aqua': '#00FFFF',
  'Rojo': '#FF0000',
  'Amarillo': '#FFFF00',
  'Verde': '#008000',
  'Verde Militar': '#4B5320',
  'Verde Musgo': '#8A9A5B',
  'Rosa': '#FFC0CB',
  'Fucsia': '#FF00FF',
  'Naranja': '#FFA500',
  'Coral': '#FF7F50',
  'Tostado': '#D2B48C',
  'Oliva': '#808000',
  'Mostaza': '#FFDB58',
  'Manteca': '#FFF8DC',
  'Ladrillo': '#B22222',
  'Borravino': '#800020'
};

// Función para obtener el código hex de un color
export function getColorHex(color: string): string {
  return COLOR_HEX_MAP[color] || '#CCCCCC';
}

