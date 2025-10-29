# 🎨 Zingarito Kids - Tienda Mayorista

E-commerce moderno para Zingarito Kids, una tienda mayorista de ropa infantil en Argentina.

[![Deploy](https://vercel.com/button)](https://vercel.com/new)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

## 🚀 Inicio Rápido

### 1. Instalación
```bash
git clone https://github.com/cocomeza/tiendaderopazingaritokids.git
cd tiendaderopazingaritokids
npm install
```

### 2. Configurar Variables de Entorno
Crea `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon
```

### 3. Ejecutar
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 📖 Documentación

- 📋 [Guía de Instalación Completa](./docs/instalacion.md)
- 🗄️ [Base de Datos y Configuración de Supabase](./docs/database.md)
- 🧪 [Tests y Calidad](./docs/tests.md)
- 🚀 [Deploy en Vercel](./docs/deploy.md)
- 🎨 [Características de UI/UX](./docs/features.md)

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología |
|-----------|-----------|
| Frontend | Next.js 15, React 18, TypeScript |
| Estilos | Tailwind CSS, Framer Motion |
| Backend | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Almacenamiento | Supabase Storage |
| Testing | Playwright, Jest, axe-core |

---

## ✨ Características

### 🛍️ E-commerce
- ✅ Catálogo de productos con filtros
- ✅ Carrito de compras persistente
- ✅ Sistema de favoritos
- ✅ Búsqueda en tiempo real
- ✅ Vista previa rápida de productos

### 👥 Autenticación
- ✅ Registro y login de usuarios
- ✅ Perfil de usuario personalizado
- ✅ Recuperación de contraseña
- ✅ Autenticación segura con Supabase

### 🔐 Panel Administrativo
- ✅ Gestión de productos
- ✅ Gestión de clientes
- ✅ Actualización masiva de precios
- ✅ Sistema de descuentos
- ✅ Control de inventario
- ✅ Separación completa cliente/admin
- ✅ Interfaz simplificada para administradores

---

## 📁 Estructura del Proyecto

```
tiendaderopazingaritokids/
├── app/                    # Next.js App Router
│   ├── (public)/          # Rutas públicas
│   ├── admin/             # Panel administrativo
│   ├── auth/              # Autenticación
│   └── api/               # API routes
├── components/            # Componentes React
│   ├── ui/               # UI components (shadcn/ui)
│   ├── productos/        # Componentes de productos
│   └── navigation/        # Navegación
├── lib/                  # Utilidades
│   ├── supabase/        # Cliente de Supabase
│   ├── hooks/           # Custom hooks
│   └── stores/          # Estado global (Zustand)
├── docs/                # 📚 Documentación
├── scripts-sql/         # 🗄️ Scripts SQL
├── tests/               # 🧪 Tests automatizados
└── supabase/           # Migraciones de Supabase
```

---

## 🔧 Comandos Principales

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo

# Producción
npm run build            # Compilar para producción
npm start                # Servidor de producción

# Testing
npm run test:e2e         # Tests E2E con Playwright
npm run test:all         # Todos los tests

# Quality
npm run lint             # Verificar código
```

---

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Agrega las variables de entorno
3. Deploy automático en cada push

**Variables de Entorno Requeridas:**
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon
```

### Configuración de Base de Datos
1. Crea un proyecto en Supabase
2. Ejecuta el archivo `database-completo.sql` en el SQL Editor
3. Crea un usuario administrador desde Authentication
4. Ejecuta el script de creación de admin (ver scripts/)

---

## 🧪 Testing

El proyecto incluye:
- ✅ Tests E2E con Playwright
- ✅ Tests de accesibilidad con axe-core
- ✅ Tests de carga con k6
- ✅ 15+ tests automatizados

Ver [Documentación de Tests](./docs/tests.md)

---

## 📊 Performance

- ⚡ First Contentful Paint: < 1.5s
- 🎯 Largest Contentful Paint: < 2.5s
- 🔄 Code Splitting automático
- 💾 Cache inteligente
- 📱 100% Responsive

---

## 🔐 Seguridad

- ✅ Row Level Security (RLS) en Supabase
- ✅ Validación de datos con Zod
- ✅ Tokens JWT para autenticación
- ✅ Headers de seguridad configurados
- ✅ Autenticación separada para admin y clientes
- ✅ Verificación de permisos en servidor
- ✅ Protección contra acceso no autorizado
- ✅ Roles diferenciados (admin/cliente)

---

## 🤝 Desarrollo

1. Fork el proyecto
2. Crea tu branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Todos los derechos reservados © 2025 Zingarito Kids

---

## 👨‍💻 Desarrollado por

**Botón Creativo**
- 🌐 Website: [botoncreativo.onrender.com](https://botoncreativo.onrender.com/)
- 📧 Email: zingaritokids@gmail.com

---

## 🎉 Agradecimientos

- Supabase por el backend
- Vercel por el hosting
- Next.js por el framework
- shadcn/ui por los componentes

---

**Hecho con ❤️ para Zingarito Kids**
