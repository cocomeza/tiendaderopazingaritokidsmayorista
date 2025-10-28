-- =====================================================
-- SOLUCIÓN SIMPLE - Ejecutar COMPLETO en Supabase SQL Editor
-- =====================================================

-- 1. Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;

-- 2. Crear tablas si no existe
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  product_id uuid not null,
  created_at timestamp with time zone default now(),
  UNIQUE(user_id, product_id)
);

-- 3. Habilitar RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas
CREATE POLICY "Users can view own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Crear índices si no existen
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_product_id_idx ON public.favorites(product_id);

-- 6. Verificar
SELECT '✅ Configuración completada' as resultado;

