'use client'

import { motion } from 'framer-motion'
import { ShoppingCart, Heart, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { CardHoverEffect } from '@/components/ui/card-hover-effect'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { useCartStore } from '@/lib/stores/cart'
import { useAuth } from '@/lib/hooks/useAuth'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { Database } from '@/lib/types/database'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { QuickViewModal } from './QuickViewModal'

type Product = Database['public']['Tables']['products']['Row']

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore()
  const { isAuthenticated } = useAuth()
  const { toggleFavorite, isFavorite, loading: favoritesLoading } = useFavorites()
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    
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

    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        wholesale_price: product.wholesale_price || product.price,
        image: product.images?.[0] || '/placeholder.jpg',
        stock: product.stock || 0,
      })
      
      toast.success('Producto agregado al carrito')
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Error al agregar al carrito')
    }
  }

  const handleAddToFavorites = async () => {
    console.log('🔥 handleAddToFavorites called!', product.id)
    
    if (!isAuthenticated) {
      console.log('❌ User not authenticated, redirecting to login')
      toast.error('Debes iniciar sesión para agregar productos a favoritos', {
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

    console.log('✅ User is authenticated, proceeding with toggle')
    const wasFavorite = isFavorite(product.id)
    console.log('📊 Current favorite status:', wasFavorite)
    
    const success = await toggleFavorite(product.id)
    console.log('🔄 Toggle result:', success)
    
    if (success) {
      toast.success(wasFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos')
    } else {
      toast.error('Error al actualizar favoritos')
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
    <CardHoverEffect>
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          whileHover={{ y: -4 }}
          className="group"
        >
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl relative group-hover:shadow-purple-500/20 shadow-lg hover:shadow-purple-500/30">
        {/* Botón de favoritos */}
        <div className="absolute top-4 right-4 z-20">
          <button
            className={`w-10 h-10 p-0 bg-white hover:bg-gray-50 rounded-full shadow-lg border-2 transition-all duration-200 flex items-center justify-center ${
              isFavorite(product.id) 
                ? 'text-red-500 border-red-200 bg-red-50 hover:bg-red-100' 
                : 'text-gray-400 border-gray-200 hover:text-red-400 hover:border-red-200'
            }`}
            onClick={() => {
              console.log('🖱️ Heart button clicked!', product.id)
              handleAddToFavorites()
            }}
            disabled={favoritesLoading}
            type="button"
          >
            <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
          </button>
        </div>

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
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
            <Button
              onClick={(e) => {
                e.stopPropagation()
                setIsQuickViewOpen(true)
              }}
              className="bg-white text-purple-600 hover:bg-purple-50 font-semibold px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all"
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
          {product.stock === 0 && (
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

          {/* Precio Mayorista */}
          <div className="space-y-2">
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(product.wholesale_price)}
                </span>
                <span className="text-sm text-gray-500">por unidad</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200">
                  Precio Mayorista
                </Badge>
                <span className="text-xs text-blue-600 font-medium">
                  Compra mínima: 5 unidades
                </span>
              </div>
            </div>
          </div>

          {/* Características principales */}
          <div className="space-y-2">
            {/* Colores */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 font-medium">Colores:</span>
                <div className="flex gap-1">
                  {product.colors.slice(0, 4).map((color, index) => (
                    <div
                      key={index}
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                    />
                  ))}
                  {product.colors.length > 4 && (
                    <span className="text-xs text-gray-500 ml-1">+{product.colors.length - 4}</span>
                  )}
                </div>
              </div>
            )}

            {/* Tallas */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 font-medium">Tallas:</span>
                <div className="flex gap-1 flex-wrap">
                  {product.sizes.slice(0, 5).map((size, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium">
                      {size}
                    </span>
                  ))}
                  {product.sizes.length > 5 && (
                    <span className="text-xs text-gray-500">+{product.sizes.length - 5}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                product.stock > 10 ? 'bg-green-500' : 
                product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-sm text-gray-600">
                {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
              </span>
            </div>
            <span className="text-xs text-gray-500">Compra mín: 5</span>
          </div>

          {/* Botón de agregar */}
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/30 transform hover:scale-105"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
    </CardHoverEffect>

    {/* Modal de Vista Rápida */}
    <QuickViewModal
      product={product}
      isOpen={isQuickViewOpen}
      onClose={() => setIsQuickViewOpen(false)}
    />
  </>
  )
}