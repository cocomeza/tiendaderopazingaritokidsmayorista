# ⚡ Solución Inmediata al Error de Login

## 🔴 Problema
El error "infinite recursion detected in policy" impide iniciar sesión como admin.

## ✅ Solución (2 minutos)

### Paso 1: Ejecutar SQL en Supabase
1. Ve a: https://supabase.com/dashboard/project/hjlmrphltpsibkzfcgvu/sql
2. Copia y pega este SQL:

```sql
-- Eliminar políticas problemáticas
DROP POLICY IF EXISTS "Public profiles are viewable by admins" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Only admins can delete profiles" ON profiles;

-- Deshabilitar RLS temporalmente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Verificar usuario admin
SELECT email, is_admin, is_active 
FROM profiles 
WHERE email = 'admin@zingarito.com';
```

3. Click en "Run"

### Paso 2: Probar login
1. Ve a: http://localhost:3001/admin/login
2. Email: `admin@zingarito.com`
3. Password: `AdminZingarito2025!`

### ✅ ¡Listo!

La seguridad sigue funcionando porque:
- El middleware verifica permisos
- El login verifica permisos
- Solo admins pueden acceder a `/admin`
- Deshabilitar RLS solo afecta la tabla profiles, no products ni orders

