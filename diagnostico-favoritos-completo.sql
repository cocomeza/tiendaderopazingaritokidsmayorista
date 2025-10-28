-- =====================================================
-- DIAGNÓSTICO COMPLETO DE FAVORITES
-- =====================================================

-- 1. ¿Existe la tabla?
SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_tables WHERE tablename = 'favorites'
  ) THEN '✅ La tabla favorites EXISTE' 
  ELSE '❌ La tabla favorites NO EXISTE' 
  END as estado_tabla;

-- 2. Ver estructura si existe
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'favorites'
ORDER BY ordinal_position;

-- 3. ¿Hay políticas RLS?
SELECT 
  CASE WHEN COUNT(*) = 0 THEN '❌ NO hay políticas RLS'
  ELSE CONCAT('✅ Hay ', COUNT(*), ' políticas RLS')
  END as estado_politicas,
  STRING_AGG(policyname, ', ') as politicas
FROM pg_policies
WHERE tablename = 'favorites';

-- 4. Ver políticas específicas
SELECT 
  policyname,
  cmd as operacion,
  permissive as permiso,
  roles
FROM pg_policies
WHERE tablename = 'favorites';

-- 5. ¿Hay favoritos?
SELECT COUNT(*) as total_favoritos FROM favorites;

-- 6. Ver usuarios y sus perfiles
SELECT 
  u.email,
  p.id as tiene_perfil,
  CASE WHEN p.id IS NULL THEN '❌ SIN PERFIL' ELSE '✅ CON PERFIL' END as estado
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
ORDER BY u.created_at DESC
LIMIT 5;

