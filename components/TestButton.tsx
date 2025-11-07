'use client'

import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/stores/cart'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'sonner'

export function TestButton() {
  const { addItem } = useCartStore()
  const { isAuthenticated } = useAuth()

  const handleTest = () => {
    console.log('Test button clicked!', { isAuthenticated })
    
    if (!isAuthenticated) {
      console.log('Not authenticated')
      toast.error('Debes estar logueado')
      return
    }

    try {
      addItem({
        id: 'test-1',
        productId: 'test-1',
        variantId: undefined,
        name: 'Producto de Prueba',
        price: 1000,
        wholesale_price: 800,
        image: '/placeholder.jpg',
        stock: 10,
      })
      
      toast.success('Producto de prueba agregado!')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al agregar')
    }
  }

  return (
    <div className="p-4 border rounded-lg m-4">
      <h3 className="text-lg font-bold mb-2">Botón de Prueba</h3>
      <p className="text-sm text-gray-600 mb-2">
        Estado: {isAuthenticated ? 'Autenticado' : 'No autenticado'}
      </p>
      <Button onClick={handleTest} className="bg-red-500 hover:bg-red-600">
        Probar Agregar al Carrito
      </Button>
    </div>
  )
}
