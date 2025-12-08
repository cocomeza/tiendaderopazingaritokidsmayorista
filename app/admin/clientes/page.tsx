'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Eye,
  Download,
  Trash2,
  Ban,
  Home,
  LogOut,
  ArrowLeft,
  User,
  Building2,
  ShoppingBag,
  DollarSign,
  FileText,
  Loader2,
  Printer
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Customer {
  id: string
  email: string
  full_name: string
  phone: string
  address: string
  company_name?: string
  cuit?: string
  billing_address?: string
  locality?: string
  sales_type?: string
  ages?: string
  is_active: boolean
  created_at: string
  last_login: string
  ordersCount?: number
  totalSpent?: number
  paidOrdersCount?: number
}

interface OrderSummary {
  id: string
  order_number: string
  status: string
  payment_status: string
  total: number
  created_at: string
  items: { id: string; product_name: string; quantity: number }[]
}

export default function AdminClientes() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Customer | null>(null)
  const [permanentDeleteMode, setPermanentDeleteMode] = useState(false)
  const [showActiveOnly, setShowActiveOnly] = useState(false)
const [customerOrders, setCustomerOrders] = useState<OrderSummary[] | null>(null)
const [loadingOrders, setLoadingOrders] = useState(false)
const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null)
const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null)


  useEffect(() => {
    loadCustomers()
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

  const loadCustomers = async () => {
    try {
      // Cargar todos los perfiles y filtrar clientes (no admins) en JavaScript
      // Esto es más robusto si algunos registros tienen is_admin como null
      const { data: customersData, error: customersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (customersError) {
        console.error('Error cargando clientes:', customersError)
        toast.error('Error al cargar clientes: ' + customersError.message)
        return
      }

      // Filtrar solo clientes, excluyendo administradores
      const clientsOnly = (customersData || []).filter(
        profile => !profile.is_admin || profile.is_admin === false
      )

      // Cargar estadísticas de pedidos para cada cliente
      const customersWithOrders = await Promise.all(
        clientsOnly.map(async (customer) => {
          const { count } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', customer.id)
          
          const { data: ordersData } = await supabase
            .from('orders')
            .select('total, payment_status')
            .eq('user_id', customer.id)
          
          const totalOrders = count || 0
          const totalSpent = ordersData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0
          const paidOrders = ordersData?.filter(order => order.payment_status === 'pagado').length || 0

          return {
            ...customer,
            ordersCount: totalOrders,
            totalSpent,
            paidOrdersCount: paidOrders
          }
        })
      )

      console.log('Clientes cargados:', customersWithOrders.length)
      
      setCustomers(customersWithOrders as Customer[])
    } catch (error) {
      console.error('Error general:', error)
      toast.error('Error inesperado al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCustomerOrders = async (
    customer: Customer,
    setSelectedCustomer: (customer: Customer | null) => void,
    setCustomerOrders: (orders: OrderSummary[] | null) => void,
    setLoadingOrders: (value: boolean) => void,
    setUpdatingStatusId: (value: string | null) => void,
    setUpdatingPaymentId: (value: string | null) => void
  ) => {
    setSelectedCustomer(customer)
    setCustomerOrders(null)
    setLoadingOrders(true)
    setUpdatingStatusId(null)
    setUpdatingPaymentId(null)

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, status, payment_status, total, created_at')
        .eq('user_id', customer.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error cargando pedidos:', error)
        toast.error('No se pudieron cargar los pedidos del cliente.')
        return
      }

      const ordersWithItems = await Promise.all(
        (data || []).map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('id, product_name, quantity')
            .eq('order_id', order.id)

          return {
            ...order,
            items: items || []
          } as OrderSummary
        })
      )

      setCustomerOrders(ordersWithItems)
    } catch (error) {
      console.error('Error general cargando pedidos:', error)
      toast.error('Error inesperado al cargar pedidos del cliente.')
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string, options?: { keepModalOpen?: boolean }) => {
    try {
      setUpdatingStatusId(orderId)
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) {
        console.error('Error actualizando estado:', error)
        toast.error('No se pudo actualizar el estado del pedido')
        return
      }

      toast.success('Estado del pedido actualizado')
      
      // Recargar los pedidos para obtener datos actualizados
      if (selectedCustomer) {
        await handleOpenCustomerOrders(
          selectedCustomer,
          setSelectedCustomer,
          setCustomerOrders,
          setLoadingOrders,
          setUpdatingStatusId,
          setUpdatingPaymentId
        )
      }

      if (!options?.keepModalOpen) {
        setSelectedCustomer(null)
      }
    } catch (error) {
      console.error('Error actualizando estado del pedido:', error)
      toast.error('Error inesperado al actualizar el estado del pedido')
    } finally {
      setUpdatingStatusId(null)
    }
  }

  const handleUpdatePaymentStatus = async (orderId: string, newStatus: string, options?: { keepModalOpen?: boolean }) => {
    try {
      setUpdatingPaymentId(orderId)
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newStatus })
        .eq('id', orderId)

      if (error) {
        console.error('Error actualizando estado de pago:', error)
        toast.error('No se pudo actualizar el estado de pago')
        return
      }

      toast.success('Estado de pago actualizado')
      
      // Recargar los pedidos para obtener datos actualizados
      if (selectedCustomer) {
        await handleOpenCustomerOrders(
          selectedCustomer,
          setSelectedCustomer,
          setCustomerOrders,
          setLoadingOrders,
          setUpdatingStatusId,
          setUpdatingPaymentId
        )
      }

      if (!options?.keepModalOpen) {
        setSelectedCustomer(null)
      }
    } catch (error) {
      console.error('Error actualizando estado de pago:', error)
      toast.error('Error inesperado al actualizar el estado de pago')
    } finally {
      setUpdatingPaymentId(null)
    }
  }

  const filteredCustomers = customers.filter((customer) => {
    // Filtrar por estado activo/inactivo (si is_active es null, considerar como activo)
    const isActive = customer.is_active !== false // null o true = activo
    const matchesActiveStatus = showActiveOnly ? isActive : true
    
    const matchesSearch =
      searchTerm.trim() === '' ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.full_name && customer.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.phone && customer.phone.includes(searchTerm))
    
    return matchesActiveStatus && matchesSearch
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handlePrintOrder = async (order: OrderSummary, customer: Customer) => {
    try {
      // Cargar datos completos del pedido
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_name,
            quantity,
            unit_price,
            subtotal,
            total_price
          )
        `)
        .eq('id', order.id)
        .single()

      if (orderError || !orderData) {
        toast.error('Error al cargar los datos del pedido para imprimir')
        return
      }

      // Crear ventana de impresión con el contenido del pedido
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        toast.error('Por favor, permite ventanas emergentes para imprimir')
        return
      }

      const printContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pedido ${orderData.order_number}</title>
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
            <p style="font-size: 22px; font-weight: bold; color: #7c3aed; margin-bottom: 10px;">📋 ORDEN DE COMPRA N°: ${orderData.order_number}</p>
            <p>Pedido N°: <strong>${orderData.order_number}</strong></p>
            <p>Fecha: ${new Date(orderData.created_at).toLocaleDateString('es-AR', {
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
              <p><strong>Nombre/Razón Social:</strong> ${customer.full_name || customer.company_name || 'No disponible'}</p>
              <p><strong>Email:</strong> ${customer.email || 'No disponible'}</p>
              <p><strong>CUIT:</strong> ${customer.cuit || 'No disponible'}</p>
              <p><strong>Dirección de Facturación:</strong> ${customer.billing_address || customer.address || 'No disponible'}</p>
              ${customer.locality ? `<p><strong>Localidad:</strong> ${customer.locality}</p>` : ''}
            </div>
            <div class="info-box">
              <h3>Información del Pedido</h3>
              <p><strong>Total de productos:</strong> ${orderData.order_items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0}</p>
              <p><strong>Items diferentes:</strong> ${orderData.order_items?.length || 0}</p>
              <p><strong>Estado:</strong> ${orderData.status?.toUpperCase() || 'PENDIENTE'}</p>
              <p><strong>Estado de Pago:</strong> ${orderData.payment_status === 'pagado' ? 'PAGADO' : orderData.payment_status === 'rechazado' ? 'RECHAZADO' : 'PENDIENTE DE PAGO'}</p>
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
              ${orderData.order_items?.map((item: any) => `
                <tr>
                  <td>${item.product_name || 'Producto sin nombre'}</td>
                  <td>${item.quantity || 0}</td>
                  <td>${formatPrice(item.unit_price || 0)}</td>
                  <td><strong>${formatPrice(item.subtotal || item.total_price || 0)}</strong></td>
                </tr>
              `).join('') || '<tr><td colspan="4">No hay productos</td></tr>'}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>${formatPrice(orderData.subtotal || 0)}</span>
            </div>
            ${(orderData.discount || 0) > 0 ? `
              <div class="totals-row" style="color: #059669;">
                <span>Descuento:</span>
                <span>-${formatPrice(orderData.discount || 0)}</span>
              </div>
            ` : ''}
            <div class="totals-row">
              <span>TOTAL:</span>
              <span>${formatPrice(orderData.total || 0)}</span>
            </div>
          </div>

          ${orderData.notes ? `
            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 20px; border-radius: 4px;">
              <h3 style="margin-top: 0;">Notas del Pedido:</h3>
              <p>${orderData.notes}</p>
            </div>
          ` : ''}

          <div class="footer">
            <p>Zingarito Kids - Mayorista de Ropa Infantil</p>
            <p>Este documento fue generado el ${new Date().toLocaleString('es-AR')}</p>
          </div>
        </body>
        </html>
      `

      printWindow.document.write(printContent)
      printWindow.document.close()
    } catch (error) {
      console.error('Error al imprimir pedido:', error)
      toast.error('Error al generar la impresión del pedido')
    }
  }

  const exportCustomers = () => {
    const csvContent = [
      ['Email', 'Nombre', 'Teléfono', 'Empresa', 'CUIT', 'Dirección Facturación', 'Localidad', 'Tipo Venta', 'Edades', 'Dirección', 'Fecha Registro'],
      ...filteredCustomers.map(customer => [
        customer.email,
        customer.full_name || '',
        customer.phone || '',
        customer.company_name || '',
        customer.cuit || '',
        customer.billing_address || '',
        customer.locality || '',
        customer.sales_type === 'local' ? 'Local Físico' : customer.sales_type === 'showroom' ? 'Showroom' : customer.sales_type === 'online' ? 'Venta Online' : customer.sales_type === 'empezando' ? 'Por Iniciar' : '',
        customer.ages || '',
        customer.address || '',
        formatDate(customer.created_at)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'clientes-zingarito.csv'
    a.click()
  }

  const handleDeleteCustomer = async () => {
    if (!deleteConfirm) return

    try {
      // Verificar que el usuario es admin antes de continuar
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('No estás autenticado')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (profileError || !profile?.is_admin) {
        toast.error('No tienes permisos de administrador')
        return
      }

      if (permanentDeleteMode) {
        // Primero verificar si hay pedidos relacionados
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('id')
          .eq('user_id', deleteConfirm.id)
          .limit(1)

        if (ordersError) {
          console.error('Error verificando pedidos:', ordersError)
        }

        // Si hay pedidos, informar al usuario pero continuar con la eliminación
        // (la constraint debería manejar el cascade, pero si falla, mostramos un mensaje claro)
        if (ordersData && ordersData.length > 0) {
          const { count } = await supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', deleteConfirm.id)

          toast.info(`El cliente tiene ${count || ordersData.length} pedido(s). Estos serán eliminados automáticamente.`)
        }

        // Eliminación permanente - esto también eliminará el usuario de auth.users por cascade
        // y todos los pedidos relacionados si la constraint tiene ON DELETE CASCADE
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', deleteConfirm.id)

        if (error) {
          console.error('Error eliminando cliente permanentemente:', JSON.stringify(error, null, 2))
          
          if (error.code === 'PGRST116' || error.message?.includes('permission denied') || error.message?.includes('policy')) {
            toast.error('Error de permisos: No tienes permisos para eliminar este perfil. Verifica las políticas RLS en Supabase.')
          } else if (error.message?.includes('foreign key constraint') || error.message?.includes('violates foreign key')) {
            toast.error('No se puede eliminar el cliente porque tiene pedidos asociados. La constraint de foreign key no está configurada con CASCADE. Por favor, aplica la migración 026_fix_profiles_delete_cascade.sql en Supabase.')
          } else {
            toast.error('Error al eliminar el cliente: ' + (error.message || JSON.stringify(error)))
          }
          return
        }

        // Actualizar la lista local removiendo el cliente
        setCustomers(customers.filter(c => c.id !== deleteConfirm.id))
        toast.success(`Cliente ${deleteConfirm.full_name || deleteConfirm.email} eliminado permanentemente`)
      } else {
        // Desactivación (soft delete)
        const { error, data } = await supabase
          .from('profiles')
          .update({ is_active: false })
          .eq('id', deleteConfirm.id)
          .select()

        if (error) {
          console.error('Error completo desactivando cliente:', JSON.stringify(error, null, 2))
          console.error('Código:', error.code)
          console.error('Mensaje:', error.message)
          console.error('Detalles:', error.details)
          console.error('Hint:', error.hint)
          
          // Mensaje más específico según el tipo de error
          if (error.code === 'PGRST116' || error.message?.includes('permission denied') || error.message?.includes('policy')) {
            toast.error('Error de permisos: No tienes permisos para actualizar este perfil. Verifica las políticas RLS en Supabase.')
          } else {
            toast.error('Error al desactivar el cliente: ' + (error.message || JSON.stringify(error)))
          }
          return
        }

        if (!data || data.length === 0) {
          toast.error('No se pudo actualizar el cliente. Verifica que el ID sea correcto.')
          return
        }

        // Actualizar la lista local
        setCustomers(customers.map(c => 
          c.id === deleteConfirm.id ? { ...c, is_active: false } : c
        ))
        toast.success(`Cliente ${deleteConfirm.full_name || deleteConfirm.email} desactivado correctamente`)
      }

      setDeleteConfirm(null)
      setPermanentDeleteMode(false)
    } catch (error: any) {
      console.error('Error general:', error)
      toast.error('Error inesperado: ' + (error?.message || 'Error desconocido'))
    }
  }

  const handleSendEmail = () => {
    if (!selectedCustomer) return
    
    // Abrir el cliente de email con el email del cliente
    window.location.href = `mailto:${selectedCustomer.email}`
    toast.success('Abriendo cliente de email...')
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
          {/* Botones de navegación en la parte superior */}
          <div className="flex justify-between items-center mb-4 gap-3">
            <Button 
              variant="ghost"
              onClick={() => router.push('/admin')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Admin
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="ghost"
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button 
                variant="ghost"
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
              <p className="text-gray-600 mt-1">{customers.length} clientes registrados</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={exportCustomers}
                className="w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showActiveOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowActiveOnly(!showActiveOnly)}
                className="whitespace-nowrap"
              >
                {showActiveOnly ? 'Solo Activos' : 'Todos'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300 group">
              <CardContent className="p-4 sm:p-6">
                {/* Header con avatar y acciones */}
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-purple-200">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                        {customer.full_name || 'Sin nombre'}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">{customer.email}</p>
                      {customer.company_name && (
                        <p className="text-xs text-purple-600 font-medium truncate mt-1">
                          🏢 {customer.company_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                  <Button 
                    size="sm" 
                      variant="ghost"
                    onClick={() => setSelectedCustomer(customer)}
                      className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600"
                      title="Ver detalles"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setDeleteConfirm(customer)}
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                      title="Eliminar cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Información del cliente - Resumen */}
                <div className="space-y-2 text-sm mb-4">
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 rounded-lg p-2">
                      <Phone className="w-4 h-4 flex-shrink-0 text-purple-600" />
                      <span className="break-all text-xs">{customer.phone}</span>
                    </div>
                  )}
                  
                  {customer.locality && (
                    <div className="flex items-start gap-2 text-gray-600 bg-indigo-50 rounded-lg p-2">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-indigo-600" />
                      <span className="line-clamp-1 text-xs">{customer.locality}</span>
                    </div>
                  )}

                  {customer.sales_type && (
                    <div className="flex items-center gap-2 text-gray-600 bg-cyan-50 rounded-lg p-2">
                      <ShoppingBag className="w-4 h-4 flex-shrink-0 text-cyan-600" />
                      <span className="text-xs capitalize">
                        {customer.sales_type === 'local' && 'Local Físico'}
                        {customer.sales_type === 'showroom' && 'Showroom'}
                        {customer.sales_type === 'online' && 'Venta Online'}
                        {customer.sales_type === 'empezando' && 'Por Iniciar'}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-500 bg-blue-50 rounded-lg p-2">
                    <Calendar className="w-4 h-4 flex-shrink-0 text-blue-600" />
                    <span className="text-xs break-words">{formatDate(customer.created_at)}</span>
                  </div>
                </div>

                {/* Información de pedidos */}
                {(customer.ordersCount !== undefined && customer.ordersCount > 0) && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3 text-purple-600" />
                        <span className="text-gray-600">Pedidos:</span>
                        <span className="font-bold text-purple-700">{customer.ordersCount}</span>
                      </div>
                      {customer.totalSpent !== undefined && customer.totalSpent > 0 && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-green-600" />
                          <span className="text-gray-600">Total:</span>
                          <span className="font-bold text-green-700">{formatPrice(customer.totalSpent)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer con badge y botón */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-3 border-t">
                  <Badge 
                    variant="outline" 
                    className={`self-start sm:self-auto ${
                      customer.is_active !== false
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {customer.is_active !== false ? '✓ Cliente Activo' : '✗ Cliente Inactivo'}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full sm:w-auto hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                    onClick={() => handleOpenCustomerOrders(customer, setSelectedCustomer, setCustomerOrders, setLoadingOrders, setUpdatingStatusId, setUpdatingPaymentId)}
                  >
                    <ShoppingBag className="w-4 h-4 mr-1" />
                    {customer.ordersCount ? `${customer.ordersCount} Pedido${customer.ordersCount > 1 ? 's' : ''}` : 'Ver Pedidos'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <Card className="bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 border-2 border-purple-200">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-purple-100">
                <Users className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
              No se encontraron clientes
            </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                No hay clientes que coincidan con tu búsqueda actual. Intenta ajustar los filtros o vuelve a intentar más tarde.
              </p>
              {searchTerm && (
                <Button 
                  variant="outline"
                  onClick={() => setSearchTerm('')}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  Limpiar búsqueda
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ban className="w-5 h-5 text-red-500" />
                  Confirmar Eliminación
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setDeleteConfirm(null)}
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-semibold mb-2">
                  {permanentDeleteMode 
                    ? '⚠️ Eliminación Permanente' 
                    : '¿Desactivar o eliminar este cliente?'}
                </p>
                <p className="text-sm text-red-700 mb-3">
                  {permanentDeleteMode ? (
                    <>
                      Esta acción <strong>eliminará permanentemente</strong> la cuenta del cliente <strong>{deleteConfirm.full_name || deleteConfirm.email}</strong> de la base de datos y <strong>no se puede deshacer</strong>. Se perderán todos los datos relacionados.
                    </>
                  ) : (
                    <>
                      Selecciona cómo deseas proceder con el cliente <strong>{deleteConfirm.full_name || deleteConfirm.email}</strong>:
                    </>
                  )}
                </p>
                <div className="mt-3 text-sm text-gray-600 mb-3">
                  <p><strong>Email:</strong> {deleteConfirm.email}</p>
                  {deleteConfirm.full_name && (
                    <p><strong>Nombre:</strong> {deleteConfirm.full_name}</p>
                  )}
                </div>
                
                {!permanentDeleteMode && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                    <div className="flex items-start gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="permanent-delete"
                        checked={permanentDeleteMode}
                        onChange={(e) => setPermanentDeleteMode(e.target.checked)}
                        className="mt-1"
                      />
                      <label htmlFor="permanent-delete" className="text-sm font-medium text-yellow-800 cursor-pointer">
                        Eliminar permanentemente (no recomendado)
                      </label>
                    </div>
                    <p className="text-xs text-yellow-700 ml-6">
                      Por defecto se desactiva el cliente (se mantienen los datos para historial). 
                      Solo marca esto si realmente quieres eliminar todos los datos del cliente.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  className={`flex-1 ${permanentDeleteMode ? 'bg-red-700 hover:bg-red-800' : 'bg-orange-600 hover:bg-orange-700'}`}
                  onClick={handleDeleteCustomer}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">
                    {permanentDeleteMode ? 'Confirmar Eliminación Permanente' : 'Desactivar Cliente'}
                  </span>
                  <span className="sm:hidden">
                    {permanentDeleteMode ? 'Eliminar' : 'Desactivar'}
                  </span>
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setDeleteConfirm(null)
                    setPermanentDeleteMode(false)
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.full_name || selectedCustomer.email}</h2>
                <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedCustomer(null)} className="h-8 w-8 p-0 rounded-full">
                ✕
              </Button>
            </div>

            <div className="px-6 py-4 border-b grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p className="font-semibold text-gray-800">Teléfono</p>
                <p>{selectedCustomer.phone || 'Sin teléfono'}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Dirección</p>
                <p>{selectedCustomer.address || 'Sin dirección'}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Pedidos recientes</h3>
                {loadingOrders && (
                  <span className="text-xs text-gray-500 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Cargando pedidos...
                  </span>
                )}
              </div>

              {!loadingOrders && customerOrders && customerOrders.length === 0 && (
                <Card className="bg-gray-50 border border-gray-200">
                  <CardContent className="py-10 text-center text-gray-500">
                    Este cliente todavía no tiene pedidos registrados.
                  </CardContent>
                </Card>
              )}

              {!loadingOrders && customerOrders && customerOrders.length > 0 && (
                <div className="space-y-3">
                  {customerOrders.map((order) => {
                    const getStatusBadge = (status: string) => {
                      const statusMap: Record<string, { label: string; color: string; bg: string }> = {
                        pendiente: { label: 'PENDIENTE', color: 'text-yellow-700', bg: 'bg-yellow-50' },
                        confirmado: { label: 'CONFIRMADO', color: 'text-blue-700', bg: 'bg-blue-50' },
                        preparando: { label: 'PREPARANDO', color: 'text-purple-700', bg: 'bg-purple-50' },
                        en_preparacion: { label: 'EN PREPARACIÓN', color: 'text-purple-700', bg: 'bg-purple-50' },
                        enviado: { label: 'ENVIADO', color: 'text-indigo-700', bg: 'bg-indigo-50' },
                        entregado: { label: 'ENTREGADO', color: 'text-green-700', bg: 'bg-green-50' },
                        cancelado: { label: 'CANCELADO', color: 'text-red-700', bg: 'bg-red-50' }
                      }
                      const statusInfo = statusMap[status] || { label: status.toUpperCase(), color: 'text-gray-700', bg: 'bg-gray-50' }
                      return (
                        <Badge className={`${statusInfo.bg} ${statusInfo.color} border`}>
                          {statusInfo.label}
                        </Badge>
                      )
                    }
                    
                    const getPaymentBadge = (paymentStatus: string) => {
                      if (paymentStatus === 'pagado') {
                        return <Badge className="bg-green-50 text-green-700 border border-green-200">PAGADO</Badge>
                      } else if (paymentStatus === 'rechazado') {
                        return <Badge className="bg-red-50 text-red-700 border border-red-200">RECHAZADO</Badge>
                      }
                      return <Badge className="bg-yellow-50 text-yellow-700 border border-yellow-200">PENDIENTE DE PAGO</Badge>
                    }
                    
                    return (
                    <Card key={order.id} className="border border-gray-200 hover:border-purple-300 transition">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <p className="text-sm text-gray-500">Número de pedido</p>
                            <p className="font-semibold text-gray-900">{order.order_number}</p>
                            <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString('es-AR')}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase">Total</p>
                            <p className="text-lg font-bold text-purple-600">{formatPrice(order.total)}</p>
                          </div>
                        </div>
                        
                        {/* Badges de estado */}
                        <div className="flex flex-wrap gap-2">
                          {getStatusBadge(order.status)}
                          {getPaymentBadge(order.payment_status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs uppercase tracking-wide text-gray-500">Estado</Label>
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleUpdateOrderStatus(order.id, value, { keepModalOpen: true })}
                              disabled={updatingStatusId === order.id}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {order.payment_status === 'pagado' ? (
                                  <>
                                    <SelectItem value="en_preparacion">A) EN PREPARACIÓN</SelectItem>
                                    <SelectItem value="preparando">A) EN PREPARACIÓN (alt)</SelectItem>
                                    <SelectItem value="enviado">Enviado</SelectItem>
                                    <SelectItem value="entregado">B) ENTREGADO</SelectItem>
                                    <SelectItem value="cancelado">Cancelado</SelectItem>
                                  </>
                                ) : (
                                  <>
                                    <SelectItem value="pendiente">PENDIENTE DE PAGO</SelectItem>
                                    <SelectItem value="confirmado">Confirmado</SelectItem>
                                    <SelectItem value="preparando">Preparando</SelectItem>
                                    <SelectItem value="en_preparacion">EN PREPARACIÓN</SelectItem>
                                    <SelectItem value="enviado">Enviado</SelectItem>
                                    <SelectItem value="entregado">Entregado</SelectItem>
                                    <SelectItem value="cancelado">Cancelado</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs uppercase tracking-wide text-gray-500">Pago</Label>
                            <Select
                              value={order.payment_status}
                              onValueChange={(value) => handleUpdatePaymentStatus(order.id, value, { keepModalOpen: true })}
                              disabled={updatingPaymentId === order.id}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pendiente">PENDIENTE DE PAGO</SelectItem>
                                <SelectItem value="pagado">PAGADO</SelectItem>
                                <SelectItem value="rechazado">Rechazado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {order.items.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                            <p className="text-xs font-semibold text-gray-600">Productos</p>
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between text-xs text-gray-600">
                                <span>{item.product_name}</span>
                                <span className="font-medium">x{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Botón de impresión */}
                        <div className="pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handlePrintOrder(order, selectedCustomer)}
                          >
                            <Printer className="w-4 h-4 mr-2" />
                            Imprimir Pedido
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                Cerrar
              </Button>
              <Button variant="default" onClick={() => router.push(`/admin/pedidos?cliente=${selectedCustomer.id}`)}>
                Ver todos los pedidos
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
