-- =====================================================
-- Crear perfiles para usuarios existentes que no tienen perfil
-- Versión segura que adapta las columnas automáticamente
-- =====================================================

-- PASO 1: Verificar qué columnas existen en profiles
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN (
    'id', 'email', 'full_name', 'phone', 'company_name', 
    'cuit', 'billing_address', 'is_admin', 'is_active', 
    'created_at', 'updated_at'
  )
ORDER BY ordinal_position;

-- PASO 2: Si las columnas existen, ejecuta esto:
-- (Ajusta según las columnas que viste en PASO 1)

-- Versión mínima (solo columnas básicas)
INSERT INTO profiles (
  id,
  email,
  full_name,
  phone,
  is_active,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', 'Usuario') as full_name,
  u.raw_user_meta_data->>'phone' as phone,
  true as is_active,
  u.created_at,
  NOW() as updated_at
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- PASO 3: Verificar que se crearon los perfiles
SELECT 
  id,
  email,
  full_name,
  phone,
  is_admin,
  is_active,
  created_at
FROM profiles
ORDER BY created_at DESC;

