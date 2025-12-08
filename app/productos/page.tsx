'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { ProductFilters } from '@/components/productos/ProductFilters'
import { SearchSort } from '@/components/productos/SearchSort'
import { ProductCard } from '@/components/productos/ProductCard'
import { ProductsGridSkeleton } from '@/components/productos/ProductCardSkeleton'
import { Filter } from 'lucide-react'
import dynamic from 'next/dynamic'

// Lazy load de componentes pesados
const Spotlight = dynamic(() => import('@/components/ui/spotlight').then(mod => ({ default: mod.Spotlight })), { ssr: false })
const TextGenerateEffect = dynamic(() => import('@/components/ui/text-generate-effect').then(mod => ({ default: mod.TextGenerateEffect })), { ssr: false })
const BackgroundBeams = dynamic(() => import('@/components/ui/background-beams').then(mod => ({ default: mod.BackgroundBeams })), { ssr: false })
import { Database } from '@/lib/types/database'

type ProductRow = Database['public']['Tables']['products']['Row']
type ProductVariantRow = Database['public']['Tables']['product_variants']['Row']
type ProductWithVariants = ProductRow & { product_variants?: ProductVariantRow[] }
type CategorySimple = { 
  id: string
  name: string
  group_type?: string | null
  age_range?: string | null
  display_order?: number
}

