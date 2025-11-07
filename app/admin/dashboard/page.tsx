'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Package,
  AlertTriangle
} from 'lucide-react'
import { Spotlight } from '@/components/ui/spotlight'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { CardHoverEffect } from '@/components/ui/card-hover-effect'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalClients: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Obtener estadísticas de productos
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact' })

      // Obtener productos con stock bajo
      const { count: lowStockProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .lte('stock', 10)

      // Obtener estadísticas de clientes
      const { count: totalClients } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })

      // Obtener estadísticas de órdenes
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })

      setStats({
        totalProducts: totalProducts || 0,
        totalClients: totalClients || 0,
        totalOrders: totalOrders || 0,
        totalRevenue: 0, // TODO: Calcular ingresos reales
        lowStockProducts: lowStockProducts || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
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
          <div className="mb-6">
            <Link href="/admin">
              <Button 
                variant="ghost" 
                className="text-white hover:text-white hover:bg-white/20 rounded-xl"
              >
                ← Volver al Admin
              </Button>
            </Link>
          </div>
          <TextGenerateEffect
            words="Panel Administrativo"
            className="text-4xl md:text-6xl font-bold text-white mb-8 drop-shadow-lg"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-20 relative z-20">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                Productos en el catálogo
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
                  <CardTitle className="text-sm font-medium text-gray-700">Total Clientes</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
            </CardHeader>
            <CardContent>
                  <div className="text-3xl font-black text-green-600">{stats.totalClients}</div>
                  <p className="text-sm text-gray-600 font-medium">
                Clientes registrados
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
                  <CardTitle className="text-sm font-medium text-gray-700">Total Pedidos</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-white" />
                  </div>
            </CardHeader>
            <CardContent>
                  <div className="text-3xl font-black text-orange-600">{stats.totalOrders}</div>
                  <p className="text-sm text-gray-600 font-medium">
                Pedidos realizados
              </p>
            </CardContent>
          </Card>
            </motion.div>
          </CardHoverEffect>

        </div>

        {/* Alertas */}
        {stats.lowStockProducts > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Card className="mb-8 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="w-5 h-5" />
                Alertas de Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-700">
                Tienes <strong>{stats.lowStockProducts}</strong> productos con stock bajo (≤10 unidades).
                  <Link href="/admin/productos" className="ml-2 text-orange-800 underline hover:text-orange-900 transition-colors">
                  Ver productos
                </Link>
              </p>
            </CardContent>
          </Card>
          </motion.div>
        )}

        {/* Acciones rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Acciones Rápidas</h2>
          <p className="text-lg text-gray-600">Gestiona tu negocio con herramientas profesionales</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <CardHoverEffect>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
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
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-6">
                    Administra tu catálogo de productos, precios y stock de manera eficiente.
                  </p>
                  <div className="space-y-3">
                <Link href="/admin/productos">
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                        Ver Productos
                      </Button>
                </Link>
                <Link href="/admin/productos/nuevo">
                      <Button variant="outline" className="w-full bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-xl transition-all duration-300">
                        Agregar Producto
                      </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
            </motion.div>
          </CardHoverEffect>

          <CardHoverEffect>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-2xl">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    Gestión de Clientes
                  </CardTitle>
            </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-6">
                    Visualiza y administra tus clientes registrados y sus pedidos.
                  </p>
                  <div className="space-y-3">
                <Link href="/admin/clientes">
                      <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                        Ver Clientes
                      </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
            </motion.div>
          </CardHoverEffect>

          <CardHoverEffect>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-2xl">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    Configuración
                  </CardTitle>
            </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-6">
                    Configura precios masivos y ajustes del negocio.
                  </p>
                  <div className="space-y-3">
                <Link href="/admin/precios">
                      <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                        Ajustar Precios
                      </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
            </motion.div>
          </CardHoverEffect>
        </div>
      </div>
    </div>
  )
}
