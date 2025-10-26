'use client'

import { User, LogOut, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

      {/* Usuario */}
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {user?.user_metadata?.full_name || 'Usuario'}
          </p>
          <p className="text-xs text-gray-500">
            {user?.user_metadata?.company || user?.email}
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-gray-500 hover:text-gray-700"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