export default function ProductosPage() {
  const [allProducts, setAllProducts] = useState<ProductWithVariants[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductWithVariants[]>([])
  const [categories, setCategories] = useState<CategorySimple[]>([])
  const [allAvailableColors, setAllAvailableColors] = useState<string[]>([])
  const [allAvailableSizes, setAllAvailableSizes] = useState<string[]>([])
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
      
      // Cargar todos los productos activos (solo campos necesarios)
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id, name, description, price, wholesale_price, 
          stock, category_id, sizes, colors, 
          active, images
        `)
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (productsError) {
        console.error('Error productos:', productsError)
        setError('Error: ' + productsError.message)
        return
      }

      let variantsByProduct = new Map<string, ProductVariantRow[]>()

      if (productsData && productsData.length > 0) {
        const productIds = productsData.map((product) => product.id)

        const { data: variantsData, error: variantsError } = await supabase
          .from('product_variants')
          .select('id, product_id, size, color, stock, active')
          .in('product_id', productIds)

        if (variantsError) {
          console.debug('Variantes no disponibles, se continúa con stock general.', variantsError)
        }

        variantsByProduct = (variantsData || []).reduce((map, variant) => {
          const key = variant.product_id
          const existing = map.get(key) || []
          existing.push(variant)
          map.set(key, existing)
          return map
        }, new Map<string, ProductVariantRow[]>())
      }

      // Cargar categorías activas con todos los campos necesarios para filtros
      let categoriesData = null
      let categoriesError = null
      
      console.log('🔍 Iniciando carga de categorías...')
      
      // Intentar cargar categorías activas primero
      // Primero intentar con todas las columnas, luego con solo las básicas si falla
      let selectColumns = 'id, name, group_type, age_range, display_order'
      const { data: activeCategories, error: activeError } = await supabase
        .from('categories')
        .select(selectColumns)
        .eq('active', true)
        .order('name')

      console.log('📡 Respuesta de Supabase - activeCategories:', activeCategories)
      console.log('📡 Respuesta de Supabase - activeError:', activeError)

      if (activeError) {
        console.error('❌ Error cargando categorías activas:', activeError)
        console.error('Código:', activeError.code)
        console.error('Mensaje:', activeError.message)
        
        // Si el error es por columna no encontrada, intentar solo con columnas básicas
        if (activeError.message?.includes('does not exist') || activeError.code === '42703') {
          console.log('🔄 Error de columna faltante, intentando solo con columnas básicas...')
          const { data: basicCategories, error: basicError } = await supabase
            .from('categories')
            .select('id, name')
            .eq('active', true)
            .order('name')
          
          if (!basicError && basicCategories) {
            console.log('✅ Categorías cargadas con columnas básicas:', basicCategories.length)
            // Agregar valores por defecto para las columnas faltantes
            categoriesData = basicCategories.map(cat => ({
              ...cat,
              group_type: null,
              age_range: null,
              display_order: 0
            }))
          } else {
            console.error('❌ Error incluso con columnas básicas:', basicError)
            categoriesError = basicError || activeError
          }
        } else {
          categoriesError = activeError
          
          // Intentar cargar todas las categorías como fallback (sin filtro active)
          console.log('🔄 Intentando cargar todas las categorías (sin filtro active)...')
          const { data: allCategories, error: allError } = await supabase
            .from('categories')
            .select('id, name')
            .order('name')
          
          if (!allError && allCategories) {
            console.warn('⚠️ Cargadas todas las categorías (incluyendo inactivas):', allCategories.length)
            categoriesData = allCategories.map(cat => ({
              ...cat,
              group_type: null,
              age_range: null,
              display_order: 0
            }))
          } else {
            console.error('❌ Error cargando todas las categorías:', allError)
            categoriesError = allError || categoriesError
          }
        }
      } else {
        categoriesData = activeCategories
        console.log('✅ Categorías activas cargadas:', categoriesData?.length || 0)
        if (categoriesData && categoriesData.length > 0) {
          console.log('📋 Primeras 5 categorías:', categoriesData.slice(0, 5).map(c => ({ name: c.name, id: c.id, group_type: c.group_type })))
        } else {
          console.warn('⚠️ No se encontraron categorías activas')
          console.warn('⚠️ activeCategories es:', activeCategories)
          
          // Intentar cargar sin filtro active como último recurso
          console.log('🔄 Intentando cargar sin filtro active...')
          const { data: allCategoriesNoFilter, error: noFilterError } = await supabase
            .from('categories')
            .select('id, name, group_type, age_range, display_order')
            .order('name')
          
          if (!noFilterError && allCategoriesNoFilter && allCategoriesNoFilter.length > 0) {
            console.warn('⚠️ Se encontraron categorías sin filtro active:', allCategoriesNoFilter.length)
            categoriesData = allCategoriesNoFilter.filter(c => c.active !== false) // Filtrar manualmente
          }
        }
      }

      console.log('✅ Productos cargados:', productsData?.length || 0)
      const productsWithVariants = (productsData || []).map((product) => ({
        ...product,
        product_variants: variantsByProduct.get(product.id) || [],
      })) as ProductWithVariants[]

      console.log(`📦 Productos cargados: ${productsWithVariants.length}`)

      setAllProducts(productsWithVariants)
      setFilteredProducts(productsWithVariants)
      
      // Asegurar que categoriesData sea un array válido
      const validCategories = (categoriesData || []).filter(cat => 
        cat && cat.id && cat.name
      )
      setCategories(validCategories)
      
      // Log detallado para depuración
      if (validCategories.length === 0) {
        console.warn('⚠️ No se cargaron categorías válidas')
        console.warn('📋 categoriesData recibido:', categoriesData)
        console.warn('📋 categoriesError:', categoriesError)
      } else {
        console.log('✅ Categorías válidas establecidas:', validCategories.length)
      }
      
      // Cargar colores desde custom_colors
      console.log('🎨 Cargando colores desde custom_colors...')
      const { data: customColorsData, error: colorsError } = await supabase
        .from('custom_colors')
        .select('name')
        .order('name')
      
      if (colorsError) {
        console.warn('⚠️ Error cargando colores personalizados (puede que la tabla no exista):', colorsError.message)
        // Si no hay tabla custom_colors, usar solo colores de productos
        const productColors = [...new Set(productsData?.flatMap(p => p.colors || []) || [])].sort()
        setAllAvailableColors(productColors)
      } else {
        const customColors = (customColorsData || []).map(c => c.name).filter(Boolean)
        console.log('✅ Colores personalizados cargados:', customColors.length)
        
        // Combinar colores de productos con colores personalizados
        const productColors = [...new Set(productsData?.flatMap(p => p.colors || []) || [])]
        const allColors = [...new Set([...productColors, ...customColors])].sort()
        setAllAvailableColors(allColors)
        console.log('✅ Total de colores disponibles:', allColors.length, '(de productos:', productColors.length, ', personalizados:', customColors.length, ')')
      }
      
      // Cargar talles desde custom_sizes y product_variants
      console.log('📏 Cargando talles desde custom_sizes y product_variants...')
      
      // Cargar talles desde custom_sizes
      let customSizes: string[] = []
      try {
        const { data: customSizesData, error: sizesError } = await supabase
          .from('custom_sizes')
          .select('name')
          .order('name')
        
        if (sizesError) {
          console.warn('⚠️ Error cargando talles personalizados (puede que la tabla no exista):', sizesError.message)
        } else {
          customSizes = (customSizesData || []).map(s => s.name).filter(Boolean)
          console.log('✅ Talles personalizados cargados:', customSizes.length)
        }
      } catch (err) {
        console.warn('⚠️ Excepción al cargar custom_sizes:', err)
      }
      
      // Cargar talles desde product_variants (todos, no solo los activos)
      let variantSizes: string[] = []
      try {
        const { data: variantsData, error: variantsError } = await supabase
          .from('product_variants')
          .select('size')
          .not('size', 'is', null)
        
        if (variantsError) {
          console.warn('⚠️ Error cargando talles de variantes:', variantsError.message)
        } else {
          variantSizes = [...new Set((variantsData || []).map(v => v.size).filter(Boolean))]
          console.log('✅ Talles de variantes cargados:', variantSizes.length)
        }
      } catch (err) {
        console.warn('⚠️ Excepción al cargar product_variants:', err)
      }
      
      // Combinar talles de productos, custom_sizes y product_variants
      const productSizes = [...new Set(productsData?.flatMap(p => p.sizes || []) || [])]
      const allSizes = [...new Set([...productSizes, ...customSizes, ...variantSizes])].sort()
      setAllAvailableSizes(allSizes)
      console.log('✅ Total de talles disponibles:', allSizes.length, '(de productos:', productSizes.length, ', personalizados:', customSizes.length, ', variantes:', variantSizes.length, ')')
      console.log('📋 Lista completa de talles:', allSizes)
      
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Hero Skeleton */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>
          <div className="relative container mx-auto px-4 py-12 sm:py-16 md:py-20 text-center">
            <div className="animate-pulse">
              <div className="h-8 sm:h-10 md:h-12 bg-white/20 rounded-lg mb-4 w-64 mx-auto"></div>
              <div className="h-6 sm:h-8 bg-white/10 rounded-lg mb-6 w-96 mx-auto"></div>
              <div className="h-16 bg-white/10 rounded-2xl max-w-xl mx-auto"></div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse mb-8">
            <div className="h-8 bg-gray-300 rounded-lg mb-2 w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          
          {/* Filtros y productos skeleton */}
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
            {/* Filtros skeleton - Desktop */}
            <div className="hidden lg:block lg:w-80 flex-shrink-0">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="mb-4">
                    <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mt-1"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Productos skeleton */}
            <div className="flex-1">
              <ProductsGridSkeleton count={12} />
            </div>
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
              availableColors={allAvailableColors}
              availableSizes={allAvailableSizes}
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
                availableColors={allAvailableColors}
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
