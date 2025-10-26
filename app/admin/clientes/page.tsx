'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client-fixed'
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Eye,
  Download
} from 'lucide-react'

interface Customer {
  id: string
  email: string
  full_name: string
  phone: string
  address: string
  created_at: string
  last_login: string
}

export default function AdminClientes() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      const { data: customersData, error: customersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (customersError) {
        console.error('Error cargando clientes:', customersError)
        return
      }

      setCustomers(customersData || [])
    } catch (error) {
      console.error('Error general:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.full_name && customer.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.phone && customer.phone.includes(searchTerm))
    return matchesSearch
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR')
  }

  const exportCustomers = () => {
    const csvContent = [
      ['Email', 'Nombre', 'Teléfono', 'Dirección', 'Fecha Registro'],
      ...filteredCustomers.map(customer => [
        customer.email,
        customer.full_name || '',
        customer.phone || '',
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
              <p className="text-gray-600 mt-1">{customers.length} clientes registrados</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={exportCustomers}
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
          <div className="flex gap-4">
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
          </div>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {customer.full_name || 'Sin nombre'}
                      </h3>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2 text-sm">
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  
                  {customer.address && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{customer.address}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Registrado: {formatDate(customer.created_at)}</span>
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <Badge variant="outline">
                    Cliente Activo
                  </Badge>
                  <Button size="sm" variant="outline">
                    Ver Pedidos
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No se encontraron clientes
            </h3>
            <p className="text-gray-500">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        )}
      </div>

      {/* Modal de Detalle del Cliente */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Detalle del Cliente
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSelectedCustomer(null)}
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{selectedCustomer.email}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Nombre Completo</label>
                <p className="text-gray-900">{selectedCustomer.full_name || 'No especificado'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Teléfono</label>
                <p className="text-gray-900">{selectedCustomer.phone || 'No especificado'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Dirección</label>
                <p className="text-gray-900">{selectedCustomer.address || 'No especificada'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Fecha de Registro</label>
                <p className="text-gray-900">{formatDate(selectedCustomer.created_at)}</p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1">
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Email
                </Button>
                <Button variant="outline" className="flex-1">
                  Ver Pedidos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
