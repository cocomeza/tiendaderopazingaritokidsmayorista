'use client'

import { User, LogOut, Heart, Settings, ShoppingBag, Shield, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/hooks/useAuth'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { useAdmin } from '@/lib/hooks/useAdmin'
import { useCartStore } from '@/lib/stores/cart'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Plus, Minus, Trash2, MessageCircle, X } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

interface UserMenuProps {
  cartDrawerOpen?: boolean
  setCartDrawerOpen?: (open: boolean) => void
}

const DATOS_TRANSFERENCIA = {
  alias: 'ZINGARITO.KIDS',
  cbu: '0170123456789012345678',
  medios: 'Transferencia bancaria, efectivo o cheque'
}

export function UserMenu({ cartDrawerOpen: externalCartDrawerOpen, setCartDrawerOpen: externalSetCartDrawerOpen }: UserMenuProps = {}) {
  const { user, isAuthenticated, signOut } = useAuth()
  const { favorites } = useFavorites()
  const { isAdmin } = useAdmin()
  const { getTotalItems, items, updateQuantity, removeItem, clearCart, getTotalWholesalePrice } = useCartStore()
  const router = useRouter()
  const [internalCartDrawerOpen, setInternalCartDrawerOpen] = useState(false)
  
  // Usar el estado externo si está disponible, sino el interno
  const cartDrawerOpen = externalCartDrawerOpen !== undefined ? externalCartDrawerOpen : internalCartDrawerOpen
  const setCartDrawerOpen = externalSetCartDrawerOpen || setInternalCartDrawerOpen

  const totalCartItems = getTotalItems()
  const cartTotal = getTotalWholesalePrice()

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
    if (totalCartItems < 5) {
      toast.error('Compra mínima requerida', {
        description: 'Debes agregar al menos 5 unidades en total para realizar un pedido. Actualmente tienes ' + totalCartItems + ' unidades.',
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
      // Cargar o crear perfil del usuario
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Si el perfil no existe, crearlo
      if (profileError || !profileData) {
        console.log('⚠️ Perfil no encontrado, creando perfil para usuario:', user.id)
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
            is_admin: false,
            is_active: true,
            is_wholesale_client: true
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creando perfil:', createError)
          toast.error('Error al crear el perfil: ' + createError.message)
          return
        }
        profileData = newProfile
      }

      // Generar número de orden
      const orderNumber = await generateOrderNumber()
      
      const subtotal = cartTotal
      const total = subtotal

      // Preparar datos de envío y facturación (siempre debe ser un objeto, nunca null)
      const shippingAddress = {
        name: profileData?.full_name || user.email || '',
        phone: profileData?.phone || '',
        address: profileData?.address || '',
        city: profileData?.city || '',
        province: profileData?.province || '',
        postal_code: profileData?.postal_code || ''
      }

      const billingAddress = {
        name: profileData?.full_name || user.email || '',
        cuit: profileData?.cuit || '',
        email: user.email || '',
        phone: profileData?.phone || '',
        address: profileData?.billing_address || profileData?.address || '',
        city: profileData?.city || '',
        province: profileData?.province || '',
        postal_code: profileData?.postal_code || ''
      }

      // Crear el pedido en la base de datos
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          status: 'pendiente',
          payment_status: 'pendiente',
          subtotal: subtotal,
          total: total,
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
        const subtotal = Number(item.wholesale_price * item.quantity)
        const orderItem: any = {
          order_id: newOrder.id,
          product_id: item.productId,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: Number(item.wholesale_price),
          subtotal: subtotal,
          total_price: subtotal // total_price es igual a subtotal
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

      // Generar mensaje de WhatsApp con formato simplificado
      const mensaje = `Hola 👋, ¿cómo estás?

Acabo de armar mi carrito en la web mayorista.

📦 Número de pedido: ${orderNumber}

🧸 Cantidad de artículos: ${totalCartItems}

💵 Total del pedido: $${cartTotal.toLocaleString('es-AR')}

Por favor, ¿me confirmás si está todo correcto para proceder con el pago?

¡Gracias!`
      
      // Abrir WhatsApp con el mensaje
      const numero = '543407440243'
      const whatsappUrl = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
      window.open(whatsappUrl, '_blank')
      
      // Mostrar mensaje de éxito
      toast.success(`Pedido ${orderNumber} creado exitosamente`)
      
      // Limpiar carrito después de crear el pedido
      clearCart()
      
      // Cerrar el drawer
      setCartDrawerOpen(false)

    } catch (error) {
      console.error('Error general:', error)
      toast.error('Error inesperado al procesar el pedido')
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const handleCartClick = () => {
    setCartDrawerOpen(true)
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button
          variant="outline"
          onClick={() => router.push('/auth/login')}
          className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2"
        >
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Iniciar Sesión</span>
          <span className="sm:hidden">Entrar</span>
        </Button>
        <Button
          variant="default"
          onClick={() => router.push('/auth/registro')}
          className="flex items-center gap-1.5 sm:gap-2 bg-green-600 hover:bg-green-700 text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2"
        >
          <span className="hidden sm:inline">Registrarse</span>
          <span className="sm:hidden">Registro</span>
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* CartDrawer */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50">
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setCartDrawerOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col animate-in slide-in-from-right">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <h2 className="text-2xl font-bold text-gray-900">Carrito de Compras</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCartDrawerOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
              {items.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-12 h-12 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    Tu carrito está vacío
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Agregá productos para comenzar tu pedido mayorista
                  </p>
                  <Button
                    onClick={() => setCartDrawerOpen(false)}
                    variant="outline"
                    className="border-purple-300 text-purple-600 hover:bg-purple-50"
                  >
                    Explorar Productos
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => {
                    const itemTotal = item.wholesale_price * item.quantity
                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
                      >
                        {/* Contenedor principal con imagen y contenido */}
                        <div className="flex gap-3 sm:gap-4 mb-3">
                          {/* Imagen del producto */}
                          <div className="flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.png'
                              }}
                            />
                          </div>
                          
                          {/* Información del producto */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <h4 className="font-bold text-sm sm:text-base text-gray-900 mb-1.5 line-clamp-2">
                              {item.name}
                            </h4>
                            {(item.size || item.color) && (
                              <div className="flex flex-wrap items-center gap-1 text-[11px] sm:text-xs text-gray-500">
                                {item.size && <span>Talle: {item.size}</span>}
                                {item.size && item.color && <span className="text-gray-300">|</span>}
                                {item.color && <span>Color: {item.color}</span>}
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-500">
                              <span>Cantidad:</span>
                              <span className="font-semibold text-gray-700">{item.quantity}</span>
                            </div>
                            
                            {/* Precio unitario y subtotal */}
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                                <span className="text-gray-600">Precio unitario:</span>
                                <span className="font-semibold text-purple-600">
                                  ${item.wholesale_price.toLocaleString('es-AR')}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs sm:text-sm text-gray-600">Subtotal:</span>
                                <span className="text-base sm:text-lg font-bold text-purple-700">
                                  ${itemTotal.toLocaleString('es-AR')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Controles de cantidad y eliminar - En fila separada para móvil */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-3 border-t border-gray-100">
                          {/* Selector de cantidad */}
                          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1.5 flex-1 sm:flex-initial sm:w-auto">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-8 w-8 p-0 hover:bg-gray-200 rounded-md flex-shrink-0"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-12 sm:w-10 text-center text-sm sm:text-base font-bold text-gray-900 flex-shrink-0">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 p-0 hover:bg-gray-200 rounded-md flex-shrink-0"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {/* Botón eliminar - Ocupa el ancho completo en móvil */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeItem(item.id)}
                            className="flex-1 sm:flex-initial text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 h-9 px-3 sm:px-4 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4 mr-1.5 flex-shrink-0" />
                            <span className="text-sm font-medium">Eliminar</span>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-gray-200 bg-white p-5 space-y-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-gray-700">Total a Pagar:</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      ${cartTotal.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 text-center">
                      Precios mayoristas • Compra mínima: 5 unidades en total
                    </p>
                    {totalCartItems < 5 && (
                      <p className="text-xs font-semibold text-orange-600 text-center bg-orange-50 rounded-lg py-1 px-2">
                        ⚠️ Faltan {5 - totalCartItems} unidad{5 - totalCartItems !== 1 ? 'es' : ''} para realizar el pedido
                      </p>
                    )}
                    {totalCartItems >= 5 && (
                      <p className="text-xs font-semibold text-green-600 text-center bg-green-50 rounded-lg py-1 px-2">
                        ✅ Cumples con el mínimo de compra
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={clearCart}
                    variant="outline"
                    className="flex-1 h-11 border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 font-medium"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Vaciar Carrito
                  </Button>
                  <Button
                    onClick={abrirWhatsApp}
                    disabled={totalCartItems < 5}
                    className={`flex-1 h-11 font-bold shadow-lg transition-all duration-200 ${
                      totalCartItems >= 5
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    {totalCartItems >= 5 ? 'Pedir por WhatsApp' : `Faltan ${5 - totalCartItems} unidades`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 sm:gap-4">
      {/* Usuario con Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
              className="h-auto p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 text-left">
                  {user?.user_metadata?.full_name || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 text-left">
                  {user?.user_metadata?.company || user?.email}
                </p>
              </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center shadow-sm">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-[calc(100vw-2rem)] max-w-sm sm:w-72 p-4 bg-white border-2 border-gray-200 shadow-2xl rounded-2xl"
            sideOffset={8}
          >
          <div className="max-h-[80vh] overflow-y-auto pr-1">
            {/* Header con información del usuario */}
            <div className="px-4 py-4 mb-3 rounded-xl bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 border border-purple-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-gray-900 truncate">
                {user?.user_metadata?.full_name || 'Usuario'}
              </p>
                  <p className="text-sm text-gray-600 truncate mt-0.5">
                {user?.email}
              </p>
                </div>
              </div>
            </div>
            
            {/* Solo opciones de cliente - SIN cerrar sesión (está en navbar) */}
            <div className="space-y-2">
              <DropdownMenuItem 
                onClick={() => router.push('/mi-perfil')}
                className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-200 group active:bg-blue-100"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-shadow flex-shrink-0">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900 text-base">Mi Perfil</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => router.push('/mis-pedidos')}
                className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 group active:bg-green-100"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-shadow flex-shrink-0">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900 text-base">Mis Pedidos</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => router.push('/favoritos')}
                className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 group active:bg-red-100"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-shadow relative flex-shrink-0">
                  <Heart className="w-5 h-5 text-white" />
                  {favorites.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-md">
                      <span className="text-xs font-bold text-red-600">{favorites.length}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="font-semibold text-gray-900 text-base">Favoritos</span>
                  {favorites.length > 0 && (
                    <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {favorites.length}
                    </Badge>
                  )}
                </div>
              </DropdownMenuItem>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    </>
  )
}
