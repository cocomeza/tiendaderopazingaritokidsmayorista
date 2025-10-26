'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/stores/cart'
import { supabase } from '@/lib/supabase/client-fixed'
import { 
  ShoppingCart, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail,
  ArrowLeft,
  CheckCircle,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'

interface BusinessInfo {
  name: string
  cbu: string
  alias: string
  phone: string
  email: string
  address: string
}

export default function CheckoutPage() {
  const { 
    items, 
    getTotalItems, 
    getTotalWholesalePrice, 
    getTotalWithDiscount,
    getDiscountPercentage,
    getDiscountAmount,
    clearCart 
  } = useCartStore()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const businessInfo: BusinessInfo = {
    name: "Zingarito Kids",
    cbu: "0170123456789012345678",
    alias: "ZINGARITO.KIDS",
    phone: "+54 340 749-8045",
    email: "zingaritokids@gmail.com",
    address: "Argentina"
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Error checking auth:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    if (price < 1000) {
      return (price * 1000).toLocaleString('es-AR')
    }
    return price.toLocaleString('es-AR')
  }

  const generateWhatsAppMessage = () => {
    const totalItems = getTotalItems()
    const totalPrice = getTotalWholesalePrice()
    
    let message = `🛒 *NUEVO PEDIDO - ZINGARITO KIDS*\n\n`
    message += `👤 *Cliente:* ${user?.email || 'Usuario'}\n`
    message += `📅 *Fecha:* ${new Date().toLocaleDateString('es-AR')}\n\n`
    message += `📦 *Productos:*\n`
    
    items.forEach(item => {
      message += `• ${item.name} x${item.quantity} - $${formatPrice(item.wholesale_price * item.quantity)}\n`
    })
    
    message += `\n💰 *TOTAL: $${formatPrice(totalPrice)}*\n`
    message += `📊 *Total de productos: ${totalItems}*\n\n`
    message += `✅ *Confirmo el pedido y procedo con el pago*`
    
    return encodeURIComponent(message)
  }

  const handleCompleteOrder = () => {
    const message = generateWhatsAppMessage()
    const whatsappUrl = `https://wa.me/543407498045?text=${message}`
    
    // Abrir WhatsApp en nueva ventana
    window.open(whatsappUrl, '_blank')
    
    // Limpiar carrito después de un delay
    setTimeout(() => {
      clearCart()
    }, 1000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Acceso Requerido</h2>
            <p className="text-gray-600 mb-6">
              Necesitas iniciar sesión para completar tu compra
            </p>
            <div className="space-y-3">
              <Link href="/auth/login">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/productos">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a Productos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Carrito Vacío</h2>
            <p className="text-gray-600 mb-6">
              No tienes productos en tu carrito
            </p>
            <Link href="/productos">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Ver Productos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
              <p className="text-gray-600 mt-1">Confirma tu pedido y completa el pago</p>
            </div>
            <Link href="/productos">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Productos
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resumen del Pedido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Resumen del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${formatPrice(item.wholesale_price * item.quantity)}</p>
                      <p className="text-sm text-gray-500">${formatPrice(item.wholesale_price)} c/u</p>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Subtotal ({getTotalItems()} productos):</span>
                    <span>${formatPrice(getTotalWholesalePrice())}</span>
                  </div>
                  
                  {getDiscountPercentage() > 0 && (
                    <>
                      <div className="flex justify-between items-center text-green-600">
                        <span>Descuento por cantidad ({getDiscountPercentage()}%):</span>
                        <span>-${formatPrice(getDiscountAmount())}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Total Final:</span>
                          <span className="text-purple-600">${formatPrice(getTotalWithDiscount())}</span>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {getDiscountPercentage() === 0 && (
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total Final:</span>
                      <span className="text-purple-600">${formatPrice(getTotalWholesalePrice())}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de Pago */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Datos para el Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-3">Información Bancaria</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-purple-700">Banco:</span>
                    <span className="font-medium">{businessInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700">CBU:</span>
                    <span className="font-mono bg-white px-2 py-1 rounded">{businessInfo.cbu}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700">Alias:</span>
                    <span className="font-mono bg-white px-2 py-1 rounded">{businessInfo.alias}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Proceso de Compra
                </h3>
                <div className="space-y-2 text-sm text-green-700">
                  <p>1. Completa el pago por transferencia</p>
                  <p>2. Envía el comprobante por WhatsApp</p>
                  <p>3. Te confirmaremos tu pedido</p>
                  <p>4. Despacharemos en 24-48hs</p>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleCompleteOrder}
                  className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Completar Compra por WhatsApp
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  Al hacer clic, se abrirá WhatsApp con tu pedido completo
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información de Contacto */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium">Teléfono</p>
                  <p className="text-gray-600">{businessInfo.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">{businessInfo.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium">Ubicación</p>
                  <p className="text-gray-600">{businessInfo.address}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
