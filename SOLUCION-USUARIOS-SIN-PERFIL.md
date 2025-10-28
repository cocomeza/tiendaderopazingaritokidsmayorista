# Solución: Usuarios sin Perfil

## ❌ Problema Detectado

Hay **3 usuarios** en `auth.users` pero **0 perfiles** en la tabla `profiles`. Esto significa que:

1. Los usuarios se registraron correctamente en Supabase Auth
2. Pero nunca se creó su perfil en la tabla `profiles`
3. Por lo tanto, no pueden usar funcionalidades que requieren perfil (favoritos, carrito, pedidos, etc.)

## 🔍 Causa Raíz

El problema es que las **políticas RLS (Row Level Security)** están bloqueando la creación de perfiles. Cuando un usuario intenta registrarse:

1. Se crea el usuario en `auth.users` ✅
2. El código intenta crear el perfil en `profiles` ❌
3. Las políticas RLS bloquean la inserción ❌
4. El usuario queda sin perfil ❌

## ✅ Solución Paso a Paso

### Paso 1: Verificar Estado Actual

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Copia y pega el contenido de `check-users-and-profiles.sql`
5. Ejecuta el query

**Deberías ver:**
- 3 usuarios en `auth.users`
- 0 perfiles en `profiles`
- 3 usuarios sin perfil

### Paso 2: Corregir Políticas RLS

1. En el **SQL Editor**, copia y pega el contenido de `fix-profile-rls-policies.sql`
2. Ejecuta el query

Esto creará las políticas correctas que permitirán a los usuarios crear sus perfiles.

**Deberías ver estas 5 políticas creadas:**
1. `Users can view own profile` (SELECT)
2. `Admins can view all profiles` (SELECT)
3. `Users can insert own profile` (INSERT)
4. `Users can update own profile` (UPDATE)
5. `Only admins can delete profiles` (DELETE)

### Paso 3: Verificar estructura de la tabla profiles

**MUY IMPORTANTE**: Antes de crear perfiles, verifica qué columnas existen:

1. En el **SQL Editor**, copia y pega el contenido de `check-profile-structure.sql`
2. Ejecuta el query
3. Anota qué columnas existen

Esto te dirá qué columnas están disponibles en tu tabla `profiles`.

### Paso 4: Crear Perfiles para Usuarios Existentes

**Información de tu tabla `profiles`:**

Tu tabla tiene estas columnas:
- `id`, `email`, `full_name`, `phone`, `address`, `city`, `province`, `postal_code`
- `is_admin`, `is_wholesale_client`, `min_order_amount`
- `created_at`, `updated_at`

**Ejecuta el script actualizado:**

1. En el **SQL Editor**, copia y pega el contenido de `create-missing-profiles.sql`
2. Ejecuta el query

Este script creará perfiles para los 3 usuarios que no tienen perfil, usando las columnas correctas de tu base de datos.

**Verifica que funcionó:**
```sql
SELECT COUNT(*) FROM profiles;
-- Deberías ver 3 perfiles ahora
```

### Paso 5: Verificar que Funcionó

```sql
SELECT 
  u.email,
  p.id as profile_id,
  p.full_name,
  p.company_name,
  p.is_active
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
ORDER BY u.created_at DESC;
```

**Todos los usuarios deberían tener perfil ahora.**

## 🧪 Probar el Registro de Nuevos Usuarios

1. Ve a `/auth/registro`
2. Intenta registrarte con un nuevo email
3. Verifica que ahora sí se crea el perfil

**En la consola del navegador (F12) deberías ver:**
```
✅ Usuario registrado exitosamente
✅ Creando perfil para usuario: [uuid]
✅ Perfil creado exitosamente
```

**En el SQL Editor:**
```sql
SELECT COUNT(*) FROM profiles;
-- Deberías ver un perfil más
```

## 🐛 Si Aún No Funciona

### Verificar que las políticas están activas

```sql
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN 'HABILITADO' ELSE 'DESHABILITADO' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'profiles';
```

**Debería mostrar "HABILITADO"**

### Ver las políticas actuales

```sql
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;
```

**Deberías ver las 5 políticas mencionadas arriba**

### Si las políticas no se aplican correctamente

```sql
-- Temporalmente desactivar RLS SOLO para debugging
-- ⚠️ SOLO EN DESARROLLO
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Intentar crear perfil manualmente
-- ...

-- Volver a habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Re-ejecutar fix-profile-rls-policies.sql
```

## 📊 Resumen de los Usuarios Actuales

Según el diagnóstico:

1. **boton.creativo.ar@gmail.com**
   - ID: b027bddf-86de-49e5-bc41-156cef5a1b7f
   - Creado: 2025-10-27
   - Confirmado: Sí
   - Último acceso: 2025-10-27

2. **mezacoco13@gmail.com**
   - ID: d4c952af-3190-4ed2-9f9a-ae5b2c6491b6
   - Creado: 2025-10-24
   - Confirmado: Sí
   - Último acceso: 2025-10-25

3. **kidtuk@gmail.com**
   - ID: 94fda1e0-1bea-4c28-b3ac-1255ab0111bd
   - Creado: 2025-10-24
   - Confirmado: No
   - Último acceso: Nunca

**Ninguno de ellos tiene perfil en la tabla `profiles`.**

## 💡 Recomendación

1. Ejecuta `fix-profile-rls-policies.sql` para corregir las políticas
2. Ejecuta `create-missing-profiles.sql` para crear los perfiles faltantes
3. Verifica que los usuarios ahora tienen perfil
4. Prueba el registro de un nuevo usuario para asegurar que funciona

## 📋 Checklist

- [ ] Ejecutar `check-users-and-profiles.sql` para verificar estado
- [ ] Ejecutar `fix-profile-rls-policies.sql` para corregir políticas
- [ ] Verificar que se crearon 5 políticas
- [ ] Ejecutar `create-missing-profiles.sql` para crear perfiles faltantes
- [ ] Verificar que se crearon 3 perfiles
- [ ] Probar registro de nuevo usuario
- [ ] Verificar que el nuevo usuario tiene perfil automáticamente

