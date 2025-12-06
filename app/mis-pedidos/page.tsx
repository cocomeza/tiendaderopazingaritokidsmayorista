'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'sonner'
import { 
  ShoppingBag, 
  Calendar, 
  DollarSign, 
  ArrowLeft, 
  Filter,
  FileText,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  Printer,
  Download
} from 'lucide-react'
import Link from 'next/link'

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

interface Order {
  id: string
  order_number: string
  status: string
  payment_status: string
  total: number
  subtotal: number
  discount: number
  notes?: string
  created_at: string
  items: OrderItem[]
  customer_email?: string
  customer_cuit?: string
  customer_billing_address?: string
  customer_name?: string
  billing_address?: any
}

export default function MisPedidosPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        console.log('Usuario no autenticado, redirigiendo a login')
        router.push('/auth/login?redirect=/mis-pedidos')
        return
      }
      
      console.log('Usuario autenticado, cargando pedidos:', user.id, user.email)
      loadOrders()
      
      // Auto-refresh cada 30 segundos para sincronizar con cambios del admin
      const interval = setInterval(() => {
        if (user) {
          loadOrders()
        }
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [authLoading, isAuthenticated, user])

  const loadOrders = async (showToast = false) => {
    try {
      if (!user) {
        console.warn('No hay usuario autenticado')
        return
      }

      console.log('Cargando pedidos para usuario:', user.id, user.email)

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error cargando pedidos:', error)
        console.error('Detalles del error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        toast.error('Error al cargar tus pedidos: ' + error.message)
        return
      }

      console.log('Pedidos cargados:', data?.length || 0, 'pedidos encontrados')

      // Cargar el perfil del usuario para obtener datos del cliente
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email, cuit, billing_address, full_name, company_name')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error cargando perfil:', profileError)
        console.error('Detalles del error de perfil:', {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details
        })
      } else {
        console.log('Perfil cargado correctamente:', profileData?.email)
      }

      // Cargar TODOS los items de todos los pedidos en una sola query
      const orderIds = (data || []).map(order => order.id)
      
      let allItems: any[] = []
      if (orderIds.length > 0) {
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds)
        
        allItems = itemsData || []
      }

      console.log('Items cargados:', allItems.length, 'items para', orderIds.length, 'pedidos')

      // Agrupar items por pedido y agregar datos del cliente
      const ordersWithItems = (data || []).map(order => {
        // Obtener dirección de facturación del pedido (si es objeto jsonb) o del perfil
        let billingAddress = ''
        if (order.billing_address) {
          if (typeof order.billing_address === 'object') {
            // Si es un objeto jsonb, formatear la dirección
            const billing = order.billing_address
            billingAddress = [
              billing.address,
              billing.city,
              billing.province,
              billing.postal_code
            ].filter(Boolean).join(', ')
          } else {
            billingAddress = order.billing_address
          }
        } else {
          billingAddress = profileData?.billing_address || ''
        }

        return {
        ...order,
          items: allItems.filter(item => item.order_id === order.id),
          customer_email: profileData?.email || user.email || '',
          customer_cuit: profileData?.cuit || '',
          customer_billing_address: billingAddress,
          customer_name: profileData?.full_name || profileData?.company_name || ''
        }
      })

      console.log('Pedidos procesados:', ordersWithItems.length)
      setOrders(ordersWithItems)
      
      if (showToast) {
        toast.success(`Pedidos actualizados: ${ordersWithItems.length} pedidos`)
      }
    } catch (error) {
      console.error('Error general:', error)
      toast.error('Error al cargar pedidos')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadOrders(true)
  }

  const handlePrintOrder = (order: Order) => {
    // Crear ventana de impresión con el contenido del pedido
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pedido ${order.order_number}</title>
        <style>
          @media print {
            @page {
              margin: 1cm;
            }
            body {
              margin: 0;
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
            color: #333;
          }
          .header {
            border-bottom: 3px solid #7c3aed;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #7c3aed;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          .order-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          .info-box {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #7c3aed;
          }
          .info-box h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            text-transform: uppercase;
            color: #666;
          }
          .info-box p {
            margin: 5px 0;
            font-size: 16px;
            font-weight: 600;
          }
          .products-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .products-table th {
            background: #7c3aed;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
          }
          .products-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
          }
          .products-table tr:hover {
            background: #f9fafb;
          }
          .totals {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .totals-row:last-child {
            border-bottom: none;
            font-size: 20px;
            font-weight: bold;
            color: #7c3aed;
            margin-top: 10px;
            padding-top: 15px;
            border-top: 2px solid #7c3aed;
          }
          .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin: 5px 5px 5px 0;
          }
          .status-pendiente { background: #fef3c7; color: #92400e; }
          .status-pagado { background: #d1fae5; color: #065f46; }
          .status-en-preparacion { background: #e9d5ff; color: #6b21a8; }
          .status-entregado { background: #d1fae5; color: #065f46; }
          .notes {
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin-top: 20px;
            border-radius: 4px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #7c3aed;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .print-button:hover {
            background: #6d28d9;
          }
        </style>
      </head>
      <body>
        <button class="print-button no-print" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
        
        <div class="header">
          <h1>ZINGARITO KIDS</h1>
          <p>Pedido N°: <strong>${order.order_number}</strong></p>
          <p>Fecha: ${new Date(order.created_at).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>

        <div class="order-info">
          <div class="info-box">
            <h3>Datos del Cliente</h3>
            ${order.customer_name ? `<p><strong>Nombre/Razón Social:</strong> ${order.customer_name}</p>` : '<p><strong>Nombre/Razón Social:</strong> No disponible</p>'}
            ${order.customer_email ? `<p><strong>Email:</strong> ${order.customer_email}</p>` : '<p><strong>Email:</strong> No disponible</p>'}
            ${order.customer_cuit ? `<p><strong>CUIT:</strong> ${order.customer_cuit}</p>` : '<p><strong>CUIT:</strong> No disponible</p>'}
            ${order.customer_billing_address ? `<p><strong>Dirección de Facturación:</strong> ${order.customer_billing_address}</p>` : '<p><strong>Dirección de Facturación:</strong> No disponible</p>'}
          </div>
          <div class="info-box">
            <h3>Información del Pedido</h3>
            <p><strong>Total de productos:</strong> ${order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</p>
            <p><strong>Items diferentes:</strong> ${order.items?.length || 0}</p>
          </div>
        </div>

        <table class="products-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${order.items?.map(item => `
              <tr>
                <td>${item.product_name}</td>
                <td>${item.quantity}</td>
                <td>${formatPrice(item.unit_price)}</td>
                <td><strong>${formatPrice(item.subtotal)}</strong></td>
              </tr>
            `).join('') || '<tr><td colspan="4">No hay productos</td></tr>'}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row">
            <span>Subtotal:</span>
            <span>${formatPrice(order.subtotal)}</span>
          </div>
          ${order.discount > 0 ? `
            <div class="totals-row" style="color: #059669;">
              <span>Descuento:</span>
              <span>-${formatPrice(order.discount)}</span>
            </div>
          ` : ''}
          <div class="totals-row">
            <span>TOTAL:</span>
            <span>${formatPrice(order.total)}</span>
          </div>
        </div>

        ${order.notes ? `
          <div class="notes">
            <h3 style="margin-top: 0;">Notas del Pedido:</h3>
            <p>${order.notes}</p>
          </div>
        ` : ''}

        <div class="footer">
          <p>Zingarito Kids - Mayorista de Ropa Infantil</p>
          <p>Este documento fue generado el ${new Date().toLocaleString('es-AR')}</p>
        </div>

        <script>
          window.onload = function() {
            // Auto-imprimir si se desea (opcional, comentado por defecto)
            // setTimeout(() => window.print(), 500);
          }
        </script>
      </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    
    // Esperar a que cargue y luego abrir diálogo de impresión
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendiente: 'Pendiente',
      confirmado: 'Confirmado',
      preparando: 'EN PREPARACIÓN',
      en_preparacion: 'EN PREPARACIÓN',
      enviado: 'Enviado',
      entregado: 'ENTREGADO',
      cancelado: 'Cancelado'
    }
    return labels[status] || status
  }

  const getPaymentLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendiente: '1) PENDIENTE DE PAGO',
      pagado: '2) PAGADO',
      rechazado: 'Rechazado'
    }
    return labels[status] || status
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getStatusBadge = (status: string, paymentStatus: string) => {
    const statusMap: Record<string, { color: string; bg: string; label: string; icon: any }> = {
      pendiente: { color: 'yellow', bg: 'bg-yellow-50', label: 'Pendiente', icon: Package },
      confirmado: { color: 'blue', bg: 'bg-blue-50', label: 'Confirmado', icon: CheckCircle },
      preparando: { color: 'purple', bg: 'bg-purple-50', label: 'EN PREPARACIÓN', icon: Package },
      en_preparacion: { color: 'purple', bg: 'bg-purple-50', label: 'EN PREPARACIÓN', icon: Package },
      enviado: { color: 'indigo', bg: 'bg-indigo-50', label: 'Enviado', icon: Truck },
      entregado: { color: 'green', bg: 'bg-green-50', label: 'ENTREGADO', icon: CheckCircle },
      cancelado: { color: 'red', bg: 'bg-red-50', label: 'Cancelado', icon: XCircle }
    }
    
    // Si está pagado y en preparación/preparando, mostrar "EN PREPARACIÓN"
    if (paymentStatus === 'pagado' && (status === 'preparando' || status === 'en_preparacion')) {
      const config = statusMap.en_preparacion
      const Icon = config.icon
      return (
        <Badge className={`${config.bg} text-${config.color}-700 border-${config.color}-200 flex items-center gap-1`}>
          <Icon className="w-3 h-3" />
          {config.label}
        </Badge>
      )
    }
    
    const config = statusMap[status] || statusMap.pendiente
    const Icon = config.icon
    return (
      <Badge className={`${config.bg} text-${config.color}-700 border-${config.color}-200 flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getPaymentBadge = (status: string) => {
    const paymentMap: Record<string, { color: string; bg: string; label: string }> = {
      pendiente: { color: 'yellow', bg: 'bg-yellow-50', label: '1) PENDIENTE DE PAGO' },
      pagado: { color: 'green', bg: 'bg-green-50', label: '2) PAGADO' },
      rechazado: { color: 'red', bg: 'bg-red-50', label: 'Rechazado' }
    }
    
    const config = paymentMap[status] || paymentMap.pendiente
    return (
      <Badge 
        className={`${config.bg} text-${config.color}-700 border-${config.color}-200`}
        data-testid={`payment-status-badge-${status}`}
      >
        {config.label}
      </Badge>
    )
  }

  const filteredOrders = orders.filter(order => {
    // Filtro por estado (incluye en_preparacion y preparando como equivalentes)
    if (statusFilter !== 'todos') {
      if (statusFilter === 'en_preparacion' && order.status !== 'en_preparacion' && order.status !== 'preparando') {
        return false
      } else if (statusFilter === 'preparando' && order.status !== 'en_preparacion' && order.status !== 'preparando') {
        return false
      } else if (statusFilter !== 'en_preparacion' && statusFilter !== 'preparando' && order.status !== statusFilter) {
      return false
      }
    }

    // Filtro por rango de fecha
    if (dateFrom && new Date(order.created_at) < new Date(dateFrom)) {
      return false
    }
    if (dateTo && new Date(order.created_at) > new Date(dateTo)) {
      return false
    }

    // Filtro por rango de precio
    if (minPrice && order.total < parseFloat(minPrice)) {
      return false
    }
    if (maxPrice && order.total > parseFloat(maxPrice)) {
      return false
    }

    return true
  })

  const getTotalStats = () => {
    const total = filteredOrders.length
    const totalValue = filteredOrders.reduce((sum, order) => sum + order.total, 0)
    return { total, totalValue }
  }

  const stats = getTotalStats()

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" data-testid="loading-orders">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="mis-pedidos-page">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900" data-testid="mis-pedidos-title">Mis Pedidos</h1>
              <p className="text-gray-600 mt-1" data-testid="pedidos-count">{stats.total} {stats.total === 1 ? 'pedido' : 'pedidos'} en tu historial</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2"
                data-testid="refresh-orders-button"
                aria-label="Actualizar lista de pedidos"
                type="button"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} data-testid="refresh-icon" />
                <span data-testid="refresh-button-text">{refreshing ? 'Actualizando...' : 'Actualizar'}</span>
              </Button>
            <Link href="/productos">
                <Button variant="outline" data-testid="back-to-products-button">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Productos
              </Button>
            </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8" data-testid="orders-container">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel de Filtros */}
          <Card className="h-fit sticky top-4" data-testid="filters-panel">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="w-5 h-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              {/* Filtro por Estado */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Estado</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="preparando">EN PREPARACIÓN</SelectItem>
                    <SelectItem value="en_preparacion">EN PREPARACIÓN</SelectItem>
                    <SelectItem value="enviado">Enviado</SelectItem>
                    <SelectItem value="entregado">ENTREGADO</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Fecha */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Desde</label>
                <Input 
                  type="date" 
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Hasta</label>
                <Input 
                  type="date" 
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              {/* Filtro por Precio */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Precio Mínimo ($)</label>
                <Input 
                  type="number" 
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Precio Máximo ($)</label>
                <Input 
                  type="number" 
                  placeholder="Sin límite"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>

              {/* Botón Limpiar */}
              <Button 
                variant="outline"
                onClick={() => {
                  setStatusFilter('todos')
                  setDateFrom('')
                  setDateTo('')
                  setMinPrice('')
                  setMaxPrice('')
                }}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </CardContent>
          </Card>

          {/* Lista de Pedidos */}
          <div className="lg:col-span-3 space-y-4" data-testid="orders-list">
            {filteredOrders.length === 0 ? (
              <Card data-testid="no-orders-message">
                <CardContent className="p-12 text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {orders.length === 0 ? 'No tienes pedidos aún' : 'No hay pedidos que coincidan con los filtros'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {orders.length === 0 
                      ? 'Cuando realices tu primer pedido desde el carrito y lo envíes por WhatsApp, aparecerá aquí con todos sus detalles y estado.'
                      : 'Intenta ajustar los filtros para ver tus pedidos'}
                  </p>
                  {orders.length === 0 && (
                    <div className="space-y-3">
                      <Link href="/productos">
                        <Button className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
                          Ver Productos
                        </Button>
                      </Link>
                      <div className="text-xs text-gray-400 mt-4">
                        <p>💡 Tip: Agrega productos al carrito y completa tu pedido para verlo aquí</p>
                      </div>
                    </div>
                  )}
                  {orders.length > 0 && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setStatusFilter('todos')
                        setDateFrom('')
                        setDateTo('')
                        setMinPrice('')
                        setMaxPrice('')
                      }}
                    >
                      Limpiar Filtros
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-all border-l-4 border-l-blue-500" data-testid={`order-card-${order.id}`}>
                  <CardContent className="p-6">
                    {/* Header del Pedido */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900" data-testid={`order-number-${order.id}`}>{order.order_number}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end" data-testid={`order-status-badges-${order.id}`}>
                        {getStatusBadge(order.status, order.payment_status)}
                        <span data-testid={`payment-badge-${order.id}`}>
                        {getPaymentBadge(order.payment_status)}
                        </span>
                      </div>
                    </div>

                    {/* Mensaje de Estado cuando está Pagado */}
                    {order.payment_status === 'pagado' && (
                      <div className={`mb-4 rounded-lg p-3 border-2 ${
                        order.status === 'entregado' 
                          ? 'bg-green-50 border-green-200' 
                          : order.status === 'en_preparacion' || order.status === 'preparando'
                          ? 'bg-purple-50 border-purple-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}>
                        {order.status === 'entregado' ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <p className="text-sm font-semibold text-green-800">
                              ✅ Tu pedido ha sido ENTREGADO
                            </p>
                          </div>
                        ) : order.status === 'en_preparacion' || order.status === 'preparando' ? (
                          <div className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-purple-600" />
                            <p className="text-sm font-semibold text-purple-800">
                              📦 Tu pedido está EN PREPARACIÓN - Te notificaremos cuando esté listo
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                            <p className="text-sm font-semibold text-blue-800">
                              💳 Pago confirmado - Tu pedido está siendo procesado
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mensaje cuando está Pendiente de Pago */}
                    {order.payment_status === 'pendiente' && (
                      <div className="mb-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-yellow-600" />
                          <p className="text-sm font-semibold text-yellow-800">
                            ⏳ PENDIENTE DE PAGO - Esperando confirmación del pago
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Items del Pedido */}
                    {order.items && order.items.length > 0 && (
                      <div className="mb-4 bg-gray-50 rounded-lg p-4">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Productos ({order.items.length})</p>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between bg-white rounded-lg p-2 border">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.product_name}</p>
                                <p className="text-xs text-gray-500">Cant: {item.quantity} × {formatPrice(item.unit_price)}</p>
                              </div>
                              <p className="text-sm font-bold text-gray-900 ml-2">
                                {formatPrice(item.subtotal)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notas del pedido */}
                    {order.notes && (
                      <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Notas</p>
                        <p className="text-sm text-gray-700">{order.notes}</p>
                      </div>
                    )}

                    {/* Resumen Financiero */}
                    <div className="flex items-center justify-between pt-4 border-t" data-testid="order-totals">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600" data-testid="order-subtotal">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          <span>Subtotal: {formatPrice(order.subtotal)}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex items-center gap-2 text-sm text-green-600" data-testid="order-discount">
                            <span>Descuento: -{formatPrice(order.discount)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2" data-testid="order-total">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <span className="text-lg font-bold text-gray-900">
                            Total: {formatPrice(order.total)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Botones de Acción */}
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handlePrintOrder(order)}
                          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                          title="Imprimir o descargar PDF del pedido"
                          data-testid="print-order-button"
                        >
                          <Printer className="w-4 h-4" />
                          <span className="hidden sm:inline">Imprimir / PDF</span>
                          <span className="sm:hidden">PDF</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

