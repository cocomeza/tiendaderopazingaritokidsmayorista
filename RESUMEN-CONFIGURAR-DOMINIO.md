# 🚀 Resumen Rápido: Configurar Dominio Namecheap + Vercel

## ⚡ Pasos Rápidos

### 1️⃣ Comprar en Namecheap (5 minutos)
1. Ve a [namecheap.com](https://www.namecheap.com) → Sign Up
2. Busca `zingaritokids.com`
3. Agrega al carrito y paga (~$10-12 USD/año)

### 2️⃣ Configurar DNS (2 opciones)

**Opción A - Nameservers de Vercel (Más fácil):**
1. Namecheap → Domain List → Manage
2. Nameservers → Custom DNS
3. Agrega:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

**Opción B - DNS de Namecheap:**
1. Namecheap → Advanced DNS
2. Agrega registros que Vercel te indique

### 3️⃣ Configurar en Vercel (5 minutos)
1. Vercel → Settings → Domains
2. Add Domain → `zingaritokids.com`
3. Espera verificación (5 min - 2 horas)

### 4️⃣ Actualizar Variables (2 minutos)
1. Vercel → Settings → Environment Variables
2. Edita `NEXT_PUBLIC_SITE_URL`:
   - Cambia: `https://tiendaderopazingaritokidsmayorista.vercel.app`
   - Por: `https://zingaritokids.com`
3. Nuevo deploy

### 5️⃣ Actualizar Supabase (2 minutos)
1. Supabase Dashboard → Settings → Authentication
2. Site URL: `https://zingaritokids.com`
3. Redirect URLs: `https://zingaritokids.com/**`

## ✅ Verificar
- [ ] Dominio carga: `https://zingaritokids.com`
- [ ] SSL funciona (candado verde 🔒)
- [ ] Login funciona
- [ ] Redirecciones funcionan

## 📖 Guía Completa
Ver: `docs/configurar-dominio-namecheap.md`

## ⏱️ Tiempo Total
- Compra: 5 minutos
- Configuración: 10-15 minutos
- Propagación DNS: 5 minutos - 24 horas (generalmente < 1 hora)

## 💰 Costo
- Primer año: ~$10-12 USD
- Renovación: ~$13-15 USD/año

