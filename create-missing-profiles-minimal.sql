-- =====================================================
-- Crear perfiles para usuarios existentes que no tienen perfil
-- Versión mínima - solo columnas absolutamente necesarias
-- =====================================================

-- Insertar solo con columnas básicas
INSERT INTO profiles (
  id,
  email,
  created_at
)
SELECT 
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verificar que se crearon los perfiles
SELECT 
  id,
  email,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- Contar total
SELECT 
  (SELECT COUNT(*) FROM auth.users) as usuarios,
  (SELECT COUNT(*) FROM profiles) as perfiles;

