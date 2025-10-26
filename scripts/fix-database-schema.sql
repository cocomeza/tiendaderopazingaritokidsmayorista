-- CORREGIR ESQUEMA DE BASE DE DATOS PARA PRECIOS ARGENTINOS
-- ========================================================

-- Cambiar el tipo de datos de los campos de precio para soportar precios argentinos
ALTER TABLE products 
ALTER COLUMN price TYPE DECIMAL(10,2),
ALTER COLUMN wholesale_price TYPE DECIMAL(10,2),
ALTER COLUMN cost_price TYPE DECIMAL(10,2);

-- Verificar que los cambios se aplicaron correctamente
SELECT column_name, data_type, numeric_precision, numeric_scale 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('price', 'wholesale_price', 'cost_price');
