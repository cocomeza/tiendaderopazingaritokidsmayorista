/**
 * Helpers para tests de CSV
 */

/**
 * Crear un archivo CSV de prueba en memoria
 */
export function createTestCSV(headers: string[], rows: string[][]): string {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
  
  return csvContent
}

/**
 * Crear un Blob de CSV para testing
 */
export function createCSVBlob(content: string): Blob {
  return new Blob([content], { type: 'text/csv;charset=utf-8;' })
}

/**
 * Crear un File mock de CSV
 */
export function createCSVFile(content: string, filename: string = 'test.csv'): File {
  const blob = createCSVBlob(content)
  return new File([blob], filename, { type: 'text/csv' })
}

/**
 * Parsear CSV simple para testing (maneja comas dentro de comillas)
 */
export function parseCSV(csvContent: string): { headers: string[], rows: string[][] } {
  const lines = csvContent.split('\n').filter(line => line.trim())
  if (lines.length === 0) {
    return { headers: [], rows: [] }
  }
  
  // Función para parsear una línea CSV respetando comillas
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'))
  }
  
  const headers = parseCSVLine(lines[0])
  const rows = lines.slice(1).map(line => parseCSVLine(line))
  
  return { headers, rows }
}

/**
 * Crear productos de prueba para tests
 */
export function createMockProducts(count: number = 3) {
  return Array.from({ length: count }, (_, i) => ({
    id: `product-${i + 1}`,
    name: `Producto Test ${i + 1}`,
    sku: `SKU-TEST-${i + 1}`,
    category: i % 2 === 0 ? 'Ropa' : 'Accesorios',
    stock: (i + 1) * 10,
    low_stock_threshold: 10,
    price: (i + 1) * 1000,
    wholesale_price: (i + 1) * 800,
    active: true,
  }))
}

/**
 * Validar estructura de CSV exportado
 */
export function validateExportedCSV(csvContent: string, expectedHeaders: string[]): boolean {
  const lines = csvContent.split('\n').filter(line => line.trim())
  if (lines.length < 1) return false
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  
  return expectedHeaders.every(header => headers.includes(header))
}

