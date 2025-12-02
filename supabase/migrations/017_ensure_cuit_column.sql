-- =====================================================
-- MIGRACIÓN: Asegurar que CUIT existe en profiles
-- =====================================================
-- Esta migración asegura que la columna cuit existe en la tabla profiles
-- =====================================================

-- Agregar columna cuit si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'cuit'
  ) THEN
    ALTER TABLE profiles ADD COLUMN cuit TEXT;
    COMMENT ON COLUMN profiles.cuit IS 'CUIT del cliente (obligatorio para nuevos registros)';
    RAISE NOTICE 'Columna cuit agregada a profiles';
  ELSE
    RAISE NOTICE 'Columna cuit ya existe en profiles';
  END IF;
END $$;

-- Crear índice para búsquedas por CUIT
CREATE INDEX IF NOT EXISTS idx_profiles_cuit ON profiles(cuit) WHERE cuit IS NOT NULL;

