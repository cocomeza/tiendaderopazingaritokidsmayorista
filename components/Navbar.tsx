'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Phone, MessageCircle, ShoppingCart } from 'lucide-react'
import { Button } from './ui/button'
import { UserMenu } from '@/components/navigation/UserMenu'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAdmin } from '@/lib/hooks/useAdmin'
import { useCartStore } from '@/lib/stores/cart'
import { Badge } from './ui/badge'

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated, signOut } = useAuth()
  const { isAdmin } = useAdmin()
  const { getTotalItems } = useCartStore()
  
  const totalCartItems = getTotalItems()
  
  // Evitar error de hidratación - solo renderizar el badge después de montar
  useEffect(() => {
    setMounted(true)
  }, [])

  const abrirWhatsApp = () => {
    const numero = '543407440243'
    const mensaje = encodeURIComponent('Hola! Me gustaría obtener más información sobre Zingarito Kids.')
    window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank')
  }

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto)
  }

  const cerrarMenu = () => {
    setMenuAbierto(false)
  }

  const handleCartClick = () => {
    setCartDrawerOpen(true)
  }

  const handleSignOut = async () => {
    await signOut()
    cerrarMenu()
  }


  return (
    <>
      {/* Barra superior con contacto */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white text-xs sm:text-sm py-2.5 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 sm:gap-5">
              <a href="tel:+543407440243" className="flex items-center gap-1.5 hover:opacity-90 transition-opacity">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-medium">3407 440243</span>
              </a>
              <div className="h-4 w-px bg-white/30"></div>
              <button onClick={abrirWhatsApp} className="flex items-center gap-1.5 hover:opacity-90 transition-opacity">
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-medium">WhatsApp</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg">🎉</span>
              <span className="hidden sm:inline font-medium">Envíos a todo el país</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navbar principal */}
      <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-baseline gap-2 group" onClick={cerrarMenu}>
              <div className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
                <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  ZINGARITO
                </span>
              </div>
              <span className="text-base sm:text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 leading-none">
                KIDS
              </span>
            </Link>

            {/* Links de navegación - Desktop */}
            <div className="hidden lg:flex items-center space-x-1">
              {/* Links públicos - Solo para clientes y no autenticados */}
              {!isAdmin && (
                <>
                  <Link
                    href="/"
                    className="px-4 py-2 text-gray-700 hover:text-purple-600 font-semibold transition-all hover:bg-purple-50 rounded-lg"
                  >
                    Inicio
                  </Link>
                  <Link
                    href="/productos"
                    className="px-4 py-2 text-gray-700 hover:text-purple-600 font-semibold transition-all hover:bg-purple-50 rounded-lg"
                  >
                    Productos
                  </Link>
                  <Link
                    href="/sobre-nosotros"
                    className="px-4 py-2 text-gray-700 hover:text-purple-600 font-semibold transition-all hover:bg-purple-50 rounded-lg"
                  >
                    Nosotros
                  </Link>
                  <Link
                    href="/contacto"
                    className="px-4 py-2 text-gray-700 hover:text-purple-600 font-semibold transition-all hover:bg-purple-50 rounded-lg"
                  >
                    Contacto
                  </Link>
                </>
              )}
              
              {/* Links de Admin - Solo para administradores */}
              {isAdmin && (
                <>
                  <Link
                    href="/admin"
                    className="px-4 py-2 text-gray-700 hover:text-purple-600 font-semibold transition-all hover:bg-purple-50 rounded-lg"
                  >
                    Panel Admin
                  </Link>
                  <Link
                    href="/admin/productos"
                    className="px-4 py-2 text-gray-700 hover:text-purple-600 font-semibold transition-all hover:bg-purple-50 rounded-lg"
                  >
                    Productos
                  </Link>
                  <Link
                    href="/admin/clientes"
                    className="px-4 py-2 text-gray-700 hover:text-purple-600 font-semibold transition-all hover:bg-purple-50 rounded-lg"
                  >
                    Clientes
                  </Link>
                  <Link
                    href="/admin/precios"
                    className="px-4 py-2 text-gray-700 hover:text-purple-600 font-semibold transition-all hover:bg-purple-50 rounded-lg"
                  >
                    Precios
                  </Link>
                </>
              )}
            </div>

            {/* Acciones - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              {/* Botón del Carrito - Solo para clientes autenticados, NO para admin */}
              {!isAdmin && isAuthenticated && (
                <Button
                  variant="outline"
                  onClick={handleCartClick}
                  className="relative h-10 px-4 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
                >
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                  {mounted && totalCartItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 bg-gradient-to-r from-red-500 to-pink-500 border-2 border-white text-white font-bold text-xs animate-pulse">
                      {totalCartItems}
                    </Badge>
                  )}
                </Button>
              )}
              
              {/* UserMenu Dropdown - Solo opciones de perfil para clientes */}
              {!isAdmin && isAuthenticated && (
                <UserMenu cartDrawerOpen={cartDrawerOpen} setCartDrawerOpen={setCartDrawerOpen} />
              )}
              
              {/* Botón Cerrar Sesión - Desktop directo, no en dropdown */}
              {isAuthenticated && (
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="h-10 px-4 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 font-semibold"
                >
                  🚪 Cerrar Sesión
                </Button>
              )}
              
              {/* Botones para no autenticados */}
              {!isAuthenticated && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/auth/login'}
                    className="h-10 px-4"
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/auth/registro'}
                    className="h-10 px-4 bg-green-600 hover:bg-green-700"
                  >
                    Registrarse
                  </Button>
                </>
              )}
            </div>

            {/* Acciones - Mobile */}
            <div className="flex md:hidden items-center gap-2">
              {/* Botón del Carrito Mobile - Solo para clientes autenticados, NO para admin */}
              {!isAdmin && isAuthenticated && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCartClick}
                  className="relative h-9 w-9 p-0 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50"
                >
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                  {mounted && totalCartItems > 0 && (
                    <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-red-500 to-pink-500 border-2 border-white text-white font-bold text-xs animate-pulse">
                      {totalCartItems}
                    </Badge>
                  )}
                </Button>
              )}
              
              {/* Botón de menú móvil */}
              <button
                onClick={toggleMenu}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {menuAbierto ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        {menuAbierto && (
          <div className="md:hidden border-t bg-white shadow-lg">
            <div className="container mx-auto px-4 py-6">
              {/* Header del menú móvil */}
              <div className="flex items-center justify-end mb-6">
                <button
                  onClick={cerrarMenu}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Cerrar menú"
                >
                  <X className="w-6 h-6 text-gray-700" />
                </button>
              </div>

              {/* Navegación principal - SIMPLIFICADA */}
              <div className="space-y-2">
                {/* Links para clientes y no autenticados */}
                {!isAdmin && !isAuthenticated && (
                  <>
                    <Link
                      href="/"
                      onClick={cerrarMenu}
                      className="block py-3 px-4 text-center text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium transition-all rounded-lg text-base"
                    >
                      🏠 Inicio
                    </Link>
                    <Link
                      href="/productos"
                      onClick={cerrarMenu}
                      className="block py-3 px-4 text-center text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium transition-all rounded-lg text-base"
                    >
                      📦 Productos
                    </Link>
                    <Link
                      href="/sobre-nosotros"
                      onClick={cerrarMenu}
                      className="block py-3 px-4 text-center text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium transition-all rounded-lg text-base"
                    >
                      ℹ️ Nosotros
                    </Link>
                    <Link
                      href="/contacto"
                      onClick={cerrarMenu}
                      className="block py-3 px-4 text-center text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium transition-all rounded-lg text-base"
                    >
                      📧 Contacto
                    </Link>
                    <Link
                      href="/auth/login"
                      onClick={cerrarMenu}
                      className="block py-3 px-4 text-center bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 font-semibold transition-all rounded-lg text-base shadow-md"
                    >
                      🔐 Iniciar Sesión
                    </Link>
                  </>
                )}
                
                {/* Links para clientes autenticados */}
                {!isAdmin && isAuthenticated && (
                  <>
                    <Link
                      href="/productos"
                      onClick={cerrarMenu}
                      className="block py-3 px-4 text-center text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium transition-all rounded-lg text-base"
                    >
                      📦 Productos
                    </Link>
                    <Link
                      href="/mis-pedidos"
                      onClick={cerrarMenu}
                      className="block py-3 px-4 text-center text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium transition-all rounded-lg text-base"
                    >
                      📋 Mis Pedidos
                    </Link>
                    <Link
                      href="/favoritos"
                      onClick={cerrarMenu}
                      className="block py-3 px-4 text-center text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium transition-all rounded-lg text-base"
                    >
                      ❤️ Favoritos
                    </Link>
                    <Link
                      href="/mi-perfil"
                      onClick={cerrarMenu}
                      className="block py-3 px-4 text-center text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium transition-all rounded-lg text-base"
                    >
                      ⚙️ Mi Perfil
                    </Link>
                  </>
                )}
                
                {/* Links de Admin - Solo para administradores */}
                {isAdmin && (
                  <>
                    <Link
                      href="/admin"
                      onClick={cerrarMenu}
                      className="block py-3 px-4 text-center text-purple-700 hover:text-purple-900 hover:bg-purple-50 font-semibold transition-all rounded-lg text-base bg-purple-50/50"
                    >
                      🏠 Panel Admin
                    </Link>
                    <Link
                      href="/admin/productos"
                      onClick={cerrarMenu}
                      className="block py-3 px-4 text-center text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium transition-all rounded-lg text-base"
                    >
                      📦 Productos
                    </Link>
                    <Link
                      href="/admin/clientes"
                      onClick={cerrarMenu}
                      className="block py-3 px-4 text-center text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium transition-all rounded-lg text-base"
                    >
                      👥 Clientes
                    </Link>
                    <Link
                      href="/admin/precios"
                      onClick={cerrarMenu}
                      className="block py-3 px-4 text-center text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium transition-all rounded-lg text-base"
                    >
                      💰 Precios
                    </Link>
                  </>
                )}
              </div>
              
              {/* Botón Cerrar Sesión - Solo para usuarios autenticados - DIRECTO */}
              {isAuthenticated && (
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full py-3 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 font-semibold text-base"
                  >
                    🚪 Cerrar Sesión
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
