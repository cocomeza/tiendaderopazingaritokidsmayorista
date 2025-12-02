-- =====================================================
-- MIGRACIÓN: Asegurar acceso público a categorías activas
-- =====================================================
-- Esta migración asegura que TODOS los usuarios (incluso anónimos)
-- puedan ver las categorías activas para usar en filtros
-- =====================================================

-- Eliminar TODAS las políticas existentes de SELECT en categories
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "categories_select_policy" ON categories;
DROP POLICY IF EXISTS "allow_select_categories" ON categories;
DROP POLICY IF EXISTS "categories_public_read" ON categories;

-- Asegurar que RLS esté habilitado
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Crear política que permita a TODOS (incluso anónimos) ver categorías activas
-- Esta política es más permisiva y explícita
CREATE POLICY "categories_public_read"
  ON categories FOR SELECT
  TO public
  USING (active = true);

-- También crear una política alternativa sin restricción de active para debugging
-- (comentada por seguridad, descomentar solo si es necesario)
-- CREATE POLICY "categories_public_read_all"
--   ON categories FOR SELECT
--   TO public
--   USING (true);

-- Verificar que la política fue creada
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public' 
    AND tablename = 'categories' 
    AND policyname = 'categories_public_read';
  
  IF policy_count > 0 THEN
    RAISE NOTICE '✅ Política "categories_public_read" creada correctamente';
  ELSE
    RAISE WARNING '⚠️ No se pudo crear la política categories_public_read';
  END IF;
  
  -- Verificar cuántas categorías activas hay
  DECLARE
    active_count INTEGER;
  BEGIN
    SELECT COUNT(*) INTO active_count FROM categories WHERE active = true;
    RAISE NOTICE '📊 Categorías activas en la base de datos: %', active_count;
  END;
END $$;

