-- Verificar si la tabla favorites existe
SELECT 
  tablename,
  schemaname
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'favorites';

-- Verificar columnas de la tabla
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'favorites'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename = 'favorites';

-- Ver favoritos existentes
SELECT COUNT(*) as total_favoritos FROM favorites;

-- Ver si hay datos en la tabla
SELECT * FROM favorites LIMIT 5;

