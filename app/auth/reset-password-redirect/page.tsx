'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetPasswordRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Esta página solo redirige si se accede desde localhost con un token
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      const searchParams = new URLSearchParams(window.location.search)
      
      // Si hay un token (en hash o query params), redirigir a producción
      if (hash || searchParams.get('access_token')) {
        const productionUrl = 'https://tiendaderopazingaritokidsmayorista.vercel.app'
        const tokenPart = hash || `#${Array.from(searchParams.entries()).map(([k, v]) => `${k}=${v}`).join('&')}`
        
        console.log('🔄 Redirigiendo desde localhost a producción...')
        console.log('Token detectado:', !!hash || !!searchParams.get('access_token'))
        
        // Redirigir inmediatamente
        window.location.replace(`${productionUrl}/auth/reset-password${tokenPart}`)
      } else {
        // Si no hay token, redirigir a la página de recuperación
        router.push('/auth/recuperar-password')
      }
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo a la página de recuperación...</p>
      </div>
    </div>
  )
}

