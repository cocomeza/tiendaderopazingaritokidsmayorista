'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Heart, Minus, Plus, Package, Tag, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { useCartStore } from '@/lib/stores/cart'
import { useAuth } from '@/lib/hooks/useAuth'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { Database } from '@/lib/types/database'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type Product = Database['public']['Tables']['products']['Row']

interface QuickViewModalProps {
  product: Product | null
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

  // Resetear cantidad cuando cambia el producto
  useEffect(() => {
    setQuantity(1)
    setCurrentImageIndex(0)
  }, [product])

  if (!product) return null

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

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        wholesale_price: product.wholesale_price || product.price,
        images: product.images,
        stock: product.stock
      })
    }

    toast.success(`${quantity} ${quantity === 1 ? 'producto' : 'productos'} agregado${quantity === 1 ? '' : 's'} al carrito`)
    onClose()
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
                      {product.sizes && product.sizes.length > 0 && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600 mb-1">Tallas disponibles:</p>
                          <div className="flex gap-1">
                            {product.sizes.map((size) => (
                              <Badge key={size} variant="outline" className="text-xs">
                                {size}
                              </Badge>
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
                          onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                          className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          disabled={quantity >= (product.stock || 99)}
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
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Agregar al Carrito
                      </Button>
                      <p className="text-xs text-center text-gray-500">
                        Stock disponible: {product.stock} unidades
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

