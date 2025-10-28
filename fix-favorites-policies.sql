-- =====================================================
-- CORREGIR POLÍTICAS DE FAVORITES
-- Primero eliminar TODAS las políticas, luego crear nuevas
-- =====================================================

-- 1. Eliminar TODAS las políticas existentes (sin IF EXISTS para forzar)
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

-- 2. Verificar que se eliminaron
SELECT 
  CASE WHEN COUNT(*) = 0 THEN '✅ Todas las políticas eliminadas'
  ELSE '⚠️ Aún hay ' || COUNT(*) || ' políticas'
  END as estado
FROM pg_policies
WHERE tablename = 'favorites';

-- 3. Crear las nuevas políticas
CREATE POLICY "Users can view own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Verificar que se crearon
SELECT 
  policyname,
  cmd as operacion
FROM pg_policies
WHERE tablename = 'favorites'
ORDER BY policyname;

-- 5. Verificar que la tabla existe y tiene datos
SELECT 
  (SELECT COUNT(*) FROM favorites) as total_favoritos,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'favorites') as total_politicas;

