# 🌐 Guía Completa: Comprar y Configurar Dominio en Namecheap + Vercel

Guía paso a paso para comprar un dominio en Namecheap y configurarlo con Vercel.

---

## 📝 Paso 1: Comprar el Dominio en Namecheap

### 1.1 Crear cuenta en Namecheap

1. Ve a [namecheap.com](https://www.namecheap.com)
2. Click en **"Sign Up"** (arriba a la derecha)
3. Completa el formulario:
   - Email
   - Contraseña
   - Nombre y apellido
4. Verifica tu email

### 1.2 Buscar y comprar el dominio

1. En la página principal, busca tu dominio:
   - Escribe: `zingaritokids` (o el nombre que prefieras)
   - Selecciona `.com` (recomendado)
   - Click en **"Search"**

2. Verifica disponibilidad:
   - Si está disponible → Click en **"Add to Cart"**
   - Si no está disponible, prueba variaciones:
     - `zingaritokidsmayorista.com`
     - `zingaritokidsar.com`
     - `zingaritokids-store.com`

3. En el carrito:
   - **WhoisGuard**: Incluido gratis el primer año (recomendado mantenerlo)
   - **Auto-renew**: Actívalo para renovación automática
   - Revisa el precio total

4. Click en **"Confirm Order"**

5. Método de pago:
   - Tarjeta de crédito/débito
   - PayPal
   - Criptomonedas

6. Confirma la compra

---

## ⚙️ Paso 2: Configurar DNS en Namecheap

### 2.1 Obtener los Nameservers de Vercel (PRIMERO)

**⚠️ IMPORTANTE:** Los nameservers NO se configuran en Vercel, se configuran en **Namecheap**. Primero debes obtener los nameservers de Vercel.

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Selecciona tu proyecto: `tiendaderopazingaritokidsmayorista`
3. Ve a **Settings** → **Domains**
4. Click en **"Add Domain"**
5. Ingresa tu dominio: `zingaritokids.com`
6. Click en **"Add"**
7. Vercel te mostrará los **nameservers** que debes usar (generalmente son):
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
8. **Copia estos nameservers** - los necesitarás en el siguiente paso

**Nota:** Vercel mostrará el estado como "Pending" hasta que configures los nameservers en Namecheap. Esto es normal.

### 2.2 Acceder a la gestión del dominio en Namecheap

1. En Namecheap, ve a **"Domain List"** (menú superior)
2. Encuentra tu dominio `zingaritokids.com`
3. Click en **"Manage"** (al lado del dominio)

### 2.3 Configurar Nameservers en Namecheap (Método Recomendado)

**Opción A: Usar Nameservers de Vercel (Recomendado)**

1. En la página de gestión de Namecheap, ve a la pestaña **"Nameservers"** (o busca "Nameservers" en la sección de configuración)
2. Selecciona **"Custom DNS"** (en lugar de "Namecheap BasicDNS")
3. Ingresa los nameservers que copiaste de Vercel:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
4. Click en **"Save"** (el check verde)
5. Espera la propagación (puede tardar 5 minutos - 24 horas, pero generalmente es más rápido)

**✅ Resumen del proceso:**
- **Vercel**: Te da los nameservers (paso 2.1)
- **Namecheap**: Donde configuras esos nameservers (paso 2.3)

**Opción B: Usar DNS de Namecheap (Alternativa)**

Si prefieres mantener los nameservers de Namecheap:

1. Ve a **"Advanced DNS"**
2. En la sección **"Host Records"**, agrega estos registros:

   | Type | Host | Value | TTL |
   |------|------|-------|-----|
   | A Record | @ | 76.76.21.21 | Automatic |
   | CNAME Record | www | cname.vercel-dns.com | Automatic |

   (Nota: Estos valores pueden cambiar, Vercel te dará los correctos)

---

## 🚀 Paso 3: Configurar Dominio en Vercel

### 3.1 Agregar dominio en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Selecciona tu proyecto: `tiendaderopazingaritokidsmayorista`
3. Ve a **Settings** → **Domains**
4. Click en **"Add Domain"**
5. Ingresa tu dominio: `zingaritokids.com`
6. Click en **"Add"**

### 3.2 Configurar registros DNS (si usas DNS de Namecheap)

Si elegiste mantener los nameservers de Namecheap, Vercel te mostrará los registros DNS exactos que necesitas.

1. Copia los registros que Vercel te muestra
2. Ve a Namecheap → **Advanced DNS**
3. Agrega los registros exactos que Vercel te indicó
4. Guarda los cambios

### 3.3 Verificar configuración

Vercel verificará automáticamente la configuración. Puede tardar:
- **Con nameservers de Vercel**: 5 minutos - 2 horas
- **Con DNS de Namecheap**: 5 minutos - 24 horas

Verás el estado en la página de Domains de Vercel:
- ⏳ **Pending**: Esperando verificación
- ✅ **Valid**: Dominio configurado correctamente
- ❌ **Error**: Revisa la configuración

---

## 🔧 Paso 4: Actualizar Variables de Entorno

### 4.1 Actualizar en Vercel

1. En Vercel, ve a **Settings** → **Environment Variables**
2. Busca `NEXT_PUBLIC_SITE_URL`
3. Edita el valor:
   - **Antes**: `https://tiendaderopazingaritokidsmayorista.vercel.app`
   - **Después**: `https://zingaritokids.com`
4. Guarda los cambios
5. **Importante**: Haz un nuevo deploy para que los cambios surtan efecto

### 4.2 Actualizar en Supabase (si es necesario)

Si tienes configuraciones de autenticación que usan la URL del sitio:

1. Ve a [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Authentication** → **URL Configuration**
4. Actualiza:
   - **Site URL**: `https://zingaritokids.com`
   - **Redirect URLs**: Agrega `https://zingaritokids.com/**`

---

## ✅ Paso 5: Verificar que Todo Funciona

### 5.1 Verificar dominio

1. Espera 5-30 minutos después de configurar
2. Abre tu navegador en modo incógnito
3. Ve a `https://zingaritokids.com`
4. Deberías ver tu sitio funcionando

### 5.2 Verificar SSL/HTTPS

Vercel configura automáticamente SSL (certificado HTTPS). Verifica:
- La URL debe comenzar con `https://`
- Debe aparecer el candado 🔒 en el navegador
- No debe haber advertencias de seguridad

### 5.3 Verificar redirecciones

- `http://zingaritokids.com` → debe redirigir a `https://zingaritokids.com`
- `http://www.zingaritokids.com` → debe redirigir a `https://zingaritokids.com`
- `https://www.zingaritokids.com` → debe redirigir a `https://zingaritokids.com`

---

## 🔄 Paso 6: Configurar www (Opcional pero Recomendado)

### 6.1 Agregar subdominio www en Vercel

1. En Vercel → **Settings** → **Domains**
2. Click en **"Add Domain"**
3. Ingresa: `www.zingaritokids.com`
4. Vercel configurará automáticamente la redirección a `zingaritokids.com`

### 6.2 Configurar en Namecheap (si usas DNS de Namecheap)

1. En Namecheap → **Advanced DNS**
2. Agrega un registro CNAME:
   - **Type**: CNAME Record
   - **Host**: www
   - **Value**: `cname.vercel-dns.com`
   - **TTL**: Automatic

---

## 🛠️ Solución de Problemas

### Problema: El dominio no carga después de 24 horas

**Solución:**
1. Verifica que los nameservers estén correctos en Namecheap
2. Verifica que el dominio esté agregado en Vercel
3. Usa [whatsmydns.net](https://www.whatsmydns.net) para verificar la propagación DNS
4. Espera hasta 48 horas (propagación DNS puede tardar)

### Problema: Error de SSL/Certificado

**Solución:**
1. Vercel configura SSL automáticamente
2. Si hay error, espera 10-15 minutos
3. Si persiste, contacta soporte de Vercel

### Problema: Redirección infinita

**Solución:**
1. Verifica que `NEXT_PUBLIC_SITE_URL` esté actualizado
2. Haz un nuevo deploy en Vercel
3. Limpia la caché del navegador

### Problema: El sitio carga pero las imágenes/recursos no

**Solución:**
1. Verifica que todas las URLs en el código usen rutas relativas o `NEXT_PUBLIC_SITE_URL`
2. Haz un nuevo deploy
3. Verifica la consola del navegador para errores

---

## 📋 Checklist Final

- [ ] Dominio comprado en Namecheap
- [ ] Nameservers configurados (o DNS configurado)
- [ ] Dominio agregado en Vercel
- [ ] Dominio verificado en Vercel (estado: Valid)
- [ ] `NEXT_PUBLIC_SITE_URL` actualizado en Vercel
- [ ] Nuevo deploy realizado en Vercel
- [ ] Sitio accesible en `https://zingaritokids.com`
- [ ] SSL/HTTPS funcionando (candado verde)
- [ ] Redirecciones funcionando (www, http → https)
- [ ] Supabase actualizado con nueva URL (si aplica)

---

## 💰 Costos Aproximados

- **Dominio .com en Namecheap**: ~$10-12 USD/año
- **WhoisGuard**: Gratis el primer año, luego ~$3 USD/año
- **Vercel**: Gratis (hasta cierto límite de uso)
- **SSL/HTTPS**: Gratis (incluido en Vercel)

**Total primer año**: ~$10-12 USD
**Total años siguientes**: ~$13-15 USD/año

---

## 📞 Soporte

- **Namecheap**: [support.namecheap.com](https://support.namecheap.com)
- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Documentación Vercel**: [vercel.com/docs](https://vercel.com/docs)

---

## 🎉 ¡Listo!

Una vez completados estos pasos, tu sitio estará disponible en tu dominio personalizado de forma profesional.

**URL actual**: `https://tiendaderopazingaritokidsmayorista.vercel.app`  
**URL nueva**: `https://zingaritokids.com`

