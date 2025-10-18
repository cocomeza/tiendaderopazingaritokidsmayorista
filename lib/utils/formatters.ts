// Funciones para formatear datos y mostrar en UI

import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatear precio en pesos argentinos
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(price);
}

/**
 * Formatear número de teléfono argentino
 */
export function formatPhone(phone: string): string {
  // Remover caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Formatear según longitud
  if (cleaned.length === 10) {
    // Ej: 3407498045 -> (0340) 749-8045
    return `(0${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
}

/**
 * Formatear fecha
 */
export function formatDate(date: string | Date, formatStr: string = 'dd/MM/yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: es });
}

/**
 * Formatear fecha relativa ("hace 2 días")
 */
export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { 
    addSuffix: true, 
    locale: es 
  });
}

/**
 * Formatear CBU (agregar espacios cada 4 dígitos)
 */
export function formatCBU(cbu: string): string {
  return cbu.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/**
 * Truncar texto
 */
export function truncate(text: string, length: number = 50): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Generar SKU automático
 */
export function generateSKU(name: string, category: string): string {
  const categoryCode = category.slice(0, 3).toUpperCase();
  const nameCode = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${categoryCode}-${nameCode}-${random}`;
}

/**
 * Formatear número de orden
 */
export function formatOrderNumber(orderNumber: string): string {
  // ZK-20231018-0001 -> #0001
  const parts = orderNumber.split('-');
  return `#${parts[parts.length - 1]}`;
}

/**
 * Pluralizar
 */
export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

/**
 * Formatear mensaje de WhatsApp
 */
export function formatWhatsAppMessage(data: {
  name: string;
  orderNumber: string;
  total: number;
  proofUrl?: string;
}): string {
  let message = `¡Hola! Soy ${data.name}.\n\n`;
  message += `Acabo de realizar el pedido ${data.orderNumber}.\n`;
  message += `Total: ${formatPrice(data.total)}\n\n`;
  
  if (data.proofUrl) {
    message += `Comprobante de pago: ${data.proofUrl}\n\n`;
  }
  
  message += `¡Gracias!`;
  
  return encodeURIComponent(message);
}

/**
 * Formatear URL de WhatsApp
 */
export function formatWhatsAppURL(phone: string, message: string): string {
  // Remover caracteres no numéricos del teléfono
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${message}`;
}

/**
 * Obtener iniciales de nombre
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Formatear número con separador de miles
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-AR').format(num);
}

/**
 * Calcular porcentaje de descuento
 */
export function calculateDiscount(original: number, discounted: number): number {
  return Math.round(((original - discounted) / original) * 100);
}

