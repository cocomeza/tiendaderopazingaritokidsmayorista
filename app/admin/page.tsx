'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client-fixed'
import { Spotlight } from '@/components/ui/spotlight'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { CardHoverEffect } from '@/components/ui/card-hover-effect'
import { motion } from 'framer-motion'
import { Package, Users, TrendingUp, DollarSign, Plus, Settings, Edit, Trash2, Percent, ArrowLeft, LogOut, Home, ShoppingBag, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Stats {
  totalProducts: number
  activeProducts: number
  totalCustomers: number
  lowStockProducts: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    activeProducts: 0,
    totalCustomers: 0,
    lowStockProducts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
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

  const loadStats = async () => {
    try {
      // Cargar estadísticas de productos
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      const { count: activeProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('active', true)

      const { count: lowStockProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('active', true)
        .lt('stock', 10)

      // Cargar estadísticas de clientes
      const { count: totalCustomers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalProducts: totalProducts || 0,
        activeProducts: activeProducts || 0,
        totalCustomers: totalCustomers || 0,
        lowStockProducts: lowStockProducts || 0
      })
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Cargando panel administrativo...</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Hero Header with Spotlight and TextGenerateEffect */}
      <div className="relative h-[40vh] w-full flex items-center justify-center overflow-hidden rounded-b-3xl shadow-xl">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />
        <BackgroundBeams className="absolute inset-0 z-0" />
        <div className="relative z-10 text-center p-4">
          {/* Botones de Navegación */}
          <div className="mb-6 flex gap-3 justify-center flex-wrap">
            <Button 
              variant="ghost" 
              className="text-white hover:text-white hover:bg-white/20 rounded-xl"
              onClick={() => router.push('/')}
            >
              <Home className="w-4 h-4 mr-2" />
              Volver al Home
            </Button>
            <Button 
              variant="ghost" 
              className="text-white hover:text-white hover:bg-white/20 rounded-xl"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
          <TextGenerateEffect
            words="Panel Administrativo"
            className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg"
          />
          <p className="text-lg md:text-xl text-gray-200 mb-8 drop-shadow-md">
            Dashboard principal de Zingarito Kids
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-xl mx-auto hover:bg-white/20 transition-all duration-300">
            <p className="text-white font-semibold text-lg mb-2">
              📊 Dashboard de Control Total
            </p>
            <p className="text-white/90">
              Gestiona productos, precios, clientes y más desde un solo lugar
            </p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Producto
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Estadísticas Generales</h2>
          <p className="text-lg text-gray-600">Resumen completo de tu negocio</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <CardHoverEffect>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-white to-blue-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Productos</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-blue-600">{stats.totalProducts}</div>
                  <p className="text-sm text-gray-600 font-medium">
                    {stats.activeProducts} activos
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </CardHoverEffect>

          <CardHoverEffect>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-white to-green-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Clientes</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-green-600">{stats.totalCustomers}</div>
                  <p className="text-sm text-gray-600 font-medium">
                    Registrados
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </CardHoverEffect>

          <CardHoverEffect>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-white to-orange-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Stock Bajo</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-orange-600">{stats.lowStockProducts}</div>
                  <p className="text-sm text-gray-600 font-medium">
                    Requieren reposición
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </CardHoverEffect>

        </div>

        {/* Acciones Rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Acciones Rápidas</h2>
          <p className="text-lg text-gray-600">Gestiona tu negocio con herramientas profesionales</p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gestión de Productos */}
          <CardHoverEffect>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-2xl">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5" />
                    </div>
                    Gestión de Productos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl" asChild>
                    <a href="/admin/productos">
                      <Edit className="w-5 h-5 mr-3" />
                      Ver Todos los Productos
                    </a>
                  </Button>
                  <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                    <Plus className="w-5 h-5 mr-3" />
                    Agregar Nuevo Producto
                  </Button>
                  <Button className="w-full justify-start bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                    <TrendingUp className="w-5 h-5 mr-3" />
                    Productos con Stock Bajo
                  </Button>
                  <Button className="w-full justify-start bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                    <Trash2 className="w-5 h-5 mr-3" />
                    Productos Inactivos
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </CardHoverEffect>

          {/* Gestión de Precios */}
          <CardHoverEffect>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-2xl">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    Gestión de Precios
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl" asChild>
                    <a href="/admin/precios">
                      <DollarSign className="w-5 h-5 mr-3" />
                      Gestión de Precios
                    </a>
                  </Button>
                  <Button className="w-full justify-start bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl" asChild>
                    <a href="/admin/descuentos">
                      <Percent className="w-5 h-5 mr-3" />
                      Escala de Descuentos
                    </a>
                  </Button>
                  <Button className="w-full justify-start bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                    <DollarSign className="w-5 h-5 mr-3" />
                    Historial de Cambios de Precio
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </CardHoverEffect>
        </div>

          {/* Gestión de Inventario */}
        <CardHoverEffect>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-t-2xl">
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  Gestión de Inventario
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl" asChild>
                  <a href="/admin/inventario">
                    <Package className="w-5 h-5 mr-3" />
                    Ver Inventario Completo
                  </a>
                </Button>
                <Button className="w-full justify-start bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                  <AlertTriangle className="w-5 h-5 mr-3" />
                  Productos con Stock Bajo
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </CardHoverEffect>

          {/* Gestión de Pedidos */}
        <Card className="mt-12 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              Gestión de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl" asChild>
                <a href="/admin/pedidos">
                  Ver Todos los Pedidos
                </a>
              </Button>
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                Pedidos Pendientes
              </Button>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                Nuevos Registros
              </Button>
              <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                Exportar Lista
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}