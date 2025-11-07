-- =====================================================
-- MIGRACIÓN: Crear Tabla de Favoritos
-- =====================================================
-- Esta migración crea la tabla favorites para que los usuarios
-- puedan guardar productos como favoritos
-- =====================================================

-- Eliminar tabla si existe (para recrearla con la foreign key correcta)
DROP TABLE IF EXISTS favorites CASCADE;

-- Crear tabla de favoritos
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint para evitar duplicados
  UNIQUE(user_id, product_id),
  
  -- Foreign key a auth.users (NO a profiles, porque el perfil podría no existir aún)
  CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

-- Comentarios para documentación
COMMENT ON TABLE favorites IS 'Tabla de productos favoritos de los usuarios';
COMMENT ON COLUMN favorites.user_id IS 'ID del usuario que marcó el favorito';
COMMENT ON COLUMN favorites.product_id IS 'ID del producto marcado como favorito';

-- Habilitar RLS (Row Level Security)
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

-- Política para que los usuarios solo puedan ver sus propios favoritos
CREATE POLICY "Users can view their own favorites" 
  ON favorites 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para que los usuarios solo puedan insertar sus propios favoritos
CREATE POLICY "Users can insert their own favorites" 
  ON favorites 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios solo puedan eliminar sus propios favoritos
CREATE POLICY "Users can delete their own favorites" 
  ON favorites 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_favorites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_favorites_updated_at_trigger ON favorites;
CREATE TRIGGER update_favorites_updated_at_trigger
  BEFORE UPDATE ON favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_favorites_updated_at();

