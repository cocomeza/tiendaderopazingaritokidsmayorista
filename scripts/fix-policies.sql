-- Script para corregir las políticas RLS que causan recursión infinita
-- =====================================================

-- Eliminar todas las políticas problemáticas
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Crear políticas simples que no causen recursión
CREATE POLICY "Enable read access for all users" ON profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON profiles FOR UPDATE USING (true);

-- Verificar que las políticas estén funcionando
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
