'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { 
  Package, 
  AlertTriangle, 
  TrendingDown,
  TrendingUp,
  Plus,
  Minus,
  Upload,
  Download,
  ArrowLeft,
  Home,
  LogOut,
  RefreshCw,
  History,
  FileText,
  MinusCircle,
  Search
} from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  sku: string
  stock: number
  low_stock_threshold: number
  category?: string
  price: number
  wholesale_price?: number
}

interface StockHistory {
  id: string
  product_id: string
  product_name: string
  change_type: string
  quantity: number
  previous_stock: number
  new_stock: number
  notes?: string
  created_at: string
}

export default function AdminInventarioPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([])
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('todos')
  const [stockFilter, setStockFilter] = useState<string>('todos')
  
  // Modal de ajuste de stock
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract' | 'set'>('add')
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('')
  const [adjustmentNotes, setAdjustmentNotes] = useState('')
  
  // Ref para el input de archivo
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadProducts()
    loadStockHistory()
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Sesión cerrada correctamente')
      router.push('/')
    } catch (error) {
      console.error('Error cerrando sesión:', error)
      toast.error('Error al cerrar sesión')
    }
  }

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true })

      if (error) {
        console.error('Error cargando productos:', error)
        toast.error('Error al cargar productos')
        return
      }

      setProducts(data || [])
      
      // Identificar productos con stock bajo
      const lowStock = (data || []).filter(p => p.stock <= p.low_stock_threshold)
      setLowStockProducts(lowStock)
    } catch (error) {
      console.error('Error general:', error)
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const loadStockHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Error cargando historial:', error?.message || error)
        return
      }

      // Obtener nombres de productos
      const enrichedHistory = await Promise.all(
        (data || []).map(async (entry) => {
          const { data: product } = await supabase
            .from('products')
            .select('name')
            .eq('id', entry.product_id)
            .single()

          return {
            ...entry,
            product_name: product?.name || 'Producto eliminado'
          }
        })
      )

      setStockHistory(enrichedHistory)
    } catch (error) {
      console.error('Error general:', error instanceof Error ? error.message : error)
    }
  }

  const handleAdjustStock = async () => {
    if (!selectedProduct || !adjustmentQuantity || isNaN(Number(adjustmentQuantity))) {
      toast.error('Ingresa una cantidad válida')
      return
    }

    const quantity = Number(adjustmentQuantity)
    let newStock = 0

    // Calcular nuevo stock según el tipo de ajuste
    if (adjustmentType === 'add') {
      newStock = selectedProduct.stock + quantity
    } else if (adjustmentType === 'subtract') {
      newStock = selectedProduct.stock - quantity
      if (newStock < 0) {
        toast.error('No puedes tener stock negativo')
        return
      }
    } else {
      newStock = quantity
    }

    try {
      // Actualizar stock del producto
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', selectedProduct.id)

      if (error) {
        console.error('Error actualizando stock:', error)
        toast.error('Error al actualizar stock')
        return
      }

      // Registrar en historial
      const changeType = adjustmentType === 'add' ? 'entrada' : 
                        adjustmentType === 'subtract' ? 'salida' : 
                        'ajuste'

      await supabase.from('stock_history').insert({
        product_id: selectedProduct.id,
        change_type: changeType,
        quantity: Math.abs(quantity),
        previous_stock: selectedProduct.stock,
        new_stock: newStock,
        notes: adjustmentNotes || undefined
      })

      toast.success('Stock actualizado correctamente')
      setSelectedProduct(null)
      setAdjustmentQuantity('')
      setAdjustmentNotes('')
      loadProducts()
      loadStockHistory()
    } catch (error) {
      console.error('Error general:', error)
      toast.error('Error al actualizar stock')
    }
  }

  const handleExportProducts = () => {
    if (products.length === 0) {
      toast.error('No hay productos para exportar')
      return
    }

    const headers = ['SKU', 'Nombre', 'Categoría', 'Stock Actual', 'Umbral Bajo', 'Precio', 'Precio Mayorista']
    
    // Función para escapar valores CSV (maneja comillas y comas)
    const escapeCSVValue = (value: any): string => {
      if (value === null || value === undefined) return ''
      const stringValue = String(value)
      // Si contiene comas, comillas o saltos de línea, envolver en comillas y escapar comillas internas
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }
    
    const csvData = products.map(p => ({
      'SKU': p.sku || `SKU-${p.id.substring(0, 8)}`,
      'Nombre': p.name || '',
      'Categoría': p.category || '',
      'Stock Actual': p.stock ?? 0,
      'Umbral Bajo': p.low_stock_threshold ?? 10,
      'Precio': p.price ?? 0,
      'Precio Mayorista': p.wholesale_price ?? p.price ?? 0
    }))

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => escapeCSVValue(row[header as keyof typeof row])).join(','))
    ].join('\n')

    // Agregar BOM para Excel (UTF-8)
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `inventario_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success(`${products.length} productos exportados correctamente`)
  }

  // Función para parsear CSV correctamente (maneja comas dentro de valores entre comillas y comillas escapadas)
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Comilla escapada dentro de comillas: ""
          current += '"'
          i++ // Saltar la siguiente comilla
        } else {
          // Comilla de inicio/fin
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    // Remover comillas externas si existen
    return result.map(v => {
      const trimmed = v.trim()
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        return trimmed.slice(1, -1).replace(/""/g, '"')
      }
      return trimmed
    })
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportProducts = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Mostrar loading
    const loadingToast = toast.loading('Procesando archivo CSV...')

    try {
      // Leer archivo como UTF-8 y manejar BOM si está presente
      let text = await file.text()
      
      // Remover BOM (Byte Order Mark) si está presente (UTF-8 BOM: \uFEFF)
      if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1)
      }
      
      // Normalizar saltos de línea (manejar Windows \r\n y Unix \n)
      text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
      
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        toast.dismiss(loadingToast)
        toast.error('El archivo CSV está vacío o no tiene datos')
        return
      }

      // Parsear headers
      const headers = parseCSVLine(lines[0]).map(h => h.trim())
      
      // Función para normalizar nombres de columnas (case-insensitive, sin espacios extra)
      const normalizeHeader = (header: string) => header.trim().toLowerCase().replace(/\s+/g, ' ')
      
      // Buscar columnas requeridas con variaciones comunes
      const findColumnIndex = (possibleNames: string[]): number => {
        for (const name of possibleNames) {
          const normalizedName = normalizeHeader(name)
          const index = headers.findIndex(h => normalizeHeader(h) === normalizedName)
          if (index >= 0) return index
        }
        return -1
      }
      
      // Buscar SKU con variaciones comunes (incluyendo inglés)
      let skuIndex = findColumnIndex(['SKU', 'sku', 'Sku', 'Código', 'Codigo', 'Código SKU', 'Codigo SKU'])
      
      // Si no hay SKU, usar ID como alternativa (para formatos de exportación completa)
      if (skuIndex < 0) {
        skuIndex = findColumnIndex(['id', 'ID', 'Id'])
        if (skuIndex >= 0) {
          console.log('⚠️ No se encontró columna SKU, usando ID como alternativa')
        }
      }
      
      // Buscar Nombre con variaciones comunes (incluyendo inglés)
      const nombreIndex = findColumnIndex(['Nombre', 'nombre', 'Nombre del Producto', 'Producto', 'producto', 'Name', 'name'])
      
      // Log para debugging
      console.log('📋 Headers encontrados en CSV:', headers)
      console.log('🔍 SKU encontrado en índice:', skuIndex, skuIndex >= 0 ? `(${headers[skuIndex]})` : 'NO ENCONTRADO')
      console.log('🔍 Nombre encontrado en índice:', nombreIndex, nombreIndex >= 0 ? `(${headers[nombreIndex]})` : 'NO ENCONTRADO')
      
      // Validar headers requeridos
      if (skuIndex < 0 || nombreIndex < 0) {
        toast.dismiss(loadingToast)
        const foundHeaders = headers.slice(0, 10).join(', ') + (headers.length > 10 ? '...' : '')
        toast.error(`El CSV debe contener las columnas: SKU (o id) y Nombre (o name). Columnas encontradas: ${foundHeaders}`)
        console.error('❌ Headers encontrados:', headers)
        console.error('❌ SKU index:', skuIndex, 'Nombre index:', nombreIndex)
        return
      }
      // Obtener índices de columnas opcionales (con variaciones en español e inglés)
      const categoriaIndex = findColumnIndex(['Categoría', 'Categoria', 'categoría', 'categoria', 'Category', 'category', 'category_id', 'Category ID'])
      const stockIndex = findColumnIndex(['Stock Actual', 'Stock', 'stock', 'Stock actual', 'Cantidad', 'cantidad', 'Stock Actual'])
      const umbralIndex = findColumnIndex(['Umbral Bajo', 'Umbral bajo', 'umbral bajo', 'Umbral', 'umbral', 'Stock Mínimo', 'Stock minimo', 'low_stock_threshold', 'Low Stock Threshold'])
      const precioIndex = findColumnIndex(['Precio', 'precio', 'Price', 'price', 'Precio Unitario', 'Precio unitario'])
      const precioMayoristaIndex = findColumnIndex(['Precio Mayorista', 'Precio mayorista', 'precio mayorista', 'Wholesale Price', 'Precio Mayoreo', 'wholesale_price'])

      let created = 0
      let updated = 0
      let errors = 0
      const errorMessages: string[] = []

      // Procesar cada línea
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue
        
        try {
          const values = parseCSVLine(lines[i])
          
          if (values.length < headers.length) {
            // Rellenar con valores vacíos si faltan columnas
            while (values.length < headers.length) {
              values.push('')
            }
          }

          const sku = values[skuIndex]?.trim() || ''
          const nombre = values[nombreIndex]?.trim() || ''
          
          // Determinar si estamos usando ID como SKU
          const usingIdAsSku = headers[skuIndex]?.toLowerCase() === 'id'

          // Validar campos mínimos
          if (!sku && !nombre) {
            errors++
            errorMessages.push(`Línea ${i + 1}: Falta SKU/ID y Nombre`)
            continue
          }

          // Preparar datos para actualizar/crear
          const updateData: any = {}
          
          if (nombre) updateData.name = nombre
          if (categoriaIndex >= 0 && values[categoriaIndex]) {
            const categoriaValue = values[categoriaIndex].trim()
            // Siempre usar category_id (la tabla no tiene columna 'category')
            if (headers[categoriaIndex]?.toLowerCase() === 'category_id') {
              // Si es un UUID válido, usarlo directamente
              updateData.category_id = categoriaValue || null
            } else {
              // Si es un nombre de categoría, necesitaríamos buscar el ID
              // Por ahora, solo usar category_id si está disponible
              // Si viene como nombre de categoría, lo ignoramos (no hay mapeo de nombre a ID)
              console.warn(`Categoría como nombre encontrada: ${categoriaValue}. Se requiere category_id (UUID) para importar.`)
            }
          }
          
          // Parsear números
          if (stockIndex >= 0 && values[stockIndex]) {
            const stock = parseInt(values[stockIndex])
            if (!isNaN(stock) && stock >= 0) {
              updateData.stock = stock
            }
          }
          
          if (umbralIndex >= 0 && values[umbralIndex]) {
            const umbral = parseInt(values[umbralIndex])
            if (!isNaN(umbral) && umbral >= 0) {
              updateData.low_stock_threshold = umbral
            }
          }
          
          if (precioIndex >= 0 && values[precioIndex]) {
            const precio = parseFloat(values[precioIndex].replace(',', '.'))
            if (!isNaN(precio) && precio >= 0) {
              updateData.price = precio
            }
          }
          
          if (precioMayoristaIndex >= 0 && values[precioMayoristaIndex]) {
            const precioMayorista = parseFloat(values[precioMayoristaIndex].replace(',', '.'))
            if (!isNaN(precioMayorista) && precioMayorista >= 0) {
              updateData.wholesale_price = precioMayorista
            }
          }

          // Buscar producto existente por SKU o ID
          let product = null
          if (sku) {
            if (usingIdAsSku) {
              // Si estamos usando ID, buscar directamente por ID
              const { data } = await supabase
                .from('products')
                .select('id, stock, name, sku')
                .eq('id', sku)
                .single()
              
              product = data
            } else {
              // Buscar por SKU normal
              const { data } = await supabase
                .from('products')
                .select('id, stock, name')
                .eq('sku', sku)
                .single()
              
              product = data
            }
          }

          if (product) {
            // Actualizar producto existente
            const previousStock = product.stock
            const newStock = updateData.stock !== undefined ? updateData.stock : previousStock

            // Limpiar updateData: eliminar 'category' si existe (solo usar category_id)
            const cleanUpdateData = { ...updateData }
            if ('category' in cleanUpdateData) {
              delete cleanUpdateData.category
            }

            const { error: updateError } = await supabase
              .from('products')
              .update(cleanUpdateData)
              .eq('id', product.id)

            if (updateError) {
              errors++
              errorMessages.push(`Línea ${i + 1}: Error actualizando ${nombre || sku} - ${updateError.message}`)
              continue
            }

            // Registrar cambio de stock en historial si cambió
            if (updateData.stock !== undefined && updateData.stock !== previousStock) {
              await supabase.from('stock_history').insert({
                product_id: product.id,
                change_type: 'importación',
                quantity: Math.abs(newStock - previousStock),
                previous_stock: previousStock,
                new_stock: newStock,
                notes: 'Actualización masiva desde CSV'
              })
            }

            updated++
          } else {
            // Crear nuevo producto
            if (!nombre) {
              errors++
              errorMessages.push(`Línea ${i + 1}: No se puede crear producto sin nombre`)
              continue
            }

            // Validar campos requeridos para crear
            if (!updateData.price) {
              errors++
              errorMessages.push(`Línea ${i + 1}: No se puede crear producto sin precio`)
              continue
            }

            const newProduct: any = {
              name: nombre,
              sku: sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              price: updateData.price || 0,
              wholesale_price: updateData.wholesale_price || updateData.price * 0.8,
              stock: updateData.stock || 0,
              low_stock_threshold: updateData.low_stock_threshold || 10,
              active: true,
              images: [],
              sizes: [],
              colors: []
            }
            
            // Solo agregar category_id si está disponible (no usar 'category')
            if (updateData.category_id) {
              newProduct.category_id = updateData.category_id
            }

            const { data: createdProduct, error: createError } = await supabase
              .from('products')
              .insert(newProduct)
              .select()
              .single()

            if (createError) {
              errors++
              errorMessages.push(`Línea ${i + 1}: Error creando ${nombre} - ${createError.message}`)
              continue
            }

            // Registrar stock inicial en historial
            if (createdProduct && newProduct.stock > 0) {
              await supabase.from('stock_history').insert({
                product_id: createdProduct.id,
                change_type: 'entrada',
                quantity: newProduct.stock,
                previous_stock: 0,
                new_stock: newProduct.stock,
                notes: 'Producto creado desde CSV'
              })
            }

            created++
          }
        } catch (lineError: any) {
          errors++
          errorMessages.push(`Línea ${i + 1}: ${lineError.message || 'Error desconocido'}`)
        }
      }

      // Mostrar resultados
      toast.dismiss(loadingToast)
      
      let message = `✅ ${created} productos creados, ${updated} productos actualizados`
      if (errors > 0) {
        message += `, ${errors} errores`
      }
      
      toast.success(message)
      
      if (errors > 0 && errorMessages.length > 0) {
        console.error('Errores de importación:', errorMessages)
        // Mostrar primeros 5 errores en consola
        toast.error(`Ver consola para detalles de ${errors} errores`)
      }

      // Recargar productos y historial
      loadProducts()
      loadStockHistory()
      
      // Limpiar input
      event.target.value = ''
    } catch (error: any) {
      toast.dismiss(loadingToast)
      console.error('Error importando:', error)
      toast.error(`Error al importar productos: ${error.message || 'Error desconocido'}`)
    }
  }

  const filteredProducts = products.filter(product => {
    // Filtro por búsqueda
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !product.sku?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Filtro por categoría
    if (categoryFilter !== 'todos' && product.category !== categoryFilter) {
      return false
    }

    // Filtro por stock
    if (stockFilter === 'bajo' && product.stock > product.low_stock_threshold) {
      return false
    }
    if (stockFilter === 'sin_stock' && product.stock > 0) {
      return false
    }

    return true
  })

  const quickCategories = useMemo(() => {
    const categories = products
      .map((product) => product.category?.trim())
      .filter((category): category is string => Boolean(category))

    const unique = Array.from(new Set(categories))

    return unique.sort((a, b) => a.localeCompare(b)).slice(0, 6)
  }, [products])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Inventario</h1>
              <p className="text-gray-600 mt-1">{filteredProducts.length} productos activos</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Admin
                </Button>
              </Link>
              <Link href="/admin/inventario/descontar">
                <Button variant="outline" className="border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50">
                  <MinusCircle className="w-4 h-4 mr-2" />
                  Registrar salida manual
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Button onClick={handleSignOut} variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Exportar/Importar CSV - Sección Separada - PRIMERO Y SIEMPRE VISIBLE */}
        <Card className="border-4 border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-lg">
          <CardHeader className="bg-blue-100 border-b-2 border-blue-300">
            <CardTitle className="flex items-center gap-2 text-blue-800 text-xl">
              <FileText className="w-6 h-6 text-blue-600" />
              📥 IMPORTAR BASE DE DATOS DE PRODUCTOS (CSV)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Button 
                onClick={handleExportProducts} 
                size="lg"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-lg py-8 font-bold shadow-md"
              >
                <Download className="w-6 h-6 mr-3" />
                EXPORTAR CSV
              </Button>
              <Button 
                onClick={handleImportClick}
                variant="default" 
                size="lg"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-lg py-8 font-bold shadow-md border-2 border-blue-800"
              >
                <Upload className="w-6 h-6 mr-3" />
                📥 IMPORTAR BASE DE DATOS CSV
              </Button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={handleImportProducts} 
              />
            </div>
            <div className="p-4 bg-white border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <strong className="text-blue-600">💡 Cómo usar:</strong> Exporta los productos a CSV, edita precios, nombres, stock, etc. en Excel, 
                y vuelve a importar el archivo. Los productos existentes se actualizarán por SKU, y los nuevos se crearán automáticamente.
              </p>
              <div className="mt-2 text-xs text-gray-600 space-y-1">
                <div>
                  <strong>Columnas requeridas:</strong> SKU, Nombre.
                </div>
                <div>
                  <strong>Opcionales:</strong> Categoría, Stock Actual, Umbral Bajo, Precio, Precio Mayorista.
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <strong className="text-orange-600">⚠️ Importante - Caracteres especiales (ñ, acentos):</strong>
                  <br />
                  Al guardar desde Excel, usa: <strong>Archivo → Guardar como → CSV UTF-8 (delimitado por comas) (*.csv)</strong>
                  <br />
                  O guarda como CSV normal y luego abre con un editor de texto y guárdalo como UTF-8.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {quickCategories.length > 0 && (
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-gray-700 mr-2">Filtros rápidos:</span>
                <Button
                  variant={categoryFilter === 'todos' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter('todos')}
                >
                  Todos
                </Button>
                {quickCategories.map((category) => (
                  <Button
                    key={category}
                    variant={categoryFilter === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter(category === categoryFilter ? 'todos' : category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alertas de Stock Bajo */}
        {lowStockProducts.length > 0 && (
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="w-5 h-5" />
                Alertas de Stock Bajo ({lowStockProducts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="bg-white p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.sku}</p>
                      </div>
                      <Badge className="bg-orange-500 text-white">
                        {product.stock} unidades
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      className="mt-3 w-full bg-orange-600 hover:bg-orange-700"
                      onClick={() => setSelectedProduct(product)}
                    >
                      Reponer Stock
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros de Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Categoría</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    {quickCategories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Stock</Label>
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="bajo">Stock Bajo</SelectItem>
                    <SelectItem value="sin_stock">Sin Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Productos */}
        <Card>
          <CardHeader>
            <CardTitle>Inventario de Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Producto</th>
                    <th className="text-left p-3">SKU</th>
                    <th className="text-left p-3">Categoría</th>
                    <th className="text-center p-3">Stock Actual</th>
                    <th className="text-center p-3">Umbral</th>
                    <th className="text-center p-3">Estado</th>
                    <th className="text-center p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{product.name}</td>
                      <td className="p-3 text-gray-600">{product.sku || '-'}</td>
                      <td className="p-3 text-gray-600">{product.category || '-'}</td>
                      <td className="p-3 text-center font-bold">
                        {product.stock}
                      </td>
                      <td className="p-3 text-center">{product.low_stock_threshold}</td>
                      <td className="p-3 text-center">
                        {product.stock === 0 ? (
                          <Badge className="bg-red-500 text-white">Sin Stock</Badge>
                        ) : product.stock <= product.low_stock_threshold ? (
                          <Badge className="bg-yellow-500 text-white">Stock Bajo</Badge>
                        ) : (
                          <Badge className="bg-green-500 text-white">Normal</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedProduct(product)}
                        >
                          Ajustar Stock
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Historial de Movimientos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Historial de Movimientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stockHistory.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {entry.change_type === 'entrada' && <TrendingUp className="w-5 h-5 text-green-600" />}
                    {entry.change_type === 'salida' && <TrendingDown className="w-5 h-5 text-red-600" />}
                    {entry.change_type === 'ajuste' && <RefreshCw className="w-5 h-5 text-blue-600" />}
                    {entry.change_type === 'importación' && <FileText className="w-5 h-5 text-purple-600" />}
                    <div>
                      <p className="font-medium">{entry.product_name}</p>
                      <p className="text-sm text-gray-600">{entry.notes || entry.change_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{entry.previous_stock} → {entry.new_stock}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(entry.created_at).toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Ajuste de Stock */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Ajustar Stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-gray-600">Stock actual: {selectedProduct.stock}</p>
              </div>

              <div>
                <Label>Tipo de Ajuste</Label>
                <Select value={adjustmentType} onValueChange={(value: 'add' | 'subtract' | 'set') => setAdjustmentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Agregar</SelectItem>
                    <SelectItem value="subtract">Restar</SelectItem>
                    <SelectItem value="set">Establecer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(e.target.value)}
                  placeholder="Ingresa la cantidad"
                />
              </div>

              <div>
                <Label>Notas (Opcional)</Label>
                <Input
                  value={adjustmentNotes}
                  onChange={(e) => setAdjustmentNotes(e.target.value)}
                  placeholder="Motivo del ajuste..."
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedProduct(null)}>
                  Cancelar
                </Button>
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={handleAdjustStock}>
                  Aplicar Ajuste
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

