# 🔐 Guía de Configuración: Recuperación de Contraseña

## ✅ Verificaciones Necesarias

### 1. Variable de Entorno en Vercel

**Variable:** `NEXT_PUBLIC_SITE_URL`  
**Valor:** `https://tiendaderopazingaritokidsmayorista.vercel.app`  
**Environment:** Production (o todas si prefieres)

**Pasos:**
1. Ve a Vercel Dashboard → Tu Proyecto → Settings → Environment Variables
2. Agrega o verifica que existe `NEXT_PUBLIC_SITE_URL`
3. Valor debe ser solo la URL base (sin `/auth/reset-password`)
4. **IMPORTANTE:** Después de agregar/modificar, haz un **redeploy** del proyecto

### 2. Configuración en Supabase Dashboard

**Pasos críticos:**

1. **Site URL:**
   - Ve a: Supabase Dashboard → Tu Proyecto → Settings → Authentication → URL Configuration
   - **Site URL:** Debe ser `https://tiendaderopazingaritokidsmayorista.vercel.app`
   - Guarda los cambios

2. **Redirect URLs:**
   - En la misma sección, busca "Redirect URLs"
   - Agrega estas URLs (una por línea):
     ```
     https://tiendaderopazingaritokidsmayorista.vercel.app/auth/reset-password
     https://tiendaderopazingaritokidsmayorista.vercel.app/**
     ```
   - El `**` permite cualquier ruta bajo tu dominio
   - Guarda los cambios

3. **Email Templates (Opcional pero recomendado):**
   - Ve a: Settings → Authentication → Email Templates
   - Selecciona "Reset Password"
   - Verifica que el enlace incluya `{{ .ConfirmationURL }}`
   - Esto asegura que use la URL correcta

### 3. Verificar que Funciona

**Pasos de prueba:**

1. **Solicitar recuperación:**
   - Ve a: `https://tiendaderopazingaritokidsmayorista.vercel.app/auth/recuperar-password`
   - Ingresa tu email
   - Haz clic en "Enviar Email"

2. **Verificar el email:**
   - Revisa tu bandeja de entrada
   - El enlace debe apuntar a: `https://tiendaderopazingaritokidsmayorista.vercel.app/auth/reset-password#access_token=...`
   - **NO debe apuntar a `localhost:3000`**

3. **Hacer clic en el enlace:**
   - Desde el email, haz clic en el enlace
   - Debe abrir la página de reset password
   - Debe mostrar el formulario (no el mensaje de error)

### 4. Debugging

Si sigue sin funcionar, verifica:

**En la consola del navegador (F12):**
- Busca mensajes que empiecen con `🔍`, `🔐`, `✅`, o `❌`
- Estos te dirán qué está pasando

**Errores comunes:**

1. **"No se encontró un enlace de recuperación válido"**
   - El hash no está en la URL
   - Verifica que el enlace del email tenga `#access_token=...`
   - Algunos clientes de email pueden convertir `#` a `?` - el código ahora maneja esto

2. **"El enlace de recuperación ha expirado"**
   - El token expiró (tienen 1 hora de validez)
   - Solicita un nuevo enlace

3. **"localhost rechazó la conexión"**
   - El enlace del email apunta a localhost
   - Verifica la configuración en Supabase Dashboard
   - Verifica que `NEXT_PUBLIC_SITE_URL` esté configurada en Vercel
   - Haz redeploy después de agregar la variable

### 5. Solución Rápida

Si nada funciona:

1. **En Supabase Dashboard:**
   - Settings → Authentication → URL Configuration
   - Site URL: `https://tiendaderopazingaritokidsmayorista.vercel.app`
   - Redirect URLs: Agrega `https://tiendaderopazingaritokidsmayorista.vercel.app/**`
   - Guarda

2. **En Vercel:**
   - Settings → Environment Variables
   - Agrega `NEXT_PUBLIC_SITE_URL` = `https://tiendaderopazingaritokidsmayorista.vercel.app`
   - Guarda y haz **redeploy**

3. **Solicita un nuevo email de recuperación** (los emails anteriores pueden tener URLs incorrectas)

## 📝 Notas Importantes

- Los tokens de recuperación expiran después de **1 hora**
- Cada vez que solicitas un nuevo enlace, el anterior se invalida
- Si cambias la configuración en Supabase, los nuevos emails usarán la nueva URL
- Los emails antiguos seguirán usando la URL que tenían cuando se enviaron

## 🆘 Si Nada Funciona

1. Verifica los logs en la consola del navegador
2. Verifica que la variable `NEXT_PUBLIC_SITE_URL` esté disponible en runtime:
   - Abre la consola del navegador
   - Escribe: `console.log(process.env.NEXT_PUBLIC_SITE_URL)`
   - Debe mostrar la URL de producción (no `undefined`)
3. Contacta soporte si el problema persiste

