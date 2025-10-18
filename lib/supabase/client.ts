// Cliente Supabase para uso en el navegador (client components)

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/lib/types/database.types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Exportar una instancia singleton para uso directo
export const supabase = createClient();

