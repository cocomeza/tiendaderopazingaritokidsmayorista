-- =====================================================
-- MIGRACIÓN: Tablas para Colores y Tallas Personalizados
-- =====================================================
-- Permite agregar colores y tallas personalizados
-- que se guardan en la base de datos
-- =====================================================

-- =====================================================
-- 1. TABLA: custom_colors (Colores Personalizados)
-- =====================================================
CREATE TABLE IF NOT EXISTS custom_colors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  hex_code text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE custom_colors IS 'Colores personalizados agregados por administradores';
COMMENT ON COLUMN custom_colors.name IS 'Nombre del color personalizado';
COMMENT ON COLUMN custom_colors.hex_code IS 'Código hexadecimal del color (opcional)';

-- Índice para búsqueda rápida
CREATE INDEX IF NOT EXISTS custom_colors_name_idx ON custom_colors(name);

-- Habilitar RLS
ALTER TABLE custom_colors ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden ver colores personalizados
CREATE POLICY "Custom colors are viewable by everyone"
  ON custom_colors FOR SELECT
  USING (true);

-- Política: Solo admins pueden insertar colores
CREATE POLICY "Only admins can insert custom colors"
  ON custom_colors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Política: Solo admins pueden actualizar colores
CREATE POLICY "Only admins can update custom colors"
  ON custom_colors FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Política: Solo admins pueden eliminar colores
CREATE POLICY "Only admins can delete custom colors"
  ON custom_colors FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_custom_colors_updated_at
  BEFORE UPDATE ON custom_colors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. TABLA: custom_sizes (Tallas Personalizadas)
-- =====================================================
CREATE TABLE IF NOT EXISTS custom_sizes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  size_type text CHECK (size_type IN ('BEBES', 'NINOS', 'ADULTOS', 'ZAPATOS', 'OTROS')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE custom_sizes IS 'Tallas personalizadas agregadas por administradores';
COMMENT ON COLUMN custom_sizes.name IS 'Nombre de la talla personalizada';
COMMENT ON COLUMN custom_sizes.size_type IS 'Tipo de talla: BEBES, NINOS, ADULTOS, ZAPATOS, OTROS';

-- Índices
CREATE INDEX IF NOT EXISTS custom_sizes_name_idx ON custom_sizes(name);
CREATE INDEX IF NOT EXISTS custom_sizes_size_type_idx ON custom_sizes(size_type);

-- Habilitar RLS
ALTER TABLE custom_sizes ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden ver tallas personalizadas
CREATE POLICY "Custom sizes are viewable by everyone"
  ON custom_sizes FOR SELECT
  USING (true);

-- Política: Solo admins pueden insertar tallas
CREATE POLICY "Only admins can insert custom sizes"
  ON custom_sizes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Política: Solo admins pueden actualizar tallas
CREATE POLICY "Only admins can update custom sizes"
  ON custom_sizes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Política: Solo admins pueden eliminar tallas
CREATE POLICY "Only admins can delete custom sizes"
  ON custom_sizes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_custom_sizes_updated_at
  BEFORE UPDATE ON custom_sizes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

