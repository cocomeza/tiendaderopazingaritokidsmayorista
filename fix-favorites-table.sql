-- =====================================================
-- CREAR/CORREGIR TABLA FAVORITES
-- =====================================================

-- 1. Crear tabla favorites si no existe
CREATE TABLE IF NOT EXISTS favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  product_id uuid not null,
  created_at timestamp with time zone default now(),
  UNIQUE(user_id, product_id)
);

-- 2. Agregar foreign keys
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'favorites_user_id_fkey'
  ) THEN
    ALTER TABLE favorites ADD CONSTRAINT favorites_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'favorites_product_id_fkey'
  ) THEN
    ALTER TABLE favorites ADD CONSTRAINT favorites_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Crear índices
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_product_id_idx ON favorites(product_id);

-- 4. Habilitar RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 5. Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;

-- 6. Crear políticas RLS
-- Permitir que los usuarios vean sus propios favoritos
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Permitir que los usuarios gestionen sus propios favoritos
CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Verificar que se creó correctamente
SELECT 
  tablename,
  schemaname
FROM pg_tables
WHERE tablename = 'favorites';

-- 8. Verificar políticas
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename = 'favorites';

