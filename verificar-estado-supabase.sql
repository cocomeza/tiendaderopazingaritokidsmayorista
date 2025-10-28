-- =====================================================
-- VERIFICAR ESTADO DE SUPABASE
-- Ejecuta este script en Supabase SQL Editor
-- =====================================================

-- 1. Verificar si la tabla profiles existe
SELECT 
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) AS profiles_exists;

-- 2. Verificar estructura de la tabla profiles
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Verificar políticas RLS activas
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
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 4. Verificar si RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';

-- 5. Verificar usuarios registrados en auth
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  confirmed_at,
  raw_app_meta_data
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 6. Verificar perfiles en profiles
SELECT 
  id,
  email,
  full_name,
  company_name,
  created_at,
  is_active
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- 7. Verificar si hay trigger para crear perfil automáticamente
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'profiles';

