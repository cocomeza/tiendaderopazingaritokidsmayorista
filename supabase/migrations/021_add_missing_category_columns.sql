-- =====================================================
-- MIGRACIÓN: Agregar columnas faltantes a categories
-- =====================================================
-- Esta migración agrega las columnas group_type, age_range, display_order
-- si no existen en la tabla categories
-- =====================================================

DO $$
BEGIN
  -- Agregar group_type si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'categories' 
    AND column_name = 'group_type'
  ) THEN
    ALTER TABLE categories ADD COLUMN group_type TEXT;
    ALTER TABLE categories ADD CONSTRAINT categories_group_type_check 
      CHECK (group_type IS NULL OR group_type IN ('menu', 'age', 'back-to-school'));
    RAISE NOTICE '✅ Columna group_type agregada';
  ELSE
    RAISE NOTICE 'ℹ️ Columna group_type ya existe';
  END IF;

  -- Agregar age_range si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'categories' 
    AND column_name = 'age_range'
  ) THEN
    ALTER TABLE categories ADD COLUMN age_range TEXT;
    RAISE NOTICE '✅ Columna age_range agregada';
  ELSE
    RAISE NOTICE 'ℹ️ Columna age_range ya existe';
  END IF;

  -- Agregar display_order si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'categories' 
    AND column_name = 'display_order'
  ) THEN
    ALTER TABLE categories ADD COLUMN display_order INTEGER DEFAULT 0;
    RAISE NOTICE '✅ Columna display_order agregada';
  ELSE
    RAISE NOTICE 'ℹ️ Columna display_order ya existe';
  END IF;

  -- Crear índices si no existen
  CREATE INDEX IF NOT EXISTS categories_group_type_idx ON categories(group_type);
  CREATE INDEX IF NOT EXISTS categories_age_range_idx ON categories(age_range);
  CREATE INDEX IF NOT EXISTS categories_display_order_idx ON categories(display_order);
  
  RAISE NOTICE '✅ Índices creados o ya existentes';
END $$;

