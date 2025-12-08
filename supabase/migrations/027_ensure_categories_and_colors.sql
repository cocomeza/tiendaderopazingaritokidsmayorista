-- =====================================================
-- MIGRACIÓN: Asegurar Categorías y Colores Requeridos
-- =====================================================
-- Esta migración verifica y agrega las categorías y colores
-- requeridos para el sistema de productos
-- =====================================================

-- =====================================================
-- 1. CATEGORÍAS REQUERIDAS
-- =====================================================
DO $$
DECLARE
  required_categories TEXT[] := ARRAY[
    'REMERAS',
    'CONJUNTOS',
    'SHORT',
    'BERMUDAS',
    'CALZAS',
    'PANTALONES',
    'JARDINEROS',
    'CAMISAS',
    'CAMISACOS',
    'CAMPERAS',
    'ACCESORIOS',
    'CALZADO'
  ];
  cat_name TEXT;
  cat_exists BOOLEAN;
  has_group_type BOOLEAN;
  has_age_range BOOLEAN;
  has_display_order BOOLEAN;
  display_order_val INTEGER := 1;
BEGIN
  -- Verificar qué columnas existen en categories
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
  
  -- Iterar sobre cada categoría requerida
  FOREACH cat_name IN ARRAY required_categories
  LOOP
    -- Verificar si la categoría ya existe (case-insensitive)
    SELECT EXISTS (
      SELECT 1 FROM categories 
      WHERE LOWER(TRIM(name)) = LOWER(TRIM(cat_name))
    ) INTO cat_exists;
    
    IF NOT cat_exists THEN
      -- Insertar la categoría según las columnas disponibles
      IF has_group_type AND has_age_range AND has_display_order THEN
        INSERT INTO categories (name, description, group_type, age_range, display_order, active)
        VALUES (
          cat_name,
          'Categoría ' || cat_name,
          'menu',
          NULL,
          display_order_val,
          true
        );
      ELSIF has_display_order THEN
        INSERT INTO categories (name, description, display_order, active)
        VALUES (
          cat_name,
          'Categoría ' || cat_name,
          display_order_val,
          true
        );
      ELSE
        INSERT INTO categories (name, description, active)
        VALUES (
          cat_name,
          'Categoría ' || cat_name,
          true
        );
      END IF;
      
      RAISE NOTICE '✅ Categoría "%" agregada', cat_name;
    ELSE
      RAISE NOTICE 'ℹ️ Categoría "%" ya existe', cat_name;
    END IF;
    
    display_order_val := display_order_val + 1;
  END LOOP;
  
  RAISE NOTICE '--- Verificación de categorías completada ---';
END $$;

-- =====================================================
-- 2. COLORES REQUERIDOS
-- =====================================================
DO $$
DECLARE
  required_colors TEXT[] := ARRAY[
    'BLANCO',
    'NEGRO',
    'ACQUA',
    'TERRACOTA',
    'BORRAVINO',
    'ROSA',
    'AZUL MARINO',
    'NATURAL',
    'TOSTADO',
    'GRIS',
    'VIOLETA',
    'ROJO',
    'VERDE',
    'FUCSIA',
    'NARANJA',
    'CELESTE',
    'CREMA',
    'BATIK'
  ];
  color_name TEXT;
  color_exists BOOLEAN;
  table_exists BOOLEAN;
