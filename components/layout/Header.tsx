'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ShoppingCart, User, Search, Heart } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/hooks/useCart';
import { Button } from '@/lib/ui-wrappers';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin, profile, signOut } = useAuth();
  const itemCount = useCart(state => state.getItemCount());

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-extrabold">
              <span className="text-[#7B3FBD]">Zingarito</span>{' '}
              <span className="text-[#00D9D4]">Kids</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/productos"
              className="text-gray-700 hover:text-[#7B3FBD] font-medium transition-colors"
            >
              Catálogo
            </Link>
            <Link
              href="/productos?featured=true"
              className="text-gray-700 hover:text-[#7B3FBD] font-medium transition-colors"
            >
              Destacados
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-gray-700 hover:text-[#7B3FBD] font-medium transition-colors"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Right Section - Icons */}
          <div className="flex items-center gap-4">
            {/* Search (Desktop) */}
            <Link
              href="/productos"
              className="hidden md:flex text-gray-700 hover:text-[#7B3FBD] transition-colors"
              aria-label="Buscar"
            >
              <Search size={22} />
            </Link>

            {/* Favorites */}
            {isAuthenticated && (
              <Link
                href="/mi-cuenta/favoritos"
                className="text-gray-700 hover:text-[#7B3FBD] transition-colors"
                aria-label="Favoritos"
              >
                <Heart size={22} />
              </Link>
            )}

            {/* Cart */}
            <Link
              href="/carrito"
              className="relative text-gray-700 hover:text-[#7B3FBD] transition-colors"
              aria-label="Carrito"
            >
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#7B3FBD] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-2 text-gray-700 hover:text-[#7B3FBD] transition-colors">
                  <User size={22} />
                  <span className="hidden md:inline font-medium">
                    {profile?.full_name?.split(' ')[0] || 'Mi Cuenta'}
                  </span>
                </button>
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link
                    href="/mi-cuenta"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg"
                  >
                    Mi Cuenta
                  </Link>
                  <Link
                    href="/mi-cuenta/pedidos"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Mis Pedidos
                  </Link>
                  <Link
                    href="/mi-cuenta/favoritos"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Favoritos
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded-b-lg"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button size="sm" variant="primary">
                  Iniciar Sesión
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-700 hover:text-[#7B3FBD] transition-colors"
              aria-label="Menú"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="px-4 py-4 space-y-3">
            <Link
              href="/productos"
              className="block text-gray-700 hover:text-[#7B3FBD] font-medium transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Catálogo
            </Link>
            <Link
              href="/productos?featured=true"
              className="block text-gray-700 hover:text-[#7B3FBD] font-medium transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Destacados
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="block text-gray-700 hover:text-[#7B3FBD] font-medium transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Panel Admin
              </Link>
            )}
            {isAuthenticated && (
              <>
                <Link
                  href="/mi-cuenta"
                  className="block text-gray-700 hover:text-[#7B3FBD] font-medium transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mi Cuenta
                </Link>
                <Link
                  href="/mi-cuenta/pedidos"
                  className="block text-gray-700 hover:text-[#7B3FBD] font-medium transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mis Pedidos
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

