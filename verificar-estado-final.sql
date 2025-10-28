-- =====================================================
-- Verificar estado final de usuarios y perfiles
-- =====================================================

-- 1. Ver todos los usuarios en auth.users
SELECT 
  id,
  email,
  created_at,
  confirmed_at
FROM auth.users 
ORDER BY created_at DESC;

-- 2. Ver todos los perfiles en profiles
SELECT 
  id,
  email,
  full_name,
  phone,
  city,
  province,
  is_admin,
  is_wholesale_client,
  min_order_amount,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- 3. Comparar usuarios vs perfiles
SELECT 
  u.id,
  u.email as usuario_email,
  p.id as perfil_id,
  p.email as perfil_email,
  CASE WHEN p.id IS NULL THEN 'SIN PERFIL' ELSE 'CON PERFIL' END as estado
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
ORDER BY u.created_at DESC;

-- 4. Contar totales
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_usuarios,
  (SELECT COUNT(*) FROM profiles) as total_perfiles,
  (SELECT COUNT(*) FROM auth.users) - (SELECT COUNT(*) FROM profiles) as usuarios_sin_perfil;

-- 5. Verificar políticas RLS
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Deberías ver 5 políticas:
-- 1. Users can view own profile (SELECT)
-- 2. Admins can view all profiles (SELECT)
-- 3. Users can insert own profile (INSERT)
-- 4. Users can update own profile (UPDATE)
-- 5. Only admins can delete profiles (DELETE)

