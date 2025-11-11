'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { Spotlight } from '@/components/ui/spotlight'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { CardHoverEffect } from '@/components/ui/card-hover-effect'
import { motion } from 'framer-motion'
import { Package, Users, TrendingUp, DollarSign, Plus, Settings, Edit, Trash2, Percent, ArrowLeft, LogOut, Home, ShoppingBag, AlertTriangle, MinusCircle } from 'lucide-react'
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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  

  useEffect(() => {
    checkAdminAccess()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isCheckingAuth) {
      loadStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckingAuth])

  const checkAdminAccess = async () => {
    try {
      // Verificar si hay sesión
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/admin/login')
        return
      }

      // Verificar si es admin
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      if (error || !profile?.is_admin) {
        toast.error('No tienes permisos de administrador')
        router.push('/')
        return
      }

      setIsCheckingAuth(false)
    } catch (error) {
      console.error('Error verificando acceso:', error)
      router.push('/admin/login')
    }
  }

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

  if (isCheckingAuth || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">
            {isCheckingAuth ? 'Verificando acceso...' : 'Cargando panel administrativo...'}
          </p>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 text-white shadow-xl p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Gestión de Productos</h3>
                <p className="text-sm text-white/80">Administra catálogo, precios y stock.</p>
              </div>
            </div>
            <Button asChild variant="secondary" className="bg-white text-gray-900 hover:bg-white/90 font-semibold">
              <a href="/admin/productos">Ver productos</a>
            </Button>
            <Button asChild variant="ghost" className="bg-white/10 text-white hover:bg-white/20 border border-white/30 font-semibold">
              <a href="/admin/inventario/descontar">Registrar salida manual</a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-xl p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Gestión de Clientes</h3>
                <p className="text-sm text-white/80">Visualiza clientes registrados y pedidos.</p>
              </div>
            </div>
            <Button asChild variant="secondary" className="bg-white text-gray-900 hover:bg-white/90 font-semibold">
              <a href="/admin/clientes">Ver clientes</a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 text-white shadow-xl p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Configuración de Precios</h3>
                <p className="text-sm text-white/80">Actualiza precios mayoristas y descuentos.</p>
              </div>
            </div>
            <Button asChild variant="secondary" className="bg-white text-gray-900 hover:bg-white/90 font-semibold">
              <a href="/admin/precios">Ajustar precios</a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 text-white shadow-xl p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <MinusCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Inventario Rápido</h3>
                <p className="text-sm text-white/80">Controla stock y registra salidas manuales.</p>
              </div>
            </div>
            <Button asChild variant="secondary" className="bg-white text-gray-900 hover:bg-white/90 font-semibold">
              <a href="/admin/inventario/descontar">Gestionar inventario</a>
            </Button>
          </motion.div>
        </div>

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