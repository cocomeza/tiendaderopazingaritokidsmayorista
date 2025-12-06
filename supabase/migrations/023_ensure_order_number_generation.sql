-- =====================================================
-- MIGRACIÓN: Asegurar Generación Segura de Números de Orden
-- =====================================================
-- Esta migración asegura que la función generate_order_number() esté disponible
-- y crea un trigger para generar automáticamente el order_number si no se proporciona,
-- evitando race conditions y asegurando unicidad.
-- =====================================================

-- Asegurar que la función generate_order_number() exista y funcione correctamente
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  new_number text;
  date_part text;
  counter integer;
  max_retries integer := 10;
  retry_count integer := 0;
BEGIN
  date_part := to_char(now(), 'YYYYMMDD');
  
  -- Intentar generar un número único con reintentos en caso de colisión
  LOOP
    SELECT coalesce(max(
      cast(substring(order_number from 'ZK-[0-9]+-([0-9]+)') as integer)
    ), 0) + 1
    INTO counter
    FROM orders
    WHERE order_number LIKE 'ZK-' || date_part || '-%';
    
    new_number := 'ZK-' || date_part || '-' || lpad(counter::text, 4, '0');
    
    -- Verificar que el número no exista (protección adicional contra race conditions)
    IF NOT EXISTS (
      SELECT 1 FROM orders WHERE order_number = new_number
    ) THEN
      RETURN new_number;
    END IF;
    
    -- Si hay colisión, incrementar contador y reintentar
    retry_count := retry_count + 1;
    IF retry_count >= max_retries THEN
      RAISE EXCEPTION 'No se pudo generar un número de orden único después de % intentos', max_retries;
    END IF;
    
    counter := counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Comentario para documentación
COMMENT ON FUNCTION generate_order_number() IS 'Genera un número de orden único en formato ZK-YYYYMMDD-XXXX. Incluye protección contra race conditions.';

-- Función para el trigger que genera order_number automáticamente si es NULL
CREATE OR REPLACE FUNCTION set_order_number_if_null()
RETURNS trigger AS $$
BEGIN
  -- Solo generar order_number si no se proporcionó uno
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS auto_generate_order_number ON orders;

-- Crear trigger que se ejecuta ANTES de insertar
CREATE TRIGGER auto_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number_if_null();

-- Comentario para documentación
COMMENT ON TRIGGER auto_generate_order_number ON orders IS 'Genera automáticamente el order_number si no se proporciona uno al insertar un pedido.';

-- Verificar que la migración se completó correctamente
DO $$
DECLARE
  function_exists BOOLEAN;
  trigger_exists BOOLEAN;
BEGIN
  -- Verificar que la función existe
  SELECT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'generate_order_number'
  ) INTO function_exists;
  
  -- Verificar que el trigger existe
  SELECT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE c.relname = 'orders' AND t.tgname = 'auto_generate_order_number'
  ) INTO trigger_exists;
  
  RAISE NOTICE '--- VERIFICACIÓN DE MIGRACIÓN ---';
  RAISE NOTICE 'Función generate_order_number() existe: %', function_exists;
  RAISE NOTICE 'Trigger auto_generate_order_number existe: %', trigger_exists;
  RAISE NOTICE '✅ Migración completada correctamente';
END $$;

