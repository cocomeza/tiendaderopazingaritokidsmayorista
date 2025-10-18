// Middleware de autenticación para Next.js

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refrescar la sesión si existe
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Proteger rutas /admin/*
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      // Redirigir a login si no está autenticado
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Verificar si es admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      // Redirigir a home si no es admin
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // Proteger rutas /mi-cuenta/*
  if (request.nextUrl.pathname.startsWith('/mi-cuenta')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  // Proteger checkout
  if (request.nextUrl.pathname.startsWith('/checkout')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', '/checkout');
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

