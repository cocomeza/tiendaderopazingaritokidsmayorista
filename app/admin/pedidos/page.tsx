'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { 
  ShoppingBag, 
  Search, 
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  DollarSign,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  FileText,
  ArrowLeft,
  Home,
  LogOut,
  Mail,
  Phone
} from 'lucide-react'
import Link from 'next/link'

interface OrderItem {
  id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

interface Customer {
  id: string
  email: string
  full_name?: string
  phone?: string
}

interface Order {
  id: string
  order_number: string
  user_id: string
  status: string
  payment_status: string
  subtotal: number
  discount: number
  total: number
  notes?: string
  shipping_address?: string
  created_at: string
  updated_at: string
  customer?: Customer
  items?: OrderItem[]
}

export default function AdminPedidosPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(false)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [paymentFilter, setPaymentFilter] = useState<string>('todos')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Detalle del pedido seleccionado
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Sesión cerrada correctamente')
      router.push('/')
    } catch (error) {
      console.error('Error cerrando sesión:', error)
      toast.error('Error al cerrar sesión')
    }
  }

  const loadOrders = async () => {
    setLoadingOrders(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:profiles!user_id(id, email, full_name, phone)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error cargando pedidos:', error)
        toast.error('Error al cargar pedidos')
        return
      }

      // Para cada pedido, cargar sus items
      const ordersWithItems = await Promise.all(
        (data || []).map(async (order: any) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id)

          return {
            ...order,
            customer: order.customer,
            items: items || []
          }
        })
      )

      setOrders(ordersWithItems as Order[])
    } catch (error) {
      console.error('Error general:', error)
      toast.error('Error al cargar pedidos')
    } finally {
      setLoadingOrders(false)
      setLoading(false)
    }
  }

  const handleViewOrderDetails = async (order: Order) => {
    setSelectedOrder(order)
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) {
        toast.error('Error al actualizar estado del pedido')
        return
      }

      toast.success('Estado del pedido actualizado')
      loadOrders() // Recargar lista
      setSelectedOrder(null)
    } catch (error) {
      console.error('Error general:', error)
      toast.error('Error al actualizar pedido')
    }
  }

  const handleUpdatePaymentStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newStatus })
        .eq('id', orderId)

      if (error) {
        toast.error('Error al actualizar estado de pago')
        return
      }

      toast.success('Estado de pago actualizado')
      loadOrders() // Recargar lista
      setSelectedOrder(null)
    } catch (error) {
      console.error('Error general:', error)
      toast.error('Error al actualizar pago')
    }
  }

  const filteredOrders = orders.filter(order => {
    // Filtro por búsqueda
    if (searchTerm && !order.order_number.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Filtro por estado
    if (statusFilter !== 'todos' && order.status !== statusFilter) {
      return false
    }

    // Filtro por estado de pago
    if (paymentFilter !== 'todos' && order.payment_status !== paymentFilter) {
      return false
    }

    // Filtro por rango de fecha
    if (dateFrom && new Date(order.created_at) < new Date(dateFrom)) {
      return false
    }
    if (dateTo && new Date(order.created_at) > new Date(dateTo)) {
      return false
    }

    return true
  })

  const exportToCSV = () => {
    if (filteredOrders.length === 0) {
      toast.error('No hay pedidos para exportar')
      return
    }

    // Preparar datos para CSV
    const headers = ['Número Pedido', 'Fecha', 'Cliente', 'Email', 'Teléfono', 'Estado', 'Pago', 'Subtotal', 'Descuento', 'Total', 'Notas']
    
    const csvData = filteredOrders.map(order => ({
      'Número Pedido': order.order_number,
      'Fecha': new Date(order.created_at).toLocaleDateString('es-AR'),
      'Cliente': order.customer?.full_name || 'Sin nombre',
      'Email': order.customer?.email || '',
      'Teléfono': order.customer?.phone || '',
      'Estado': order.status,
      'Pago': order.payment_status,
      'Subtotal': order.subtotal,
      'Descuento': order.discount,
      'Total': order.total,
      'Notas': order.notes || ''
    }))

    // Convertir a CSV
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n')

    // Descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `pedidos_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Pedidos exportados correctamente')
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

  if (loading) {
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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
              <p className="text-gray-600 mt-1">{filteredOrders.length} {filteredOrders.length === 1 ? 'pedido' : 'pedidos'}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Admin
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Button onClick={handleSignOut} variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label>Buscar por número</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Número de pedido"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>Estado</Label>
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

              <div>
                <Label>Estado de Pago</Label>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="pagado">Pagado</SelectItem>
                    <SelectItem value="rechazado">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Desde</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div>
                <Label>Hasta</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => {
                setSearchTerm('')
                setStatusFilter('todos')
                setPaymentFilter('todos')
                setDateFrom('')
                setDateTo('')
              }}>
                Limpiar
              </Button>
              <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Pedidos */}
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No hay pedidos
                </h3>
                <p className="text-gray-500">
                  Los pedidos de los clientes aparecerán aquí
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                          <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{order.order_number}</h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.created_at).toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                            <User className="w-4 h-4" />
                            Cliente
                          </p>
                          <p className="font-medium">{order.customer?.full_name || 'Sin nombre'}</p>
                          <p className="text-sm text-gray-500">{order.customer?.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Total</p>
                          <p className="text-2xl font-bold text-purple-600">{formatPrice(order.total)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(order.status)}
                        {getPaymentBadge(order.payment_status)}
                      </div>
                    </div>

                    <Button onClick={() => handleViewOrderDetails(order)} variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Modal de Detalle del Pedido */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Detalle del Pedido</h2>
              <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
                <XCircle className="w-5 h-5" />
              </Button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Número de Pedido</h3>
                  <p className="text-lg font-bold text-purple-600">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Fecha</h3>
                  <p>{new Date(selectedOrder.created_at).toLocaleDateString('es-AR')}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Cliente</h3>
                  <p>{selectedOrder.customer?.full_name || 'Sin nombre'}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.customer?.email}</p>
                </div>
                {selectedOrder.customer?.phone && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Teléfono</h3>
                    <p>{selectedOrder.customer.phone}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div>
                    <Label>Estado del Pedido</Label>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value) => {
                        handleUpdateOrderStatus(selectedOrder.id, value)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                        <SelectItem value="preparando">Preparando</SelectItem>
                        <SelectItem value="enviado">Enviado</SelectItem>
                        <SelectItem value="entregado">Entregado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Estado de Pago</Label>
                    <Select
                      value={selectedOrder.payment_status}
                      onValueChange={(value) => {
                        handleUpdatePaymentStatus(selectedOrder.id, value)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="pagado">Pagado</SelectItem>
                        <SelectItem value="rechazado">Rechazado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Productos</h3>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-gray-500">Cant: {item.quantity} × {formatPrice(item.unit_price)}</p>
                          </div>
                          <p className="font-bold">{formatPrice(item.subtotal)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-purple-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-bold">{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento:</span>
                      <span className="font-bold">-{formatPrice(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-purple-600">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <Label>Notas del Pedido</Label>
                    <Textarea value={selectedOrder.notes} readOnly rows={3} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

