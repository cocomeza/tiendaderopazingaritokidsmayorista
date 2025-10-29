import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Middleware básico sin redirecciones problemáticas
  // La protección de admin se maneja en el cliente
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Aplicar a rutas específicas que necesiten middleware
    '/admin/:path*',
    '/api/:path*'
  ]
}