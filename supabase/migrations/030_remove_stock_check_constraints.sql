-- =====================================================
-- Migración: Eliminar constraints de stock que impiden valores negativos
-- =====================================================
-- Esta migración elimina los constraints CHECK que requieren stock >= 0
-- para permitir que los pedidos se creen sin restricciones de stock
-- =====================================================

-- Eliminar constraint de stock en tabla products
-- PostgreSQL puede generar diferentes nombres para el constraint
-- Intentamos eliminar todos los posibles nombres
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  -- Buscar el constraint de stock en products
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'products'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%stock%>=%0%';
  
  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE products DROP CONSTRAINT IF EXISTS %I', constraint_name);
    RAISE NOTICE '✅ Constraint eliminado de products: %', constraint_name;
  ELSE
    -- Si no se encuentra con LIKE, intentar nombres comunes
    ALTER TABLE products DROP CONSTRAINT IF EXISTS products_stock_check;
    ALTER TABLE products DROP CONSTRAINT IF EXISTS products_stock_check1;
    RAISE NOTICE '✅ Intentado eliminar constraints comunes de products';
  END IF;
END $$;

-- Eliminar constraint de stock en tabla product_variants
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  -- Buscar el constraint de stock en product_variants
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'product_variants'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%stock%>=%0%';
  
  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS %I', constraint_name);
    RAISE NOTICE '✅ Constraint eliminado de product_variants: %', constraint_name;
  ELSE
    -- Si no se encuentra con LIKE, intentar nombres comunes
    ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS product_variants_stock_check;
    ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS product_variants_stock_check1;
    RAISE NOTICE '✅ Intentado eliminar constraints comunes de product_variants';
  END IF;
END $$;

-- Verificar que los constraints fueron eliminados
DO $$
DECLARE
  products_constraint_exists BOOLEAN;
  variants_constraint_exists BOOLEAN;
BEGIN
  -- Verificar products
  SELECT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'products'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%stock%>=%0%'
  ) INTO products_constraint_exists;
  
  -- Verificar product_variants
  SELECT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'product_variants'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%stock%>=%0%'
  ) INTO variants_constraint_exists;
  
  IF NOT products_constraint_exists AND NOT variants_constraint_exists THEN
    RAISE NOTICE '✅ Todos los constraints de stock fueron eliminados correctamente';
  ELSIF products_constraint_exists THEN
    RAISE WARNING '⚠️ Aún existe un constraint de stock en products';
  ELSIF variants_constraint_exists THEN
    RAISE WARNING '⚠️ Aún existe un constraint de stock en product_variants';
  END IF;
END $$;

