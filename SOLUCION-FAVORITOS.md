# 🔧 Solución: No se Agregan Productos a Favoritos

## 🔍 Pasos de Diagnóstico

### 1. Verificar la Tabla en Supabase

Ejecuta este SQL en el SQL Editor:

```sql
-- ¿Existe la tabla favorites?
SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_tables WHERE tablename = 'favorites'
  ) THEN '✅ La tabla EXISTE' 
  ELSE '❌ La tabla NO EXISTE' 
  END as estado;
```

**Si dice "NO EXISTE"**: Ejecuta el SQL de `fix-favorites-table.sql`

### 2. Verificar Errores en Consola

1. Abre la consola del navegador (F12)
2. Intenta agregar un producto a favoritos
3. Busca estos logs:
   - `🔥 handleAddToFavorites called!`
   - `✅ User is authenticated`
   - `🔄 Inserting into favorites table...`
   - **Si hay error**: verás el mensaje completo

### 3. Verificar Mensajes de Error

En la consola, busca:
- `Error code:`
- `Error message:`
- `Error details:`

## ⚠️ Posibles Problemas

### Problema 1: Tabla NO Existe ❌

**Solución**: Ejecuta el SQL de `fix-favorites-table.sql` en Supabase

### Problema 2: Falta Perfil ❌

**Mensaje**: "new row violates row-level security policy"

**Solución**: El usuario necesita tener un perfil en la tabla `profiles`

Ejecuta esto para verificar:
```sql
SELECT 
  u.email,
  CASE WHEN p.id IS NULL THEN '❌ SIN PERFIL' ELSE '✅ CON PERFIL' END
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id;
```

Si no tiene perfil, crea uno (ya hicimos esto antes)

### Problema 3: Políticas RLS Incorrectas ❌

**Mensaje**: "permission denied"

**Solución**: Ejecuta esto:

```sql
-- Ver políticas actuales
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'favorites';

-- Si no hay políticas o están mal, ejecuta:
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);
```

### Problema 4: Constraint Unique Violado ❌

**Mensaje**: "duplicate key value violates unique constraint"

**Esto es normal**: Significa que ya está en favoritos

### Problema 5: Producto NO Existe ❌

**Mensaje**: "Key is not present in table products"

**Solución**: Verifica que el producto existe en la tabla `products`

## 🧪 Test Rápido

Después de verificar todo, haz este test:

1. **Abre la consola** (F12 → Console)
2. **Ve a** `/productos`
3. **Haz clic** en el corazón de un producto
4. **Mira la consola** - deberías ver:
   ```
   🔥 handleAddToFavorites called! [id-producto]
   ✅ User is authenticated
   🔄 Inserting into favorites table...
   ✅ Successfully added to favorites
   ```

5. **Si hay error**, copia el mensaje completo de error

## 📋 Checklist de Verificación

Ejecuta este SQL completo para verificar TODO:

```sql
-- Ver TODO el estado de la tabla
SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_tables WHERE tablename = 'favorites'
  ) THEN '✅ Tabla existe' 
  ELSE '❌ Tabla NO existe' 
  END as estado_tabla;

SELECT 
  CASE WHEN COUNT(*) = 0 THEN '❌ NO hay políticas'
  ELSE CONCAT('✅ ', COUNT(*), ' políticas')
  END as estado_politicas
FROM pg_policies WHERE tablename = 'favorites';

SELECT COUNT(*) as total_favoritos FROM favorites;

SELECT 
  u.email,
  CASE WHEN p.id IS NULL THEN '❌ SIN PERFIL' ELSE '✅ CON PERFIL' END
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
LIMIT 5;
```

## 💡 Solución Rápida si Nada Funciona

Ejecuta TODO este SQL en Supabase:

```sql
-- Crear tabla completa de favorites
CREATE TABLE IF NOT EXISTS favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  product_id uuid not null,
  created_at timestamp with time zone default now(),
  UNIQUE(user_id, product_id)
);

-- Foreign keys
ALTER TABLE favorites ADD CONSTRAINT IF NOT EXISTS favorites_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE favorites ADD CONSTRAINT IF NOT EXISTS favorites_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Índices
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_product_id_idx ON favorites(product_id);

-- RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);
```

## 🎯 Siguiente Paso

1. **Ejecuta el SQL de diagnóstico** en Supabase
2. **Comparte el resultado** conmigo
3. **Abre la consola** (F12)
4. **Intenta agregar a favoritos**
5. **Copia el error** que aparece en consola

Con esa información podremos solucionar el problema específico.

