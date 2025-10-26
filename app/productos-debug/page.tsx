'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client-fixed'

export default function ProductosDebugPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      console.log('🔍 Cargando productos...')
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(10)

      if (error) {
        console.error('❌ Error:', error)
        setError(error.message)
      } else {
        console.log('✅ Productos cargados:', data)
        setProducts(data || [])
      }
    } catch (err) {
      console.error('❌ Error general:', err)
      setError('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadProducts}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Productos Debug</h1>
        
        <div className="mb-4">
          <p className="text-gray-600">
            Total de productos: {products.length}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-2">{product.description}</p>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Precio:</span> ${product.price}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Precio Mayorista:</span> ${product.wholesale_price}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Stock:</span> {product.stock}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Categoría:</span> {product.category_id || 'Sin categoría'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Activo:</span> {product.active ? 'Sí' : 'No'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-600">No se encontraron productos</p>
          </div>
        )}
      </div>
    </div>
  )
}
