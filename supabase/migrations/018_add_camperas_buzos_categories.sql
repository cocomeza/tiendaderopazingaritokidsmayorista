-- =====================================================
-- MIGRACIÓN: Agregar categorías adicionales
-- =====================================================
-- Esta migración asegura que las categorías: Camperas, Buzos, Camisas,
-- Bodys, Bermudas, Calzados y Combos existan en la base de datos
-- para poder asignarlas a productos y usarlas en filtros y ajustes de precios
-- =====================================================

-- Función auxiliar para generar slug desde nombre
CREATE OR REPLACE FUNCTION generate_slug(input_name TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(input_name, '[áàäâ]', 'a', 'gi'),
        '[éèëê]', 'e', 'gi'
      ),
      '[^a-z0-9]+', '-', 'gi'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Verificar qué columnas existen y agregar las categorías usando solo las columnas disponibles
DO $$
DECLARE
  has_group_type BOOLEAN;
  has_age_range BOOLEAN;
  has_display_order BOOLEAN;
  has_slug BOOLEAN;
  camperas_exists BOOLEAN;
  buzos_exists BOOLEAN;
  camisas_exists BOOLEAN;
  bodys_exists BOOLEAN;
  bermudas_exists BOOLEAN;
  calzados_exists BOOLEAN;
  combos_exists BOOLEAN;
  camperas_slug TEXT;
  buzos_slug TEXT;
  camisas_slug TEXT;
  bodys_slug TEXT;
  bermudas_slug TEXT;
  calzados_slug TEXT;
  combos_slug TEXT;
