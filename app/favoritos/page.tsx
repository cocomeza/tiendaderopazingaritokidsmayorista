'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/hooks/useAuth'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { useCartStore } from '@/lib/stores/cart'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database'
import { toast } from 'sonner'

type Product = Database['public']['Tables']['products']['Row']

export default function FavoritosPage() {
  const { user, isAuthenticated } = useAuth()
  const { favorites, removeFromFavorites, loading: favoritesLoading } = useFavorites()
  const { addItem } = useCartStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar productos favoritos desde la base de datos
  const loadFavoriteProducts = async () => {
    if (!user || !isAuthenticated) {
      setProducts([])
      setLoading(false)
      return
    }

    if (favorites.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Cargar productos usando una consulta que incluye la relación con favorites
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', favorites)
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading favorite products:', error)
        throw error
      }

      setProducts(data || [])
    } catch (error: any) {
      console.error('Error loading favorite products:', error)
      toast.error('Error al cargar productos favoritos: ' + (error.message || 'Error desconocido'))
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Agregar al carrito
  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      productId: product.id,
      variantId: undefined,
      name: product.name,
      price: product.price,
      wholesale_price: product.wholesale_price || product.price,
      image: product.images?.[0] || '/placeholder.jpg',
      stock: product.stock || 0,
    })
    toast.success('Producto agregado al carrito')
  }

  // Eliminar de favoritos
  const handleRemoveFromFavorites = async (productId: string) => {
    try {
      const success = await removeFromFavorites(productId)
      if (success) {
        toast.success('Eliminado de favoritos')
        // Actualizar la lista local removiendo el producto
        setProducts(prev => prev.filter(p => p.id !== productId))
      } else {
        toast.error('Error al eliminar de favoritos')
      }
    } catch (error) {
      console.error('Error removing from favorites:', error)
      toast.error('Error al eliminar de favoritos')
    }
  }

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      loadFavoriteProducts()
    }
  }, [favorites, user, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Inicia sesión para ver tus favoritos
            </h1>
            <p className="text-gray-600">
              Necesitas estar registrado para acceder a tus productos favoritos
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando favoritos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mis Favoritos Mayoristas</h1>
          <p className="text-gray-600">
            {products.length} producto{products.length !== 1 ? 's' : ''} guardado{products.length !== 1 ? 's' : ''} - Compra mínima 5 unidades
          </p>
        </div>

        {/* Grid de productos */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No tienes productos favoritos
            </h2>
            <p className="text-gray-500 mb-6">
              Agrega productos a tus favoritos desde el catálogo mayorista
            </p>
            <Button asChild>
              <a href="/productos">Ver Productos</a>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -2 }}
                className="group"
              >
                <Card className="overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl border-0 shadow-md bg-white">
                  {/* Imagen del producto */}
                  <div className="relative overflow-hidden bg-gray-50">
                    <motion.img
                      src={product.images?.[0] || '/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.5 }}
                    />
                    
                    {/* Botón de eliminar de favoritos */}
                    <div className="absolute top-4 right-4">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-10 h-10 p-0 bg-red-500 hover:bg-red-600 rounded-full shadow-lg text-white opacity-90 hover:opacity-100 transition-all duration-300"
                        onClick={() => handleRemoveFromFavorites(product.id)}
                        disabled={favoritesLoading}
                        title="Eliminar de favoritos"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Sin stock overlay */}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Badge className="bg-gray-800 text-white font-bold px-4 py-2 text-sm rounded-full">
                          Sin Stock
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-5 space-y-4">
                    {/* Título del producto */}
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight text-gray-900">
                        {product.name}
                      </h3>
                      
                      {/* ID del producto */}
                      <p className="text-xs text-gray-500 font-mono"> 
                        ID: {product.id}
                      </p>
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

                        {/* Precio regular si existe */}
                        {product.price && product.price !== product.wholesale_price && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500 line-through">
                              Precio regular: {formatPrice(product.price)}
                            </span>
                          </div>
                        )}
                      </div>
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
                    </div>

                    {/* Botón de agregar */}
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {product.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
