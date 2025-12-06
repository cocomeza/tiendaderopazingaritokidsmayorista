'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })

  // Verificar el token de recuperación cuando la página carga
  useEffect(() => {
    let mounted = true
    let subscription: { unsubscribe: () => void } | null = null

    const initializeReset = async () => {
      try {
        // Verificar si hay un hash fragment en la URL (viene del email)
        const hash = window.location.hash
        const hashParams = new URLSearchParams(hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const type = hashParams.get('type')

        // Si hay un token en el hash, Supabase lo procesará automáticamente
        if (accessToken && type === 'recovery') {
          // Escuchar cambios en la sesión de autenticación
          const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return

            if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
              // Limpiar el hash de la URL para que no se vea
              try {
                window.history.replaceState(null, '', window.location.pathname)
              } catch (e) {
                console.warn('No se pudo limpiar el hash de la URL:', e)
              }
              
              if (session) {
                setError(null)
                setInitializing(false)
              } else {
                setError('El enlace de recuperación es inválido o ha expirado. Por favor solicita un nuevo enlace.')
                setInitializing(false)
              }
              
              if (authSubscription) {
                authSubscription.unsubscribe()
              }
            }
          })

          subscription = authSubscription || null

          // También verificar la sesión después de un breve delay
          // por si Supabase ya procesó el hash antes de que se registre el listener
          const checkSession = async (retries = 3) => {
            if (!mounted) return

            try {
              const { data: { session }, error: sessionError } = await supabase.auth.getSession()
              
              if (!mounted) return

              if (session && !sessionError) {
                try {
                  window.history.replaceState(null, '', window.location.pathname)
                } catch (e) {
                  console.warn('No se pudo limpiar el hash de la URL:', e)
                }
                setError(null)
                setInitializing(false)
                if (subscription) {
                  subscription.unsubscribe()
                }
              } else if (!session && retries > 0) {
                // Esperar un poco más por si Supabase aún está procesando
                setTimeout(() => checkSession(retries - 1), 500)
              } else {
                setError('El enlace de recuperación es inválido o ha expirado. Por favor solicita un nuevo enlace.')
                setInitializing(false)
                if (subscription) {
                  subscription.unsubscribe()
                }
              }
            } catch (err) {
              console.error('Error verificando sesión:', err)
              if (retries > 0) {
                setTimeout(() => checkSession(retries - 1), 500)
              } else {
                setError('Error al procesar el enlace de recuperación. Por favor intenta nuevamente.')
                setInitializing(false)
                if (subscription) {
                  subscription.unsubscribe()
                }
              }
            }
          }

          // Esperar un momento para que Supabase procese el hash
          setTimeout(() => checkSession(), 500)
        } else {
          // No hay token en la URL, verificar si hay una sesión activa de recuperación
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError || !session) {
            setError('No se encontró un enlace de recuperación válido. Por favor solicita un nuevo enlace desde la página de recuperación.')
            setInitializing(false)
            return
          }

          setError(null)
          setInitializing(false)
        }
      } catch (err) {
        console.error('Error inicializando reset:', err)
        if (mounted) {
          setError('Error al procesar el enlace de recuperación. Por favor intenta nuevamente.')
          setInitializing(false)
        }
      }
    }

    initializeReset()

    return () => {
      mounted = false
      if (subscription) {
        try {
          subscription.unsubscribe()
        } catch (e) {
          console.warn('Error al desuscribirse:', e)
        }
      }
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Verificar que haya una sesión válida antes de actualizar
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        setError('Tu sesión de recuperación ha expirado. Por favor solicita un nuevo enlace.')
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (error) {
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          setError('El enlace de recuperación ha expirado. Por favor solicita un nuevo enlace.')
        } else {
          setError('Error al actualizar contraseña: ' + error.message)
        }
        toast.error('Error al actualizar contraseña')
        setLoading(false)
        return
      }

      toast.success('Contraseña actualizada correctamente')
      setSuccess(true)
      
      // Cerrar sesión después de actualizar la contraseña para forzar nuevo login
      await supabase.auth.signOut()
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } catch (error) {
      console.error('Error general:', error)
      setError('Error inesperado al actualizar contraseña. Por favor intenta nuevamente.')
      toast.error('Error inesperado al actualizar contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-white">
          <CardHeader className="text-center pb-6 pt-8">
            <div className="flex items-center justify-between mb-4">
              <Link href="/productos" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Nueva Contraseña
              </CardTitle>
              <div className="w-5"></div> {/* Spacer */}
            </div>
            <p className="text-gray-600 text-sm">
              Ingresa tu nueva contraseña
            </p>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            {initializing ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Verificando enlace de recuperación...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Error de Recuperación
                </h3>
                <p className="text-gray-600 mb-6">
                  {error}
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={() => router.push('/auth/recuperar-password')}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    Solicitar Nuevo Enlace
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/auth/login')}
                    className="w-full"
                  >
                    Volver al Login
                  </Button>
                </div>
              </div>
            ) : !success ? (
              <>
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nueva Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Repite tu contraseña"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-green-800 mb-2">Requisitos de contraseña:</h4>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>✓ Mínimo 6 caracteres</li>
                      <li>✓ Mejor si combinas letras y números</li>
                      <li>✓ No uses información personal</li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link 
                    href="/auth/login"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    ← Volver al Login
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ¡Contraseña Actualizada!
                </h3>
                <p className="text-gray-600 mb-6">
                  Tu contraseña ha sido actualizada correctamente. Serás redirigido al login...
                </p>
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

