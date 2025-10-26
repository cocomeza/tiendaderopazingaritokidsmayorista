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
}

export function ProductFilters({ products, onFilterChange, categories }: FilterProps) {
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
  const allColors = [...new Set(products.flatMap(p => p.colors || []))].sort()
  const allSizes = [...new Set(products.flatMap(p => p.sizes || []))].sort()

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
      'verde': '#008000',
      'amarillo': '#FFFF00',
      'rosa': '#FFC0CB',
      'gris': '#808080',
      'marrón': '#A52A2A',
      'naranja': '#FFA500',
      'morado': '#800080',
      'celeste': '#87CEEB',
      'aqua': '#00FFFF',
      'oliva': '#808000',
      'manteca': '#F5F5DC',
      'natural': '#F5F5DC',
      'beige': '#F5F5DC',
      'crema': '#FFF8DC',
      'turquesa': '#40E0D0',
      'coral': '#FF7F50',
      'lila': '#C8A2C8',
      'bordo': '#800020',
      'violeta': '#8A2BE2',
      'dorado': '#FFD700',
      'plateado': '#C0C0C0'
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

        {/* Categorías */}
        <div className="bg-white border-2 border-gray-200 rounded-lg">
          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto border-b border-gray-200"
            onClick={() => toggleSection('categories')}
          >
            <span className="font-bold text-gray-800 text-left">
              📂 CATEGORÍAS
            </span>
            {expandedSections.categories ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
          
          {expandedSections.categories && (
            <div className="p-4 space-y-2">
              <Button
                variant={filters.category === '' ? 'default' : 'ghost'}
                size="sm"
                className="w-full justify-start font-semibold"
                onClick={() => handleFilterChange('category', '')}
              >
                Todas las categorías
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={filters.category === category.id ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleFilterChange('category', category.id)}
                >
                  {category.name}
                </Button>
              ))}
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

      </div>
    </div>
  )
}
