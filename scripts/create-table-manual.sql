-- CREAR TABLA DE DESCUENTOS MANUALMENTE EN SUPABASE
-- ================================================

-- 1. Crear la tabla
CREATE TABLE discount_rules (
    id SERIAL PRIMARY KEY,
    min_quantity INTEGER NOT NULL CHECK (min_quantity > 0),
    max_quantity INTEGER CHECK (max_quantity IS NULL OR max_quantity > min_quantity),
    discount_percentage DECIMAL(5,2) NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices
CREATE INDEX idx_discount_rules_active ON discount_rules(is_active);
CREATE INDEX idx_discount_rules_quantity ON discount_rules(min_quantity, max_quantity);

-- 3. Habilitar RLS
ALTER TABLE discount_rules ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas
CREATE POLICY "discount_rules_select_policy" ON discount_rules FOR SELECT USING (true);
CREATE POLICY "discount_rules_insert_policy" ON discount_rules FOR INSERT WITH CHECK (true);
CREATE POLICY "discount_rules_update_policy" ON discount_rules FOR UPDATE USING (true);
CREATE POLICY "discount_rules_delete_policy" ON discount_rules FOR DELETE USING (true);

-- 5. Insertar reglas por defecto
INSERT INTO discount_rules (min_quantity, max_quantity, discount_percentage, is_active) VALUES
(5, 9, 5.00, true),
(10, 24, 10.00, true),
(25, 49, 15.00, true),
(50, 99, 20.00, true),
(100, NULL, 25.00, true);

-- 6. Verificar que se insertaron correctamente
SELECT * FROM discount_rules ORDER BY min_quantity;
