-- =====================================================
-- MIGRACIÓN: Agregar Datos de Facturación y Mejorar Estados de Pedidos
-- =====================================================
-- Esta migración agrega el campo billing_address para datos de facturación
-- y mejora el sistema de estados de pedidos según los requerimientos.
-- =====================================================

-- Agregar campo billing_address si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'billing_address'
  ) THEN
    ALTER TABLE orders ADD COLUMN billing_address jsonb;
    COMMENT ON COLUMN orders.billing_address IS 'Datos de facturación: {name, cuit, address, city, province, postal_code, phone, email}';
    RAISE NOTICE '✅ Columna "billing_address" agregada a "orders"';
  ELSE
    RAISE NOTICE 'ℹ️ Columna "billing_address" ya existe en "orders"';
  END IF;
END $$;

-- Verificar que los estados existan en el enum
-- Primero verificar si el tipo order_status existe, si no, crearlo
DO $$
BEGIN
  -- Verificar si el tipo order_status existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'order_status'
  ) THEN
    -- Crear el tipo order_status con todos los valores necesarios
    CREATE TYPE order_status AS ENUM (
      'pendiente',
      'confirmado',
      'preparando',
      'en_preparacion',
      'enviado',
      'entregado',
      'cancelado'
    );
    RAISE NOTICE '✅ Tipo "order_status" creado con todos los valores';
  ELSE
    -- El tipo existe, verificar si 'en_preparacion' existe
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum 
      WHERE enumlabel = 'en_preparacion' 
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')
    ) THEN
      -- Agregar 'en_preparacion' al enum existente
      ALTER TYPE order_status ADD VALUE 'en_preparacion';
      RAISE NOTICE '✅ Estado "en_preparacion" agregado al enum order_status';
    ELSE
      RAISE NOTICE 'ℹ️ Estado "en_preparacion" ya existe en order_status';
    END IF;
  END IF;
END $$;

-- Crear índice para billing_address si es necesario (para búsquedas futuras)
CREATE INDEX IF NOT EXISTS idx_orders_billing_address ON orders USING gin(billing_address);

-- Comentarios adicionales para documentación
COMMENT ON TABLE orders IS 'Tabla de pedidos con información completa del cliente, envío y facturación';
COMMENT ON COLUMN orders.shipping_address IS 'Dirección de envío: {name, phone, address, city, province, postal_code}';
COMMENT ON COLUMN orders.billing_address IS 'Dirección de facturación: {name, cuit, address, city, province, postal_code, phone, email}';

-- Verificar que la migración se completó correctamente
DO $$
DECLARE
  billing_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'billing_address'
  ) INTO billing_exists;

  RAISE NOTICE '--- VERIFICACIÓN DE MIGRACIÓN ---';
  RAISE NOTICE 'Columna billing_address existe: %', billing_exists;
  RAISE NOTICE '✅ Migración completada correctamente';
END $$;

