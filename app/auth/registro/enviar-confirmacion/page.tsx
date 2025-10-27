'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail } from 'lucide-react'

export default function EnviarConfirmacionPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleResend = async () => {
    if (!email) {
      toast.error('Por favor ingresa tu email')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (error) {
        toast.error('Error al enviar email: ' + error.message)
      } else {
        toast.success('Email de confirmación enviado. Revisa tu bandeja de entrada.')
      }
    } catch (error) {
      toast.error('Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Reenviar Email de Confirmación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleResend}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Enviando...' : 'Reenviar Email'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

