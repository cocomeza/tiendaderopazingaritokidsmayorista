# 🚀 Guía de Deploy en Vercel - Zingarito Kids

## ✅ Configuración Lista para Deploy

Tu proyecto ya está configurado con:
- ✅ `vercel.json` creado
- ✅ Variables de entorno configuradas
- ✅ Build optimizado
- ✅ Tests automatizados
- ✅ Performance mejorado

---

## 🎯 Pasos para Deploy en Vercel

### Paso 1: Preparar Variables de Entorno

Crea un archivo `.env.local` (si no existe):
```bash
# Copia el ejemplo
cp .env.example .env.local
```

Llena las variables necesarias:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

### Paso 2: Conectar con Vercel

#### Opción A: Desde GitHub (Recomendado)
```bash
# 1. Sube tu código a GitHub
git add .
git commit -m "Listo para deploy"
git push origin main

# 2. Ve a vercel.com
# 3. Conecta con tu repositorio de GitHub
# 4. Vercel detectará automáticamente Next.js
```

#### Opción B: CLI de Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

---

### Paso 3: Configurar Variables de Entorno en Vercel

En el Dashboard de Vercel:

1. **Settings** → **Environment Variables**
2. Agregar:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_SITE_URL=https://tu-dominio.vercel.app
```

**Nota:** Para producción, agrega también estas variables en el ambiente de "Production".

---

### Paso 4: Configurar Build Settings

Vercel ya detectará automáticamente:
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`

**No necesitas cambiar nada** - Vercel lo hace automáticamente.

---

### Paso 5: Aplicar Índices de Supabase (Opcional pero Recomendado)

En Supabase SQL Editor, ejecuta:
```sql
-- Archivo: supabase/migrations/009_add_performance_indexes.sql
```

Esto hará que las queries sean 10x más rápidas.

---

## 🔧 Configuración Avanzada

### Domino Personalizado

Si tienes un dominio personalizado:
1. **Settings** → **Domains**
2. Agrega tu dominio
3. Configura DNS según instrucciones

### Preview Deployments

Cada push a `main`:
- ✅ Build automático
- ✅ Tests automáticos (si configuras)
- ✅ Preview URL para testing

### Environment Variables por Ambiente

En Vercel puedes configurar variables diferentes para:
- Development
- Preview
- Production

---

## 📊 Comandos Útiles

### Build Local
```bash
npm run build
npm run start  # Probar build localmente
```

### Debug en Vercel
```bash
# Ver logs en tiempo real
vercel logs

# Ver deployments
vercel list
```

---

## ✅ Checklist Pre-Deploy

Antes de hacer deploy, verifica:

- [ ] Variables de entorno configuradas
- [ ] `.env.local` no está en git (está en `.gitignore`)
- [ ] Build local funciona (`npm run build`)
- [ ] Tests pasan (`npm run test:e2e`)
- [ ] No hay errores de TypeScript
- [ ] No hay errores de ESLint
- [ ] Índices de Supabase aplicados (opcional)

---

## 🐛 Troubleshooting

### Error: "Module not found"
```bash
# Solución:
rm -rf node_modules .next
npm install
npm run build
```

### Error: "Supabase connection failed"
- Verifica que `NEXT_PUBLIC_SUPABASE_URL` esté correcto
- Verifica que `NEXT_PUBLIC_SUPABASE_ANON_KEY` sea válido
- Verifica que no haya restricciones en Supabase

### Error: "Build timeout"
- Normal en el primer build (puede tardar 5-10 minutos)
- Si persiste, aumenta el timeout en Vercel Settings

### Error: "Memory limit exceeded"
- Reduce el límite de productos en `app/productos/page.tsx`
- Ya está en 50, puedes bajarlo a 30 si es necesario

---

## 📝 Estructura de Deploy

```
Vercel Deployment
├── Build
│   ├── npm run build
│   ├── Next.js compilation
│   └── Static file generation
├── Environment
│   ├── Variables from Vercel
│   ├── Supabase connection
│   └── Site URL
└── Runtime
    ├── Server-side rendering
    ├── API routes
    └── Static files
```

---

## 🎯 Post-Deploy

Después de deploy:

1. **Verifica el sitio:**
   ```
   https://tu-proyecto.vercel.app
   ```

2. **Ejecuta tests:**
   ```bash
   npm run test:e2e
   ```

3. **Verifica performance:**
   - Lighthouse CI
   - Google PageSpeed

4. **Monitorea errores:**
   - Vercel Logs
   - Supabase Logs

---

## 🚀 Comandos Rápidos

### Deploy Rápido (CLI)
```bash
vercel --prod
```

### Ver información del proyecto
```bash
vercel inspect
```

### Ver logs
```bash
vercel logs
```

### Rollback
```bash
vercel rollback
```

---

## 📋 Configuración en Vercel Dashboard

### Settings → General
- Framework Preset: Next.js ✅
- Root Directory: /
- Build Command: `npm run build` ✅
- Output Directory: `.next` ✅
- Install Command: `npm install` ✅

### Settings → Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=
```

### Settings → Git
- Auto-deploy desde GitHub ✅
- Preview deployments ✅

---

## ✅ ¡Listo para Deploy!

Tu proyecto ya está configurado con:
- ✅ Next.js 15
- ✅ Supabase
- ✅ Tests automáticos
- ✅ Performance optimizado
- ✅ Vercel configurado

**Próximo paso:** Hacer push a GitHub o ejecutar `vercel`

