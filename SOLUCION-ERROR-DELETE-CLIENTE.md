# Solución para Error al Eliminar/Desactivar Cliente

## Problema
Error al intentar desactivar un cliente en `/admin/clientes`:
```
Error desactivando cliente: {}
```

## Causa
Falta la política RLS (Row Level Security) que permite a los administradores actualizar perfiles de otros usuarios.

## Solución

### Opción 1: Ejecutar la migración SQL en Supabase (Recomendado)

1. Ve a tu proyecto en Supabase Dashboard
2. Abre el **SQL Editor**
3. Ejecuta el siguiente SQL:

```sql
-- Eliminar política existente si hay conflicto
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Crear política para que los admins puedan actualizar cualquier perfil
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );
```

4. Verifica que la política se creó correctamente:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies
WHERE tablename = 'profiles' AND policyname = 'Admins can update all profiles';
```

### Opción 2: Usar el archivo de migración

Si usas migraciones de Supabase, el archivo `supabase/migrations/010_add_admin_update_profile_policy.sql` ya contiene el SQL necesario.

### Opción 3: Actualizar database-completo.sql

Si necesitas recrear la base de datos desde cero, el archivo `database-completo.sql` ya incluye esta política.

## Mejoras implementadas en el código

1. **Verificación de permisos**: Ahora se verifica que el usuario es admin antes de intentar actualizar
2. **Manejo de errores mejorado**: Mensajes más descriptivos según el tipo de error
3. **Validación de datos**: Verifica que la actualización fue exitosa antes de actualizar el estado local

## Después de aplicar la solución

1. Recarga la página `/admin/clientes`
2. Intenta desactivar un cliente nuevamente
3. Debería funcionar correctamente

## Verificación

Si después de aplicar la política sigues teniendo problemas:

1. Verifica que tu usuario tiene `is_admin = true` en la tabla `profiles`
2. Verifica que estás autenticado correctamente
3. Revisa la consola del navegador para ver errores más detallados

