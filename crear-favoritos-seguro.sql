-- =====================================================
-- CREAR TABLA FAVORITES (Version Segura)
-- Solo crea lo que no existe
-- =====================================================

-- 1. Verificar estado actual
SELECT 
  'Tabla' as tipo,
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'favorites')
    THEN '✅ favorites EXISTE'
    ELSE '❌ favorites NO EXISTE'
  END as estado;

SELECT 
  'Políticas' as tipo,
  COUNT(*) as total
FROM pg_policies
WHERE tablename = 'favorites';

SELECT 
  'Índices' as tipo,
  COUNT(*) as total
FROM pg_indexes
WHERE tablename = 'favorites';

-- 2. Crear tabla SI NO EXISTE
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  product_id uuid not null,
  created_at timestamp with time zone default now(),
  UNIQUE(user_id, product_id)
);

-- 3. Crear índices SI NO EXISTEN
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_product_id_idx ON public.favorites(product_id);

-- 4. Habilitar RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 5. Limpiar políticas viejas y crear nuevas
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;

-- Crear las políticas
CREATE POLICY "Users can view own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Verificar resultado
SELECT '✅ Configuración de favorites completada' as resultado;

SELECT 
  policyname,
  cmd as operacion
FROM pg_policies
WHERE tablename = 'favorites'
ORDER BY policyname;

