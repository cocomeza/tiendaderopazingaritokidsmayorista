-- =====================================================
-- Migración: Corregir validación de stock al decrementar
-- =====================================================
-- Esta migración corrige la función decrement_product_stock()
-- para validar que hay suficiente stock antes de decrementar
-- y evitar violaciones del constraint stock >= 0
-- =====================================================

-- Modificar la función para validar stock antes de decrementar
CREATE OR REPLACE FUNCTION decrement_product_stock()
RETURNS TRIGGER AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  -- Obtener el stock actual del producto
  SELECT stock INTO current_stock
  FROM products
  WHERE id = NEW.product_id;
  
  -- Si no se encuentra el producto, lanzar error
  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'Producto con id % no encontrado', NEW.product_id;
  END IF;
  
  -- Validar que hay suficiente stock
  IF current_stock < NEW.quantity THEN
    RAISE EXCEPTION 'Stock insuficiente para el producto %. Stock disponible: %, cantidad solicitada: %', 
      NEW.product_id, current_stock, NEW.quantity;
  END IF;
  
  -- Decrementar el stock solo si hay suficiente
  UPDATE products
  SET stock = stock - NEW.quantity
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verificar que la función se creó correctamente
DO $$
DECLARE
  function_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'decrement_product_stock'
  ) INTO function_exists;
  
  IF function_exists THEN
    RAISE NOTICE '✅ Función decrement_product_stock actualizada correctamente';
  ELSE
    RAISE WARNING '⚠️ Función decrement_product_stock no encontrada';
  END IF;
END $$;

