-- Verificar QUÉ columnas existen en la tabla profiles
-- Ejecuta este query para ver todas las columnas

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

