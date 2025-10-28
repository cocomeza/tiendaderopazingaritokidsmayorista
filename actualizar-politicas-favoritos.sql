-- =====================================================
-- ACTUALIZAR POLÍTICAS DE FAVORITES
-- La tabla ya existe, solo actualizar políticas
-- =====================================================

-- 1. Eliminar políticas existentes (sin importar qué sean)
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'favorites'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.favorites', pol.policyname);
    END LOOP;
END $$;

-- 2. Crear las políticas correctas
CREATE POLICY "Users can view own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Verificar
SELECT 
  '✅ Políticas actualizadas' as resultado,
  COUNT(*) as total_politicas
FROM pg_policies
WHERE tablename = 'favorites';

-- 4. Ver políticas creadas
SELECT 
  policyname,
  cmd as operacion
FROM pg_policies
WHERE tablename = 'favorites'
ORDER BY policyname;

-- 5. Probar inserción (reemplaza USER_ID y PRODUCT_ID con valores reales)
-- SELECT * FROM public.favorites;

