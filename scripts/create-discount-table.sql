-- CREAR TABLA DE DESCUENTOS POR CANTIDAD
-- =====================================

-- Crear tabla para reglas de descuento
CREATE TABLE IF NOT EXISTS discount_rules (
    id SERIAL PRIMARY KEY,
    min_quantity INTEGER NOT NULL CHECK (min_quantity > 0),
    max_quantity INTEGER CHECK (max_quantity IS NULL OR max_quantity > min_quantity),
    discount_percentage DECIMAL(5,2) NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_discount_rules_active ON discount_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_discount_rules_quantity ON discount_rules(min_quantity, max_quantity);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_discount_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_discount_rules_updated_at ON discount_rules;
CREATE TRIGGER trigger_update_discount_rules_updated_at
    BEFORE UPDATE ON discount_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_discount_rules_updated_at();

-- Insertar reglas de descuento por defecto
INSERT INTO discount_rules (min_quantity, max_quantity, discount_percentage, is_active) VALUES
(5, 9, 5.00, true),
(10, 24, 10.00, true),
(25, 49, 15.00, true),
(50, 99, 20.00, true),
(100, NULL, 25.00, true);

-- Habilitar RLS (Row Level Security)
ALTER TABLE discount_rules ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad
CREATE POLICY "discount_rules_select_policy" ON discount_rules FOR SELECT USING (true);
CREATE POLICY "discount_rules_insert_policy" ON discount_rules FOR INSERT WITH CHECK (true);
CREATE POLICY "discount_rules_update_policy" ON discount_rules FOR UPDATE USING (true);
CREATE POLICY "discount_rules_delete_policy" ON discount_rules FOR DELETE USING (true);

-- Crear vista para consultar descuentos fácilmente
CREATE OR REPLACE VIEW discount_summary AS
SELECT 
    id,
    min_quantity,
    max_quantity,
    discount_percentage,
    is_active,
    CASE 
        WHEN max_quantity IS NULL THEN CONCAT(min_quantity, '+ unidades')
        ELSE CONCAT(min_quantity, ' - ', max_quantity, ' unidades')
    END as quantity_range,
    CONCAT(discount_percentage, '%') as discount_display
FROM discount_rules
WHERE is_active = true
ORDER BY min_quantity;

COMMENT ON TABLE discount_rules IS 'Reglas de descuento por cantidad para productos mayoristas';
COMMENT ON VIEW discount_summary IS 'Vista resumen de reglas de descuento activas';
