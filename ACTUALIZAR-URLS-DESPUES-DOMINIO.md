# 🔄 Archivos a Actualizar Después de Configurar el Dominio

Una vez que tengas tu dominio funcionando (ej: `https://zingaritokids.com`), actualiza estas URLs hardcodeadas:

## 📝 Archivos a Actualizar

### 1. `app/auth/recuperar-password/page.tsx`
**Línea ~33:**
```typescript
// ANTES:
const productionUrl = 'https://tiendaderopazingaritokidsmayorista.vercel.app'

// DESPUÉS:
const productionUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zingaritokids.com'
```

### 2. `app/auth/reset-password/page.tsx`
**Línea ~45:**
```typescript
// ANTES:
const productionUrl = 'https://tiendaderopazingaritokidsmayorista.vercel.app'

// DESPUÉS:
const productionUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zingaritokids.com'
```

### 3. `app/auth/reset-password-redirect/page.tsx`
**Línea ~17:**
```typescript
// ANTES:
const productionUrl = 'https://tiendaderopazingaritokidsmayorista.vercel.app'

// DESPUÉS:
const productionUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zingaritokids.com'
```

## ⚠️ Nota Importante

Estos archivos tienen URLs hardcodeadas intencionalmente para evitar problemas con localhost. 

**Recomendación:**
1. Primero configura el dominio y verifica que funciona
2. Luego actualiza estas URLs
3. Haz un nuevo deploy
4. Prueba el flujo de recuperación de contraseña

## ✅ Checklist

- [ ] Dominio configurado y funcionando
- [ ] `NEXT_PUBLIC_SITE_URL` actualizado en Vercel
- [ ] URLs hardcodeadas actualizadas en código
- [ ] Nuevo deploy realizado
- [ ] Flujo de recuperación de contraseña probado

