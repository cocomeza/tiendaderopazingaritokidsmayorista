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

-- Agregar quantity si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'quantity'
  ) THEN
    ALTER TABLE order_items ADD COLUMN quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0);
    RAISE NOTICE '✅ Columna "quantity" agregada a "order_items"';
  ELSE
    RAISE NOTICE 'ℹ️ Columna "quantity" ya existe en "order_items"';
  END IF;
END $$;

-- Agregar unit_price si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'unit_price'
  ) THEN
    ALTER TABLE order_items ADD COLUMN unit_price numeric(10, 2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0);
    RAISE NOTICE '✅ Columna "unit_price" agregada a "order_items"';
  ELSE
    RAISE NOTICE 'ℹ️ Columna "unit_price" ya existe en "order_items"';
  END IF;
END $$;

-- Agregar subtotal si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'subtotal'
  ) THEN
    ALTER TABLE order_items ADD COLUMN subtotal numeric(10, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0);
    
    -- Si hay registros existentes, calcular subtotal desde quantity * unit_price
    UPDATE order_items
    SET subtotal = quantity * unit_price
    WHERE subtotal = 0 AND quantity > 0 AND unit_price > 0;
    
    RAISE NOTICE '✅ Columna "subtotal" agregada a "order_items"';
  ELSE
    RAISE NOTICE 'ℹ️ Columna "subtotal" ya existe en "order_items"';
  END IF;
END $$;

-- Agregar total_price si no existe (puede ser un alias de subtotal)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'total_price'
  ) THEN
    ALTER TABLE order_items ADD COLUMN total_price numeric(10, 2) NOT NULL DEFAULT 0 CHECK (total_price >= 0);
    
    -- Si hay registros existentes, calcular total_price desde subtotal o quantity * unit_price
    UPDATE order_items
    SET total_price = COALESCE(subtotal, quantity * unit_price, 0)
    WHERE total_price = 0 AND (subtotal > 0 OR (quantity > 0 AND unit_price > 0));
    
    RAISE NOTICE '✅ Columna "total_price" agregada a "order_items"';
  ELSE
    RAISE NOTICE 'ℹ️ Columna "total_price" ya existe en "order_items"';
    
    -- Asegurar que los registros existentes tengan total_price si está NULL
    UPDATE order_items
    SET total_price = COALESCE(subtotal, quantity * unit_price, 0)
    WHERE total_price IS NULL OR total_price = 0;
  END IF;
END $$;

-- Verificar que la migración se completó correctamente
DO $$
DECLARE
  product_name_exists BOOLEAN;
  product_sku_exists BOOLEAN;
  size_exists BOOLEAN;
  color_exists BOOLEAN;
  quantity_exists BOOLEAN;
  unit_price_exists BOOLEAN;
  subtotal_exists BOOLEAN;
  total_price_exists BOOLEAN;
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
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'quantity'
  ) INTO quantity_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'unit_price'
  ) INTO unit_price_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'subtotal'
  ) INTO subtotal_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'total_price'
  ) INTO total_price_exists;
  
  RAISE NOTICE '--- VERIFICACIÓN DE MIGRACIÓN ---';
  RAISE NOTICE 'Columna product_name existe: %', product_name_exists;
  RAISE NOTICE 'Columna product_sku existe: %', product_sku_exists;
  RAISE NOTICE 'Columna size existe: %', size_exists;
  RAISE NOTICE 'Columna color existe: %', color_exists;
  RAISE NOTICE 'Columna quantity existe: %', quantity_exists;
  RAISE NOTICE 'Columna unit_price existe: %', unit_price_exists;
  RAISE NOTICE 'Columna subtotal existe: %', subtotal_exists;
  RAISE NOTICE 'Columna total_price existe: %', total_price_exists;
  RAISE NOTICE '✅ Migración completada correctamente';
END $$;

