-- =====================================================
-- Script de diagnóstico: Verificar usuarios y perfiles
-- =====================================================

-- 1. Verificar usuarios en auth.users
SELECT 
  id, 
  email, 
  created_at, 
  confirmed_at, 
  last_sign_in_at,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'phone' as phone,
  raw_user_meta_data->>'company_name' as company_name
FROM auth.users 
ORDER BY created_at DESC;

-- 2. Verificar perfiles en la tabla profiles
SELECT 
  id,
  email,
  full_name,
  company_name,
  phone,
  cuit,
  is_admin,
  is_active,
  created_at,
  updated_at
FROM profiles
ORDER BY created_at DESC;

-- 3. Verificar usuarios sin perfil
SELECT 
  u.id,
  u.email,
  u.created_at,
  CASE WHEN p.id IS NULL THEN 'SIN PERFIL' ELSE 'CON PERFIL' END as estado
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
ORDER BY u.created_at DESC;

-- 4. Verificar políticas RLS en profiles
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- 5. Verificar si RLS está habilitado
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN 'HABILITADO' ELSE 'DESHABILITADO' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'profiles';

-- 6. Contar total de usuarios y perfiles
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_usuarios,
  (SELECT COUNT(*) FROM profiles) as total_perfiles,
  (SELECT COUNT(*) FROM auth.users) - (SELECT COUNT(*) FROM profiles) as usuarios_sin_perfil;

