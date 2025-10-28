# 🚀 Instrucciones de Deploy en Vercel

## ✅ Checklist Pre-Deploy

Antes de hacer deploy, verifica:

- [x] `vercel.json` configurado
- [x] Variables de entorno documentadas
- [x] Build funciona (`npm run build`)
- [x] Next.js configurado para producción
- [ ] Variables de entorno en Vercel (pendiente)

---

## 🎯 Pasos para Deploy

### 1. Preparar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Copiar el archivo de ejemplo
cp env-example.txt .env.local

# Editar con tus valores reales
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-de-supabase
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**⚠️ IMPORTANTE:** 
- Este archivo `.env.local` ya está en `.gitignore`
- NO lo subas a GitHub
- Usarás las mismas variables en Vercel

---

### 2. Subir Código a GitHub (si aún no lo hiciste)

```bash
# Verificar que no haya cambios sin commitear
git status

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Preparado para deploy en Vercel"

# Push a GitHub
git push origin main
```

---

### 3. Conectar Proyecto con Vercel

#### Opción A: Desde el Dashboard (Recomendado)

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en **"Add New Project"**
3. Conecta tu cuenta de **GitHub**
4. Selecciona el repositorio `tienda-mayorista`
5. Vercel detectará automáticamente:
   - Framework: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### Opción B: Usando CLI

```bash
# Instalar Vercel CLI globalmente
npm i -g vercel

# Login
vercel login

# Deploy (primera vez)
vercel

# Deploy a producción
vercel --prod
```

---

### 4. Configurar Variables de Entorno en Vercel

En el Dashboard de Vercel:

1. Ve a tu proyecto
2. **Settings** → **Environment Variables**
3. Agrega las siguientes variables:

```env
Variable Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://tu-proyecto.supabase.co
Environment: Production, Preview, Development

Variable Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: tu-clave-anon-de-supabase
Environment: Production, Preview, Development

Variable Name: NEXT_PUBLIC_SITE_URL
Value: https://tu-proyecto.vercel.app
Environment: Production
```

**Nota:** Para `NEXT_PUBLIC_SITE_URL` en producción, usa la URL que Vercel te asigne.

---

### 5. Hacer el Deploy

#### Desde Dashboard:
1. Haz clic en **"Deploy"**
2. Espera a que termine el build (~2-5 minutos)
3. Verás tu URL: `https://tu-proyecto.vercel.app`

#### Desde CLI:
```bash
# Deploy a producción
npm run deploy
# o
vercel --prod

# Preview (testing)
npm run deploy:preview
# o
vercel
```

---

## ✅ Verificación Post-Deploy

### 1. Verificar que el Site Funciona
```
https://tu-proyecto.vercel.app
```

### 2. Verificar Conexión con Supabase
- Debería cargar sin errores
- Los productos deberían verse
- El login debería funcionar

### 3. Ejecutar Tests
```bash
npm run test:e2e
```

---

## 🔧 Ajustes Adicionales

### Dominio Personalizado

Si quieres usar tu propio dominio:

1. **Settings** → **Domains**
2. Agrega tu dominio
3. Configura DNS según instrucciones:
   ```
   CNAME: www → cname.vercel-dns.com
   ```

### Analytics (Opcional)

Para agregar Google Analytics:

1. **Settings** → **Environment Variables**
2. Agrega:
   ```env
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

### Preview Deployments

Cada vez que hagas push a una branch:
- ✅ Crea un preview deployment
- ✅ URL única para testing
- ✅ Comentar antes de merge

---

## 📊 Monitoreo

### Ver Logs en Vercel

```bash
# Ver logs en tiempo real
vercel logs

# Ver logs de un deployment específico
vercel logs <deployment-id>
```

### Dashboard de Vercel

En el dashboard puedes ver:
- ✅ Tiempos de build
- ✅ Errores de compilación
- ✅ Performance metrics
- ✅ Analytics

---

## 🐛 Troubleshooting

### Error: "Build failed"
```bash
# Verificar que build funciona localmente
npm run build

# Si hay errores de TypeScript
npm run lint
```

### Error: "Supabase connection failed"
- Verifica que las variables de entorno estén correctas
- Verifica que `NEXT_PUBLIC_SUPABASE_URL` sea válida
- Verifica que `NEXT_PUBLIC_SUPABASE_ANON_KEY` sea válida

### Error: "Module not found"
```bash
# Limpiar y reinstalar
rm -rf node_modules .next
npm install
npm run build
```

### Error: "Memory limit exceeded"
- Aumenta el límite en Vercel Settings
- O reduce el límite de productos en código

---

## 📝 Variables de Entorno Necesarias

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública de Supabase | `eyJ...` |
| `NEXT_PUBLIC_SITE_URL` | URL de tu sitio | `https://tu-dominio.vercel.app` |

---

## ✅ Resumen

**Tu proyecto está listo para deploy con:**

1. ✅ `vercel.json` configurado
2. ✅ `next.config.ts` optimizado
3. ✅ Variables de entorno documentadas
4. ✅ Build optimizado
5. ✅ Tests automatizados

**Solo necesitas:**

1. Push a GitHub
2. Conectar con Vercel
3. Agregar variables de entorno
4. Deploy

**¡Listo!** 🎉

---

## 🎯 Próximos Pasos

Después del deploy:

1. Verificar que el sitio funciona
2. Ejecutar `npm run test:e2e` para validar
3. Configurar dominio personalizado (opcional)
4. Agregar analytics (opcional)

**¡Tu tienda estará online!** 🚀

