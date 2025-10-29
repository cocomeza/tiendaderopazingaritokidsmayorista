'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Limpiar sesión anterior si existe
      await supabase.auth.signOut()

      // Pequeño delay para que se limpien las cookies
      await new Promise(resolve => setTimeout(resolve, 500))

      // Autenticar con Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        console.error('Error de autenticación:', authError)
        setError(`Email o contraseña incorrectos: ${authError.message}`)
        toast.error('Credenciales incorrectas')
        return
      }

      if (!authData.user) {
        setError('Error al iniciar sesión')
        return
      }

      // Verificar que el usuario tiene permisos de admin en la base de datos
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', authData.user.id)
        .single()

      if (profileError) {
        console.error('Error verificando perfil:', profileError)
        // Si el error es que no se encontró el perfil, dale una advertencia más clara
        if (profileError.code === 'PGRST116' || profileError.message?.includes('No rows')) {
          setError('Tu perfil no está configurado. Contacta al administrador del sistema.')
          toast.error('Perfil no encontrado')
        } else {
          setError('Error verificando permisos. Intenta nuevamente.')
          toast.error('Error al verificar permisos')
        }
        await supabase.auth.signOut()
        return
      }

      if (!profile) {
        setError('No se encontró tu perfil en la base de datos')
        toast.error('Perfil no configurado')
        await supabase.auth.signOut()
        return
      }

      if (!profile.is_admin) {
        // Cerrar sesión si no es admin
        await supabase.auth.signOut()
        setError('No tienes permisos de administrador')
        toast.error('Acceso denegado: no eres administrador')
        return
      }

      toast.success('Sesión iniciada correctamente')
      router.push('/admin')
    } catch (err) {
      console.error('Error:', err)
      setError('Error al iniciar sesión')
      toast.error('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleClearSession = async () => {
    await supabase.auth.signOut()
    toast.success('Sesión limpiada. Intenta iniciar sesión nuevamente.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Panel Administrativo</h2>
          <p className="mt-2 text-sm text-gray-600">
            Acceso exclusivo para administradores
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-center text-xl">Iniciar Sesión Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">Email de Administrador</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@zingarito.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {loading ? 'Iniciando sesión...' : 'Acceder al Panel Admin'}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <div className="text-center">
                <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver al sitio principal
                </Link>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <Link href="/auth/login" className="text-xs text-gray-500 hover:text-gray-700 transition-colors text-center">
                  ¿Eres cliente? Accede aquí
                </Link>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">⚠️ Acceso Restringido</h4>
                <p className="text-sm text-red-800">
                  Solo personal autorizado con permisos de administrador puede acceder a esta sección.
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 ¿Problemas de acceso?</h4>
                <p className="text-sm text-blue-800 mb-3">
                  Si estás teniendo problemas para iniciar sesión:
                </p>
                <Button
                  onClick={handleClearSession}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  size="sm"
                >
                  Limpiar Sesión
                </Button>
                <p className="text-xs text-blue-700 mt-3">
                  También intenta limpiar las cookies de tu navegador si el problema persiste.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
