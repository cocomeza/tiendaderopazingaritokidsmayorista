-- =====================================================
-- SCRIPT PARA CREAR USUARIO ADMINISTRADOR
-- Ejecuta este script en: Supabase Dashboard > SQL Editor
-- =====================================================

-- Opción 1: Si el usuario ya existe en auth.users
-- Simplemente promueve el usuario existente a admin

UPDATE profiles 
SET is_admin = true 
WHERE email = 'admin@zingarito.com';

-- Si no existe el perfil, primero necesitas crear el usuario de autenticación
-- Ve a Authentication > Users en el dashboard de Supabase
-- Crea el usuario con email: admin@zingarito.com
-- Luego ejecuta este SQL para crear el perfil y hacerlo admin:

-- Insertar perfil de admin (ajusta el UUID al usuario que creaste)
/*
INSERT INTO profiles (id, email, full_name, is_admin, is_active)
VALUES (
  'AQUI-VA-EL-UUID-DEL-USUARIO',  -- Reemplaza con el ID del usuario de auth.users
  'admin@zingarito.com',
  'Administrador Principal',
  true,
  true
);
*/

-- Verificar que se creó correctamente
SELECT email, is_admin, is_active, created_at 
FROM profiles 
WHERE email = 'admin@zingarito.com';