BEGIN
  -- Verificar si la tabla custom_colors existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'custom_colors'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    RAISE WARNING '⚠️ La tabla custom_colors no existe. Creándola...';
    
    -- Crear la tabla custom_colors si no existe
    CREATE TABLE IF NOT EXISTS custom_colors (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      name text NOT NULL UNIQUE,
      hex_code text,
      created_at timestamp with time zone DEFAULT now(),
      updated_at timestamp with time zone DEFAULT now()
    );
    
    CREATE INDEX IF NOT EXISTS custom_colors_name_idx ON custom_colors(name);
    
    ALTER TABLE custom_colors ENABLE ROW LEVEL SECURITY;
    
    -- Políticas RLS básicas
    DROP POLICY IF EXISTS "Custom colors are viewable by everyone" ON custom_colors;
    CREATE POLICY "Custom colors are viewable by everyone"
      ON custom_colors FOR SELECT
      USING (true);
    
    DROP POLICY IF EXISTS "Only admins can insert custom colors" ON custom_colors;
    CREATE POLICY "Only admins can insert custom colors"
      ON custom_colors FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
        )
      );
    
    DROP POLICY IF EXISTS "Only admins can update custom colors" ON custom_colors;
    CREATE POLICY "Only admins can update custom colors"
      ON custom_colors FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
        )
      );
    
    DROP POLICY IF EXISTS "Only admins can delete custom colors" ON custom_colors;
    CREATE POLICY "Only admins can delete custom colors"
      ON custom_colors FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
        )
      );
    
    -- Trigger para updated_at si existe la función
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
      DROP TRIGGER IF EXISTS update_custom_colors_updated_at ON custom_colors;
      CREATE TRIGGER update_custom_colors_updated_at
        BEFORE UPDATE ON custom_colors
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    RAISE NOTICE '✅ Tabla custom_colors creada';
  END IF;
  
  -- Iterar sobre cada color requerido
  FOREACH color_name IN ARRAY required_colors
  LOOP
    -- Verificar si el color ya existe (case-insensitive)
    SELECT EXISTS (
      SELECT 1 FROM custom_colors 
      WHERE LOWER(TRIM(name)) = LOWER(TRIM(color_name))
    ) INTO color_exists;
    
    IF NOT color_exists THEN
      -- Insertar el color
      INSERT INTO custom_colors (name)
      VALUES (color_name)
      ON CONFLICT (name) DO NOTHING;
      
      RAISE NOTICE '✅ Color "%" agregado', color_name;
    ELSE
      RAISE NOTICE 'ℹ️ Color "%" ya existe', color_name;
    END IF;
  END LOOP;
  
  RAISE NOTICE '--- Verificación de colores completada ---';
END $$;

-- =====================================================
-- 3. VERIFICACIÓN FINAL
-- =====================================================
DO $$
DECLARE
  categories_count INTEGER;
  colors_count INTEGER;
  required_categories_count INTEGER := 12;
  required_colors_count INTEGER := 18;
BEGIN
  -- Contar categorías activas
  SELECT COUNT(*) INTO categories_count
  FROM categories
  WHERE active = true
  AND LOWER(TRIM(name)) IN (
    'remeras', 'conjuntos', 'short', 'bermudas', 'calzas',
    'pantalones', 'jardineros', 'camisas', 'camisacos',
    'camperas', 'accesorios', 'calzado'
  );
  
  -- Contar colores
  SELECT COUNT(*) INTO colors_count
  FROM custom_colors
  WHERE LOWER(TRIM(name)) IN (
    'blanco', 'negro', 'acqua', 'terracota', 'borravino',
    'rosa', 'azul marino', 'natural', 'tostado', 'gris',
    'violeta', 'rojo', 'verde', 'fucsia', 'naranja',
    'celeste', 'crema', 'batik'
  );
  
  RAISE NOTICE '--- RESUMEN DE VERIFICACIÓN ---';
  RAISE NOTICE 'Categorías requeridas encontradas: % de %', categories_count, required_categories_count;
  RAISE NOTICE 'Colores requeridos encontrados: % de %', colors_count, required_colors_count;
  
  IF categories_count >= required_categories_count AND colors_count >= required_colors_count THEN
    RAISE NOTICE '✅ Migración completada correctamente: Todas las categorías y colores requeridos están presentes';
  ELSE
    RAISE WARNING '⚠️ Algunas categorías o colores pueden estar faltando. Revisa los logs anteriores.';
  END IF;
END $$;

