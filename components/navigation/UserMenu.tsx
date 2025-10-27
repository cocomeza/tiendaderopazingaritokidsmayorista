'use client'

import { User, LogOut, Heart, Settings, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/hooks/useAuth'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { useRouter } from 'next/navigation'

export function UserMenu() {
  const { user, isAuthenticated, signOut } = useAuth()
  const { favorites } = useFavorites()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => router.push('/auth/login')}
          className="flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          Iniciar Sesión
        </Button>
        <Button
          variant="default"
          onClick={() => router.push('/auth/registro')}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          Registrarse
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      {/* Favoritos */}
      <Button variant="ghost" size="sm" asChild className="relative">
        <a href="/favoritos">
          <Heart className="w-5 h-5" />
          {favorites.length > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {favorites.length}
            </Badge>
          )}
        </a>
      </Button>

      {/* Usuario con Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto p-2 hover:bg-gray-100 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 text-left">
                  {user?.user_metadata?.full_name || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 text-left">
                  {user?.user_metadata?.company || user?.email}
                </p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium text-gray-900">
              {user?.user_metadata?.full_name || 'Usuario'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/mi-perfil')}>
            <Settings className="w-4 h-4 mr-2" />
            Mi Perfil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/mis-pedidos')}>
            <ShoppingBag className="w-4 h-4 mr-2" />
            Mis Pedidos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/favoritos')}>
            <Heart className="w-4 h-4 mr-2" />
            Mis Favoritos
            {favorites.length > 0 && (
              <Badge className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {favorites.length}
              </Badge>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
