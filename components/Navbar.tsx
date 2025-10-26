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
      <div className="bg-purple-600 text-white text-sm py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <a href="tel:+543407498045" className="flex items-center gap-1 hover:opacity-80">
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">3407 498045</span>
              </a>
              <button onClick={abrirWhatsApp} className="flex items-center gap-1 hover:opacity-80">
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
            </div>
            <div className="text-xs">
              <span className="hidden md:inline">🎉 Envíos a todo el país</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navbar principal */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center" onClick={cerrarMenu}>
              <div className="text-2xl font-bold text-gradient-horizontal">
                ZINGARITO
              </div>
              <span className="ml-2 text-sm font-semibold text-purple-600">KIDS</span>
            </Link>

            {/* Links de navegación - Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
              >
                Inicio
              </Link>
              <Link
                href="/productos"
                className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
              >
                Productos
              </Link>
              <Link
                href="/sobre-nosotros"
                className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
              >
                Nosotros
              </Link>
              <Link
                href="/contacto"
                className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
              >
                Contacto
              </Link>
              <Link
                href="/admin/login"
                className="text-gray-700 hover:text-purple-600 font-medium transition-colors flex items-center gap-1"
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
