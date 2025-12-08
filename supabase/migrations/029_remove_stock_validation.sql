-- =====================================================
-- Migración: Eliminar validación de stock
-- =====================================================
-- Esta migración elimina la validación de stock que bloquea pedidos
-- Permite que los pedidos se creen sin restricciones de stock
-- =====================================================

-- Modificar la función para NO validar stock, solo decrementar
-- Si el stock es negativo, se permite (se puede ajustar después manualmente)
CREATE OR REPLACE FUNCTION decrement_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrementar el stock sin validación
  -- Si el stock queda negativo, se permite (se puede corregir después)
  UPDATE products
  SET stock = stock - NEW.quantity
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar que la función se actualizó correctamente
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
    RAISE NOTICE '✅ Función decrement_product_stock actualizada - validación de stock eliminada';
  ELSE
    RAISE WARNING '⚠️ Función decrement_product_stock no encontrada';
  END IF;
END $$;

