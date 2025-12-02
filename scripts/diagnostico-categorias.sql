-- =====================================================
-- SCRIPT DE DIAGNÓSTICO: Verificar categorías
-- =====================================================
-- Ejecuta este script en Supabase SQL Editor para diagnosticar
-- por qué no se están cargando las categorías
-- =====================================================

-- 1. Verificar cuántas categorías hay en total
SELECT 
  COUNT(*) as total_categorias,
  COUNT(*) FILTER (WHERE active = true) as categorias_activas,
  COUNT(*) FILTER (WHERE active = false) as categorias_inactivas
FROM categories;

-- 2. Listar todas las categorías activas
SELECT id, name, active, group_type, age_range, display_order, created_at
FROM categories
WHERE active = true
ORDER BY name;

-- 3. Verificar políticas RLS existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'categories'
ORDER BY policyname;

-- 4. Verificar si RLS está habilitado
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'categories';

-- 5. Probar consulta como usuario anónimo (simular)
-- Esto debería funcionar si las políticas están correctas
SET ROLE anon;
SELECT COUNT(*) as categorias_visibles_para_anonimo
FROM categories
WHERE active = true;
RESET ROLE;

