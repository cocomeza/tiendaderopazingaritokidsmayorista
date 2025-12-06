-- =====================================================
-- MIGRACIÓN: Corregir Foreign Key para Eliminación de Profiles
-- =====================================================
-- Esta migración asegura que todas las foreign keys a profiles
-- tengan on delete cascade para permitir eliminación de clientes
-- =====================================================

-- Verificar y corregir la foreign key de orders.user_id
DO $$
DECLARE
  constraint_name TEXT;
  constraint_exists BOOLEAN;
BEGIN
  -- Buscar el nombre de la constraint actual
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'orders'::regclass
    AND confrelid = 'profiles'::regclass
    AND contype = 'f'
    AND conkey[1] = (
      SELECT attnum FROM pg_attribute
      WHERE attrelid = 'orders'::regclass
      AND attname = 'user_id'
    )
  LIMIT 1;
  
  -- Verificar si la constraint orders_user_id_fkey específica existe
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'orders'::regclass
    AND conname = 'orders_user_id_fkey'
  ) INTO constraint_exists;
  
  -- Si existe cualquier constraint, eliminarla
  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE orders DROP CONSTRAINT IF EXISTS %I', constraint_name);
    RAISE NOTICE '✅ Constraint "%" eliminada de orders', constraint_name;
  END IF;
  
  -- Solo crear la constraint si no existe
  IF NOT constraint_exists THEN
    ALTER TABLE orders
    ADD CONSTRAINT orders_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE;
    
    RAISE NOTICE '✅ Foreign key orders.user_id configurada con ON DELETE CASCADE';
  ELSE
    -- Si ya existe, eliminarla y recrearla para asegurar CASCADE
    EXECUTE format('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey');
    ALTER TABLE orders
    ADD CONSTRAINT orders_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE;
    
    RAISE NOTICE '✅ Foreign key orders.user_id actualizada con ON DELETE CASCADE';
  END IF;
END $$;

-- Verificar y corregir la foreign key de favorites.user_id
DO $$
DECLARE
  constraint_name TEXT;
  constraint_exists BOOLEAN;
BEGIN
  -- Buscar cualquier constraint existente en favorites.user_id que apunte a profiles
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'favorites'::regclass
    AND confrelid = 'profiles'::regclass
    AND contype = 'f'
    AND conkey[1] = (
      SELECT attnum FROM pg_attribute
      WHERE attrelid = 'favorites'::regclass
      AND attname = 'user_id'
    )
  LIMIT 1;
  
  -- Verificar si la constraint favorites_user_id_fkey específica existe
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'favorites'::regclass
    AND conname = 'favorites_user_id_fkey'
  ) INTO constraint_exists;
  
  -- Si existe cualquier constraint, eliminarla
  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE favorites DROP CONSTRAINT IF EXISTS %I', constraint_name);
    RAISE NOTICE '✅ Constraint "%" eliminada de favorites', constraint_name;
  END IF;
  
  -- Solo crear la constraint si no existe
  IF NOT constraint_exists THEN
    ALTER TABLE favorites
    ADD CONSTRAINT favorites_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE;
    
    RAISE NOTICE '✅ Foreign key favorites.user_id configurada con ON DELETE CASCADE';
  ELSE
    -- Si ya existe, verificar si tiene CASCADE y actualizarla si es necesario
    -- (PostgreSQL no permite modificar constraints directamente, así que la recreamos)
    EXECUTE format('ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_fkey');
    ALTER TABLE favorites
    ADD CONSTRAINT favorites_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE;
    
    RAISE NOTICE '✅ Foreign key favorites.user_id actualizada con ON DELETE CASCADE';
  END IF;
END $$;

-- Verificar que todas las foreign keys estén correctamente configuradas
DO $$
DECLARE
  orders_cascade BOOLEAN;
  favorites_cascade BOOLEAN;
BEGIN
  -- Verificar orders
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_class r ON c.confrelid = r.oid
    WHERE t.relname = 'orders'
      AND r.relname = 'profiles'
      AND c.contype = 'f'
      AND c.confdeltype = 'c' -- 'c' = CASCADE
  ) INTO orders_cascade;
  
  -- Verificar favorites
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_class r ON c.confrelid = r.oid
    WHERE t.relname = 'favorites'
      AND r.relname = 'profiles'
      AND c.contype = 'f'
      AND c.confdeltype = 'c' -- 'c' = CASCADE
  ) INTO favorites_cascade;
  
  RAISE NOTICE '--- VERIFICACIÓN DE MIGRACIÓN ---';
  RAISE NOTICE 'orders.user_id tiene ON DELETE CASCADE: %', orders_cascade;
  RAISE NOTICE 'favorites.user_id tiene ON DELETE CASCADE: %', favorites_cascade;
  RAISE NOTICE '✅ Migración completada correctamente';
END $$;

