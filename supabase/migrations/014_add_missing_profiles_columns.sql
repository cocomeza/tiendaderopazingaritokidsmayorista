-- =====================================================
-- MIGRACIÓN: Agregar Columnas Faltantes a Profiles
-- =====================================================
-- Esta migración agrega las columnas locality, sales_type y ages
-- a la tabla profiles si no existen
-- =====================================================

-- Agregar columna locality si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'locality'
  ) THEN
    ALTER TABLE profiles ADD COLUMN locality TEXT;
    COMMENT ON COLUMN profiles.locality IS 'Localidad o ciudad del cliente';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'company_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN company_name TEXT;
    COMMENT ON COLUMN profiles.company_name IS 'Nombre de la empresa del cliente';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'sales_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN sales_type TEXT;
    COMMENT ON COLUMN profiles.sales_type IS 'Tipo de venta: local, showroom, online, empezando';
  END IF;
END $$;

-- Agregar columna billing_address si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'billing_address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN billing_address TEXT;
    COMMENT ON COLUMN profiles.billing_address IS 'Dirección de facturación del cliente';
  END IF;
END $$;

-- Agregar columna ages si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'ages'
  ) THEN
    ALTER TABLE profiles ADD COLUMN ages TEXT;
    COMMENT ON COLUMN profiles.ages IS 'Rangos de edad con los que trabaja (opcional)';
  END IF;
END $$;

-- Crear índices opcionales para búsquedas
CREATE INDEX IF NOT EXISTS idx_profiles_locality ON profiles(locality);
CREATE INDEX IF NOT EXISTS idx_profiles_sales_type ON profiles(sales_type);

-- Verificar que las columnas fueron creadas
DO $$
DECLARE
  locality_exists BOOLEAN;
  company_name_exists BOOLEAN;
  sales_type_exists BOOLEAN;
  billing_address_exists BOOLEAN;
  ages_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'locality'
  ) INTO locality_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'company_name'
  ) INTO company_name_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'sales_type'
  ) INTO sales_type_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'billing_address'
  ) INTO billing_address_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'ages'
  ) INTO ages_exists;
  
  RAISE NOTICE 'Columna locality: %', locality_exists;
  RAISE NOTICE 'Columna company_name: %', company_name_exists;
  RAISE NOTICE 'Columna sales_type: %', sales_type_exists;
  RAISE NOTICE 'Columna billing_address: %', billing_address_exists;
  RAISE NOTICE 'Columna ages: %', ages_exists;
END $$;

