-- Verificar si el usuario tiene perfil
-- Reemplaza 'TU_EMAIL_AQUI' con el email del usuario logueado

SELECT 
  u.id as user_id,
  u.email,
  p.id as profile_id,
  p.full_name,
  p.phone,
  p.address,
  p.city,
  p.province,
  CASE WHEN p.id IS NULL THEN 'SIN PERFIL' ELSE 'CON PERFIL' END as estado
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'TU_EMAIL_AQUI';

-- Ver todos los usuarios y sus perfiles
SELECT 
  u.id,
  u.email,
  p.id as profile_id,
  p.full_name,
  CASE WHEN p.id IS NULL THEN '❌ SIN PERFIL' ELSE '✅ CON PERFIL' END as estado
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
ORDER BY u.created_at DESC;

