'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase/client'
import { Trash2, ArrowLeft, AlertTriangle, Loader2, Download } from 'lucide-react'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  parent_id: string | null
  parent?: Category
}

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  wholesale_price: number
  cost_price: number | null
  stock: number
  low_stock_threshold: number
  category_id: string | null
  sizes: string[]
  colors: string[]
  images: string[]
  active: boolean
  created_at: string
  updated_at: string
}

export default function EliminarMasivoPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('')
  const [deleteMode, setDeleteMode] = useState<'all' | 'category' | 'subcategory'>('all')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [productCount, setProductCount] = useState<number | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  // Cargar contador inicial si es modo "all"
  useEffect(() => {
    if (deleteMode === 'all') {
      loadProductCount('all', null)
    }
  }, [deleteMode])

  useEffect(() => {
    if (selectedCategory) {
      loadSubcategories(selectedCategory)
      loadProductCount('category', selectedCategory)
    } else {
      setSubcategories([])
      setSelectedSubcategory('')
      if (deleteMode === 'all') {
        loadProductCount('all', null)
      } else {
        setProductCount(null)
      }
    }
  }, [selectedCategory, deleteMode])

  useEffect(() => {
    if (selectedSubcategory) {
      loadProductCount('subcategory', selectedSubcategory)
    } else if (selectedCategory && deleteMode === 'category') {
      loadProductCount('category', selectedCategory)
    }
  }, [selectedSubcategory])

  const loadCategories = async () => {
    try {
      // Verificar autenticación primero
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Error obteniendo sesión:', sessionError)
      }
      
      if (!session) {
        console.error('No hay sesión activa')
        toast.error('No estás autenticado. Por favor inicia sesión.')
        router.push('/admin/login')
        return
      }

      console.log('🔍 Intentando cargar categorías...')
      console.log('Usuario autenticado:', session.user.email)
      console.log('User ID:', session.user.id)

      // Primero intentar cargar solo categorías activas (como lo hace la política RLS)
      // Intentar con parent_id primero, si falla, intentar sin parent_id
      let { data, error } = await supabase
        .from('categories')
        .select('id, name, active')
        .eq('active', true)
        .order('name')

      // Si hay error por columna inexistente, intentar sin parent_id
      if (error && (error.code === '42703' || error.message?.includes('parent_id'))) {
        console.log('⚠️ parent_id no existe, cargando sin esa columna...')
        const result = await supabase
          .from('categories')
          .select('id, name, active')
          .eq('active', true)
          .order('name')
        
        data = result.data
        error = result.error
      }

      // Si no hay resultados con active=true, intentar sin filtro
      if ((!data || data.length === 0) && !error) {
        console.log('⚠️ No hay categorías activas, intentando cargar todas...')
        const result = await supabase
          .from('categories')
          .select('id, name, active')
          .order('name')
        
        data = result.data
        error = result.error
      }

      if (error) {
        // Intentar serializar el error de diferentes formas
        const errorInfo = {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          toString: String(error),
          json: JSON.stringify(error, Object.getOwnPropertyNames(error))
        }
        
        console.error('❌ Error de Supabase:', errorInfo)
        
        // Si el error está vacío, podría ser RLS
        if (!error.message && !error.code) {
          console.error('⚠️ Error vacío - posible problema de RLS')
          toast.error('Error de permisos. Verifica que tengas acceso de administrador y que existan categorías en la base de datos.')
        } else {
          const errorMessage = error.message || error.code || 'Error desconocido'
          toast.error(`Error al cargar categorías: ${errorMessage}`)
        }
        
        setCategories([])
        return
      }

      console.log('📊 Respuesta de Supabase:', { 
        dataLength: data?.length, 
        hasError: !!error,
        firstCategory: data?.[0] 
      })

      if (!data || data.length === 0) {
        console.warn('⚠️ No hay categorías en la base de datos')
        toast.warning('No hay categorías disponibles. Crea categorías primero desde el panel de administración.')
        setCategories([])
        return
      }

      console.log(`✅ Recibidas ${data.length} categorías totales`)
      console.log('Primeras 3 categorías:', data.slice(0, 3).map(c => ({ name: c.name, active: c.active })))

      // Si no existe parent_id en los datos, todas las categorías son principales
      // Si existe parent_id, filtrar solo las principales (sin parent_id)
      const hasParentId = data.some(cat => 'parent_id' in cat && cat.parent_id !== undefined)
      
      const mainCategories = hasParentId
        ? data
            .filter(cat => !cat.parent_id || cat.parent_id === null)
            .map(cat => ({ 
              id: cat.id, 
              name: cat.name, 
              parent_id: cat.parent_id || null 
            }))
        : data.map(cat => ({ 
            id: cat.id, 
            name: cat.name, 
            parent_id: null 
          }))
      
      console.log(`✅ ${mainCategories.length} categorías principales encontradas`)
      console.log('Categorías principales:', mainCategories.map(c => c.name))
      
      setCategories(mainCategories)
    } catch (error: any) {
      console.error('❌ Error inesperado cargando categorías:', error)
      console.error('Tipo:', typeof error)
      console.error('Stack:', error?.stack)
      console.error('String:', String(error))
      console.error('JSON:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
      
      const errorMsg = error?.message || error?.toString() || 'Error desconocido'
      toast.error('Error al cargar categorías: ' + errorMsg)
      setCategories([])
    }
  }

  const loadSubcategories = async (categoryId: string) => {
    try {
      console.log('🔍 Cargando subcategorías para categoría:', categoryId)
      
      // Intentar cargar subcategorías, si parent_id no existe, retornar array vacío
      let { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('parent_id', categoryId)
        .order('name')

      // Si hay error por columna inexistente, no hay subcategorías
      if (error && (error.code === '42703' || error.message?.includes('parent_id'))) {
        console.log('⚠️ parent_id no existe, no hay subcategorías disponibles')
        setSubcategories([])
        return
      }

      if (error) {
        console.error('❌ Error cargando subcategorías:', error)
        console.error('Código:', error.code)
        console.error('Mensaje:', error.message)
        // No mostrar error si es porque parent_id no existe
        if (!(error.code === '42703' || error.message?.includes('parent_id'))) {
          toast.error('Error al cargar subcategorías: ' + (error.message || 'Error desconocido'))
        }
        setSubcategories([])
        return
      }

      console.log(`✅ ${data?.length || 0} subcategorías encontradas`)
      setSubcategories((data || []).map(cat => ({ 
        id: cat.id, 
        name: cat.name, 
        parent_id: categoryId 
      })))
    } catch (error: any) {
      console.error('❌ Error inesperado cargando subcategorías:', error)
      toast.error('Error al cargar subcategorías: ' + (error?.message || 'Error desconocido'))
      setSubcategories([])
    }
  }

  const loadProductCount = async (mode: 'all' | 'category' | 'subcategory', id: string | null) => {
    setLoading(true)
    try {
      let query = supabase
        .from('products')
        .select('id', { count: 'exact', head: true })

      if (mode === 'category' && id) {
        query = query.eq('category_id', id)
      } else if (mode === 'subcategory' && id) {
        query = query.eq('category_id', id)
      }

      const { count, error } = await query

      if (error) throw error
      setProductCount(count || 0)
    } catch (error: any) {
      console.error('Error contando productos:', error)
      toast.error('Error al contar productos')
      setProductCount(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    // Verificar autenticación primero
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Error obteniendo sesión:', sessionError)
      toast.error('Error de autenticación. Por favor inicia sesión nuevamente.')
      router.push('/admin/login')
      return
    }
    
    if (!session) {
      toast.error('No estás autenticado. Por favor inicia sesión.')
      router.push('/admin/login')
      return
    }

    // Verificar que el usuario sea admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (profileError) {
      console.error('Error verificando perfil:', profileError)
      toast.error('Error verificando permisos de administrador.')
      return
    }

    if (!profile?.is_admin) {
      toast.error('No tienes permisos de administrador para realizar esta acción.')
      return
    }

    let confirmMessage = ''
    let count = productCount || 0

    if (deleteMode === 'all') {
      confirmMessage = `¿Estás SEGURO de eliminar TODOS los productos (${count} productos)? Esta acción NO se puede deshacer.`
    } else if (deleteMode === 'category') {
      const categoryName = categories.find(c => c.id === selectedCategory)?.name || 'la categoría seleccionada'
      confirmMessage = `¿Estás SEGURO de eliminar todos los productos de "${categoryName}" (${count} productos)? Esta acción NO se puede deshacer.`
    } else if (deleteMode === 'subcategory') {
      const subcategoryName = subcategories.find(c => c.id === selectedSubcategory)?.name || 'la subcategoría seleccionada'
      confirmMessage = `¿Estás SEGURO de eliminar todos los productos de "${subcategoryName}" (${count} productos)? Esta acción NO se puede deshacer.`
    }

    if (!confirm(confirmMessage)) return

    // Doble confirmación para eliminación masiva
    if (deleteMode === 'all' || count > 50) {
      const doubleConfirm = prompt('Escribe "ELIMINAR" para confirmar la eliminación masiva:')
      if (doubleConfirm !== 'ELIMINAR') {
        toast.info('Eliminación cancelada')
        return
      }
    }

    setDeleting(true)
    const loadingToast = toast.loading(`Eliminando ${count} productos...`)

    try {
      console.log('🔍 Iniciando eliminación masiva...')
      console.log('Modo:', deleteMode)
      console.log('Categoría seleccionada:', selectedCategory)
      console.log('Subcategoría seleccionada:', selectedSubcategory)
      console.log('Usuario:', session.user.email)
      console.log('Es admin:', profile.is_admin)

      let query = supabase
        .from('products')
        .delete()

      if (deleteMode === 'category' && selectedCategory) {
        query = query.eq('category_id', selectedCategory)
        console.log('Filtrando por category_id:', selectedCategory)
      } else if (deleteMode === 'subcategory' && selectedSubcategory) {
        query = query.eq('category_id', selectedSubcategory)
        console.log('Filtrando por category_id (subcategoría):', selectedSubcategory)
      }

      console.log('Ejecutando consulta de eliminación...')
      
      let deletedCount = count
      
      // Intentar eliminación directa primero
      let { error } = await query

      // Si falla, intentar eliminar en lotes de 100
      if (error && (error.code === 'PGRST116' || error.message?.includes('0 rows') || error.code === '42501')) {
        console.log('⚠️ Eliminación directa falló, intentando en lotes...')
        
        // Obtener IDs de productos a eliminar
        let selectQuery = supabase
          .from('products')
          .select('id')

        if (deleteMode === 'category' && selectedCategory) {
          selectQuery = selectQuery.eq('category_id', selectedCategory)
        } else if (deleteMode === 'subcategory' && selectedSubcategory) {
          selectQuery = selectQuery.eq('category_id', selectedSubcategory)
        }

        const { data: productsToDelete, error: selectError } = await selectQuery

        if (selectError) {
          console.error('Error obteniendo productos:', selectError)
          throw selectError
        }

        if (!productsToDelete || productsToDelete.length === 0) {
          throw new Error('No se encontraron productos para eliminar')
        }

        // Eliminar en lotes de 100
        const batchSize = 100
        let deleted = 0
        const totalProducts = productsToDelete.length

        for (let i = 0; i < productsToDelete.length; i += batchSize) {
          const batch = productsToDelete.slice(i, i + batchSize)
          const batchIds = batch.map(p => p.id)

          const { error: batchError } = await supabase
            .from('products')
            .delete()
            .in('id', batchIds)

          if (batchError) {
            console.error(`Error eliminando lote ${Math.floor(i / batchSize) + 1}:`, batchError)
            throw batchError
          }

          deleted += batch.length
          toast.loading(`Eliminando productos... ${deleted}/${totalProducts}`, { id: loadingToast })
        }

        deletedCount = deleted
        console.log(`✅ Eliminación completada en lotes: ${deletedCount} productos eliminados`)
      } else if (error) {
        console.error('❌ Error de Supabase:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        throw error
      } else {
        console.log('✅ Eliminación completada')
        console.log('Productos eliminados:', deletedCount)
      }

      toast.dismiss(loadingToast)
      toast.success(`Se eliminaron ${deletedCount} productos exitosamente`)
      
      // Esperar un momento antes de redirigir
      setTimeout(() => {
        router.push('/admin/productos')
      }, 1500)
    } catch (error: any) {
      console.error('❌ Error eliminando productos:', error)
      
      let errorMessage = 'Error desconocido'
      
      if (error.message) {
        errorMessage = error.message
      } else if (error.code) {
        errorMessage = `Error ${error.code}: ${error.message || 'Error de base de datos'}`
      }

      // Mensajes más específicos según el tipo de error
      if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
        errorMessage = 'Error de permisos. Verifica que tengas permisos de administrador y que las políticas RLS estén configuradas correctamente.'
      } else if (error.code === 'PGRST116' || error.message?.includes('0 rows')) {
        errorMessage = 'No se encontraron productos para eliminar con los criterios seleccionados.'
      }

      toast.dismiss(loadingToast)
      toast.error(`Error al eliminar productos: ${errorMessage}`)
      
      console.error('Detalles completos del error:', {
        error,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
    } finally {
      setDeleting(false)
    }
  }

  const convertProductsToCsv = (items: Product[]) => {
    const headers: (keyof Product | 'sizes' | 'colors' | 'images')[] = [
      'id',
      'name',
      'description',
      'price',
      'wholesale_price',
      'cost_price',
      'stock',
      'low_stock_threshold',
      'category_id',
      'sizes',
      'colors',
      'images',
      'active',
      'created_at',
      'updated_at'
    ]

    const escapeValue = (value: unknown) => {
      if (value === null || value === undefined) return ''
      let stringValue: string

      if (Array.isArray(value)) {
        stringValue = value.join(' | ')
      } else if (typeof value === 'object') {
        stringValue = JSON.stringify(value)
      } else {
        stringValue = String(value)
      }

      const escaped = stringValue.replace(/"/g, '""')
      return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped
    }

    const rows = items.map((item) =>
      headers
        .map((header) => {
          const value =
            header === 'sizes' || header === 'colors' || header === 'images'
              ? (item as any)[header]
              : item[header as keyof Product]
          return escapeValue(value)
        })
        .join(',')
    )

    return [headers.join(','), ...rows].join('\r\n')
  }

  const handleBackup = async () => {
    if (deleteMode === 'category' && !selectedCategory) {
      toast.warning('Seleccioná una categoría para generar el respaldo.')
      return
    }

    if (deleteMode === 'subcategory' && (!selectedCategory || !selectedSubcategory)) {
      toast.warning('Seleccioná una categoría y subcategoría para generar el respaldo.')
      return
    }

    setExporting(true)

    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('name')

      if (deleteMode === 'category' && selectedCategory) {
        query = query.eq('category_id', selectedCategory)
      } else if (deleteMode === 'subcategory' && selectedSubcategory) {
        query = query.eq('category_id', selectedSubcategory)
      }

      const { data, error } = await query

      if (error) throw error

      if (!data || data.length === 0) {
        toast.info('No hay productos para exportar con los filtros seleccionados.')
        return
      }

      const csvContent = convertProductsToCsv(data as Product[])
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const scope =
        deleteMode === 'all' ? 'todos' : deleteMode === 'category' ? 'categoria' : 'subcategoria'

      link.href = url
      link.setAttribute('download', `backup-productos-${scope}-${timestamp}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Se descargó el respaldo de ${data.length} productos.`)
    } catch (error: any) {
      console.error('Error generando respaldo:', error)
      toast.error('Error al generar el respaldo. Intenta nuevamente.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/productos')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Productos
          </Button>
        </div>

        <Card className="border-red-200 shadow-lg">
          <CardHeader className="bg-red-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <Trash2 className="w-6 h-6" />
              <div>
                <CardTitle>Eliminación Masiva de Productos</CardTitle>
                <CardDescription className="text-red-100">
                  Elimina productos por categoría, subcategoría o todos los productos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <Alert className="border-red-300 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>⚠️ ADVERTENCIA:</strong> Esta acción es IRREVERSIBLE. Los productos eliminados no se pueden recuperar.
              </AlertDescription>
            </Alert>

            {/* Selección de modo de eliminación */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Seleccionar Modo de Eliminación</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id="delete-all"
                    checked={deleteMode === 'all'}
                    onCheckedChange={() => {
                      setDeleteMode('all')
                      setSelectedCategory('')
                      setSelectedSubcategory('')
                      loadProductCount('all', null)
                    }}
                  />
                  <label htmlFor="delete-all" className="flex-1 cursor-pointer">
                    <div className="font-semibold">Eliminar TODOS los productos</div>
                    <div className="text-sm text-gray-600">Elimina todos los productos sin excepción</div>
                  </label>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id="delete-category"
                    checked={deleteMode === 'category'}
                    onCheckedChange={() => {
                      setDeleteMode('category')
                      setSelectedSubcategory('')
                    }}
                  />
                  <label htmlFor="delete-category" className="flex-1 cursor-pointer">
                    <div className="font-semibold">Eliminar por Categoría</div>
                    <div className="text-sm text-gray-600">Elimina todos los productos de una categoría específica</div>
                  </label>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id="delete-subcategory"
                    checked={deleteMode === 'subcategory'}
                    onCheckedChange={() => {
                      setDeleteMode('subcategory')
                    }}
                  />
                  <label htmlFor="delete-subcategory" className="flex-1 cursor-pointer">
                    <div className="font-semibold">Eliminar por Subcategoría</div>
                    <div className="text-sm text-gray-600">Elimina todos los productos de una subcategoría específica</div>
                  </label>
                </div>
              </div>
            </div>

            {/* Selector de categoría */}
            {deleteMode === 'category' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium">Seleccionar Categoría</label>
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                  {categories.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No hay categorías disponibles</p>
                  ) : (
                    categories.map(category => (
                      <div key={category.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategory === category.id}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategory(category.id)
                            } else {
                              setSelectedCategory('')
                            }
                          }}
                        />
                        <label 
                          htmlFor={`category-${category.id}`} 
                          className="flex-1 cursor-pointer text-sm font-medium"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Selector de subcategoría */}
            {deleteMode === 'subcategory' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="block text-sm font-medium">Seleccionar Categoría</label>
                  <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                    {categories.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No hay categorías disponibles</p>
                    ) : (
                      categories.map(category => (
                        <div key={category.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                          <Checkbox
                            id={`subcat-category-${category.id}`}
                            checked={selectedCategory === category.id}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCategory(category.id)
                                setSelectedSubcategory('')
                              } else {
                                setSelectedCategory('')
                                setSelectedSubcategory('')
                              }
                            }}
                          />
                          <label 
                            htmlFor={`subcat-category-${category.id}`} 
                            className="flex-1 cursor-pointer text-sm font-medium"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {selectedCategory && subcategories.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium">Seleccionar Subcategoría</label>
                    <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                      {subcategories.map(subcategory => (
                        <div key={subcategory.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                          <Checkbox
                            id={`subcategory-${subcategory.id}`}
                            checked={selectedSubcategory === subcategory.id}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedSubcategory(subcategory.id)
                              } else {
                                setSelectedSubcategory('')
                              }
                            }}
                          />
                          <label 
                            htmlFor={`subcategory-${subcategory.id}`} 
                            className="flex-1 cursor-pointer text-sm font-medium"
                          >
                            {subcategory.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCategory && subcategories.length === 0 && (
                  <Alert>
                    <AlertDescription>
                      Esta categoría no tiene subcategorías. Usa el modo "Eliminar por Categoría" en su lugar.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Contador de productos */}
            {productCount !== null && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-yellow-800">
                    Productos que se eliminarán:
                  </span>
                  <span className="text-2xl font-bold text-red-600">
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      productCount
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Botón de eliminación */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => router.push('/admin/productos')}
                className="w-full sm:flex-1"
                disabled={deleting || exporting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleBackup}
                disabled={
                  exporting ||
                  deleting ||
                  loading ||
                  (deleteMode === 'category' && !selectedCategory) ||
                  (deleteMode === 'subcategory' && (!selectedCategory || !selectedSubcategory))
                }
                className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando respaldo...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Descargar respaldo CSV
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={
                  deleting ||
                  loading ||
                  (deleteMode === 'category' && !selectedCategory) ||
                  (deleteMode === 'subcategory' && (!selectedCategory || !selectedSubcategory)) ||
                  (productCount !== null && productCount === 0)
                }
                className="flex-1"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar Productos
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

