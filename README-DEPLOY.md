# 🚀 Deploy Rápido - Zingarito Kids

## ⚡ Deploy en 5 Pasos

### 1. Configurar Variables de Entorno

```bash
# En Vercel Dashboard:
# Settings → Environment Variables

NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon
NEXT_PUBLIC_SITE_URL=https://tu-dominio.vercel.app
```

### 2. Subir a GitHub

```bash
git add .
git commit -m "Listo para deploy"
git push origin main
```

### 3. Conectar con Vercel

- Ve a [vercel.com](https://vercel.com)
- **Add New Project**
- Selecciona tu repositorio
- **Deploy**

### 4. Configurar Dominio (Opcional)

- Settings → Domains
- Agrega tu dominio
- Configura DNS

### 5. ¡Listo!

Tu sitio estará en:
```
https://tu-proyecto.vercel.app
```

---

## 📋 Archivos Configurados

- ✅ `vercel.json` - Configuración de Vercel
- ✅ `next.config.ts` - Optimizado para producción
- ✅ `.gitignore` - Variables excluidas
- ✅ Scripts de deploy en `package.json`

---

## 🔧 Scripts Disponibles

```bash
npm run deploy           # Deploy a producción
npm run deploy:preview   # Preview deployment
npm run build            # Build local
npm run start            # Probar build localmente
```

---

## ✅ Pre-Deploy Checklist

- [x] Variables de entorno documentadas
- [x] `vercel.json` creado
- [x] Build funciona localmente
- [x] Tests pasando
- [ ] Variables configuradas en Vercel
- [ ] Código en GitHub
- [ ] Conectado con Vercel

---

## 📞 Soporte

Si tienes problemas:
1. Verifica logs en Vercel Dashboard
2. Ejecuta `npm run build` localmente
3. Verifica variables de entorno

**¡Tu proyecto está listo para deploy!** 🎉

