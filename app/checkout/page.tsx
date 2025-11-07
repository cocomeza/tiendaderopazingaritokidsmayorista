'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useCartStore } from '@/lib/stores/cart'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { 
  ShoppingCart, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail,
  ArrowLeft,
  CheckCircle,
  MessageCircle,
  Save
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
  const router = useRouter()
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
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState('')
  const [profileData, setProfileData] = useState<any>(null)
  
  const businessInfo: BusinessInfo = {
    name: "Zingarito Kids",
    cbu: "0170123456789012345678",
    alias: "ZINGARITO.KIDS",
    phone: "+54 340 744-0243",
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
      
      // Cargar datos del perfil
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setProfileData(profile)
      }
    } catch (error) {
      console.error('Error checking auth:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateOrderNumber = async () => {
    // Generar número de pedido: ZK-YYYYMMDD-0001
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

  const formatPrice = (price: number) => {
    if (price < 1000) {
      return (price * 1000).toLocaleString('es-AR')
    }
    return price.toLocaleString('es-AR')
  }

  const handleCompleteOrder = async () => {
    if (!user) return

    setSaving(true)

    try {
      // Generar número de pedido único
      const orderNumber = await generateOrderNumber()
      
      const subtotal = getTotalWholesalePrice()
      const discount = getDiscountAmount()
      const total = getTotalWithDiscount()

      // Crear el pedido en la base de datos
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          status: 'pendiente',
          payment_status: 'pendiente',
          subtotal: subtotal,
          discount: discount,
          total: total,
          notes: notes || null,
          shipping_address: profileData?.billing_address || profileData?.address || null
        })
        .select()
        .single()

      if (orderError) {
        console.error('Error creando pedido:', orderError)
        toast.error('Error al crear el pedido: ' + orderError.message)
        return
      }

      // Crear los items del pedido
      const orderItems = items.map(item => ({
        order_id: newOrder.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.wholesale_price,
        subtotal: item.wholesale_price * item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Error creando items del pedido:', itemsError)
        toast.error('Error al guardar los items del pedido')
        return
      }

      // Generar mensaje de WhatsApp con el número de pedido
      const message = generateWhatsAppMessage(orderNumber)
      const whatsappUrl = `https://wa.me/543407440243?text=${message}`
      
      // Abrir WhatsApp en nueva ventana
      window.open(whatsappUrl, '_blank')
      
      toast.success(`Pedido ${orderNumber} creado exitosamente`)
      
      // Limpiar carrito después de un delay
      setTimeout(() => {
        clearCart()
        router.push('/mis-pedidos')
      }, 1500)

    } catch (error) {
      console.error('Error general:', error)
      toast.error('Error inesperado al procesar el pedido')
    } finally {
      setSaving(false)
    }
  }

  const generateWhatsAppMessage = (orderNumber: string = '') => {
    const totalItems = getTotalItems()
    const totalPrice = getTotalWholesalePrice()
    
    let message = `🛒 *NUEVO PEDIDO - ZINGARITO KIDS*\n\n`
    if (orderNumber) {
      message += `📋 *Pedido N°:* ${orderNumber}\n`
    }
    message += `👤 *Cliente:* ${profileData?.full_name || user?.email || 'Usuario'}\n`
    if (profileData?.phone) {
      message += `📞 *Teléfono:* ${profileData.phone}\n`
    }
    message += `📅 *Fecha:* ${new Date().toLocaleDateString('es-AR')}\n\n`
    message += `📦 *Productos:*\n`
    
    items.forEach(item => {
      message += `• ${item.name} x${item.quantity} - $${formatPrice(item.wholesale_price * item.quantity)}\n`
    })
    
    message += `\n💰 *TOTAL: $${formatPrice(totalPrice)}*\n`
    message += `📊 *Total de productos: ${totalItems}*\n\n`
    
    if (notes) {
      message += `📝 *Notas:* ${notes}\n\n`
    }
    
    message += `✅ *Confirmo el pedido y procedo con el pago*`
    
    return encodeURIComponent(message)
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
          <Card className="border-2 border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CreditCard className="w-6 h-6 text-purple-600" />
                Finalizar Compra
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Condiciones de Pago */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-blue-900 mb-3 text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Condiciones de Pago
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-blue-800">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="font-medium">Transferencia bancaria</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-800">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="font-medium">Efectivo</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-800">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="font-medium">Cheque</span>
                  </div>
                </div>
              </div>

              {/* Datos Bancarios */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-5 shadow-md">
                <h3 className="font-bold text-purple-900 mb-4 text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Datos Bancarios
                </h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-purple-700 font-semibold">CBU:</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(businessInfo.cbu)
                          toast.success('CBU copiado al portapapeles')
                        }}
                        className="text-xs text-purple-600 hover:text-purple-800 underline"
                      >
                        Copiar
                      </button>
                    </div>
                    <p className="font-mono text-lg font-bold text-gray-900 tracking-wider">
                      {businessInfo.cbu}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-purple-700 font-semibold">Alias:</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(businessInfo.alias)
                          toast.success('Alias copiado al portapapeles')
                        }}
                        className="text-xs text-purple-600 hover:text-purple-800 underline"
                      >
                        Copiar
                      </button>
                    </div>
                    <p className="font-mono text-lg font-bold text-gray-900">
                      {businessInfo.alias}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow-sm border border-purple-200">
                    <span className="text-sm text-purple-700 font-semibold">Titular:</span>
                    <p className="font-medium text-gray-900">{businessInfo.name}</p>
                  </div>
                </div>
              </div>

              {/* Proceso de Compra con Pasos */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-green-900 mb-4 text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Cómo Completar tu Compra
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-green-900">Realiza la transferencia</p>
                      <p className="text-sm text-green-700">Usa los datos bancarios de arriba</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-green-900">Haz clic en "Confirmar Pedido"</p>
                      <p className="text-sm text-green-700">Te redirigiremos a WhatsApp</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-green-900">Envía el comprobante</p>
                      <p className="text-sm text-green-700">Por WhatsApp para confirmar</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <p className="font-semibold text-green-900">¡Listo!</p>
                      <p className="text-sm text-green-700">Despacharemos en 24-48hs hábiles</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campo de Notas */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Notas del Pedido (Opcional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Ej: Necesito el pedido para el viernes, por favor incluir talles grandes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="resize-none border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              {/* Botón Principal */}
              <div className="space-y-3 pt-2">
                <Button 
                  onClick={handleCompleteOrder}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg py-7 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-bold"
                >
                  {saving ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Guardando Pedido...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-6 h-6 mr-2" />
                      Confirmar Pedido por WhatsApp
                    </>
                  )}
                </Button>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-lg p-4">
                  <p className="text-sm text-blue-900 text-center font-medium">
                    💾 <span className="font-bold">Tu pedido se guardará</span> y luego abriremos WhatsApp para que envíes el comprobante de pago
                  </p>
                </div>
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
