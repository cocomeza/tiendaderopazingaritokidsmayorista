# ✅ Solución: Error al Cargar Perfil

## 🐛 Problema

Error: `Error cargando perfil: {}`

**Causa**: El usuario logueado no tiene perfil creado en la tabla `profiles`.

## ✅ Solución Implementada

He actualizado el código para:

1. **Usar `.maybeSingle()`** en lugar de `.single()` - evita errores cuando no hay datos
2. **Detectar usuarios sin perfil** - comprueba si el perfil existe
3. **Crear perfil automáticamente** - si el usuario no tiene perfil, se crea uno básico con los metadatos de `auth.users`

## 📝 Cambios Realizados

### Antes
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()  // ❌ Falla si no hay datos
```

### Después
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .maybeSingle()  // ✅ Devuelve null si no hay datos

// Si no hay datos, crear perfil automáticamente
if (error.code === 'PGRST116' || error.message.includes('No rows')) {
  // Crear perfil básico
  const newProfile = { ... }
  await supabase.from('profiles').insert(newProfile)
}
```

## 🎯 Comportamiento Actual

### Si el usuario TIENE perfil:
- ✅ Carga el perfil normalmente
- ✅ Muestra todos los datos

### Si el usuario NO TIENE perfil:
- ✅ Detecta que no existe
- ✅ Crea un perfil básico automáticamente
- ✅ Usa metadatos de `auth.users` (email, full_name, phone)
- ✅ Muestra toast: "Perfil creado correctamente"
- ✅ Carga el perfil recién creado

## 🧪 Cómo Probar

1. **Cierra sesión** (si estás logueado)
2. **Inicia sesión** con cualquier usuario
3. **Ve a** `/mi-perfil`
4. **Resultado esperado**:
   - Si el usuario NO tiene perfil → se crea automáticamente
   - Si el usuario SÍ tiene perfil → se muestra normalmente

## 🔍 Debug en SQL

Si quieres verificar qué usuarios tienen o no tienen perfil:

```sql
-- Ver todos los usuarios y sus perfiles
SELECT 
  u.id,
  u.email,
  p.id as profile_id,
  p.full_name,
  CASE WHEN p.id IS NULL THEN '❌ SIN PERFIL' ELSE '✅ CON PERFIL' END as estado
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
ORDER BY u.created_at DESC;
```

## 💡 Notas Importantes

### Políticas RLS
Asegúrate de que las políticas RLS permitan insertar perfiles:

```sql
-- Verificar políticas
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'profiles';

-- Si falta, ejecuta:
-- CREATE POLICY "Users can insert own profile"
--   ON profiles FOR INSERT
--   WITH CHECK (auth.uid() = id);
```

### Campos del Perfil
El perfil que se crea automáticamente tiene:
- `id` - ID del usuario
- `email` - Email del usuario
- `full_name` - Del metadata (si existe)
- `phone` - Del metadata (si existe)
- `is_admin` - false
- `is_wholesale_client` - true
- `created_at` - Fecha actual
- `updated_at` - Fecha actual

## 🎉 Resultado

Ahora el perfil debería cargar correctamente:
- ✅ Para usuarios con perfil → Carga datos
- ✅ Para usuarios sin perfil → Crea y carga datos
- ✅ Sin errores en consola
- ✅ UX fluida sin interrupciones

## 📊 Flujo Completo

```
Usuario visita /mi-perfil
    ↓
¿Tiene perfil?
    ↓ NO                      ↓ SÍ
Crear perfil básico      Cargar perfil
    ↓                           ↓
Mostrar datos            Mostrar datos
```

## 🚀 Siguiente Paso

1. **Reinicia el servidor**:
```bash
npm run dev
```

2. **Prueba el perfil**:
- Inicia sesión
- Ve a `/mi-perfil`
- Debería funcionar sin errores

3. **Si aún hay problemas**:
- Abre la consola del navegador (F12)
- Ve los detalles del error
- Ejecuta el SQL de debug para verificar usuarios

