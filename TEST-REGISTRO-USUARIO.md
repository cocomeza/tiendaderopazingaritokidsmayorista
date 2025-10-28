# Test: Registro de Nuevo Usuario

## ✅ Objetivo
Verificar que el registro de nuevos usuarios funciona correctamente y crea el perfil automáticamente.

## 📋 Pasos para Probar

### 1. Preparar Test
- Abre la aplicación en desarrollo (`npm run dev`)
- Ve a `/auth/registro`

### 2. Registro de Prueba
- Email: `test@example.com` (usa un email que no exista)
- Nombre completo: `Usuario de Prueba`
- Teléfono: `1234567890`
- Empresa: `Empresa de Prueba`
- CUIT: `20-12345678-9`
- Dirección: `Calle Falsa 123`
- Localidad: `Buenos Aires`
- Tipo de venta: Cualquiera
- Contraseña: `Test1234` (debe tener letras y números)

### 3. Verificar en Consola del Navegador (F12)
Deberías ver estos logs:
```
✅ Intentando registrar usuario: test@example.com
✅ Usuario registrado exitosamente: [uuid]
✅ Creando perfil para usuario: [uuid]
✅ Datos del perfil a insertar: { ... }
✅ Perfil creado exitosamente
```

### 4. Verificar en Supabase
Ejecuta este query en el SQL Editor:
```sql
SELECT 
  u.email,
  u.created_at as usuario_creado,
  p.id as perfil_id,
  p.full_name,
  p.phone,
  CASE WHEN p.id IS NULL THEN 'SIN PERFIL' ELSE 'CON PERFIL' END as estado
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'test@example.com';
```

Deberías ver:
- ✅ Usuario existe en `auth.users`
- ✅ Perfil existe en `profiles`
- ✅ Estado: "CON PERFIL"

### 5. Probar Login
- Ve a `/auth/login`
- Usa el email y contraseña del usuario de prueba
- Deberías poder iniciar sesión

### 6. Verificar Funcionalidades
Una vez logueado, verifica que funcionen:
- ✅ Ver productos
- ✅ Agregar a favoritos
- ✅ Agregar al carrito
- ✅ Ver perfil en `/mi-perfil`

## ❌ Si Algo Falla

### Error: "Error al crear el perfil"
1. Abre la consola del navegador (F12)
2. Busca el error completo
3. Copia el mensaje de error
4. Ejecuta `fix-profile-rls-policies.sql` en el SQL Editor

### Error: "Usuario sin perfil"
1. El usuario se creó en `auth.users` pero no en `profiles`
2. Ejecuta este query para crear el perfil manualmente:
```sql
INSERT INTO profiles (
  id, email, full_name, phone, city, province, 
  is_admin, is_wholesale_client, min_order_amount
)
SELECT 
  id, 
  email, 
  'Usuario de Prueba' as full_name,
  '1234567890' as phone,
  'Villa Ramallo' as city,
  'Buenos Aires' as province,
  false as is_admin,
  true as is_wholesale_client,
  5 as min_order_amount
FROM auth.users
WHERE email = 'test@example.com'
ON CONFLICT (id) DO NOTHING;
```

### Error de Políticas RLS
Si hay errores relacionados con RLS:
1. Ejecuta `fix-profile-rls-policies.sql`
2. Verifica que existan 5 políticas
3. Vuelve a intentar el registro

## 📊 Resultado Esperado

Después de todos los tests, deberías tener:
- ✅ 4 usuarios en `auth.users` (3 originales + 1 nuevo)
- ✅ 4 perfiles en `profiles`
- ✅ Todos los usuarios con perfil correspondiente
- ✅ Registro de nuevos usuarios funcionando
- ✅ Login funcionando
- ✅ Funcionalidades básicas (favoritos, carrito) funcionando

## 🎉 ¡Todo Listo!

Si todos los tests pasan, significa que:
1. ✅ Las políticas RLS están correctas
2. ✅ El sistema de registro funciona
3. ✅ Los usuarios pueden tener perfiles
4. ✅ La aplicación está lista para usar

