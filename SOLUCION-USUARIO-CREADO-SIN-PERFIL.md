# Solución: Usuario Creado Pero Sin Perfil

## ❌ Problema
El usuario se crea en `auth.users` pero **no aparece** en la tabla `profiles`.

## 🔍 Causa Raíz
La política RLS está bloqueando la inserción del perfil por error `{}` (vacío).

## ✅ Solución Paso a Paso

### Paso 1: Verificar Estado Actual

1. Ve a https://supabase.com/dashboard
2. Proyecto "tienda-ropa-argentina" (asegúrate de que esté activo)
3. Abre el **SQL Editor**
4. Copia y pega el contenido de `verificar-estado-supabase.sql`
5. Ejecuta el query para ver qué está mal

### Paso 2: Ejecutar Migración de Corrección

En el **SQL Editor**, ejecuta:

```sql
-- Ejecutar migración 008_fix_profile_policies.sql
```

O copia directamente este código:

```sql
-- Eliminar TODAS las políticas existentes de profiles
DROP POLICY IF EXISTS "Public profiles are viewable by admins" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Only admins can delete profiles" ON profiles;

-- Permitir que los usuarios vean su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Permitir que los admins vean todos los perfiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

-- Permitir que los usuarios inserten su propio perfil
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Permitir que los usuarios actualicen su propio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Solo admins pueden eliminar perfiles
CREATE POLICY "Only admins can delete profiles"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );
```

### Paso 3: Verificar que Funcionó

```sql
-- Ver que las políticas están creadas
SELECT policyname, cmd, permissive
FROM pg_policies
WHERE tablename = 'profiles';
```

Deberías ver 5 políticas:
1. Users can view own profile
2. Admins can view all profiles
3. Users can insert own profile
4. Users can update own profile
5. Only admins can delete profiles

### Paso 4: Intentar Registrarse de Nuevo

1. Ve a `/auth/registro`
2. Intenta registrarte con un **nuevo email** (para evitar duplicados)
3. Usa una contraseña fuerte

### Paso 5: Verificar en Consola del Navegador

Abre las Developer Tools (F12) y verás estos logs:

```
Intentando registrar usuario: email@ejemplo.com
Usuario registrado exitosamente: [uuid]
Creando perfil para usuario: [uuid]
Datos del perfil a insertar: { ... }
Resultado insert perfil: [objeto]
Perfil creado exitosamente
```

## 🐛 Si Aún No Funciona

### Opción A: Crear Perfil Manualmente

Si el usuario ya existe pero no tiene perfil:

```sql
-- Ver usuarios sin perfil
SELECT 
  u.id,
  u.email,
  u.created_at,
  CASE WHEN p.id IS NULL THEN 'SIN PERFIL' ELSE 'CON PERFIL' END as estado
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- Crear perfil manualmente (reemplaza EMAIL y UUID)
INSERT INTO profiles (
  id, 
  email, 
  full_name, 
  phone, 
  company_name,
  cuit,
  billing_address,
  is_active
) VALUES (
  'UUID_DEL_USUARIO',  -- Reemplaza con UUID de auth.users
  'EMAIL_DEL_USUARIO',  -- Reemplaza con email
  'Nombre Completo',
  'Teléfono',
  'Nombre Empresa',
  'CUIT',
  'Dirección',
  true
);
```

### Opción B: Temporalmente Desactivar RLS

⚠️ **SOLO PARA DESARROLLO - NUNCA EN PRODUCCIÓN**

```sql
-- Desactivar RLS temporalmente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Intentar registro

-- Volver a activar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Recrear las políticas (ejecuta paso 2)
```

### Opción C: Verificar Límites de Supabase Free Tier

Si estás en el plan gratuito:
- Verifica que no hayas alcanzado el límite de usuarios
- Verifica que el proyecto no esté pausado
- Verifica que no haya errores de rate limiting

## 📋 Checklist

- [ ] Proyecto Supabase activo (no pausado)
- [ ] Tabla profiles existe
- [ ] Columnas required existen (id, email, etc.)
- [ ] Políticas RLS correctas (5 políticas)
- [ ] RLS está habilitado
- [ ] No hay usuarios duplicados
- [ ] Email no está ya en uso
- [ ] Contraseña cumple requisitos

## 🔍 Debugging

### Ver Error Completo en Consola

El código ahora imprime errores detallados:
- `Error completo del perfil`
- `Código de error`
- `Mensaje`
- `Detalles`
- `Hint`

Copia TODOS los logs y compártelos si el problema persiste.

### Verificar en Dashboard

1. **Authentication → Users**: ¿Aparece el usuario?
2. **Table Editor → profiles**: ¿Aparece el perfil?
3. **SQL Editor → Logs**: ¿Hay errores?

## 💡 Solución Alternativa: Trigger Automático

Si las políticas siguen fallando, podemos crear un trigger que cree el perfil automáticamente:

```sql
-- Crear función
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_active)
  VALUES (new.id, new.email, true);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

Esto creará el perfil automáticamente cuando se cree un usuario en `auth.users`.

