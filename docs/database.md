# 🗄️ Base de Datos - Configuración de Supabase

Guía completa para configurar la base de datos en Supabase.

---

## 📊 Esquema de Base de Datos

### Tablas Principales

- **profiles** - Perfiles de usuarios
- **products** - Productos del catálogo
- **categories** - Categorías de productos
- **orders** - Pedidos de clientes
- **order_items** - Items de cada pedido
- **favorites** - Productos favoritos de usuarios
- **discounts** - Descuentos configurados

---

## 🔧 Paso 1: Ejecutar Migraciones

### Orden de Ejecución

Las migraciones están en `supabase/migrations/`:

1. `001_initial_schema.sql` - Esquema inicial
2. `007_ensure_profile_insert_policy.sql` - Políticas RLS
3. `008_fix_profile_policies.sql` - Correciones
4. `009_add_performance_indexes.sql` - Índices de performance

### Cómo Ejecutarlas

1. Ve a tu proyecto en Supabase Dashboard
2. Ve a **SQL Editor**
3. Copia el contenido de cada migración
4. Ejecuta en orden
5. Verifica que no haya errores

---

## 🔐 Paso 2: Configurar Row Level Security (RLS)

Las políticas RLS están incluidas en las migraciones.

### Verificar Políticas

Ejecuta en Supabase SQL Editor:

```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
SELECT * FROM pg_policies WHERE tablename = 'products';
SELECT * FROM pg_policies WHERE tablename = 'favorites';
```

---

## 📦 Paso 3: Configurar Storage

### Crear Bucket

1. Ve a **Storage** en Supabase
2. Click en **"New bucket"**
3. Nombre: `product-images`
4. Público: ✅ (para que los usuarios vean las imágenes)
5. Click **"Create bucket"**

### Configurar Políticas de Storage

Ejecuta en SQL Editor:

```sql
-- Permitir lectura pública de imágenes
CREATE POLICY "Imágenes públicas"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

-- Permitir que usuarios autenticados suban imágenes
CREATE POLICY "Upload imágenes autenticadas"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );
```

---

## 🔑 Paso 4: Índices de Performance

Los índices optimizan las queries. Ya están en `009_add_performance_indexes.sql`.

### Importancia de los Índices

- ⚡ Queries 10x más rápidas
- 🔍 Búsqueda de texto eficiente
- 📊 Filtros y ordenamiento optimizado

---

## 🧪 Paso 5: Datos de Prueba (Opcional)

Para desarrollo, puedes insertar datos de prueba:

```sql
-- Insertar categorías
INSERT INTO categories (name) VALUES 
('Ropa de Bebé'),
('Ropa Infantil'),
('Accesorios');

-- Insertar producto de ejemplo
INSERT INTO products (name, description, price, wholesale_price, category_id, stock)
VALUES (
  'Body de Algodón',
  'Body 100% algodón, suave y cómodo',
  1500.00,
  1200.00,
  'cat_id_aqui',
  50
);
```

---

## 🔍 Paso 6: Verificar Configuración

### Checklist

- [ ] Migraciones ejecutadas sin errores
- [ ] Políticas RLS activadas
- [ ] Bucket de storage creado
- [ ] Índices creados
- [ ] Datos de prueba insertados (opcional)

---

## 🐛 Troubleshooting

### Error: "Table already exists"
**Solución:** Las tablas ya existen. Verifica la estructura con `SELECT * FROM table_name LIMIT 1;`

### Error: "Policy already exists"
**Solución:** La política ya está creada. Verifica con `SELECT * FROM pg_policies;`

### Error: "Permission denied"
**Solución:** Verifica que tengas permisos de admin en Supabase o usa `service_role_key`

### RLS bloquea queries
**Solución:** Verifica que las políticas estén correctamente configuradas para usuarios autenticados

---

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Setup](https://supabase.com/docs/guides/storage)

---

## 💡 Tips

- Usa diferentes proyectos de Supabase para dev/prod
- Revisa logs de Supabase para errores
- Prueba las queries en SQL Editor primero
- Haz backup antes de cambios importantes

---

**Base de datos configurada correctamente.** ✅

