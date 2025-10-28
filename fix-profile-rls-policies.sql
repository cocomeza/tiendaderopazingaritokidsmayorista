-- =====================================================
-- CORREGIR POLÍTICAS RLS PARA PERFILES
-- =====================================================
-- Este script asegura que las políticas RLS estén correctas
-- para permitir que los usuarios creen y gestionen sus perfiles

-- 1. Habilitar RLS en la tabla profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar TODAS las políticas existentes (para empezar limpio)
DROP POLICY IF EXISTS "Public profiles are viewable by admins" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Only admins can delete profiles" ON profiles;

-- 3. Política para SELECT (Lectura)
-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Los administradores pueden ver todos los perfiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

-- 4. Política para INSERT (Creación)
-- Los usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 5. Política para UPDATE (Actualización)
-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6. Política para DELETE (Eliminación)
-- Solo los administradores pueden eliminar perfiles
CREATE POLICY "Only admins can delete profiles"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

-- 7. Verificar que las políticas se crearon correctamente
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Deberías ver:
-- 1. Users can view own profile (SELECT)
-- 2. Admins can view all profiles (SELECT)
-- 3. Users can insert own profile (INSERT)
-- 4. Users can update own profile (UPDATE)
-- 5. Only admins can delete profiles (DELETE)

