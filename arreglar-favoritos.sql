-- =====================================================
-- ARREGLAR FAVORITOS - Ejecutar en Supabase SQL Editor
-- =====================================================

-- Paso 1: Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;

-- Verificar que se eliminaron
SELECT 'Políticas eliminadas, ahora hay: ' || COUNT(*) || ' políticas' as estado
FROM pg_policies
WHERE tablename = 'favorites';

-- Paso 2: Crear las políticas correctas
CREATE POLICY "Users can view own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Paso 3: Verificar resultado
SELECT 
  'Políticas creadas:' as resultado,
  STRING_AGG(policyname, ', ') as politicas
FROM pg_policies
WHERE tablename = 'favorites';

-- Paso 4: Ver total de favoritos (debería ser 0 si es nuevo)
SELECT COUNT(*) as total_favoritos FROM public.favorites;