BEGIN
  -- Verificar si las columnas existen
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'group_type'
  ) INTO has_group_type;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'age_range'
  ) INTO has_age_range;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'display_order'
  ) INTO has_display_order;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'slug'
  ) INTO has_slug;
  
  -- Generar slugs
  camperas_slug := generate_slug('Camperas');
  buzos_slug := generate_slug('Buzos');
  camisas_slug := generate_slug('Camisas');
  bodys_slug := generate_slug('Bodys');
  bermudas_slug := generate_slug('Bermudas');
  calzados_slug := generate_slug('Calzados');
  combos_slug := generate_slug('Combos');
  
  -- Verificar si las categorías ya existen
  SELECT EXISTS (
    SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Camperas')
  ) INTO camperas_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Buzos')
  ) INTO buzos_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Camisas')
  ) INTO camisas_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Bodys')
  ) INTO bodys_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Bermudas')
  ) INTO bermudas_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Calzados')
  ) INTO calzados_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Combos')
  ) INTO combos_exists;
  
  -- Insertar "Camperas" si no existe
  IF NOT camperas_exists THEN
    IF has_slug AND has_group_type AND has_age_range AND has_display_order THEN
      INSERT INTO categories (name, slug, description, group_type, age_range, display_order, active)
      VALUES ('Camperas', camperas_slug, 'Camperas para todas las edades', 'menu', NULL, 6, true);
    ELSIF has_slug AND has_display_order THEN
      INSERT INTO categories (name, slug, description, display_order, active)
      VALUES ('Camperas', camperas_slug, 'Camperas para todas las edades', 6, true);
    ELSIF has_slug THEN
      INSERT INTO categories (name, slug, description, active)
      VALUES ('Camperas', camperas_slug, 'Camperas para todas las edades', true);
    ELSIF has_group_type AND has_age_range AND has_display_order THEN
      INSERT INTO categories (name, description, group_type, age_range, display_order, active)
      VALUES ('Camperas', 'Camperas para todas las edades', 'menu', NULL, 6, true);
    ELSIF has_display_order THEN
      INSERT INTO categories (name, description, display_order, active)
      VALUES ('Camperas', 'Camperas para todas las edades', 6, true);
    ELSE
      INSERT INTO categories (name, description, active)
      VALUES ('Camperas', 'Camperas para todas las edades', true);
    END IF;
    RAISE NOTICE '✅ Categoría "Camperas" creada';
  ELSE
    RAISE NOTICE 'ℹ️ Categoría "Camperas" ya existe';
  END IF;
  
  -- Insertar "Buzos" si no existe
  IF NOT buzos_exists THEN
    IF has_slug AND has_group_type AND has_age_range AND has_display_order THEN
      INSERT INTO categories (name, slug, description, group_type, age_range, display_order, active)
      VALUES ('Buzos', buzos_slug, 'Buzos y buzos con capucha para todas las edades', 'menu', NULL, 7, true);
    ELSIF has_slug AND has_display_order THEN
      INSERT INTO categories (name, slug, description, display_order, active)
      VALUES ('Buzos', buzos_slug, 'Buzos y buzos con capucha para todas las edades', 7, true);
    ELSIF has_slug THEN
      INSERT INTO categories (name, slug, description, active)
      VALUES ('Buzos', buzos_slug, 'Buzos y buzos con capucha para todas las edades', true);
    ELSIF has_group_type AND has_age_range AND has_display_order THEN
      INSERT INTO categories (name, description, group_type, age_range, display_order, active)
      VALUES ('Buzos', 'Buzos y buzos con capucha para todas las edades', 'menu', NULL, 7, true);
    ELSIF has_display_order THEN
      INSERT INTO categories (name, description, display_order, active)
      VALUES ('Buzos', 'Buzos y buzos con capucha para todas las edades', 7, true);
    ELSE
      INSERT INTO categories (name, description, active)
      VALUES ('Buzos', 'Buzos y buzos con capucha para todas las edades', true);
    END IF;
    RAISE NOTICE '✅ Categoría "Buzos" creada';
  ELSE
    RAISE NOTICE 'ℹ️ Categoría "Buzos" ya existe';
  END IF;
  
  -- Insertar "Camisas" si no existe
  IF NOT camisas_exists THEN
    IF has_slug AND has_group_type AND has_age_range AND has_display_order THEN
      INSERT INTO categories (name, slug, description, group_type, age_range, display_order, active)
      VALUES ('Camisas', camisas_slug, 'Camisas para todas las edades', 'menu', NULL, 8, true);
    ELSIF has_slug AND has_display_order THEN
      INSERT INTO categories (name, slug, description, display_order, active)
      VALUES ('Camisas', camisas_slug, 'Camisas para todas las edades', 8, true);
    ELSIF has_slug THEN
      INSERT INTO categories (name, slug, description, active)
      VALUES ('Camisas', camisas_slug, 'Camisas para todas las edades', true);
    ELSIF has_group_type AND has_age_range AND has_display_order THEN
      INSERT INTO categories (name, description, group_type, age_range, display_order, active)
      VALUES ('Camisas', 'Camisas para todas las edades', 'menu', NULL, 8, true);
    ELSIF has_display_order THEN
      INSERT INTO categories (name, description, display_order, active)
      VALUES ('Camisas', 'Camisas para todas las edades', 8, true);
    ELSE
      INSERT INTO categories (name, description, active)
      VALUES ('Camisas', 'Camisas para todas las edades', true);
    END IF;
    RAISE NOTICE '✅ Categoría "Camisas" creada';
  ELSE
    RAISE NOTICE 'ℹ️ Categoría "Camisas" ya existe';
  END IF;
  
  -- Insertar "Bodys" si no existe
  IF NOT bodys_exists THEN
    IF has_slug AND has_group_type AND has_age_range AND has_display_order THEN
      INSERT INTO categories (name, slug, description, group_type, age_range, display_order, active)
      VALUES ('Bodys', bodys_slug, 'Bodys para todas las edades', 'menu', NULL, 9, true);
    ELSIF has_slug AND has_display_order THEN
      INSERT INTO categories (name, slug, description, display_order, active)
      VALUES ('Bodys', bodys_slug, 'Bodys para todas las edades', 9, true);
    ELSIF has_slug THEN
      INSERT INTO categories (name, slug, description, active)
      VALUES ('Bodys', bodys_slug, 'Bodys para todas las edades', true);
    ELSIF has_group_type AND has_age_range AND has_display_order THEN
      INSERT INTO categories (name, description, group_type, age_range, display_order, active)
      VALUES ('Bodys', 'Bodys para todas las edades', 'menu', NULL, 9, true);
    ELSIF has_display_order THEN
      INSERT INTO categories (name, description, display_order, active)
      VALUES ('Bodys', 'Bodys para todas las edades', 9, true);
    ELSE
      INSERT INTO categories (name, description, active)
      VALUES ('Bodys', 'Bodys para todas las edades', true);
    END IF;
    RAISE NOTICE '✅ Categoría "Bodys" creada';
  ELSE
    RAISE NOTICE 'ℹ️ Categoría "Bodys" ya existe';
  END IF;
  
  -- Insertar "Bermudas" si no existe
  IF NOT bermudas_exists THEN
    IF has_slug AND has_group_type AND has_age_range AND has_display_order THEN
      INSERT INTO categories (name, slug, description, group_type, age_range, display_order, active)
      VALUES ('Bermudas', bermudas_slug, 'Bermudas para todas las edades', 'menu', NULL, 10, true);
    ELSIF has_slug AND has_display_order THEN
      INSERT INTO categories (name, slug, description, display_order, active)
      VALUES ('Bermudas', bermudas_slug, 'Bermudas para todas las edades', 10, true);
    ELSIF has_slug THEN
      INSERT INTO categories (name, slug, description, active)
      VALUES ('Bermudas', bermudas_slug, 'Bermudas para todas las edades', true);
    ELSIF has_group_type AND has_age_range AND has_display_order THEN
      INSERT INTO categories (name, description, group_type, age_range, display_order, active)
      VALUES ('Bermudas', 'Bermudas para todas las edades', 'menu', NULL, 10, true);
    ELSIF has_display_order THEN
      INSERT INTO categories (name, description, display_order, active)
      VALUES ('Bermudas', 'Bermudas para todas las edades', 10, true);
    ELSE
      INSERT INTO categories (name, description, active)
      VALUES ('Bermudas', 'Bermudas para todas las edades', true);
    END IF;
    RAISE NOTICE '✅ Categoría "Bermudas" creada';
  ELSE
    RAISE NOTICE 'ℹ️ Categoría "Bermudas" ya existe';
  END IF;
  
  -- Insertar "Calzados" si no existe
  IF NOT calzados_exists THEN
    IF has_slug AND has_group_type AND has_age_range AND has_display_order THEN
      INSERT INTO categories (name, slug, description, group_type, age_range, display_order, active)
      VALUES ('Calzados', calzados_slug, 'Calzados para todas las edades', 'menu', NULL, 11, true);
    ELSIF has_slug AND has_display_order THEN
      INSERT INTO categories (name, slug, description, display_order, active)
      VALUES ('Calzados', calzados_slug, 'Calzados para todas las edades', 11, true);
    ELSIF has_slug THEN
      INSERT INTO categories (name, slug, description, active)
      VALUES ('Calzados', calzados_slug, 'Calzados para todas las edades', true);
    ELSIF has_group_type AND has_age_range AND has_display_order THEN
      INSERT INTO categories (name, description, group_type, age_range, display_order, active)
      VALUES ('Calzados', 'Calzados para todas las edades', 'menu', NULL, 11, true);
    ELSIF has_display_order THEN
      INSERT INTO categories (name, description, display_order, active)
      VALUES ('Calzados', 'Calzados para todas las edades', 11, true);
    ELSE
      INSERT INTO categories (name, description, active)
      VALUES ('Calzados', 'Calzados para todas las edades', true);
    END IF;
    RAISE NOTICE '✅ Categoría "Calzados" creada';
  ELSE
    RAISE NOTICE 'ℹ️ Categoría "Calzados" ya existe';
  END IF;
  
  -- Insertar "Combos" si no existe
  IF NOT combos_exists THEN
    IF has_slug AND has_group_type AND has_age_range AND has_display_order THEN
      INSERT INTO categories (name, slug, description, group_type, age_range, display_order, active)
      VALUES ('Combos', combos_slug, 'Combos y sets para todas las edades', 'menu', NULL, 12, true);
    ELSIF has_slug AND has_display_order THEN
      INSERT INTO categories (name, slug, description, display_order, active)
      VALUES ('Combos', combos_slug, 'Combos y sets para todas las edades', 12, true);
    ELSIF has_slug THEN
      INSERT INTO categories (name, slug, description, active)
      VALUES ('Combos', combos_slug, 'Combos y sets para todas las edades', true);
    ELSIF has_group_type AND has_age_range AND has_display_order THEN
      INSERT INTO categories (name, description, group_type, age_range, display_order, active)
      VALUES ('Combos', 'Combos y sets para todas las edades', 'menu', NULL, 12, true);
    ELSIF has_display_order THEN
      INSERT INTO categories (name, description, display_order, active)
      VALUES ('Combos', 'Combos y sets para todas las edades', 12, true);
    ELSE
      INSERT INTO categories (name, description, active)
      VALUES ('Combos', 'Combos y sets para todas las edades', true);
    END IF;
    RAISE NOTICE '✅ Categoría "Combos" creada';
  ELSE
    RAISE NOTICE 'ℹ️ Categoría "Combos" ya existe';
  END IF;
  
  -- Verificar que las categorías fueron creadas correctamente
  SELECT EXISTS (
    SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Camperas') AND active = true
  ) INTO camperas_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Buzos') AND active = true
  ) INTO buzos_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Camisas') AND active = true
  ) INTO camisas_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Bodys') AND active = true
  ) INTO bodys_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Bermudas') AND active = true
  ) INTO bermudas_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Calzados') AND active = true
  ) INTO calzados_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Combos') AND active = true
  ) INTO combos_exists;
  
  IF camperas_exists THEN
    RAISE NOTICE '✅ Categoría "Camperas" existe y está activa';
  ELSE
    RAISE WARNING '⚠️ Categoría "Camperas" no existe o está inactiva';
  END IF;
  
  IF buzos_exists THEN
    RAISE NOTICE '✅ Categoría "Buzos" existe y está activa';
  ELSE
    RAISE WARNING '⚠️ Categoría "Buzos" no existe o está inactiva';
  END IF;
  
  IF camisas_exists THEN
    RAISE NOTICE '✅ Categoría "Camisas" existe y está activa';
  ELSE
    RAISE WARNING '⚠️ Categoría "Camisas" no existe o está inactiva';
  END IF;
  
  IF bodys_exists THEN
    RAISE NOTICE '✅ Categoría "Bodys" existe y está activa';
  ELSE
    RAISE WARNING '⚠️ Categoría "Bodys" no existe o está inactiva';
  END IF;
  
  IF bermudas_exists THEN
    RAISE NOTICE '✅ Categoría "Bermudas" existe y está activa';
  ELSE
    RAISE WARNING '⚠️ Categoría "Bermudas" no existe o está inactiva';
  END IF;
  
  IF calzados_exists THEN
    RAISE NOTICE '✅ Categoría "Calzados" existe y está activa';
  ELSE
    RAISE WARNING '⚠️ Categoría "Calzados" no existe o está inactiva';
  END IF;
  
  IF combos_exists THEN
    RAISE NOTICE '✅ Categoría "Combos" existe y está activa';
  ELSE
    RAISE WARNING '⚠️ Categoría "Combos" no existe o está inactiva';
  END IF;
END $$;

