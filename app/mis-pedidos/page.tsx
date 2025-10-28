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
  XCircle
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
}

export default function MisPedidosPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/mis-pedidos')
        return
      }
      loadOrders()
    }
  }, [authLoading, isAuthenticated])

  const loadOrders = async () => {
    try {
      if (!user) return

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error cargando pedidos:', error)
        toast.error('Error al cargar tus pedidos')
        return
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

      // Agrupar items por pedido
      const ordersWithItems = (data || []).map(order => ({
        ...order,
        items: allItems.filter(item => item.order_id === order.id)
      }))

      setOrders(ordersWithItems)
    } catch (error) {
      console.error('Error general:', error)
      toast.error('Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; bg: string; label: string; icon: any }> = {
      pendiente: { color: 'yellow', bg: 'bg-yellow-50', label: 'Pendiente', icon: Package },
      confirmado: { color: 'blue', bg: 'bg-blue-50', label: 'Confirmado', icon: CheckCircle },
      preparando: { color: 'purple', bg: 'bg-purple-50', label: 'Preparando', icon: Package },
      enviado: { color: 'indigo', bg: 'bg-indigo-50', label: 'Enviado', icon: Truck },
      entregado: { color: 'green', bg: 'bg-green-50', label: 'Entregado', icon: CheckCircle },
      cancelado: { color: 'red', bg: 'bg-red-50', label: 'Cancelado', icon: XCircle }
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
      pendiente: { color: 'yellow', bg: 'bg-yellow-50', label: 'Pendiente' },
      pagado: { color: 'green', bg: 'bg-green-50', label: 'Pagado' },
      rechazado: { color: 'red', bg: 'bg-red-50', label: 'Rechazado' }
    }
    
    const config = paymentMap[status] || paymentMap.pendiente
    return (
      <Badge className={`${config.bg} text-${config.color}-700 border-${config.color}-200`}>
        {config.label}
      </Badge>
    )
  }

  const filteredOrders = orders.filter(order => {
    // Filtro por estado
    if (statusFilter !== 'todos' && order.status !== statusFilter) {
      return false
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
              <p className="text-gray-600 mt-1">{stats.total} {stats.total === 1 ? 'pedido' : 'pedidos'} en tu historial</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel de Filtros */}
          <Card className="h-fit sticky top-4">
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
                    <SelectItem value="preparando">Preparando</SelectItem>
                    <SelectItem value="enviado">Enviado</SelectItem>
                    <SelectItem value="entregado">Entregado</SelectItem>
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
          <div className="lg:col-span-3 space-y-4">
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {orders.length === 0 ? 'No tienes pedidos aún' : 'No hay pedidos que coincidan con los filtros'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {orders.length === 0 
                      ? 'Cuando realices tu primer pedido, aparecerá aquí'
                      : 'Intenta ajustar los filtros para ver tus pedidos'}
                  </p>
                  {orders.length === 0 && (
                    <Link href="/productos">
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        Ver Productos
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-all border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    {/* Header del Pedido */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{order.order_number}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {getStatusBadge(order.status)}
                        {getPaymentBadge(order.payment_status)}
                      </div>
                    </div>

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
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          <span>Subtotal: {formatPrice(order.subtotal)}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <span>Descuento: -{formatPrice(order.discount)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <span className="text-lg font-bold text-gray-900">
                            Total: {formatPrice(order.total)}
                          </span>
                        </div>
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

