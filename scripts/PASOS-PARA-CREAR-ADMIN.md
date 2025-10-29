# 📝 Pasos para crear usuario administrador

## Problema con el Token de Refresh

El error que estás viendo (`Invalid Refresh Token: Refresh Token Not Found`) se debe a que:
1. No hay un usuario admin configurado todavía
2. Las cookies del navegador están corruptas

## Solución: Crear el usuario administrador

### Método 1: Desde Supabase Dashboard (RECOMENDADO)

1. **Ve a tu proyecto Supabase**: https://supabase.com/dashboard
2. **Authentication > Users**
3. **Click en "Invite user by email"**
4. **Ingresa el email**: `admin@zingarito.com`
5. **Set password**: Ingresa una contraseña
6. **Confirma**: El usuario será creado

7. **SQL Editor**: Ejecuta este SQL:
```sql
-- Promover a administrador
UPDATE profiles 
SET is_admin = true 
WHERE email = 'admin@zingarito.com';

-- Verificar
SELECT email, is_admin, is_active 
FROM profiles 
WHERE email = 'admin@zingarito.com';
```

### Método 2: Crear usuario completo manualmente

1. **Supabase Dashboard > Authentication > Users > Add user**
2. **Datos**:
   - Email: `admin@zingarito.com`
   - Password: (tu contraseña segura)
3. **Copia el UUID del usuario**

4. **SQL Editor**: Ejecuta esto (reemplaza el UUID):
```sql
INSERT INTO profiles (id, email, full_name, is_admin, is_active)
VALUES (
  'TU-UUID-AQUI',
  'admin@zingarito.com',
  'Administrador Principal',
  true,
  true
);
```

### Método 3: Usar un usuario existente

Si ya tienes un usuario registrado en la app:

1. **Ve a Supabase > SQL Editor**
2. **Ejecuta** (reemplaza con tu email):
```sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'TU_EMAIL_EXISTENTE';
```

## Después de crear el admin

1. **Limpia las cookies del navegador**:
   - Chrome/Edge: DevTools (F12) > Application > Cookies > Delete All
   - O: Ctrl+Shift+Delete > Cookies > Clear

2. **Ve a**: `http://localhost:3000/admin/login`

3. **Login**:
   - Email: `admin@zingarito.com`
   - Password: (la que configuraste)

## ⚠️ Si sigues teniendo problemas

1. **Cierra completamente el navegador**
2. **Abre en modo incógnito/privado**
3. **Intenta iniciar sesión**

## 🎯 Resumen rápido

```bash
# 1. Crea el usuario en Supabase Dashboard > Authentication > Add user
# 2. Ejecuta en SQL Editor:
UPDATE profiles SET is_admin = true WHERE email = 'admin@zingarito.com';
# 3. Limpia cookies del navegador
# 4. Login en /admin/login
```

