-- =====================================================
-- AGREGAR COLUMNA is_active A LA TABLA profiles
-- =====================================================
-- Ejecuta este SQL en Supabase Dashboard > SQL Editor

-- Agregar la columna is_active si no existe
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Actualizar todos los registros existentes a activos (por si acaso algunos son null)
UPDATE profiles 
SET is_active = true 
WHERE is_active IS NULL;

-- Crear índice para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS profiles_is_active_idx ON profiles(is_active);

-- Verificar que la columna fue agregada correctamente
SELECT 
  column_name, 
  data_type, 
  column_default, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name = 'is_active';

