'use client'

import { useState, useEffect } from 'react'
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
  FileText
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
        console.error('Error cargando historial:', error)
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
      console.error('Error general:', error)
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
      ...csvData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `inventario_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Productos exportados correctamente')
  }

  const handleImportProducts = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))

      // Validar headers
      const requiredHeaders = ['SKU', 'Nombre', 'Stock Actual']
      const hasRequired = requiredHeaders.every(h => headers.includes(h))
      
      if (!hasRequired) {
        toast.error('El CSV debe contener las columnas: SKU, Nombre, Stock Actual')
        return
      }

      let updated = 0
      let errors = 0

      // Procesar cada línea
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue
        
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
        const skuIndex = headers.indexOf('SKU')
        const stockIndex = headers.indexOf('Stock Actual')

        if (skuIndex === -1 || stockIndex === -1) continue

        const sku = values[skuIndex]
        const newStock = parseInt(values[stockIndex])

        if (isNaN(newStock)) {
          errors++
          continue
        }

        // Buscar producto por SKU
        const { data: product } = await supabase
          .from('products')
          .select('id, stock')
          .eq('sku', sku)
          .single()

        if (!product) {
          errors++
          continue
        }

        // Actualizar stock
        const { error } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', product.id)

        if (error) {
          errors++
          continue
        }

        // Registrar en historial
        await supabase.from('stock_history').insert({
          product_id: product.id,
          change_type: 'importación',
          quantity: Math.abs(newStock - product.stock),
          previous_stock: product.stock,
          new_stock: newStock,
          notes: 'Actualización masiva desde CSV'
        })

        updated++
      }

      toast.success(`${updated} productos actualizados. ${errors} errores`)
      loadProducts()
      loadStockHistory()
    } catch (error) {
      console.error('Error importando:', error)
      toast.error('Error al importar productos')
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Buscar producto</Label>
                <Input
                  placeholder="Nombre o SKU"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label>Categoría</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    {[...new Set(products.map(p => p.category).filter(Boolean))].map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
              <div className="flex items-end gap-2">
                <Button onClick={handleExportProducts} className="flex-1 bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
                <Button variant="outline" asChild>
                  <label>
                    <Upload className="w-4 h-4 mr-2" />
                    Importar CSV
                    <input type="file" accept=".csv" className="hidden" onChange={handleImportProducts} />
                  </label>
                </Button>
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

