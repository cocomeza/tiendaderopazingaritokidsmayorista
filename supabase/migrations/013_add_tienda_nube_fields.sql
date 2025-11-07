-- =====================================================
-- MIGRACIÓN: Agregar campos faltantes de Tienda Nube
-- =====================================================
-- Esta migración agrega todos los campos del CSV de Tienda Nube
-- que no están actualmente en la tabla products
-- 
-- Fecha: Enero 2025
-- =====================================================

-- Agregar campo cost_price si no existe (algunas versiones ya lo tienen)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'cost_price'
  ) THEN
    ALTER TABLE products ADD COLUMN cost_price numeric(10, 2);
  END IF;
END $$;

-- =====================================================
-- 1. DIMENSIONES Y PESO (Para envíos)
-- =====================================================
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS weight_kg numeric(10, 3) CHECK (weight_kg >= 0),
ADD COLUMN IF NOT EXISTS height_cm numeric(10, 2) CHECK (height_cm >= 0),
ADD COLUMN IF NOT EXISTS width_cm numeric(10, 2) CHECK (width_cm >= 0),
ADD COLUMN IF NOT EXISTS depth_cm numeric(10, 2) CHECK (depth_cm >= 0);

COMMENT ON COLUMN products.weight_kg IS 'Peso del producto en kilogramos';
COMMENT ON COLUMN products.height_cm IS 'Alto del producto en centímetros';
COMMENT ON COLUMN products.width_cm IS 'Ancho del producto en centímetros';
COMMENT ON COLUMN products.depth_cm IS 'Profundidad del producto en centímetros';

-- =====================================================
-- 2. INFORMACIÓN DE PRODUCTO
-- =====================================================
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS barcode text,
ADD COLUMN IF NOT EXISTS mpn text,
ADD COLUMN IF NOT EXISTS brand text;

COMMENT ON COLUMN products.barcode IS 'Código de barras del producto';
COMMENT ON COLUMN products.mpn IS 'Número de pieza del fabricante (MPN)';
COMMENT ON COLUMN products.brand IS 'Marca del producto';

-- Índice para búsqueda por marca
CREATE INDEX IF NOT EXISTS products_brand_idx ON products(brand) WHERE brand IS NOT NULL;

-- =====================================================
-- 3. SEO Y MARKETING
-- =====================================================
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS seo_title text,
ADD COLUMN IF NOT EXISTS seo_description text,
ADD COLUMN IF NOT EXISTS tags text[];

COMMENT ON COLUMN products.seo_title IS 'Título optimizado para SEO';
COMMENT ON COLUMN products.seo_description IS 'Descripción optimizada para SEO';
COMMENT ON COLUMN products.tags IS 'Array de tags para búsqueda y filtros';

-- Índice GIN para búsqueda en tags
CREATE INDEX IF NOT EXISTS products_tags_gin_idx ON products USING gin(tags);

-- =====================================================
-- 4. CLASIFICACIÓN
-- =====================================================
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('niños', 'niñas', 'unisex', 'bebes', null)),
ADD COLUMN IF NOT EXISTS age_range text;

COMMENT ON COLUMN products.gender IS 'Género: niños, niñas, unisex, bebes';
COMMENT ON COLUMN products.age_range IS 'Rango de edad del producto';

-- Índices para filtros
CREATE INDEX IF NOT EXISTS products_gender_idx ON products(gender) WHERE gender IS NOT NULL;
CREATE INDEX IF NOT EXISTS products_age_range_idx ON products(age_range) WHERE age_range IS NOT NULL;

-- =====================================================
-- 5. LOGÍSTICA
-- =====================================================
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS free_shipping boolean DEFAULT false;

COMMENT ON COLUMN products.free_shipping IS 'Si el producto tiene envío sin cargo';

-- Índice para productos con envío gratis
CREATE INDEX IF NOT EXISTS products_free_shipping_idx ON products(free_shipping) WHERE free_shipping = true;

-- =====================================================
-- 6. PROPIEDADES ADICIONALES
-- =====================================================
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS property_3_name text,
ADD COLUMN IF NOT EXISTS property_3_value text;

COMMENT ON COLUMN products.property_3_name IS 'Nombre de propiedad adicional 3';
COMMENT ON COLUMN products.property_3_value IS 'Valor de propiedad adicional 3';

-- =====================================================
-- 7. URL IDENTIFIER (Para referencia con Tienda Nube)
-- =====================================================
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS url_identifier text;

COMMENT ON COLUMN products.url_identifier IS 'Identificador de URL de Tienda Nube (para referencia)';

-- Índice para búsqueda por URL identifier
CREATE INDEX IF NOT EXISTS products_url_identifier_idx ON products(url_identifier) WHERE url_identifier IS NOT NULL;

-- =====================================================
-- ÍNDICES COMPUESTOS PARA PERFORMANCE
-- =====================================================

-- Búsqueda por género y rango de edad
CREATE INDEX IF NOT EXISTS products_gender_age_range_idx 
ON products(gender, age_range) 
WHERE gender IS NOT NULL AND age_range IS NOT NULL;

-- Búsqueda por marca y activo
CREATE INDEX IF NOT EXISTS products_brand_active_idx 
ON products(brand, active) 
WHERE brand IS NOT NULL AND active = true;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Verificar que todos los campos se agregaron correctamente
DO $$
DECLARE
  missing_columns text[];
BEGIN
  SELECT array_agg(column_name) INTO missing_columns
  FROM (
    SELECT column_name
    FROM (VALUES
      ('weight_kg'),
      ('height_cm'),
      ('width_cm'),
      ('depth_cm'),
      ('barcode'),
      ('mpn'),
      ('brand'),
      ('seo_title'),
      ('seo_description'),
      ('tags'),
      ('gender'),
      ('age_range'),
      ('free_shipping'),
      ('property_3_name'),
      ('property_3_value'),
      ('url_identifier')
    ) AS expected(column_name)
    WHERE NOT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND column_name = expected.column_name
    )
  ) AS missing;

  IF array_length(missing_columns, 1) > 0 THEN
    RAISE WARNING 'Algunos campos no se agregaron: %', missing_columns;
  ELSE
    RAISE NOTICE '✅ Todos los campos se agregaron correctamente';
  END IF;
END $$;

