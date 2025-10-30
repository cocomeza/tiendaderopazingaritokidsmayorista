-- =====================================================
-- AGREGAR POLÍTICA PARA QUE LOS ADMINS PUEDAN ACTUALIZAR PERFILES
-- =====================================================
-- Este script permite que los administradores puedan actualizar
-- cualquier perfil, necesario para desactivar clientes desde el panel admin

-- Eliminar política existente si hay conflicto
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Crear política para que los admins puedan actualizar cualquier perfil
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

-- Verificar que la política fue creada
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies
WHERE tablename = 'profiles' AND policyname = 'Admins can update all profiles';

