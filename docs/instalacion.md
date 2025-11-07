# 📋 Guía de Instalación - Zingarito Kids

Guía completa para configurar el proyecto desde cero.

## 📋 Requisitos

- Node.js 18 o superior
- npm 9 o superior
- Cuenta de Supabase
- Git

---

## 🔧 Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/cocomeza/tiendaderopazingaritokids.git
cd tiendaderopazingaritokids
```

---

## 📦 Paso 2: Instalar Dependencias

```bash
npm install
```

Esto instalará todas las dependencias necesarias:
- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Supabase
- Y más...

---

## 🔐 Paso 3: Configurar Variables de Entorno

### 3.1 Crear archivo `.env.local`

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon
SUPABASE_SERVICE_ROLE_KEY=tu_clave_service_role

# Información del Negocio
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=543407440243
NEXT_PUBLIC_BUSINESS_EMAIL=zingaritokids@gmail.com

# Opcional
NEXT_PUBLIC_GA_ID=tu_google_analytics_id
```

### 3.2 Obtener Credenciales de Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea un proyecto o usa el existente
3. Ve a **Settings** → **API**
4. Copia:
   - **URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

---

## 🗄️ Paso 4: Configurar Base de Datos

### 4.1 Ejecutar Migraciones

1. Ve a tu proyecto en Supabase Dashboard
2. Ve a **SQL Editor**
3. Copia y ejecuta las migraciones de `supabase/migrations/` en orden:
   - `001_initial_schema.sql`
   - `002_...`
   - etc.

### 4.2 Configurar Storage

1. Ve a **Storage** en Supabase
2. Crea un bucket llamado `product-images`
3. Configura permisos públicos para lectura
4. Verifica las políticas RLS

---

## ▶️ Paso 5: Ejecutar el Proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## ✅ Verificar la Instalación

### Checklist:

- [ ] Servidor ejecutándose en `http://localhost:3000`
- [ ] Página principal carga correctamente
- [ ] Puedes ver productos (aunque no haya datos)
- [ ] Los links de navegación funcionan
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en la terminal

---

## 🐛 Troubleshooting

### Error: "Invalid supabaseUrl"
**Solución:** Verifica que las variables de entorno estén correctamente configuradas en `.env.local`

### Error: "Module not found"
**Solución:** Ejecuta `npm install` nuevamente

### Error: "Port 3000 already in use"
**Solución:** Cambia el puerto: `npm run dev -- -p 3001`

### Build falla
**Solución:** 
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## 📚 Siguientes Pasos

- [Configurar Base de Datos](./database.md)
- [Ejecutar Tests](./tests.md)
- [Hacer Deploy en Vercel](./deploy.md)

---

## 💡 Tips

- Usa `.env.local` para desarrollo local
- Nunca subas `.env.local` a Git
- Usa diferentes proyectos de Supabase para dev/prod
- Consulta los logs de la terminal si hay errores

---

**¡Listo para desarrollar!** 🚀

