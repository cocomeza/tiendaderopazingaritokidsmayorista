'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, X, Plus, Minus, Trash2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCartStore } from '@/lib/stores/cart'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

const DATOS_TRANSFERENCIA = {
  alias: 'ZINGARITO.KIDS',
  cbu: '0170123456789012345678',
  medios: 'Transferencia bancaria, efectivo o cheque'
}

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
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const { items, updateQuantity, removeItem, clearCart, getTotalWholesalePrice, getTotalItems } = useCartStore()

  const total = getTotalWholesalePrice()
  const totalItems = getTotalItems()

  const generateOrderNumber = async () => {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    
    const { data } = await supabase
      .from('orders')
      .select('order_number')
      .like('order_number', `ZK-${datePart}-%`)
      .order('order_number', { ascending: false })
      .limit(1)
    
    let counter = 1
    if (data && data.length > 0) {
      const lastNumber = data[0].order_number.split('-')[2]
      counter = parseInt(lastNumber) + 1
    }
    
    return `ZK-${datePart}-${counter.toString().padStart(4, '0')}`
  }

  const abrirWhatsApp = async () => {
    // Verificar que el total de unidades sea >= 5
    if (totalItems < 5) {
      toast.error('Compra mínima requerida', {
        description: 'Debes agregar al menos 5 unidades en total para realizar un pedido. Actualmente tienes ' + totalItems + ' unidades.',
        duration: 5000,
      })
      return
    }

    // Verificar autenticación
    if (!isAuthenticated || !user) {
      toast.info('Debes iniciar sesión para crear un pedido', {
        description: 'Serás redirigido al login...',
        duration: 3000,
      })
      setTimeout(() => {
        router.push('/auth/login?redirect=/productos')
      }, 1000)
      return
    }

    try {
      // Cargar perfil del usuario
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Generar número de orden
      const orderNumber = await generateOrderNumber()
      
      const subtotal = total
      const totalAmount = subtotal

      // Preparar datos de envío y facturación
      const shippingAddress = profileData ? {
        name: profileData.full_name || user.email,
        phone: profileData.phone || '',
        address: profileData.address || '',
        city: profileData.city || '',
        province: profileData.province || '',
        postal_code: profileData.postal_code || ''
      } : null

      const billingAddress = profileData ? {
        name: profileData.full_name || user.email,
        cuit: profileData.cuit || '',
        email: user.email,
        phone: profileData.phone || '',
        address: profileData.billing_address || profileData.address || '',
        city: profileData.city || '',
        province: profileData.province || '',
        postal_code: profileData.postal_code || ''
      } : null

      // Crear el pedido en la base de datos
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          status: 'pendiente',
          payment_status: 'pendiente',
          subtotal: subtotal,
          total: totalAmount,
          notes: null,
          shipping_address: shippingAddress,
          billing_address: billingAddress
        })
        .select()
        .single()

      if (orderError) {
        console.error('Error creando pedido:', orderError)
        toast.error('Error al crear el pedido: ' + orderError.message)
        return
      }

      // Crear los items del pedido
      const orderItems = items.map(item => {
        const orderItem: any = {
          order_id: newOrder.id,
          product_id: item.productId,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: Number(item.wholesale_price),
          subtotal: Number(item.wholesale_price * item.quantity)
        }
        
        // Agregar campos opcionales solo si tienen valores
        if (item.size) {
          orderItem.size = item.size
        }
        if (item.color) {
          orderItem.color = item.color
        }
        
        return orderItem
      })

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Error creando items del pedido:', itemsError)
        console.error('Items que se intentaron insertar:', orderItems)
        toast.error('Error al guardar los items del pedido: ' + (itemsError.message || 'Error desconocido'))
        return
      }

      // Generar mensaje de WhatsApp con el número de orden
      const mensaje = `Hola! Quiero hacer un pedido MAYORISTA:\n\n${items.map(item => {
        const detalles = [
          item.size ? `Talle: ${item.size}` : null,
          item.color ? `Color: ${item.color || 'Color único'}` : null,
        ].filter(Boolean).join(' | ')
        
        const detallesStr = detalles ? ` (${detalles})` : ''
        const precioItem = (item.wholesale_price * item.quantity)
        
        return `• ${item.name}${detallesStr} - Cantidad: ${item.quantity} - $${precioItem.toLocaleString('es-AR')}`
      }).join('\n')}\n\nTotal: $${total.toLocaleString('es-AR')}\n\nCompra mínima: 5 unidades por producto\n\nDatos para pago:\n\nMedios aceptados: ${DATOS_TRANSFERENCIA.medios}\nAlias: ${DATOS_TRANSFERENCIA.alias}\nCBU: ${DATOS_TRANSFERENCIA.cbu}\n\nRecordá enviar el comprobante o captura del pago para confirmar tu pedido.`
      
      // Agregar número de orden al inicio del mensaje
      const mensajeConOrden = `Hola! Quiero hacer un pedido MAYORISTA:\n\n📋 ORDEN DE COMPRA N°: ${orderNumber}\n\n${mensaje.split('\n\n').slice(1).join('\n\n')}`
      
      // Abrir WhatsApp con el mensaje
      const numero = '543407440243'
      window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensajeConOrden)}`, '_blank')
      
      // Cerrar el drawer
      setIsOpen(false)

    } catch (error) {
      console.error('Error general:', error)
      toast.error('Error inesperado al procesar el pedido')
    }
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
