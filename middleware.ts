import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Middleware básico sin redirecciones problemáticas
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Solo aplicar a rutas específicas que necesiten middleware
    '/admin/:path*',
    '/api/:path*'
  ]
}