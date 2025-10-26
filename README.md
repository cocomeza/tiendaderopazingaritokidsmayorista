# 🎨 Zingarito Kids - Tienda Mayorista

E-commerce completo para Zingarito Kids, una tienda mayorista de ropa infantil en Argentina. Desarrollado con las últimas tecnologías web.

## 🚀 Características Principales

### Frontend
- **Next.js 15** con App Router
- **React 18** con componentes modernos
- **TypeScript** para type safety
- **Tailwind CSS** para estilos
- **Framer Motion** para animaciones
- Diseño responsive y mobile-first

### Backend y Base de Datos
- **Supabase** como BaaS (Backend as a Service)
- **PostgreSQL** para base de datos
- **Supabase Storage** para imágenes
- **Row Level Security (RLS)** para seguridad

### Funcionalidades del E-commerce
- ✅ Catálogo de productos con imágenes múltiples
- ✅ Carrito de compras
- ✅ Sistema de favoritos
- ✅ Filtros y búsqueda de productos
- ✅ Autenticación de usuarios
- ✅ Panel administrativo completo
- ✅ Gestión masiva de precios
- ✅ Configuración de descuentos
- ✅ Gestión de clientes
- ✅ Enlaces a redes sociales

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase
- Git

## 🔧 Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/cocomeza/tiendaderopazingaritokids.git
cd tiendaderopazingaritokids
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Business Information
NEXT_PUBLIC_WHATSAPP_NUMBER=543407498045
NEXT_PUBLIC_BUSINESS_EMAIL=zingaritokids@gmail.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: Analytics and Monitoring
NEXT_PUBLIC_GA_ID=your_google_analytics_id
SENTRY_DSN=your_sentry_dsn
```

4. **Configurar Supabase**

- Ejecuta el script de migración en Supabase SQL Editor: `supabase/migrations/001_initial_schema.sql`
- Configura las políticas RLS
- Crea el bucket de Storage para imágenes de productos

5. **Ejecutar el proyecto**
```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
tiendaderopazingaritokids/
├── app/                    # App Router de Next.js
│   ├── (public)/          # Rutas públicas
│   ├── admin/             # Panel administrativo
│   ├── auth/              # Autenticación
│   └── api/               # API routes
├── components/            # Componentes React
│   ├── ui/               # Componentes UI reutilizables
│   ├── products/         # Componentes de productos
│   └── navigation/       # Navegación
├── lib/                  # Utilidades y hooks
│   ├── supabase/        # Cliente de Supabase
│   ├── hooks/           # Custom hooks
│   └── stores/          # Estado global (Zustand)
├── public/              # Archivos estáticos
├── supabase/           # Migraciones y esquemas
└── scripts/            # Scripts de utilidad
```

## 🎨 Características de UI/UX

- **Diseño moderno**: Gradientes, efectos glassmorphism
- **Animaciones suaves**: Framer Motion para transiciones
- **Responsive**: Adaptable a todos los dispositivos
- **SEO optimizado**: Metadata dinámica y estructura semántica
- **Performance**: Carga optimizada de imágenes y lazy loading

## 🔐 Seguridad

- Row Level Security (RLS) en Supabase
- Validación de datos con Zod
- Sanitización de inputs
- Tokens JWT para autenticación

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start

# Testing
npm test
npm run test:watch

# Linting
npm run lint
```

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio de GitHub a Vercel
2. Agrega las variables de entorno
3. Deploy automático en cada push

### Otros proveedores
- Netlify
- AWS Amplify
- DigitalOcean App Platform

## 📚 Documentación Adicional

- [README Profesional](./README-PROFESIONAL.md)
- [README Botón Creativo](./README-botoncreativo.md)
- [Configuración de Imágenes](./CONFIGURACION-IMAGENES.md)
- [Auditoría Responsive](./RESPONSIVE-AUDIT-REPORT.md)

## 🤝 Contribuir

Este es un proyecto privado para Zingarito Kids. Para sugerencias o reportes, contactar al equipo de desarrollo.

## 📄 Licencia

Todos los derechos reservados © 2025 Zingarito Kids

## 👨‍💻 Desarrollo

Desarrollado por **Botón Creativo**
- Website: https://botoncreativo.onrender.com/
- Email: zingaritokids@gmail.com

## 🌟 Características Destacadas

### Panel Administrativo
- Gestión completa de productos
- Actualización masiva de precios
- Gestión de clientes
- Configuración de descuentos
- Estadísticas y reportes

### E-commerce
- Carrito de compras persistente
- Sistema de favoritos
- Búsqueda y filtros avanzados
- Carrousel de imágenes múltiples
- Integración con redes sociales

### Optimizaciones
- Carga lazy de imágenes
- Caché inteligente
- Code splitting automático
- Optimización de bundles

---

**Desarrollado con ❤️ para Zingarito Kids**