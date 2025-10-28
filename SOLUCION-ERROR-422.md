# Solución para Error 422 en Registro

## ❌ Error
```
Failed to load resource: the server responded with a status of 422 ()
```

## 🔍 Causas Posibles

### 1. **Proyecto Supabase Pausado** (MÁS PROBABLE)
Tu proyecto está inactivo, causando errores 422 en todas las operaciones.

#### Solución:
1. Ve a https://supabase.com/dashboard
2. Proyecto "tienda-ropa-argentina"
3. Configuración → Reactivar proyecto

### 2. **Contraseña Débil**
Supabase tiene requisitos de contraseña más estrictos por defecto.

#### Solución temporal:
- Desactiva la validación de contraseña en Supabase:
  1. Dashboard → Authentication → Settings
  2. Deshabilita "Password validation"
  3. Guarda los cambios

#### O usa una contraseña más fuerte:
- Mínimo 8 caracteres
- Al menos una letra mayúscula
- Al menos una letra minúscula
- Al menos un número
- Al menos un carácter especial

### 3. **Usuario Ya Registrado**
El email ya existe en la base de datos.

#### Solución:
- Intenta iniciar sesión en `/auth/login`
- O recupera la contraseña en `/auth/recuperar-password`

### 4. **Campos Faltantes en la Base de Datos**
Las columnas `locality`, `sales_type`, `ages` no existen.

#### Solución:
Ejecuta la migración `006_add_new_customer_fields.sql` en Supabase:
```sql
-- Ejecutar en Supabase SQL Editor
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locality text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sales_type text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ages text;
```

### 5. **Problema con RLS (Row Level Security)**
La política de inserción no está correctamente configurada.

#### Solución:
Ejecuta la migración `007_ensure_profile_insert_policy.sql`

## 🧪 Probar el Registro

### Opción 1: Desactivar Confirmación por Email
```
1. Supabase Dashboard → Authentication → Settings
2. Email Auth → Disable "Enable email confirmations"
3. Guarda y prueba el registro
```

### Opción 2: Verificar en Console del Navegador
Abre las Developer Tools (F12) y revisa:
- Si hay errores de red adicionales
- Si aparece el log "Intentando registrar usuario"
- El mensaje de error completo de Supabase

## 📋 Checklist de Verificación

- [ ] Proyecto Supabase reactivado
- [ ] Confirmación por email desactivada (para desarrollo)
- [ ] Migraciones ejecutadas (001-007)
- [ ] Columnas de base de datos existen
- [ ] Políticas RLS configuradas
- [ ] Contraseña cumple requisitos
- [ ] Email no está ya registrado

## 🔧 Comandos de Verificación

### Verificar estructura de profiles:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

### Verificar políticas RLS:
```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';
```

### Verificar si el email existe:
```sql
SELECT id, email, full_name, created_at
FROM auth.users
WHERE email = 'tu-email@ejemplo.com';
```

## 🚨 Si Nada Funciona

### Reset Completo del Auth
1. Ve a Authentication → Users
2. Elimina todos los usuarios de prueba
3. Intenta registrar nuevamente

### Restaurar Configuración de Auth
```sql
-- Ver configuración actual
SELECT * FROM auth.config;
```

## 📞 Contactar Soporte

Si el problema persiste:
1. Revisa los logs de Supabase Dashboard
2. Copia el error completo de la consola del navegador
3. Verifica el estado del proyecto en Supabase

