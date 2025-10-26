-- SOLUCIÓN COMPLETA PARA CORREGIR ESQUEMA DE PRECIOS ARGENTINOS
-- ============================================================

-- PASO 1: Eliminar vistas que dependen de las columnas de precio
DROP VIEW IF EXISTS best_selling_products;
DROP VIEW IF EXISTS low_stock_products;
DROP VIEW IF EXISTS product_summary;

-- PASO 2: Cambiar el tipo de datos de los campos de precio
ALTER TABLE products 
ALTER COLUMN price TYPE DECIMAL(10,2),
ALTER COLUMN wholesale_price TYPE DECIMAL(10,2),
ALTER COLUMN cost_price TYPE DECIMAL(10,2);

-- PASO 3: Recrear las vistas con los nuevos tipos de datos
CREATE VIEW best_selling_products AS
SELECT 
    p.*,
    COALESCE(SUM(oi.quantity), 0) as total_sold
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
WHERE p.active = true
GROUP BY p.id
ORDER BY total_sold DESC
LIMIT 10;

CREATE VIEW low_stock_products AS
SELECT 
    p.*,
    CASE 
        WHEN p.stock <= p.low_stock_threshold THEN 'LOW'
        WHEN p.stock = 0 THEN 'OUT'
        ELSE 'OK'
    END as stock_status
FROM products p
WHERE p.active = true
AND (p.stock <= p.low_stock_threshold OR p.stock = 0)
ORDER BY p.stock ASC;

CREATE VIEW product_summary AS
SELECT 
    p.id,
    p.name,
    p.price,
    p.wholesale_price,
    p.stock,
    p.active,
    c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.active = true;

-- PASO 4: Verificar que los cambios se aplicaron correctamente
SELECT 
    column_name, 
    data_type, 
    numeric_precision, 
    numeric_scale 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('price', 'wholesale_price', 'cost_price');

-- PASO 5: Verificar que las vistas se recrearon correctamente
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('best_selling_products', 'low_stock_products', 'product_summary');
