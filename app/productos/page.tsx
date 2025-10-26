'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { ProductFilters } from '@/components/productos/ProductFilters'
import { SearchSort } from '@/components/productos/SearchSort'
import { ProductCard } from '@/components/productos/ProductCard'
import { Spotlight } from '@/components/ui/spotlight'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { Filter } from 'lucide-react'
import { Database } from '@/lib/types/database'

type Product = Database['public']['Tables']['products']['Row']
type CategorySimple = { id: string; name: string }

export default function ProductosPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<CategorySimple[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    colors: [] as string[],
    sizes: [] as string[],
    priceMin: '',
    priceMax: '',
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      console.log('🔍 Cargando datos...')
      
      // Cargar productos
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id, name, description, price, wholesale_price, cost_price, 
          stock, low_stock_threshold, category_id, sizes, colors, 
          active, images, created_at, updated_at
        `)
        .eq('active', true)

      if (productsError) {
        console.error('Error productos:', productsError)
        setError('Error: ' + productsError.message)
        return
      }

      // Cargar categorías
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('active', true)
        .order('name')

      if (categoriesError) {
        console.error('Error categorías:', categoriesError)
      }

      console.log('✅ Productos cargados:', productsData?.length || 0)
      setAllProducts(productsData || [])
      setFilteredProducts(productsData || [])
      setCategories(categoriesData || [])
      
    } catch (err) {
      console.error('Error general:', err)
      setError('Error: ' + (err instanceof Error ? err.message : 'Error desconocido'))
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    applyFilters(newFilters)
  }

  const applyFilters = (currentFilters: any) => {
    let filtered = [...allProducts]

    // Filtro por búsqueda
    if (currentFilters.search) {
      const searchTerm = currentFilters.search.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.id.toLowerCase().includes(searchTerm)
      )
    }

    // Filtro por categoría
    if (currentFilters.category) {
      filtered = filtered.filter(product => product.category_id === currentFilters.category)
    }

    // Filtro por colores
    if (currentFilters.colors.length > 0) {
      filtered = filtered.filter(product =>
        product.colors && product.colors.some((color: string) => currentFilters.colors.includes(color))
      )
    }

    // Filtro por tallas
    if (currentFilters.sizes.length > 0) {
      filtered = filtered.filter(product =>
        product.sizes && product.sizes.some((size: string) => currentFilters.sizes.includes(size))
      )
    }

    // Filtro por precio
    if (currentFilters.priceMin) {
      filtered = filtered.filter(product => product.price >= parseFloat(currentFilters.priceMin))
    }
    if (currentFilters.priceMax) {
      filtered = filtered.filter(product => product.price <= parseFloat(currentFilters.priceMax))
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (currentFilters.sortBy) {
        case 'price':
          aValue = a.price
          bValue = b.price
          break
        case 'stock':
          aValue = a.stock
          bValue = b.stock
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (currentFilters.sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1
      } else {
        return aValue > bValue ? 1 : -1
      }
    })

    setFilteredProducts(filtered)
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Error al cargar productos</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button 
              onClick={loadData} 
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <BackgroundBeams className="opacity-30" />
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        <div className="relative container mx-auto px-4 py-12 sm:py-16 md:py-20 text-center">
          <div className="animate-fadeInUp">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 sm:mb-4 leading-tight text-white">
              <TextGenerateEffect 
                words="Catálogo Mayorista" 
                className="text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-200 to-purple-200"
                duration={0.1}
              />
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6 max-w-2xl mx-auto text-white/90 font-light px-4">
              Ropa infantil de calidad premium - Compra mínima 5 unidades
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 max-w-xl mx-auto hover:bg-white/20 transition-all duration-300 mx-4">
              <p className="text-white font-semibold text-base sm:text-lg mb-2">
                🛍️ {filteredProducts.length} de {allProducts.length} productos disponibles
              </p>
              <p className="text-white/90 text-sm sm:text-base">
                Precios mayoristas - Compra mínima 5 unidades por producto
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-gray-800">Filtros y Búsqueda</h2>
            <p className="text-sm sm:text-base text-gray-600">
              Encuentra exactamente lo que buscas
            </p>
          </div>
          
          {/* Búsqueda y Ordenamiento */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
            <SearchSort
              searchTerm={filters.search}
              onSearchChange={(value) => handleFilterChange('search', value)}
              sortBy={filters.sortBy}
              onSortChange={(value) => handleFilterChange('sortBy', value)}
              sortOrder={filters.sortOrder}
              onSortOrderChange={(value) => handleFilterChange('sortOrder', value)}
            />
            
            {/* Botón de filtros móvil */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white hover:shadow-lg transition-all duration-300 w-full sm:w-auto"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>


        {/* Contenido principal */}
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Filtros - Desktop */}
          <div className="hidden lg:block lg:w-80 flex-shrink-0">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
            <ProductFilters
              products={allProducts}
              onFilterChange={applyFilters}
              categories={categories}
            />
            </div>
          </div>

          {/* Filtros - Mobile */}
          {showFilters && (
            <div className="lg:hidden">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
              <ProductFilters
                products={allProducts}
                onFilterChange={applyFilters}
                categories={categories}
              />
              </div>
            </div>
          )}

          {/* Productos */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-white/20 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                  No se encontraron productos
                </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                  {allProducts.length === 0 
                    ? 'No hay productos disponibles en este momento' 
                    : 'Intenta ajustar los filtros de búsqueda'
                  }
                </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
