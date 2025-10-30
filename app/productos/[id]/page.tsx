'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Heart, Share2, Truck, Shield, Star, Plus, Minus, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database'

type Product = Database['public']['Tables']['products']['Row']
type ProductVariant = Database['public']['Tables']['product_variants']['Row']

// Datos de ejemplo temporal mientras cargamos de la BD
const PRODUCTO_MOCK = {
  id: 1,
  nombre: 'Remera Estampada Niños',
  categoria: 'Remeras',
  descripcion: 'Remera de algodón 100% con estampado de alta calidad. Ideal para el uso diario de los más pequeños. Confeccionada con materiales suaves y resistentes al lavado. Diseño moderno y colorido que encanta a los niños.',
  precio: 8500,
  precioAnterior: 10000,
  imagen: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop',
  imagenes: [
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=800&h=800&fit=crop',
  ],
  stock: 45,
  destacado: true,
  talles: ['2', '4', '6', '8', '10'],
  colores: [
    { nombre: 'Azul', hex: '#3B82F6' },
    { nombre: 'Rosa', hex: '#EC4899' },
    { nombre: 'Verde', hex: '#10B981' },
    { nombre: 'Amarillo', hex: '#F59E0B' },
  ],
  material: '100% Algodón',
  cuidados: ['Lavar a máquina', 'No usar cloro', 'Planchar a baja temperatura', 'No lavar en seco'],
  minimo: 6,
  rating: 4.5,
  reviews: 24,
}

const PRODUCTOS_RELACIONADOS = [
  {
    id: 2,
    nombre: 'Pantalón Jogger Infantil',
    precio: 12500,
    imagen: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=400&fit=crop',
  },
  {
    id: 3,
    nombre: 'Buzo Frisa con Capucha',
    precio: 16500,
    imagen: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=400&fit=crop',
  },
  {
    id: 4,
    nombre: 'Short Bermuda Verano',
    precio: 7500,
    imagen: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop',
  },
]

