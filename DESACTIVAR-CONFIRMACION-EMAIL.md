# Cómo Desactivar la Confirmación por Email en Supabase

## Instrucciones Paso a Paso

### Paso 1: Accede a Supabase
1. Ve a https://supabase.com/dashboard
2. Inicia sesión
3. Selecciona tu proyecto "tienda-ropa-argentina"

### Paso 2: Ve a la Configuración de Email
1. En el menú lateral izquierdo, haz clic en **"Authentication"**
2. Luego haz clic en **"Providers"**
3. Busca **"Email"** y haz clic en él

### Paso 3: Desactiva la Confirmación
1. Busca la opción **"Enable email confirmations"**
2. **Desactiva** esa opción (toggle off)
3. Opcionalmente, también desactiva **"Secure email change"** si está activo
4. Haz clic en **"Save"** o **"Guardar"**

### Paso 4: ¡Listo!
Ahora puedes:
- ✅ Registrar nuevos usuarios sin confirmación por email
- ✅ Hacer login inmediatamente después del registro
- ✅ Continuar probando la aplicación

### Paso 5: Vuelve a Activar en Producción
Cuando estés listo para poner en producción:
- Activa la confirmación por email nuevamente
- Los usuarios deberán confirmar su email antes de usar la app

## Nota
Esta configuración es solo para desarrollo. En producción siempre activa la confirmación por email para seguridad.

