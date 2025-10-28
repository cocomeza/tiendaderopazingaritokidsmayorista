-- =====================================================
-- CORREGIR POLÍTICAS RLS PARA PERFILES
-- =====================================================

-- Eliminar TODAS las políticas existentes de profiles
DROP POLICY IF EXISTS "Public profiles are viewable by admins" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Only admins can delete profiles" ON profiles;

-- Permitir que los usuarios vean su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Permitir que los admins vean todos los perfiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

-- Permitir que los usuarios inserten su propio perfil
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Permitir que los usuarios actualicen su propio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Solo admins pueden eliminar perfiles
CREATE POLICY "Only admins can delete profiles"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

-- Verificar que las políticas están creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

