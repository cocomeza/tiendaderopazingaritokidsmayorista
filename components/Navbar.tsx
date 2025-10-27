'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ShoppingCart, Shield, Phone, MessageCircle } from 'lucide-react'
import { Button } from './ui/button'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { UserMenu } from '@/components/navigation/UserMenu'
import { useAuth } from '@/lib/hooks/useAuth'

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { isAuthenticated } = useAuth()

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto)
  }

  const cerrarMenu = () => {
    setMenuAbierto(false)
  }

  const abrirWhatsApp = () => {
    const numero = '543407498045'
    const mensaje = encodeURIComponent('Hola! Me gustaría obtener más información sobre Zingarito Kids.')
    window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank')
  }

  return (
    <>
      {/* Barra superior con contacto */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white text-xs sm:text-sm py-2.5 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 sm:gap-5">
              <a href="tel:+543407498045" className="flex items-center gap-1.5 hover:opacity-90 transition-opacity">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-medium">3407 498045</span>
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
              <Link
                href="/admin/login"
                className="px-4 py-2 text-gray-700 hover:text-purple-600 font-semibold transition-all hover:bg-purple-50 rounded-lg flex items-center gap-1.5"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            </div>

            {/* Acciones - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <UserMenu />
              {isAuthenticated && <CartDrawer />}
            </div>

            {/* Botón de menú móvil */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
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

              {/* Navegación principal */}
              <div className="space-y-1 mb-6">
              <Link
                href="/"
                onClick={cerrarMenu}
                  className="block py-3 px-4 text-center text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium transition-all rounded-lg"
              >
                Inicio
              </Link>
              <Link
                href="/productos"
                onClick={cerrarMenu}
                  className="block py-3 px-4 text-center text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium transition-all rounded-lg"
              >
                Productos
              </Link>
              <Link
                href="/sobre-nosotros"
                onClick={cerrarMenu}
                  className="block py-3 px-4 text-center text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium transition-all rounded-lg"
              >
                Nosotros
              </Link>
              <Link
                href="/contacto"
                onClick={cerrarMenu}
                  className="block py-3 px-4 text-center text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium transition-all rounded-lg"
              >
                Contacto
              </Link>
                <Link
                  href="/admin/login"
                  onClick={cerrarMenu}
                  className="block py-3 px-4 text-center text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium transition-all rounded-lg flex items-center justify-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Panel Admin
                </Link>
              <Link
                href="/auth/login"
                onClick={cerrarMenu}
                  className="block py-3 px-4 text-center text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium transition-all rounded-lg"
              >
                Iniciar Sesión
              </Link>
              </div>
              
              {/* Acciones rápidas */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="flex justify-center">
                  <UserMenu />
                </div>
                {isAuthenticated && (
                  <Button variant="outline" className="w-full justify-center" onClick={cerrarMenu}>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Carrito (0)
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
