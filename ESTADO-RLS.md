# Estado de las Políticas RLS (Row Level Security)

## ✅ Políticas Configuradas Correctamente

### Tabla: `profiles`

#### 1. **SELECT (Lectura)**
```sql
Policy: "Public profiles are viewable by admins"
- Los usuarios pueden ver su propio perfil (`auth.uid() = id`)
- Los administradores pueden ver todos los perfiles
```

#### 2. **INSERT (Creación)**
```sql
Policy: "Users can insert own profile"
- Los usuarios pueden insertar su propio perfil (`auth.uid() = id`)
- ✅ ESTO PERMITE EL REGISTRO CORRECTAMENTE
```

#### 3. **UPDATE (Actualización)**
```sql
Policy: "Users can update own profile"
- Los usuarios pueden actualizar solo su propio perfil (`auth.uid() = id`)
```

#### 4. **DELETE (Eliminación)**
```sql
Policy: "Only admins can delete profiles"
- Solo los administradores pueden eliminar perfiles
```

## 📝 Orden de Ejecución de Migraciones

Para que el registro funcione correctamente, ejecuta las migraciones en este orden:

1. **001_initial_schema.sql** - Schema inicial con todas las tablas
2. **002_add_delete_profiles_policy.sql** - Política de eliminación
3. **003_add_company_fields_to_profiles.sql** - Campos de empresa
4. **004_create_stock_history.sql** - Historial de stock
5. **005_add_is_active_to_profiles.sql** - Campo is_active
6. **006_add_new_customer_fields.sql** - Nuevos campos de cliente
7. **007_ensure_profile_insert_policy.sql** - Asegurar política de inserción

## ⚠️ IMPORTANTE: Proyecto Supabase Pausado

Tu proyecto de Supabase está **pausado** por inactividad. Esto puede causar:
- Emails de confirmación no se envían
- Errores al guardar datos
- Conexiones inestables

### Solución:
1. Ve a https://supabase.com/dashboard
2. Proyecto "tienda-ropa-argentina"
3. Configuración → Pausar/Restaurar proyecto
4. **Reactiva el proyecto**

## 🔧 Verificar Políticas RLS

Para verificar que las políticas están correctas:

```sql
-- Ver todas las políticas de profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';
```

## ✅ Funcionalidad de Registro

El registro **debería funcionar** con las políticas actuales porque:

1. ✅ El usuario puede insertar su propio perfil (policy: "Users can insert own profile")
2. ✅ El usuario puede leer su propio perfil (policy: "Public profiles are viewable by admins")
3. ✅ El usuario puede actualizar su propio perfil (policy: "Users can update own profile")

### Si el registro falla:

1. **Verifica que el proyecto no esté pausado**
2. **Ejecuta todas las migraciones en orden**
3. **Verifica que los campos existen en la tabla**

```sql
-- Verificar columnas de profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles';
```

## 🚫 Errores Comunes

### Error: "Error actualizando perfil: {}"
**Causa**: Las columnas `locality`, `sales_type`, `ages` no existen en la tabla.

**Solución**: Ejecuta la migración `006_add_new_customer_fields.sql`

### Error: "new row violates row-level security policy"
**Causa**: La política RLS está bloqueando la inserción.

**Solución**: 
- Verifica que `auth.uid()` está disponible (usuario autenticado)
- Ejecuta la migración `007_ensure_profile_insert_policy.sql`

### Email de confirmación no llega
**Causa**: Proyecto pausado o configuración de email incorrecta.

**Solución**:
- Reactiva el proyecto en Supabase
- Temporalmente desactiva la confirmación por email en Auth Settings

## 📊 Tablas con RLS Habilitado

- ✅ `profiles` - Políticas configuradas correctamente
- ✅ `products` - Lectura pública, escritura solo admins
- ✅ `orders` - Usuarios ven solo sus pedidos
- ✅ `order_items` - Vinculado a orders
- ✅ `favorites` - Usuarios gestionan solo sus favoritos
- ✅ `business_config` - Lectura pública, escritura solo admins
- ✅ `stock_history` - Solo admins pueden ver/modificar

