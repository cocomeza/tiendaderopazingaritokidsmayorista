'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Heart, Minus, Plus, Package, Tag, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { useCartStore } from '@/lib/stores/cart'
import { useAuth } from '@/lib/hooks/useAuth'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { Database } from '@/lib/types/database'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type ProductRow = Database['public']['Tables']['products']['Row']
type ProductVariantRow = Database['public']['Tables']['product_variants']['Row']
type ProductWithVariants = ProductRow & { product_variants?: ProductVariantRow[] }

interface QuickViewModalProps {
  product: ProductWithVariants | null
  isOpen: boolean
  onClose: () => void
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addItem } = useCartStore()
  const { isAuthenticated } = useAuth()
  const { toggleFavorite, isFavorite, loading: favoritesLoading } = useFavorites()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedSizeKey, setSelectedSizeKey] = useState<string | null>(null)
  const [selectedColorKey, setSelectedColorKey] = useState<string | null>(null)

  // Resetear cantidad cuando cambia el producto
  useEffect(() => {
    setQuantity(1)
    setCurrentImageIndex(0)
    setSelectedSizeKey(null)
    setSelectedColorKey(null)
  }, [product])

  if (!product) return null

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

  useEffect(() => {
    if (!hasVariants) {
      if (showSizeOptions) {
        const defaultSizeKey = baseSizeOptions[0]?.key ?? DEFAULT_SIZE_KEY
        setSelectedSizeKey((prev) => {
          if (prev && baseSizeOptions.some((option) => option.key === prev)) {
            return prev
          }
          return defaultSizeKey
        })
      } else {
        setSelectedSizeKey(DEFAULT_SIZE_KEY)
      }

      if (baseColorOptions.length === 0) {
        setSelectedColorKey(null)
      } else {
        setSelectedColorKey((prev) => {
          if (prev && baseColorOptions.some((option) => option.key === prev)) {
            return prev
          }
          return baseColorOptions[0]?.key ?? null
        })
      }
      return
    }

    if (showSizeOptions) {
      const defaultSizeKey = sizeOptions[0]?.key ?? DEFAULT_SIZE_KEY
      setSelectedSizeKey((prev) => {
        if (prev && sizeOptions.some((option) => option.key === prev)) {
          return prev
        }
        return defaultSizeKey
      })
    } else {
      setSelectedSizeKey(DEFAULT_SIZE_KEY)
    }
  }, [product.id, hasVariants, showSizeOptions, sizeOptions, baseSizeOptions, baseColorOptions])

  const currentSizeKey = showSizeOptions
    ? (selectedSizeKey && sizeOptions.some((option) => option.key === selectedSizeKey)
        ? selectedSizeKey
        : sizeOptions[0]?.key ?? DEFAULT_SIZE_KEY)
    : (hasVariants ? DEFAULT_SIZE_KEY : baseSizeOptions[0]?.key ?? DEFAULT_SIZE_KEY)

  const currentSizeOption = showSizeOptions
    ? sizeOptions.find((option) => option.key === currentSizeKey)
    : undefined

  const colorOptions: VariantColorOption[] = hasVariants
    ? showSizeOptions
      ? currentSizeOption?.colors ?? []
      : aggregateColors
    : baseColorOptions

  const showColorOptions = colorOptions.length > 0

  useEffect(() => {
    if (!hasVariants) {
      if (baseColorOptions.length === 0) {
        setSelectedColorKey(null)
      } else {
        setSelectedColorKey((prev) => {
          if (prev && baseColorOptions.some((option) => option.key === prev)) {
            return prev
          }
          return baseColorOptions[0]?.key ?? null
        })
      }
      return
    }

    if (!showColorOptions) {
      setSelectedColorKey(null)
      return
    }

    setSelectedColorKey((prev) => {
      if (prev && colorOptions.some((option) => option.key === prev)) {
        return prev
      }
      return colorOptions[0]?.key ?? null
    })
  }, [product.id, hasVariants, showColorOptions, colorOptions, baseColorOptions])

  const disableColorSelection = hasVariants && showSizeOptions && !currentSizeKey

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

  useEffect(() => {
    if (availableStock <= 0) {
      setQuantity(1)
      return
    }

    if (quantity > availableStock) {
      setQuantity(availableStock)
    }
  }, [availableStock, quantity])

  const images = product.images || []
  const hasMultipleImages = images.length > 1

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para agregar productos al carrito', {
        description: 'Serás redirigido al inicio de sesión',
        duration: 3000,
      })
      
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

      const sizeLabelForCart = showSizeOptions
        ? sizeOptions.find((option) => option.key === sizeKeyForVariant)?.label ?? targetVariant.size ?? null
        : targetVariant.size ?? null

      const colorLabelForCart = showColorOptions
        ? colorOptions.find((option) => option.key === colorKeyForVariant)?.label ?? targetVariant.color ?? null
        : targetVariant.color ?? null

      for (let i = 0; i < quantity; i++) {
        addItem({
          id: `${product.id}::${targetVariant.id}`,
          productId: product.id,
          variantId: targetVariant.id,
          name: product.name,
          price: product.price,
          wholesale_price: product.wholesale_price || product.price,
          image: product.images?.[0],
          stock: variantStock,
          size: sizeLabelForCart,
          color: colorLabelForCart,
        })
      }
    } else {
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: product.id,
          productId: product.id,
          variantId: undefined,
          name: product.name,
          price: product.price,
          wholesale_price: product.wholesale_price || product.price,
          image: product.images?.[0],
          stock: product.stock || 0,
          size: selectedSizeLabel ?? undefined,
          color: selectedColorLabel ?? undefined,
        })
      }
    }

    toast.success(`${quantity} ${quantity === 1 ? 'producto' : 'productos'} agregado${quantity === 1 ? '' : 's'} al carrito`)
    onClose()
  }

  const handleColorHex = (colorName: string) => {
    const colorMap: { [key: string]: string } = {
      negro: '#000000',
      blanco: '#FFFFFF',
      rojo: '#FF0000',
      azul: '#0000FF',
      verde: '#008000',
      amarillo: '#FFFF00',
      rosa: '#FFC0CB',
      gris: '#808080',
      celeste: '#87CEEB',
      naranja: '#FFA500',
      morado: '#800080',
      bordó: '#800020',
      'azul claro': '#ADD8E6',
    }
    return colorMap[colorName.toLowerCase()] || '#CCCCCC'
  }

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
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

    toggleFavorite(product.id)
    toast.success(isFavorite(product.id) ? 'Removido de favoritos' : 'Agregado a favoritos')
  }

  const formatPrice = (price: number) => {
    if (price < 1000) {
      return (price * 1000).toLocaleString('es-AR')
    }
    return price.toLocaleString('es-AR')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden relative">
              {/* Botón de cerrar */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 h-full max-h-[90vh]">
                {/* Sección de Imagen */}
                <div className="relative bg-gray-50 overflow-hidden">
                  {images.length > 0 ? (
                    <div className="relative h-full w-full aspect-square">
                      <OptimizedImage
                        src={images[currentImageIndex]}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />

                      {/* Flechas de navegación */}
                      {hasMultipleImages && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-all"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-all"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>

                          {/* Indicadores de imagen */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {images.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100">
                      <Package className="w-24 h-24 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Sección de Información */}
                <div className="overflow-y-auto p-6 md:p-8">
                  <div className="space-y-4">
                    {/* Título y badges */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 pr-8">
                          {product.name}
                        </h2>
                        {isAuthenticated && (
                          <button
                            onClick={handleToggleFavorite}
                            disabled={favoritesLoading}
                            className={`p-2 rounded-full transition-all hover:scale-110 ${
                              isFavorite(product.id)
                                ? 'bg-red-50 text-red-500'
                                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
                            }`}
                          >
                            <Heart
                              className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-current' : ''}`}
                            />
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {product.featured && (
                          <Badge className="bg-yellow-500 text-white">Destacado</Badge>
                        )}
                        <Badge variant={product.stock > 10 ? 'default' : 'destructive'}>
                          {product.stock > 10 ? 'En Stock' : `Solo ${product.stock} unidades`}
                        </Badge>
                        {product.category && (
                          <Badge variant="outline">{product.category}</Badge>
                        )}
                      </div>
                    </div>

                    {/* Descripción */}
                    {product.description && (
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900">Descripción</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                    )}

                    {/* Información adicional */}
                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-b">
                      {product.gender && (
                        <div className="flex items-center gap-2 text-sm">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Género:</span>
                          <span className="font-medium capitalize">{product.gender}</span>
                        </div>
                      )}
                      {product.age_range && (
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Edad:</span>
                          <span className="font-medium">{product.age_range}</span>
                        </div>
                      )}
                      {showSizeOptions && (
                        <div className="col-span-2 space-y-2">
                          <p className="text-sm font-semibold text-gray-700">
                            Talle:{' '}
                            <span className="text-purple-600">{selectedSizeLabel || 'Elegí'}</span>
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {sizeOptions.map((size) => {
                              const disabled = size.totalStock <= 0
                              return (
                                <button
                                  key={size.key}
                                  onClick={() => {
                                    if (disabled) return
                                    setSelectedSizeKey(size.key)
                                  }}
                                  disabled={disabled}
                                  className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                                    currentSizeKey === size.key
                                      ? 'border-purple-600 bg-purple-50 text-purple-600'
                                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                  } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
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

                      {showColorOptions && (
                        <div className="col-span-2 space-y-2">
                          <p className="text-sm font-semibold text-gray-700">
                            Color:{' '}
                            <span className="text-purple-600 capitalize">{selectedColorLabel || 'Elegí'}</span>
                          </p>
                          {disableColorSelection && (
                            <p className="text-xs text-gray-500">Primero seleccioná un talle para ver los colores disponibles.</p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {colorOptions.map((color) => {
                              const disabled = disableColorSelection || (hasVariants ? color.stock <= 0 : false)
                              return (
                                <button
                                  key={color.key}
                                  onClick={() => {
                                    if (disabled) return
                                    setSelectedColorKey(color.key)
                                  }}
                                  disabled={disabled}
                                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                                    selectedColorKey === color.key
                                      ? 'border-purple-600 scale-110 shadow-md'
                                      : 'border-gray-200 hover-border-gray-300'
                                  } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                                  title={`Stock disponible: ${color.stock}`}
                                >
                                  <span
                                    className="block w-full h-full rounded-full"
                                    style={{ backgroundColor: handleColorHex(color.label) }}
                                  ></span>
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
                    </div>

                    {/* Precios */}
                    <div className="space-y-2 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Precio Mayorista:</span>
                        <span className="text-2xl font-bold text-purple-600">
                          ${formatPrice(product.wholesale_price || product.price)}
                        </span>
                      </div>
                      {product.wholesale_price !== product.price && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 line-through">Precio regular:</span>
                          <span className="text-gray-500 line-through">
                            ${formatPrice(product.price)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Selector de cantidad */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Cantidad</label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          disabled={quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                          className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          disabled={quantity >= availableStock}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="space-y-3 pt-4">
                      <Button
                        onClick={handleAddToCart}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 text-lg"
                        disabled={availableStock === 0}
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Agregar al Carrito
                      </Button>
                      <p className="text-xs text-center text-gray-500">
                        {availableStock > 0
                          ? `Stock disponible: ${availableStock} unidades`
                          : 'Sin stock para la combinación seleccionada'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

