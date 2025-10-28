-- =====================================================
-- Crear perfiles para usuarios existentes que no tienen perfil
-- Basado en las columnas REALES de tu tabla profiles
-- =====================================================

-- Tu tabla profiles tiene estas columnas:
-- id, email, full_name, phone, address, city, province, postal_code, 
-- is_admin, is_wholesale_client, min_order_amount, created_at, updated_at

INSERT INTO profiles (
  id,
  email,
  full_name,
  phone,
  address,
  city,
  province,
  postal_code,
  is_admin,
  is_wholesale_client,
  min_order_amount,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', 'Usuario Sin Nombre') as full_name,
  u.raw_user_meta_data->>'phone' as phone,
  u.raw_user_meta_data->>'address' as address,
  'Villa Ramallo' as city,
  'Buenos Aires' as province,
  u.raw_user_meta_data->>'postal_code' as postal_code,
  false as is_admin,
  true as is_wholesale_client,
  5 as min_order_amount,
  u.created_at,
  NOW() as updated_at
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verificar que se crearon los perfiles
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

-- Contar total
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_usuarios,
  (SELECT COUNT(*) FROM profiles) as total_perfiles,
  (SELECT COUNT(*) FROM auth.users) - (SELECT COUNT(*) FROM profiles) as usuarios_sin_perfil;

