-- =====================================================
-- MIGRACIÓN: Asegurar que categorías sean visibles públicamente
-- =====================================================
-- Esta migración asegura que todos los usuarios (incluso no autenticados)
-- puedan ver las categorías activas para usar en filtros
-- =====================================================

-- Eliminar políticas existentes que puedan estar bloqueando
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "categories_select_policy" ON categories;
DROP POLICY IF EXISTS "allow_select_categories" ON categories;

-- Crear política que permita a todos ver categorías activas
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (active = true);

-- Verificar que la política fue creada
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'categories' 
    AND policyname = 'Categories are viewable by everyone'
  ) THEN
    RAISE NOTICE '✅ Política "Categories are viewable by everyone" creada correctamente';
  ELSE
    RAISE WARNING '⚠️ No se pudo crear la política';
  END IF;
END $$;

