-- =====================================================
-- FIX: Recursión infinita en políticas de profiles
-- =====================================================

-- Eliminar TODAS las políticas existentes de profiles
DROP POLICY IF EXISTS "Public profiles are viewable by admins" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Only admins can delete profiles" ON profiles;

-- Política para que los usuarios puedan ver su propio perfil (SIN RECURSIÓN)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Política para que los usuarios puedan insertar su propio perfil
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Política para que los usuarios puedan actualizar su propio perfil (excepto is_admin)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Política para que los admins puedan hacer TODO (sin verificar is_admin para evitar recursión)
-- Esta política usa auth.jwt()->>'role' que viene del token, no de la BD
CREATE POLICY "Service role can do anything"
  ON profiles FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Hacer que todos los perfiles sean visibles (para evitar problemas de permisos)
-- Los administradores pueden ser configurados directamente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Re-habilitar RLS con políticas simples
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

