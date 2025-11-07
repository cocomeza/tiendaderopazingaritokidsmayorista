'use client'

import { ShoppingCart, Heart, ChevronLeft, ChevronRight, Eye, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { useCartStore } from '@/lib/stores/cart'
import { useAuth } from '@/lib/hooks/useAuth'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { useAdmin } from '@/lib/hooks/useAdmin'
import { Database } from '@/lib/types/database'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { QuickViewModal } from './QuickViewModal'

type ProductRow = Database['public']['Tables']['products']['Row']
type ProductVariantRow = Database['public']['Tables']['product_variants']['Row']
type ProductWithVariants = ProductRow & { product_variants?: ProductVariantRow[] }

interface ProductCardProps {
  product: ProductWithVariants
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore()
  const { isAuthenticated } = useAuth()
  const { toggleFavorite, isFavorite, loading: favoritesLoading } = useFavorites()
  const { isAdmin } = useAdmin()
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  
  // Estados para selección de color y talle
  const [selectedColorKey, setSelectedColorKey] = useState<string | null>(null)
  const [selectedSizeKey, setSelectedSizeKey] = useState<string | null>(null)
  
  const normalize = (value: string | null | undefined) =>
    (value ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')

  const variants = useMemo(
    () => (product.product_variants ?? []).filter((variant) => variant && variant.active !== false),
    [product.product_variants]
  )

  const hasVariants = variants.length > 0

  type VariantColorOption = {
    key: string
    label: string
    stock: number
    variant?: ProductVariantRow
  }

  type VariantSizeOption = {
    key: string
    label: string
    totalStock: number
    colors: VariantColorOption[]
  }

  const DEFAULT_SIZE_KEY = '__default_size__'
  const DEFAULT_COLOR_KEY = '__default_color__'

  const baseColorOptions: VariantColorOption[] = useMemo(() => {
    if (!product.colors || product.colors.length === 0) {
      return []
    }
    return product.colors.map((color) => ({
      key: normalize(color),
      label: color,
      stock: product.stock || 0,
    }))
  }, [product.colors, product.stock])

  const baseSizeOptions: VariantSizeOption[] = useMemo(() => {
    if (!product.sizes || product.sizes.length === 0) {
      return []
    }

    return product.sizes.map((size) => ({
      key: normalize(size) || DEFAULT_SIZE_KEY,
      label: size?.trim() || 'Único',
      totalStock: product.stock || 0,
      colors: [],
    }))
  }, [product.sizes, product.stock])

  const { sizeOptions, aggregateColors, variantLookup, hasRealSizes, totalVariantStock } = useMemo(() => {
    if (!hasVariants) {
      const fallbackSizes = baseSizeOptions.length > 0
        ? baseSizeOptions
        : [{
            key: DEFAULT_SIZE_KEY,
            label: 'Único',
            totalStock: product.stock || 0,
            colors: [],
          }]

      return {
        sizeOptions: fallbackSizes,
        aggregateColors: baseColorOptions,
        variantLookup: new Map<string, ProductVariantRow>(),
        hasRealSizes: baseSizeOptions.length > 0,
        totalVariantStock: product.stock || 0,
      }
    }

    const sizeMap = new Map<string, {
      key: string
      label: string
      totalStock: number
      colors: Map<string, VariantColorOption>
    }>()

    const aggregateColorMap = new Map<string, VariantColorOption>()
    const lookup = new Map<string, ProductVariantRow>()

    variants.forEach((variant) => {
      const stock = variant.stock ?? 0
      const sizeKey = normalize(variant.size) || DEFAULT_SIZE_KEY
      const sizeLabel = variant.size?.trim() || 'Único'
      const colorKey = normalize(variant.color) || DEFAULT_COLOR_KEY
      const colorLabel = variant.color?.trim() || 'Color único'

      let sizeEntry = sizeMap.get(sizeKey)
      if (!sizeEntry) {
        sizeEntry = {
          key: sizeKey,
          label: sizeLabel,
          totalStock: 0,
          colors: new Map(),
        }
        sizeMap.set(sizeKey, sizeEntry)
      }

      sizeEntry.totalStock += stock

      let colorEntry = sizeEntry.colors.get(colorKey)
      if (!colorEntry) {
        colorEntry = {
          key: colorKey,
          label: colorLabel,
          stock: 0,
          variant,
        }
        sizeEntry.colors.set(colorKey, colorEntry)
      }
      colorEntry.stock += stock
      colorEntry.variant = variant

      const aggregateEntry = aggregateColorMap.get(colorKey)
      if (!aggregateEntry) {
        aggregateColorMap.set(colorKey, {
          key: colorKey,
          label: colorLabel,
          stock,
          variant,
        })
      } else {
        aggregateEntry.stock += stock
        if (!aggregateEntry.variant) {
          aggregateEntry.variant = variant
        }
      }

      lookup.set(`${sizeKey}::${colorKey}`, variant)
    })

    const normalizedSizeOptions: VariantSizeOption[] = Array.from(sizeMap.values()).map((entry) => ({
      key: entry.key,
      label: entry.label,
      totalStock: entry.totalStock,
      colors: Array.from(entry.colors.values()).sort((a, b) =>
        a.label.localeCompare(b.label, 'es', { sensitivity: 'base', numeric: true })
      ),
    })).sort((a, b) =>
      a.label.localeCompare(b.label, 'es', { sensitivity: 'base', numeric: true })
    )

    const normalizedColors: VariantColorOption[] = Array.from(aggregateColorMap.values()).sort((a, b) =>
      a.label.localeCompare(b.label, 'es', { sensitivity: 'base', numeric: true })
    )

    const totalVariantStock = normalizedSizeOptions.reduce((sum, option) => sum + option.totalStock, 0)
    const hasRealSizes = normalizedSizeOptions.length > 1 || (normalizedSizeOptions[0] && normalizedSizeOptions[0].key !== DEFAULT_SIZE_KEY)

    return {
      sizeOptions: normalizedSizeOptions,
      aggregateColors: normalizedColors,
      variantLookup: lookup,
      hasRealSizes,
      totalVariantStock,
    }
  }, [hasVariants, variants, baseSizeOptions, baseColorOptions, product.stock])

  const showSizeOptions = hasVariants ? hasRealSizes : baseSizeOptions.length > 0

  const currentSizeKey = showSizeOptions
    ? (selectedSizeKey && sizeOptions.some((option) => option.key === selectedSizeKey)
        ? selectedSizeKey
        : sizeOptions[0]?.key ?? DEFAULT_SIZE_KEY)
    : (hasVariants ? DEFAULT_SIZE_KEY : baseSizeOptions[0]?.key ?? DEFAULT_SIZE_KEY)

  const currentSizeOption = showSizeOptions
    ? sizeOptions.find((option) => option.key === currentSizeKey)
    : baseSizeOptions.find((option) => option.key === currentSizeKey)

  const colorOptions: VariantColorOption[] = hasVariants
    ? showSizeOptions
      ? currentSizeOption?.colors ?? []
      : aggregateColors
    : baseColorOptions

  const showColorOptions = colorOptions.length > 0
  const disableColorSelection = hasVariants && showSizeOptions && currentSizeKey === null

  const selectedColorOption = showColorOptions
    ? colorOptions.find((option) => option.key === (selectedColorKey && colorOptions.some((opt) => opt.key === selectedColorKey)
        ? selectedColorKey
        : colorOptions[0]?.key ?? null))
    : undefined

  const selectedSizeLabel = showSizeOptions
    ? currentSizeOption?.label ?? 'Único'
    : hasVariants
      ? (sizeOptions[0]?.label ?? 'Único')
      : null

  const selectedColorLabel = showColorOptions
    ? selectedColorOption?.label ?? 'Elegí'
    : null

  const availableStock = hasVariants
    ? showColorOptions
      ? selectedColorOption?.stock ?? 0
      : currentSizeOption?.totalStock ?? totalVariantStock
    : product.stock || 0

  const overallStock = hasVariants ? totalVariantStock : product.stock || 0
  
  // Obtener imágenes del producto
  const images = product.images || []
  const hasMultipleImages = images.length > 1

  // Funciones para navegar entre imágenes
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

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
      'celeste': '#87CEEB',
      'naranja': '#FFA500',
      'morado': '#800080',
      'bordó': '#800020',
      'azul claro': '#ADD8E6',
    }
    return colorMap[colorName.toLowerCase()] || '#CCCCCC'
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Si es admin, no puede agregar al carrito
    if (isAdmin) {
      return
    }
    
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para agregar productos al carrito', {
        description: 'Serás redirigido al inicio de sesión',
        duration: 3000,
      })
      
      // Redirigir después de un breve delay para que el usuario vea el mensaje
      setTimeout(() => {
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/productos'
        router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`)
      }, 1500)
      return
    }

    if (hasVariants) {
      if (showSizeOptions && !currentSizeKey) {
        toast.error('Elegí un talle disponible antes de agregar al carrito')
        return
      }

      if (showColorOptions && !selectedColorKey) {
        toast.error(
          disableColorSelection
            ? 'Elegí un talle para ver los colores disponibles'
            : 'Elegí un color disponible antes de agregar al carrito'
        )
        return
      }

      const sizeKeyForVariant = showSizeOptions ? currentSizeKey ?? DEFAULT_SIZE_KEY : DEFAULT_SIZE_KEY
      const colorKeyForVariant = showColorOptions
        ? (selectedColorKey && colorOptions.some((option) => option.key === selectedColorKey)
            ? selectedColorKey
            : colorOptions[0]?.key ?? DEFAULT_COLOR_KEY)
        : DEFAULT_COLOR_KEY

      let targetVariant = variantLookup.get(`${sizeKeyForVariant}::${colorKeyForVariant}`)

      if (!targetVariant && showSizeOptions && !showColorOptions) {
        targetVariant = variantLookup.get(`${sizeKeyForVariant}::${DEFAULT_COLOR_KEY}`)
      }

      if (!targetVariant && !showSizeOptions && showColorOptions) {
        targetVariant = variantLookup.get(`${DEFAULT_SIZE_KEY}::${colorKeyForVariant}`)
      }

      if (!targetVariant) {
        targetVariant = variants.find(
          (variant) => normalize(variant.size) === sizeKeyForVariant && normalize(variant.color) === colorKeyForVariant
        )
      }

      if (!targetVariant) {
        toast.error('No encontramos stock para esa combinación. Probá con otra.')
        return
      }

      const variantStock = targetVariant.stock ?? 0

      if (variantStock <= 0) {
        toast.error('Sin stock para la combinación seleccionada.')
        return
      }

      const variantSize = showSizeOptions
        ? sizeOptions.find((option) => option.key === sizeKeyForVariant)?.label ?? targetVariant.size ?? undefined
        : targetVariant.size ?? undefined

      const variantColor = showColorOptions
        ? colorOptions.find((option) => option.key === colorKeyForVariant)?.label ?? targetVariant.color ?? undefined
        : targetVariant.color ?? undefined

      addItem({
        id: `${product.id}::${targetVariant.id}`,
        productId: product.id,
        variantId: targetVariant.id,
        name: product.name,
        price: product.price,
        wholesale_price: product.wholesale_price || product.price,
        image: product.images?.[0] || '/placeholder.jpg',
        stock: variantStock,
        size: variantSize,
        color: variantColor,
      })

      toast.success('Producto agregado al carrito')
      return
    }

    if (availableStock <= 0) {
      toast.error('Este producto no tiene stock disponible en este momento.')
      return
    }

    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      wholesale_price: product.wholesale_price || product.price,
      image: product.images?.[0] || '/placeholder.jpg',
      stock: availableStock,
      size: selectedSizeLabel ?? undefined,
      color: selectedColorLabel ?? undefined,
    })
    toast.success('Producto agregado al carrito')
  }

  const handleAddToFavorites = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    console.log('💗 handleAddToFavorites llamado para producto:', product.id, product.name)
    console.log('Usuario autenticado:', isAuthenticated)
    
    if (!isAuthenticated) {
      console.log('⚠️ Usuario no autenticado')
      toast.error('Debes iniciar sesión para agregar productos a favoritos', {
        description: 'Serás redirigido al inicio de sesión',
        duration: 3000,
      })
      
      setTimeout(() => {
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/productos'
        router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`)
      }, 1500)
      return
    }

    const wasFavorite = isFavorite(product.id)
    console.log('Es favorito actualmente:', wasFavorite)
    
    try {
      console.log('🔄 Llamando a toggleFavorite...')
      const success = await toggleFavorite(product.id)
      console.log('Resultado toggleFavorite:', success)
      
      if (success) {
        toast.success(
          wasFavorite 
            ? '❤️ Eliminado de favoritos' 
            : '💚 Agregado a favoritos',
          {
            description: wasFavorite 
              ? 'El producto fue eliminado de tu lista' 
              : 'El producto fue agregado a tu lista',
            duration: 2000
          }
        )
      } else {
        console.error('❌ toggleFavorite retornó false')
        toast.error('Error al actualizar favoritos', {
          description: 'Por favor intenta nuevamente o verifica la consola',
          duration: 4000
        })
      }
    } catch (error: unknown) {
      console.error('❌ ERROR CRÍTICO en handleAddToFavorites:', error)
      toast.error('Error al actualizar favoritos', {
        description: error instanceof Error ? error.message : 'Error desconocido. Revisa la consola del navegador.',
        duration: 4000
      })
    }
  }

  // Formatear precio en pesos argentinos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  // Calcular descuento si hay precio mayorista
  const hasDiscount = product.wholesale_price && product.wholesale_price < product.price
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - product.wholesale_price) / product.price) * 100)
    : 0

  return (
    <>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl relative shadow-lg hover:shadow-purple-500/30 animate-in fade-in">
        {/* Botón de favoritos - Solo para clientes, no para admins */}
        {!isAdmin && (
          <div
            className="absolute top-4 right-4 z-40"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={`w-10 h-10 p-0 bg-white hover:bg-gray-50 rounded-full shadow-lg border-2 transition-all duration-200 flex items-center justify-center pointer-events-auto ${
                isFavorite(product.id) 
                  ? 'text-red-500 border-red-200 bg-red-50 hover:bg-red-100' 
                  : 'text-gray-400 border-gray-200 hover:text-red-400 hover:border-red-200'
              }`}
              onClick={handleAddToFavorites}
              disabled={favoritesLoading}
              type="button"
              title={isFavorite(product.id) ? 'Eliminar de favoritos' : 'Agregar a favoritos'}
            >
              <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
            </button>
          </div>
        )}

        {/* Indicador de múltiples imágenes */}
        {hasMultipleImages && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
            <Badge className="bg-black/50 text-white font-bold px-2 py-1 text-xs rounded-full">
              {images.length} fotos
            </Badge>
          </div>
        )}

        {/* Imagen del producto */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 mb-0 z-10">
          {images.length > 0 ? (
            <OptimizedImage
              src={images[currentImageIndex]}
              alt={product.name}
              className="w-full h-56 group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Sin imagen</span>
            </div>
          )}
          
          {/* Controles de navegación para múltiples imágenes */}
          {hasMultipleImages && (
            <>
              {/* Botón anterior */}
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {/* Botón siguiente */}
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              
              {/* Indicadores de imágenes */}
              <div className="absolute bottom-3 right-4 flex gap-1 z-30">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentImageIndex(index)
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentImageIndex 
                        ? 'bg-white shadow-lg' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Ver imagen ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>
          
          {/* Botón de Vista Rápida - Aparece en hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 pointer-events-none">
            <Button
              onClick={(e) => {
                e.stopPropagation()
                setIsQuickViewOpen(true)
              }}
              className="bg-white text-purple-600 hover:bg-purple-50 font-semibold px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all pointer-events-auto"
            >
              <Eye className="w-5 h-5 mr-2" />
              Vista Rápida
            </Button>
          </div>
          
          {/* Badge de descuento */}
        {hasDiscount && (
            <div className="absolute bottom-4 left-4 z-20">
              <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-3 py-1 text-sm rounded-full shadow-lg">
                -{discountPercentage}%
              </Badge>
            </div>
          )}

          {/* Overlay de sin stock */}
        {overallStock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
              <Badge className="bg-gray-800 text-white font-bold px-4 py-2 text-sm rounded-full">
                Sin Stock
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-5 space-y-4">

          {/* Título del producto */}
          <div className="space-y-1">
            <h3 className="font-bold text-lg line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300 leading-tight text-gray-900">
              {product.name}
            </h3>
            
          </div>

          {/* Precio Mayorista - Sección Mejorada */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-2 border-orange-200 p-4 shadow-sm hover:shadow-md transition-all duration-300">
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-yellow-200/30 to-orange-200/30 rounded-full blur-xl -ml-8 -mb-8"></div>
            
            <div className="relative space-y-3">
              {/* Badge destacado */}
              <div className="flex items-center justify-between">
                <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-3 py-1 text-xs shadow-md border-0">
                  💼 Precio Mayorista
                </Badge>
                {hasDiscount && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-2 py-1 text-xs shadow-md border-0">
                    Ahorra {discountPercentage}%
                  </Badge>
                )}
              </div>

              {/* Precio destacado */}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  {formatPrice(product.wholesale_price)}
                </span>
                <span className="text-sm font-medium text-orange-700">por unidad</span>
              </div>

              {/* Información adicional */}
              <div className="flex items-center gap-2 pt-2 border-t border-orange-200/50">
                <div className="flex items-center gap-1.5 text-xs text-orange-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">Compra mínima:</span>
                  <span className="font-bold">5 unidades</span>
                </div>
              </div>

              {/* Precio regular tachado si hay descuento */}
              {hasDiscount && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500 line-through">
                    Precio regular: {formatPrice(product.price)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Selección de Talle */}
          {showSizeOptions && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">
                Talle: {selectedSizeLabel || 'Elegí'}
                {selectedSizeLabel && (
                  <span className="text-xs text-gray-500 ml-2">({availableStock} disponibles)</span>
                )}
              </label>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => {
                  const sizeDisabled = size.totalStock <= 0
                  return (
                    <button
                      key={size.key}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (sizeDisabled) return
                        setSelectedSizeKey(size.key)
                      }}
                      disabled={sizeDisabled}
                      className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        currentSizeKey === size.key
                          ? 'border-purple-600 bg-purple-50 text-purple-600'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      } ${sizeDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                      title={`Stock disponible: ${size.totalStock}`}
                    >
                      <span className="block leading-none">{size.label}</span>
                      <span className="block text-[10px] text-gray-500">{size.totalStock}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Selección de Color */}
          {showColorOptions && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">
                Color:{' '}
                <span className="text-purple-600 capitalize">{selectedColorLabel || 'Elegí'}</span>
                {selectedColorLabel && (
                  <span className="text-xs text-gray-500 ml-2">({availableStock} disponibles)</span>
                )}
              </label>
              {disableColorSelection && (
                <p className="text-xs text-gray-500">Primero elegí un talle para ver los colores disponibles.</p>
              )}
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => {
                  const colorDisabled = disableColorSelection || (hasVariants ? color.stock <= 0 : false)
                  return (
                    <button
                      key={color.key}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (colorDisabled) return
                        setSelectedColorKey(color.key)
                      }}
                      disabled={colorDisabled}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColorKey === color.key
                          ? 'border-purple-600 scale-110 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${colorDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                      title={`Stock disponible: ${color.stock}`}
                    >
                      <div
                        className="w-full h-full rounded-full"
                        style={{ backgroundColor: getColorHex(color.label) }}
                      />
                    </button>
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] text-gray-500">
                {colorOptions.map((color) => (
                  <span key={`${color.key}-stock`} className="px-2 py-0.5 bg-gray-100 rounded-full">
                    {color.label}: {color.stock}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stock Disponible */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                availableStock > 10 ? 'bg-green-500' :
                availableStock > 0 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-sm text-gray-600">
                {availableStock > 0 ? `${availableStock} disponibles` : 'Sin stock'}
              </span>
            </div>
            <span className="text-xs text-gray-500">Compra mín: 5</span>
          </div>

          {/* Botón de agregar - Solo para clientes, no para admins */}
          {!isAdmin ? (
            <Button
              onClick={handleAddToCart}
              disabled={availableStock === 0}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/30 transform hover:scale-105"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {availableStock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
            </Button>
          ) : (
            <Button
              disabled
              className="w-full bg-gray-400 text-white font-bold py-3 rounded-xl cursor-not-allowed"
            >
              <Shield className="w-4 h-4 mr-2" />
              Modo Administrador
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Modal de Vista Rápida */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  )
}