-- =====================================================
-- SOLUCIÓN INMEDIATA: Deshabilitar RLS en profiles
-- =====================================================

-- EJECUTA ESTO EN: Supabase Dashboard > SQL Editor

-- 1. Eliminar todas las políticas problemáticas
DROP POLICY IF EXISTS "Public profiles are viewable by admins" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Only admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can do anything" ON profiles;

-- 2. Deshabilitar RLS temporalmente para profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 3. Verificar que el usuario admin existe
SELECT email, is_admin, full_name
FROM profiles 
WHERE email = 'admin@zingarito.com';

-- 4. Ver todos los usuarios para verificar
SELECT email, is_admin 
FROM profiles;

