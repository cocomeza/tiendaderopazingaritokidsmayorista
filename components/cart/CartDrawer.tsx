'use client'

import { useState } from 'react'
import { ShoppingCart, X, Plus, Minus, Trash2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCartStore } from '@/lib/stores/cart'
import { toast } from 'sonner'

export function CartButton() {
  const { getTotalItems } = useCartStore()
  const itemCount = getTotalItems()

  return (
    <Button variant="outline" className="relative">
      <ShoppingCart className="w-4 h-4 mr-2" />
      Carrito
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          {itemCount}
        </span>
      )}
    </Button>
  )
}

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const { items, updateQuantity, removeItem, clearCart, getTotalWholesalePrice, getTotalItems } = useCartStore()

  const total = getTotalWholesalePrice()
  const totalItems = getTotalItems()

  const abrirWhatsApp = () => {
    // Verificar que el total de unidades sea >= 5
    if (totalItems < 5) {
      toast.error('Compra mínima requerida', {
        description: 'Debes agregar al menos 5 unidades en total para realizar un pedido. Actualmente tienes ' + totalItems + ' unidades.',
        duration: 5000,
      })
      return
    }

    const numero = '543407440243'
    const mensaje = `Hola! Quiero hacer un pedido MAYORISTA:\n\n${items.map(item => 
      `• ${item.name}${item.size || item.color ? ` (${[
        item.size ? `Talle: ${item.size}` : null,
        item.color ? `Color: ${item.color}` : null,
      ].filter(Boolean).join(' | ')})` : ''} - Cantidad: ${item.quantity} - $${(item.wholesale_price * item.quantity).toLocaleString('es-AR')}`
    ).join('\n')}\n\nTotal: $${total.toLocaleString('es-AR')}\n\n(Compra mínima: 5 unidades en total)`
    
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" className="relative">
        <ShoppingCart className="w-4 h-4 mr-2" />
        Carrito
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {totalItems}
          </span>
        )}
      </Button>

      {/* Drawer con animación CSS pura */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 animate-in fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle>Carrito de Compras</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Tu carrito está vacío
                  </h3>
                  <p className="text-gray-500">
                    Agregá productos para comenzar tu pedido
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors animate-in fade-in"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.png'
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{item.name}</h4>
                        {(item.size || item.color) && (
                          <p className="text-xs text-gray-500">
                            {item.size && <span>Talle: {item.size}</span>}
                            {item.size && item.color && <span className="mx-1">|</span>}
                            {item.color && <span>Color: {item.color}</span>}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-purple-600">
                          ${(item.wholesale_price * item.quantity).toLocaleString('es-AR')}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            {items.length > 0 && (
              <div className="border-t p-4 space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-3 border border-purple-100 mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-gray-700">Total:</span>
                    <span className="text-xl font-bold text-purple-600">
                      ${total.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 text-center">
                      Compra mínima: 5 unidades en total
                    </p>
                    {totalItems < 5 && (
                      <p className="text-xs font-semibold text-orange-600 text-center bg-orange-50 rounded-lg py-1 px-2">
                        ⚠️ Faltan {5 - totalItems} unidad{5 - totalItems !== 1 ? 'es' : ''} para realizar el pedido
                      </p>
                    )}
                    {totalItems >= 5 && (
                      <p className="text-xs font-semibold text-green-600 text-center bg-green-50 rounded-lg py-1 px-2">
                        ✅ Cumples con el mínimo de compra
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={clearCart}
                    variant="outline"
                    className="flex-1"
                  >
                    Vaciar Carrito
                  </Button>
                  <Button
                    onClick={abrirWhatsApp}
                    disabled={totalItems < 5}
                    className={`flex-1 h-11 font-bold transition-all duration-200 ${
                      totalItems >= 5
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {totalItems >= 5 ? 'Pedir por WhatsApp' : `Faltan ${5 - totalItems} unidades`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