export default function ProductoDetallePage() {
  const params = useParams()
  const id = params?.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  
  const [imagenSeleccionada, setImagenSeleccionada] = useState(0)
  const [talleSeleccionado, setTalleSeleccionado] = useState<string | null>(null)
  const [colorSeleccionado, setColorSeleccionado] = useState<string | null>(null)
  const [cantidad, setCantidad] = useState(6) // Mínimo por defecto
  const [stockDisponible, setStockDisponible] = useState<number>(0)

  useEffect(() => {
    if (id) {
      loadProductData()
    }
  }, [id])

  const loadProductData = async () => {
    try {
      setLoading(true)
      
      // Cargar producto
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (productError) throw productError
      if (!productData) throw new Error('Producto no encontrado')

      setProduct(productData)

      // Cargar variantes del producto
      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', id)
        .eq('active', true)

      if (variantsError) {
        console.warn('No se pudieron cargar variantes:', variantsError)
        // Si no hay variantes, no es un error fatal
      } else if (variantsData && variantsData.length > 0) {
        setVariants(variantsData)
      } else {
        // Si no hay variantes, crear estructura básica desde arrays del producto
        const sizes = productData.sizes || []
        const colors = productData.colors || []
        setVariants([]) // Sin variantes específicas
      }
      
    } catch (err: any) {
      console.error('Error cargando producto:', err)
      setError(err.message || 'Error al cargar el producto')
    } finally {
      setLoading(false)
    }
  }

  // Obtener colores disponibles
  const getAvailableColors = () => {
    if (variants.length > 0) {
      return [...new Set(variants.map(v => v.color).filter(Boolean))]
    }
    return product?.colors || []
  }

  // Obtener talles disponibles
  const getAvailableSizes = () => {
    if (variants.length > 0) {
      return [...new Set(variants.map(v => v.size).filter(Boolean))]
    }
    return product?.sizes || []
  }

  // Obtener stock de una combinación específica
  const getVariantStock = (size?: string | null, color?: string | null) => {
    if (variants.length > 0 && size && color) {
      const variant = variants.find(v => v.size === size && v.color === color)
      return variant?.stock || 0
    }
    return product?.stock || 0
  }

  // Actualizar stock cuando cambia color o talle
  useEffect(() => {
    const stock = getVariantStock(talleSeleccionado, colorSeleccionado)
    setStockDisponible(stock)
  }, [talleSeleccionado, colorSeleccionado, variants, product])

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(precio)
  }

  const incrementarCantidad = () => {
    if (cantidad < stockDisponible) {
      setCantidad(prev => prev + 1)
    }
  }

  const decrementarCantidad = () => {
    const minimo = 6 // Mínimo de compra
    if (cantidad > minimo) {
      setCantidad(prev => prev - 1)
    }
  }

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
      'azul claro': '#ADD8E6',
      'verde claro': '#90EE90',
    }
    return colorMap[colorName.toLowerCase()] || '#CCCCCC'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Producto no encontrado'}</p>
          <Link href="/productos">
            <Button>Volver a Productos</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-600 hover:text-purple-600">Inicio</Link>
            <span className="text-gray-400">/</span>
            <Link href="/productos" className="text-gray-600 hover:text-purple-600">Productos</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Producto</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Botón volver */}
        <Link href="/productos">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al catálogo
          </Button>
        </Link>

        {/* Grid principal */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Galería de imágenes */}
          <div>
            {/* Imagen principal */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden mb-4 shadow-sm">
              <img
                src={PRODUCTO_MOCK.imagenes[imagenSeleccionada]}
                alt={PRODUCTO_MOCK.nombre}
                className="w-full h-full object-cover"
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {PRODUCTO_MOCK.destacado && (
                  <Badge variant="warning" className="flex items-center gap-1">
                    <Star className="w-3 h-3" fill="currentColor" />
                    Destacado
                  </Badge>
                )}
                {PRODUCTO_MOCK.precioAnterior && (
                  <Badge variant="destructive">
                    -{Math.round((1 - PRODUCTO_MOCK.precio / PRODUCTO_MOCK.precioAnterior) * 100)}% OFF
                  </Badge>
                )}
              </div>
            </div>

            {/* Miniaturas */}
            <div className="grid grid-cols-4 gap-2">
              {PRODUCTO_MOCK.imagenes.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setImagenSeleccionada(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    imagenSeleccionada === index
                      ? 'border-purple-600 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt={`Vista ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Información del producto */}
          <div>
            {/* Header */}
            <div className="mb-6">
              <p className="text-purple-600 font-semibold mb-2">{PRODUCTO_MOCK.categoria}</p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {PRODUCTO_MOCK.nombre}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(PRODUCTO_MOCK.rating)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {PRODUCTO_MOCK.rating} ({PRODUCTO_MOCK.reviews} reseñas)
                </span>
              </div>

              {/* Precio */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold text-purple-600">
                  {formatearPrecio(PRODUCTO_MOCK.precio)}
                </span>
                {PRODUCTO_MOCK.precioAnterior && (
                  <span className="text-xl text-gray-400 line-through">
                    {formatearPrecio(PRODUCTO_MOCK.precioAnterior)}
                  </span>
                )}
              </div>

              {/* Descripción */}
              <p className="text-gray-700 leading-relaxed mb-6">
                {PRODUCTO_MOCK.descripcion}
              </p>
            </div>

            {/* Selección de talle */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Talle: {talleSeleccionado || 'Seleccionar'}
              </label>
              <div className="flex flex-wrap gap-2">
                {PRODUCTO_MOCK.talles.map(talle => (
                  <button
                    key={talle}
                    onClick={() => setTalleSeleccionado(talle)}
                    className={`w-12 h-12 rounded-lg border-2 font-semibold transition-all ${
                      talleSeleccionado === talle
                        ? 'border-purple-600 bg-purple-50 text-purple-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {talle}
                  </button>
                ))}
              </div>
            </div>

            {/* Selección de color */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Color: {colorSeleccionado !== null ? PRODUCTO_MOCK.colores[colorSeleccionado]?.nombre : 'Seleccionar'}
              </label>
              <div className="flex flex-wrap gap-3">
                {PRODUCTO_MOCK.colores.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setColorSeleccionado(index)}
                    className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                      colorSeleccionado === index
                        ? 'border-purple-600 scale-110'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    title={color.nombre}
                  >
                    <div
                      className="w-full h-full rounded-full"
                      style={{ backgroundColor: color.hex }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Cantidad */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Cantidad (mínimo {PRODUCTO_MOCK.minimo} unidades)
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-lg">
                  <button
                    onClick={decrementarCantidad}
                    disabled={cantidad <= PRODUCTO_MOCK.minimo}
                    className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="px-6 font-semibold text-lg">{cantidad}</span>
                  <button
                    onClick={incrementarCantidad}
                    className="p-3 hover:bg-gray-100"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-semibold">Total: {formatearPrecio(PRODUCTO_MOCK.precio * cantidad)}</p>
                  <p>Stock disponible: {PRODUCTO_MOCK.stock}</p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 mb-6">
              <Button size="lg" className="flex-1">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Agregar al Carrito
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Información adicional */}
            <div className="space-y-3 border-t pt-6">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-purple-600 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Envío a todo el país</p>
                  <p className="text-sm text-gray-600">Entrega estimada en 5-7 días hábiles</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-purple-600 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Compra protegida</p>
                  <p className="text-sm text-gray-600">Devolución gratuita en caso de defectos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles adicionales */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Especificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Material:</dt>
                  <dd className="font-semibold">{PRODUCTO_MOCK.material}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Talles disponibles:</dt>
                  <dd className="font-semibold">{PRODUCTO_MOCK.talles.join(', ')}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Colores:</dt>
                  <dd className="font-semibold">{PRODUCTO_MOCK.colores.length} opciones</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Pedido mínimo:</dt>
                  <dd className="font-semibold">{PRODUCTO_MOCK.minimo} unidades</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cuidados</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {PRODUCTO_MOCK.cuidados.map((cuidado, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span className="text-gray-700">{cuidado}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Productos relacionados */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Productos Relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRODUCTOS_RELACIONADOS.map(producto => (
              <Card key={producto.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/productos/${producto.id}`}>
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 hover:text-purple-600">
                      {producto.nombre}
                    </h3>
                    <p className="text-xl font-bold text-purple-600">
                      {formatearPrecio(producto.precio)}
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
