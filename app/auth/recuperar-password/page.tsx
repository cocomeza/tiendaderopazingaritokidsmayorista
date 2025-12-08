'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'

export default function RecuperarPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleRecoverPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Por favor ingresa tu email')
      return
    }

    setLoading(true)

    try {
      // Usar la URL de producción si está disponible, sino usar la URL actual
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const redirectUrl = `${siteUrl}/auth/reset-password`
      
      console.log('Enviando email de recuperación a:', email)
      console.log('URL de redirección:', redirectUrl)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      if (error) {
        toast.error('Error al enviar email: ' + error.message)
        return
      }

      setEmailSent(true)
      toast.success('Email de recuperación enviado')
    } catch (error) {
      console.error('Error inesperado:', error)
      toast.error('Error inesperado al enviar email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-white">
          <CardHeader className="text-center pb-6 pt-8">
            <div className="flex items-center justify-between mb-4">
              <Link href="/auth/login" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Recuperar Contraseña
              </CardTitle>
              <div className="w-5"></div> {/* Spacer */}
            </div>
            <p className="text-gray-600 text-sm">
              Te enviaremos un enlace para restablecer tu contraseña
            </p>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            {!emailSent ? (
              <>
                <form onSubmit={handleRecoverPassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="email"
                        placeholder="tu@empresa.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Ingresa el email con el que te registraste
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Enviando...' : 'Enviar Email'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    ¿Recordaste tu contraseña?{' '}
                    <Link 
                      href="/auth/login"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Volver al Login
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ¡Email Enviado!
                </h3>
                <p className="text-gray-600 mb-4">
                  Te hemos enviado un enlace a <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Revisa tu bandeja de entrada (y spam) y haz clic en el enlace para restablecer tu contraseña.
                </p>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => router.push('/auth/login')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Volver al Login
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setEmailSent(false)}
                    className="w-full"
                  >
                    Enviar Nuevamente
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

