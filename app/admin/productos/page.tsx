'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { supabase } from '@/lib/supabase/client-fixed'
import { 
  Edit, 
  Trash2, 
  Plus, 
  Search,
  Eye,
  EyeOff,
  Save,
  X,
  ArrowLeft,
  Home,
  LogOut
} from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  wholesale_price: number
  cost_price: number | null
  images: string[]
  category_id: string | null
  sizes: string[]
  colors: string[]
  stock: number
  low_stock_threshold: number
  active: boolean
  created_at: string
  updated_at: string
}

interface Category {
  id: string
  name: string
}

export default function AdminProductos() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showInactive, setShowInactive] = useState(false)

  useEffect(() => {
    loadData()
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

  const loadData = async () => {
    try {
      // Cargar productos
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (productsError) {
        console.error('Error cargando productos:', productsError)
        return
      }

      // Cargar categorías
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')

      if (categoriesError) {
        console.error('Error cargando categorías:', categoriesError)
      }

      setProducts(productsData || [])
      setCategories(categoriesData || [])
    } catch (error) {
      console.error('Error general:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesActive = showInactive || product.active
    return matchesSearch && matchesActive
  })

  const formatPrice = (price: number) => {
    if (price < 1000) {
      return (price * 1000).toLocaleString('es-AR')
    }
    return price.toLocaleString('es-AR')
  }

  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product })
  }

  const handleSave = async () => {
    if (!editingProduct) return

    try {
      const { error } = await supabase
        .from('products')
        .update(editingProduct)
        .eq('id', editingProduct.id)

      if (error) {
        console.error('Error actualizando producto:', error)
        return
      }

      // Actualizar la lista local
      setProducts(products.map(p => 
        p.id === editingProduct.id ? editingProduct : p
      ))
      setEditingProduct(null)
    } catch (error) {
      console.error('Error guardando:', error)
    }
  }

  const handleToggleActive = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ active: !product.active })
        .eq('id', product.id)

      if (error) {
        console.error('Error actualizando estado:', error)
        return
      }

      // Actualizar la lista local
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, active: !p.active } : p
      ))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`¿Estás seguro de eliminar "${product.name}"?`)) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)

      if (error) {
        console.error('Error eliminando producto:', error)
        return
      }

      // Actualizar la lista local
      setProducts(products.filter(p => p.id !== product.id))
    } catch (error) {
      console.error('Error eliminando:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Cargando productos...</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        <div className="relative container mx-auto px-4 py-12 sm:py-16">
          {/* Botones de navegación */}
          <div className="flex justify-between items-center mb-6">
            <Button 
              variant="ghost"
              onClick={() => router.push('/admin')}
              className="text-white hover:text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Admin
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="ghost"
                onClick={() => router.push('/')}
                className="text-white hover:text-white hover:bg-white/20"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button 
                variant="ghost"
                onClick={handleSignOut}
                className="text-white hover:text-white hover:bg-white/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 sm:mb-4 leading-tight text-white">
              Gestión de
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Productos
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6 max-w-2xl mx-auto text-white/90 font-light px-4">
              Administra tu catálogo mayorista completo
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 max-w-xl mx-auto mx-4">
              <p className="text-white font-semibold text-base sm:text-lg mb-2">
                📦 {products.length} productos totales
              </p>
              <p className="text-white/90 text-sm sm:text-base">
                Control total sobre precios mayoristas, stock y disponibilidad
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <Button 
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto"
                onClick={() => router.push('/admin/productos/nuevo')}
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Nuevo Producto
              </Button>
              <Button 
                className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-indigo-600 font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 w-full sm:w-auto"
                onClick={() => setShowInactive(!showInactive)}
              >
                {showInactive ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />}
                {showInactive ? 'Ocultar Inactivos' : 'Mostrar Inactivos'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 bg-white/80 backdrop-blur-sm border-white/20 rounded-xl shadow-lg text-sm sm:text-base h-10 sm:h-12"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Productos */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="space-y-4 sm:space-y-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${!product.active ? 'opacity-60' : ''}`}>
              <CardContent className="p-4 sm:p-6">
                {editingProduct?.id === product.id ? (
                  // Modo Edición
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-700">Nombre</label>
                      <Input
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          name: e.target.value
                        })}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-bold text-blue-800">Precio Mayorista</label>
                      <Input
                        type="number"
                        value={editingProduct.wholesale_price}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          wholesale_price: parseFloat(e.target.value)
                        })}
                        className="text-sm sm:text-base border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-700">Stock</label>
                      <Input
                        type="number"
                        value={editingProduct.stock}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          stock: parseInt(e.target.value)
                        })}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-0 sm:col-span-2 lg:col-span-3">
                      <Button 
                        size="sm" 
                        onClick={handleSave}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto"
                      >
                        <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Guardar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditingProduct(null)}
                        className="bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white hover:shadow-lg transition-all duration-300 px-3 sm:px-4 py-2 rounded-xl w-full sm:w-auto"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Modo Visualización
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                        <h3 className="text-base sm:text-lg font-semibold">{product.name}</h3>
                        <Badge variant={product.active ? 'default' : 'secondary'} className="w-fit">
                          {product.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                          <span className="font-bold text-blue-800">Precio Mayorista:</span>
                          <br /><span className="text-lg font-bold text-blue-900">${formatPrice(product.wholesale_price)}</span>
                        </div>
                        <div>
                          <span className="font-medium">Stock:</span>
                          <br />{product.stock} unidades
                        </div>
                        <div>
                          <span className="font-medium">Categoría:</span>
                          <br />{categories.find(c => c.id === product.category_id)?.name || 'Sin categoría'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Button 
                        size="sm" 
                        onClick={() => router.push(`/admin/productos/${product.id}`)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleToggleActive(product)}
                        className={`font-semibold px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto ${
                          product.active 
                            ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white' 
                            : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                        }`}
                      >
                        {product.active ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />}
                        {product.active ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleDelete(product)}
                        className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
