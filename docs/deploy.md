# 🚀 Guía de Deploy en Vercel

Cómo desplegar tu proyecto de Zingarito Kids en Vercel.

---

## 📋 Requisitos Previos

- ✅ Código en GitHub
- ✅ Variables de entorno documentadas
- ✅ Build funciona localmente (`npm run build`)

---

## 🚀 Paso 1: Conectar con Vercel

### Opción A: Dashboard (Recomendado)

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con GitHub
3. Click en **"Add New Project"**
4. Selecciona el repositorio: `tiendaderopazingaritokids`
5. Vercel detectará automáticamente Next.js

### Opción B: CLI

```bash
npm i -g vercel
vercel login
vercel
```

---

## 🔐 Paso 2: Configurar Variables de Entorno

En **Settings** → **Environment Variables**, agrega:

### Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon
NEXT_PUBLIC_SITE_URL=https://tu-proyecto.vercel.app
```

### Preview y Development

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon
```

**Configurar para:** Production, Preview, Development

---

## 🚀 Paso 3: Deploy

1. Click en **"Deploy"**
2. Espera ~2-5 minutos
3. ✅ Tu sitio estará online en la URL proporcionada

---

## ✅ Verificación Post-Deploy

- [ ] Build completado sin errores
- [ ] URL funciona correctamente
- [ ] Página principal carga
- [ ] Productos se muestran
- [ ] Login funciona
- [ ] No hay errores en consola

---

## 🔄 Actualizar Despliegue

Cada push a `main` activará un nuevo deploy automáticamente.

### Manual:

1. Ve a **Deployments**
2. Click en **"⋮"** → **"Redeploy"**

---

## 🌐 Dominio Personalizado

1. Ve a **Settings** → **Domains**
2. Agrega tu dominio
3. Configura DNS según instrucciones de Vercel

---

## 📊 Monitoreo

### Logs en Tiempo Real
```bash
vercel logs
```

### Analytics
- En el dashboard de Vercel
- Métricas de performance
- Analytics de visitantes

---

## 🐛 Troubleshooting

### Build Failed
- Verifica variables de entorno
- Revisa logs en Vercel
- Prueba build local: `npm run build`

### Variables no funcionan
- Verifica que estén configuradas para el environment correcto
- Agrega para Production, Preview y Development

### Error 500
- Revisa logs de Vercel
- Verifica conexión con Supabase
- Revisa variables de entorno

---

## 📈 Performance

Vercel automáticamente:
- ✅ Optimiza imágenes
- ✅ Hace Code Splitting
- ✅ Cachea assets
- ✅ CDN global

---

## 💡 Tips

- Usa Preview Deployments para testing
- Monitora Analytics en Vercel Dashboard
- Revisa logs regularmente
- Actualiza variables cuando sea necesario

---

## 📚 Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Guía de Variables de Entorno](https://vercel.com/docs/concepts/projects/environment-variables)

---

**¡Tu tienda está online!** 🎉

