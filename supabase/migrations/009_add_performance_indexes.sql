-- =====================================================
-- Índices adicionales para mejorar performance
-- =====================================================

-- Índices compuestos para queries frecuentes
CREATE INDEX IF NOT EXISTS products_active_created_at_idx 
ON products(active, created_at DESC) 
WHERE active = true;

-- Índice para búsqueda de productos
CREATE INDEX IF NOT EXISTS products_name_search_idx 
ON products USING gin(to_tsvector('spanish', name));

-- Índice para filtros de precio
CREATE INDEX IF NOT EXISTS products_price_range_idx 
ON products(active, wholesale_price) 
WHERE active = true;

-- Índice para filtros de categoría
CREATE INDEX IF NOT EXISTS products_category_active_idx 
ON products(category_id, active) 
WHERE active = true;

-- Índice para stock
CREATE INDEX IF NOT EXISTS products_stock_active_idx 
ON products(stock, active) 
WHERE active = true;

-- Verificar índices creados
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'products' 
AND indexname LIKE 'products_%'
ORDER BY indexname;

