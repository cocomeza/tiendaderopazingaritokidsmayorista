-- =====================================================
-- MIGRACIÓN: Asegurar Columnas en order_items
-- =====================================================
-- Esta migración asegura que todas las columnas necesarias
-- existan en la tabla order_items, especialmente product_name
-- =====================================================

-- Agregar product_name si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'product_name'
  ) THEN
    ALTER TABLE order_items ADD COLUMN product_name text;
    
    -- Si hay registros existentes, actualizar product_name desde products
    UPDATE order_items oi
    SET product_name = p.name
    FROM products p
    WHERE oi.product_id = p.id AND oi.product_name IS NULL;
    
    -- Hacer la columna NOT NULL después de actualizar los valores
    ALTER TABLE order_items ALTER COLUMN product_name SET NOT NULL;
    
    RAISE NOTICE '✅ Columna "product_name" agregada a "order_items"';
  ELSE
    RAISE NOTICE 'ℹ️ Columna "product_name" ya existe en "order_items"';
  END IF;
END $$;

-- Agregar product_sku si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'product_sku'
  ) THEN
    ALTER TABLE order_items ADD COLUMN product_sku text;
    RAISE NOTICE '✅ Columna "product_sku" agregada a "order_items"';
  ELSE
    RAISE NOTICE 'ℹ️ Columna "product_sku" ya existe en "order_items"';
  END IF;
END $$;

-- Agregar size si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'size'
  ) THEN
    ALTER TABLE order_items ADD COLUMN size text;
    RAISE NOTICE '✅ Columna "size" agregada a "order_items"';
  ELSE
    RAISE NOTICE 'ℹ️ Columna "size" ya existe en "order_items"';
  END IF;
END $$;

-- Agregar color si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'color'
  ) THEN
    ALTER TABLE order_items ADD COLUMN color text;
    RAISE NOTICE '✅ Columna "color" agregada a "order_items"';
  ELSE
    RAISE NOTICE 'ℹ️ Columna "color" ya existe en "order_items"';
  END IF;
END $$;

-- Verificar que la migración se completó correctamente
DO $$
DECLARE
  product_name_exists BOOLEAN;
  product_sku_exists BOOLEAN;
  size_exists BOOLEAN;
  color_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'product_name'
  ) INTO product_name_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'product_sku'
  ) INTO product_sku_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'size'
  ) INTO size_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'color'
  ) INTO color_exists;
  
  RAISE NOTICE '--- VERIFICACIÓN DE MIGRACIÓN ---';
  RAISE NOTICE 'Columna product_name existe: %', product_name_exists;
  RAISE NOTICE 'Columna product_sku existe: %', product_sku_exists;
  RAISE NOTICE 'Columna size existe: %', size_exists;
  RAISE NOTICE 'Columna color existe: %', color_exists;
  RAISE NOTICE '✅ Migración completada correctamente';
END $$;

