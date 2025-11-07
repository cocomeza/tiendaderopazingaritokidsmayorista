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
  FileText
} from 'lucide-react'
import { useRouter } from 'next/navigation'

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

      console.log('Clientes cargados:', clientsOnly.length)
      console.log('Datos de primer cliente:', clientsOnly[0])
      
      setCustomers(clientsOnly)
    } catch (error) {
      console.error('Error general:', error)
      toast.error('Error inesperado al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    // Filtrar por estado activo/inactivo (si is_active es null, considerar como activo)
    const isActive = customer.is_active !== false // null o true = activo
    const matchesActiveStatus = showActiveOnly ? isActive : true
    
    const matchesSearch = searchTerm.trim() === '' || 
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.full_name && customer.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.phone && customer.phone.includes(searchTerm))
    
    return matchesActiveStatus && matchesSearch
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR')
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
        // Eliminación permanente - esto también eliminará el usuario de auth.users por cascade
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', deleteConfirm.id)

        if (error) {
          console.error('Error eliminando cliente permanentemente:', JSON.stringify(error, null, 2))
          
          if (error.code === 'PGRST116' || error.message?.includes('permission denied') || error.message?.includes('policy')) {
            toast.error('Error de permisos: No tienes permisos para eliminar este perfil. Verifica las políticas RLS en Supabase.')
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
                    onClick={() => {
                      router.push(`/admin/pedidos?cliente=${customer.id}`)
                    }}
                  >
                    Ver Pedidos
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

      {/* Modal de Detalle del Cliente */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto my-4">
            <CardHeader className="sticky top-0 bg-white z-10 border-b">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-lg sm:text-xl">Detalle del Cliente</span>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setSelectedCustomer(null)}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6 py-6">
              {/* Información de Contacto */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Información de Contacto
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                    <p className="text-gray-900 font-medium break-all mt-1">
                      {selectedCustomer.email || <span className="text-gray-400 italic">No proporcionado</span>}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Teléfono</label>
                    <p className="text-gray-900 font-medium mt-1">
                      {selectedCustomer.phone || <span className="text-gray-400 italic">No proporcionado</span>}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Información Personal */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Información Personal
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre Completo</label>
                    <p className="text-gray-900 font-medium mt-1">
                      {selectedCustomer.full_name || <span className="text-gray-400 italic">No proporcionado</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Datos de la Empresa */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Datos de la Empresa
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre de la Empresa</label>
                    <p className="text-gray-900 font-medium mt-1">
                      {selectedCustomer.company_name || <span className="text-gray-400 italic">No proporcionado</span>}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">CUIT</label>
                    <p className="text-gray-900 font-medium mt-1">
                      {selectedCustomer.cuit ? (
                        selectedCustomer.cuit.length === 11 
                          ? `${selectedCustomer.cuit.slice(0, 2)}-${selectedCustomer.cuit.slice(2, 10)}-${selectedCustomer.cuit.slice(10)}`
                          : selectedCustomer.cuit
                      ) : <span className="text-gray-400 italic">No proporcionado</span>}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Dirección de Facturación</label>
                    <p className="text-gray-900 font-medium mt-1">
                      {selectedCustomer.billing_address || <span className="text-gray-400 italic">No proporcionado</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dirección de Envío */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-100">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Dirección de Envío
                </h3>
                <div>
                  <p className="text-gray-900 font-medium">
                    {selectedCustomer.address || <span className="text-gray-400 italic">No proporcionado</span>}
                  </p>
                </div>
              </div>

              {/* Información del Negocio */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Información del Negocio
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Localidad</label>
                    <p className="text-gray-900 font-medium mt-1">
                      {selectedCustomer.locality || <span className="text-gray-400 italic">No proporcionado</span>}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo de Venta</label>
                    <p className="text-gray-900 font-medium mt-1">
                      {selectedCustomer.sales_type ? (
                        selectedCustomer.sales_type === 'local' ? 'Local Físico' :
                        selectedCustomer.sales_type === 'showroom' ? 'Showroom' :
                        selectedCustomer.sales_type === 'online' ? 'Venta Online' :
                        selectedCustomer.sales_type === 'empezando' ? 'Por Iniciar' :
                        selectedCustomer.sales_type
                      ) : <span className="text-gray-400 italic">No proporcionado</span>}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Edades con las que trabaja</label>
                    <p className="text-gray-900 font-medium mt-1">
                      {selectedCustomer.ages || <span className="text-gray-400 italic">No proporcionado</span>}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Metadatos */}
              <div className="flex items-center justify-between pt-4 border-t">
              <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Registrado el</label>
                  <p className="text-gray-900 font-medium">{formatDate(selectedCustomer.created_at)}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={selectedCustomer.is_active !== false
                    ? "bg-green-50 text-green-700 border-green-200" 
                    : "bg-red-50 text-red-700 border-red-200"
                  }
                >
                  {selectedCustomer.is_active !== false ? '✓ Cliente Activo' : '✗ Cliente Inactivo'}
                </Badge>
              </div>

              {/* Acciones */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button 
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  onClick={handleSendEmail}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  )
}
