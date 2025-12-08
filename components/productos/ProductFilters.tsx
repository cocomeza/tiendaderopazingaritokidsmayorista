'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react'

interface FilterProps {
  products: any[]
  onFilterChange: (filters: any) => void
  categories: any[]
  availableColors?: string[]
  availableSizes?: string[]
}

export function ProductFilters({ products, onFilterChange, categories, availableColors, availableSizes }: FilterProps) {
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

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    colors: false,
    sizes: false,
    price: false,
    sort: false
  })

  // Extraer opciones únicas de los productos
  const productColors = [...new Set(products.flatMap(p => p.colors || []))]
  
  // Combinar colores de productos con colores disponibles (de custom_colors)
  const allColors = [...new Set([
    ...productColors,
    ...(availableColors || [])
  ])].sort()
  
  // Combinar talles de productos con talles disponibles (de custom_sizes y product_variants)
  const productSizes = [...new Set(products.flatMap(p => p.sizes || []))]
  const allSizes = [...new Set([
    ...productSizes,
    ...(availableSizes || [])
  ])].sort()

  // Validar que categories sea un array válido
  const validCategoriesArray = Array.isArray(categories) ? categories : []
  
  // Todas las categorías (mostrar todas sin importar group_type)
  const allCategories = validCategoriesArray
    .filter(cat => cat && cat.id && cat.name) // Filtrar categorías válidas
    .sort((a, b) => {
      // Ordenar primero por display_order si existe, luego por nombre
      const orderA = a.display_order || 999
      const orderB = b.display_order || 999
      if (orderA !== orderB) return orderA - orderB
      return (a.name || '').localeCompare(b.name || '')
    })
  
  // Contar productos por categoría
  const getCategoryCount = (categoryId: string) => 
    products.filter(p => p && p.category_id === categoryId).length
  
  // Log para depuración
  if (typeof window !== 'undefined') {
    console.log('🔍 ProductFilters - Categorías recibidas:', categories.length)
    console.log('🔍 ProductFilters - Categorías raw:', categories)
    console.log('🔍 ProductFilters - Todas las categorías filtradas:', allCategories.length)
    if (allCategories.length > 0) {
      console.log('🔍 ProductFilters - Primeras 5 categorías:', allCategories.slice(0, 5).map(c => ({ name: c.name, id: c.id, group_type: c.group_type })))
    } else {
      console.warn('⚠️ ProductFilters - No hay categorías para mostrar')
      console.warn('⚠️ ProductFilters - categories prop:', categories)
    }
  }
  

  // Contar productos por filtro
  const getColorCount = (color: string) => 
    products.filter(p => p.colors?.includes(color)).length

  const getSizeCount = (size: string) => 
    products.filter(p => p.sizes?.includes(size)).length

  // Función para convertir nombres de colores a códigos hex
  const getColorHex = (colorName: string) => {
    const colorMap: { [key: string]: string } = {
      'negro': '#000000',
      'blanco': '#FFFFFF',
      'rojo': '#FF0000',
      'azul': '#0000FF',
      'azul marino': '#000080',
      'verde': '#008000',
      'amarillo': '#FFFF00',
      'rosa': '#FFC0CB',
      'gris': '#808080',
      'marrón': '#A52A2A',
      'naranja': '#FFA500',
      'morado': '#800080',
      'celeste': '#87CEEB',
      'aqua': '#00FFFF',
      'acqua': '#00FFFF',
      'oliva': '#808000',
      'manteca': '#F5F5DC',
      'natural': '#F5F5DC',
      'beige': '#F5F5DC',
      'crema': '#FFF8DC',
      'turquesa': '#40E0D0',
      'coral': '#FF7F50',
      'lila': '#C8A2C8',
      'bordo': '#800020',
      'borravino': '#800020',
      'violeta': '#8A2BE2',
      'dorado': '#FFD700',
      'plateado': '#C0C0C0',
      'terracota': '#E2725B',
      'tostado': '#D2B48C',
      'fucsia': '#FF00FF',
      'batik': '#8B4513'
    }
    
    return colorMap[colorName.toLowerCase()] || '#CCCCCC'
  }

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleArrayFilterChange = (key: string, value: string) => {
    const currentArray = filters[key as keyof typeof filters] as string[]
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    
    const newFilters = { ...filters, [key]: newArray }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      colors: [] as string[],
      sizes: [] as string[],
      priceMin: '',
      priceMax: '',
      search: '',
      sortBy: 'name',
      sortOrder: 'asc'
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const activeFiltersCount = 
    (filters.category ? 1 : 0) +
    filters.colors.length +
    filters.sizes.length +
    (filters.priceMin || filters.priceMax ? 1 : 0)

  return (
    <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Filter className="w-5 h-5" />
            FILTROS
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-white text-gray-800">{activeFiltersCount}</Badge>
            )}
          </h2>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-white hover:bg-gray-700">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">

        {/* Categorías Generales - Todas las categorías disponibles */}
        {/* Mostrar siempre la sección, incluso si no hay categorías */}
        <div className="bg-white border-2 border-gray-200 rounded-lg">
          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto border-b border-gray-200"
            onClick={() => toggleSection('categories')}
          >
            <span className="font-bold text-gray-800 text-left">
              📂 CATEGORÍAS {allCategories.length > 0 ? `(${allCategories.length})` : '(0)'}
            </span>
            {expandedSections.categories ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
          
          {expandedSections.categories && (
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {allCategories.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-2">No hay categorías disponibles</p>
                  <p className="text-xs text-gray-400">Las categorías se cargarán automáticamente cuando estén disponibles</p>
                </div>
              ) : (
                <>
                  <Button
                    variant={filters.category === '' ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-start font-semibold"
                    onClick={() => {
                      const clearedFilters = {
                        ...filters,
                        category: ''
                      }
                      setFilters(clearedFilters)
                      onFilterChange(clearedFilters)
                    }}
                  >
                    Todas las categorías
                  </Button>
                  {allCategories.map((category) => {
                    const count = getCategoryCount(category.id)
                    const isSelected = filters.category === category.id
                    
                    return (
                      <div
                        key={category.id}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-purple-50 border border-purple-200' : ''
                        }`}
                        onClick={() => {
                          const updatedFilters = {
                            ...filters,
                            category: isSelected ? '' : category.id
                          }
                          setFilters(updatedFilters)
                          onFilterChange(updatedFilters)
                        }}
                      >
                        <span className="font-medium text-sm">{category.name}</span>
                        {count > 0 && (
                          <Badge variant="secondary" className="bg-gray-200 text-gray-700 text-xs">
                            {count}
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          )}
        </div>

        {/* Colores */}
        {allColors.length > 0 && (
          <div className="bg-white border-2 border-gray-200 rounded-lg">
            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto border-b border-gray-200"
              onClick={() => toggleSection('colors')}
            >
              <span className="font-bold text-gray-800 text-left">
                🎨 COLOR ({allColors.length})
              </span>
              {expandedSections.colors ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
            
            {expandedSections.colors && (
              <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                {allColors.map((color) => (
                  <div
                    key={color}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-50 ${
                      filters.colors.includes(color) ? 'bg-purple-50 border border-purple-200' : ''
                    }`}
                    onClick={() => handleArrayFilterChange('colors', color)}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ 
                          backgroundColor: getColorHex(color),
                          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)'
                        }}
                      />
                      <span className="font-medium">{color}</span>
                    </div>
                    <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                      {getColorCount(color)}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-3 text-sm">
                  VER TODOS
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tallas */}
        {allSizes.length > 0 && (
          <div className="bg-white border-2 border-gray-200 rounded-lg">
            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto border-b border-gray-200"
              onClick={() => toggleSection('sizes')}
            >
              <span className="font-bold text-gray-800 text-left">
                📏 TALLE ({allSizes.length})
              </span>
              {expandedSections.sizes ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
            
            {expandedSections.sizes && (
              <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                {allSizes.map((size) => (
                  <div
                    key={size}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-50 ${
                      filters.sizes.includes(size) ? 'bg-purple-50 border border-purple-200' : ''
                    }`}
                    onClick={() => handleArrayFilterChange('sizes', size)}
                  >
                    <span className="font-medium">{size}</span>
                    <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                      {getSizeCount(size)}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-3 text-sm">
                  VER TODOS
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Precio */}
        <div className="bg-white border-2 border-gray-200 rounded-lg">
          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto border-b border-gray-200"
            onClick={() => toggleSection('price')}
          >
            <span className="font-bold text-gray-800 text-left">
              💰 PRECIO
            </span>
            {expandedSections.price ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
          
          {expandedSections.price && (
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Desde</label>
                  <Input
                    placeholder="6046"
                    type="number"
                    value={filters.priceMin}
                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                    className="border-2 border-gray-300 focus:border-purple-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Hasta</label>
                  <Input
                    placeholder="110086"
                    type="number"
                    value={filters.priceMax}
                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                    className="border-2 border-gray-300 focus:border-purple-500"
                  />
                </div>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                →
              </Button>
            </div>
          )}
        </div>

        {/* Botón Limpiar Filtros */}
        <div className="pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 font-semibold"
            disabled={activeFiltersCount === 0}
          >
            <X className="w-4 h-4 mr-2" />
            Limpiar Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-gray-200 text-gray-700">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

      </div>
    </div>
  )
}
