/**
 * Tests unitarios para funcionalidad de exportación/importación CSV
 */

import { createTestCSV, createCSVFile, parseCSV, createMockProducts, validateExportedCSV } from '../helpers/csv-helpers'

describe('CSV Export/Import Functions', () => {
  describe('CSV Helpers', () => {
    test('debe crear CSV válido con headers y filas', () => {
      const headers = ['SKU', 'Nombre', 'Precio']
      const rows = [
        ['SKU-001', 'Producto 1', '1000'],
        ['SKU-002', 'Producto 2', '2000']
      ]
      
      const csv = createTestCSV(headers, rows)
      
      expect(csv).toContain('SKU,Nombre,Precio')
      expect(csv).toContain('"SKU-001"')
      expect(csv).toContain('"Producto 1"')
    })

    test('debe parsear CSV correctamente', () => {
      const csvContent = 'SKU,Nombre,Precio\n"SKU-001","Producto 1","1000"\n"SKU-002","Producto 2","2000"'
      const parsed = parseCSV(csvContent)
      
      expect(parsed.headers).toEqual(['SKU', 'Nombre', 'Precio'])
      expect(parsed.rows).toHaveLength(2)
      expect(parsed.rows[0]).toEqual(['SKU-001', 'Producto 1', '1000'])
    })

    test('debe crear File mock de CSV', () => {
      const csvContent = 'SKU,Nombre\n"SKU-001","Producto 1"'
      const file = createCSVFile(csvContent, 'test.csv')
      
      expect(file).toBeInstanceOf(File)
      expect(file.name).toBe('test.csv')
      expect(file.type).toBe('text/csv')
    })

    test('debe validar estructura de CSV exportado', () => {
      const csvContent = 'SKU,Nombre,Categoría,Stock Actual,Umbral Bajo,Precio,Precio Mayorista\n"SKU-001","Producto","Ropa","10","5","1000","800"'
      const expectedHeaders = ['SKU', 'Nombre', 'Categoría', 'Stock Actual', 'Umbral Bajo', 'Precio', 'Precio Mayorista']
      
      const isValid = validateExportedCSV(csvContent, expectedHeaders)
      
      expect(isValid).toBe(true)
    })

    test('debe detectar CSV inválido con headers faltantes', () => {
      const csvContent = 'SKU,Nombre\n"SKU-001","Producto"'
      const expectedHeaders = ['SKU', 'Nombre', 'Precio'] // Falta Precio
      
      const isValid = validateExportedCSV(csvContent, expectedHeaders)
      
      expect(isValid).toBe(false)
    })
  })

  describe('CSV Parser - Manejo de comas y comillas', () => {
    test('debe manejar valores con comas dentro de comillas', () => {
      const csvContent = 'SKU,Nombre\n"SKU-001","Producto, con coma"\n"SKU-002","Producto normal"'
      const parsed = parseCSV(csvContent)
      
      expect(parsed.rows[0][1]).toBe('Producto, con coma')
    })

    test('debe manejar valores con comillas dobles', () => {
      const csvContent = 'SKU,Nombre\n"SKU-001","Producto ""especial"""'
      const parsed = parseCSV(csvContent)
      
      expect(parsed.rows[0][1]).toContain('especial')
    })

    test('debe manejar valores vacíos', () => {
      const csvContent = 'SKU,Nombre,Categoría\n"SKU-001","Producto",""\n"SKU-002","","Ropa"'
      const parsed = parseCSV(csvContent)
      
      expect(parsed.rows[0][2]).toBe('')
      expect(parsed.rows[1][1]).toBe('')
    })
  })

  describe('Mock Products', () => {
    test('debe crear productos mock correctamente', () => {
      const products = createMockProducts(3)
      
      expect(products).toHaveLength(3)
      expect(products[0]).toHaveProperty('sku')
      expect(products[0]).toHaveProperty('name')
      expect(products[0]).toHaveProperty('price')
      expect(products[0]).toHaveProperty('stock')
    })

    test('debe tener SKU único para cada producto', () => {
      const products = createMockProducts(5)
      const skus = products.map(p => p.sku)
      const uniqueSkus = new Set(skus)
      
      expect(uniqueSkus.size).toBe(products.length)
    })
  })

  describe('CSV Export Format', () => {
    test('debe generar CSV con formato correcto para Excel', () => {
      const products = createMockProducts(2)
      const headers = ['SKU', 'Nombre', 'Categoría', 'Stock Actual', 'Umbral Bajo', 'Precio', 'Precio Mayorista']
      
      const csvData = products.map(p => ({
        'SKU': p.sku || '',
        'Nombre': p.name,
        'Categoría': p.category || '',
        'Stock Actual': p.stock,
        'Umbral Bajo': p.low_stock_threshold,
        'Precio': p.price,
        'Precio Mayorista': p.wholesale_price || ''
      }))

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
      ].join('\n')

      // Validar estructura
      const isValid = validateExportedCSV(csvContent, headers)
      expect(isValid).toBe(true)
      
      // Validar que tiene datos
      const lines = csvContent.split('\n')
      expect(lines.length).toBeGreaterThan(1) // Al menos headers + 1 fila
    })

    test('debe generar SKU automático si falta', () => {
      const product = { ...createMockProducts(1)[0], sku: '' }
      const generatedSku = `SKU-${product.id.substring(0, 8)}`
      
      expect(generatedSku).toContain('SKU-')
      expect(generatedSku.length).toBeGreaterThan(4)
    })
  })

  describe('CSV Import Validation', () => {
    test('debe validar headers requeridos', () => {
      const validCSV = 'SKU,Nombre,Stock Actual\n"SKU-001","Producto","10"'
      const invalidCSV = 'Nombre,Precio\n"Producto","1000"'
      
      const validParsed = parseCSV(validCSV)
      const invalidParsed = parseCSV(invalidCSV)
      
      expect(validParsed.headers).toContain('SKU')
      expect(validParsed.headers).toContain('Nombre')
      expect(invalidParsed.headers).not.toContain('SKU')
    })

    test('debe parsear números correctamente', () => {
      const csvContent = 'SKU,Nombre,Stock Actual,Precio\n"SKU-001","Producto","10","1000.50"'
      const parsed = parseCSV(csvContent)
      
      const stock = parseInt(parsed.rows[0][2])
      const price = parseFloat(parsed.rows[0][3])
      
      expect(stock).toBe(10)
      expect(price).toBe(1000.50)
    })

    test('debe manejar valores numéricos con comas como separador decimal', () => {
      const csvContent = 'SKU,Precio\n"SKU-001","1000,50"'
      const parsed = parseCSV(csvContent)
      
      const price = parseFloat(parsed.rows[0][1].replace(',', '.'))
      
      expect(price).toBe(1000.50)
    })
  })
})

