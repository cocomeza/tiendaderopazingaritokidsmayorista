# 🚀 Zingarito Kids - Tienda Mayorista Profesional

Sistema completo de e-commerce **MAYORISTA** para Zingarito Kids, desarrollado con tecnologías modernas y mejores prácticas de desarrollo.

> **Nota:** Esta plataforma está específicamente diseñada para ventas mayoristas. Las ventas minoristas se manejan a través de Tienda Nube.

## ✨ Características Principales

### 🎨 **Frontend Profesional**
- **Next.js 14** con App Router
- **TypeScript** para type safety
- **Tailwind CSS** para styling consistente
- **Framer Motion** para animaciones fluidas
- **Responsive Design** optimizado para todos los dispositivos

### 🛒 **Funcionalidades de E-commerce Mayorista**
- **Catálogo de productos** con filtros y búsqueda
- **Carrito de compras** persistente con Zustand
- **Sistema de autenticación** completo
- **Panel de administración** funcional
- **Integración con WhatsApp** para pedidos mayoristas
- **Compra mínima** de 5 unidades por producto

### 🔧 **Arquitectura Profesional**
- **Supabase** como backend (auth + database)
- **Error Boundaries** para manejo de errores
- **Loading states** y skeletons
- **Lazy loading** para optimización
- **SEO optimizado** con metadata dinámica
- **Testing** con Jest y Testing Library

### 📱 **UX/UI Avanzado**
- **Microinteracciones** y estados de loading
- **Animaciones** suaves y profesionales
- **Estados de error** manejados elegantemente
- **Feedback visual** en todas las acciones
- **Accesibilidad** mejorada

## 🏪 **Diferencias: Mayorista vs Minorista**

### **Esta Plataforma (Mayorista)**
- ✅ **Compra mínima:** 5 unidades por producto
- ✅ **Precios mayoristas** especiales
- ✅ **Atención personalizada** para comercios
- ✅ **Catálogo completo** con stock en tiempo real
- ✅ **Panel de administración** para gestión
- ✅ **Pedidos por WhatsApp** con detalles comerciales

### **Tienda Nube (Minorista)**
- 🛍️ **Venta unitaria** sin mínimo
- 🛍️ **Precios minoristas** al público
- 🛍️ **Experiencia de compra** directa
- 🛍️ **Checkout online** tradicional
- 🛍️ **Enfocado en consumidores finales**

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación
│   ├── admin/             # Panel de administración
│   ├── productos/         # Catálogo de productos
│   └── contacto/          # Página de contacto
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base (Button, Card, etc.)
│   ├── productos/        # Componentes específicos de productos
│   ├── cart/             # Componentes del carrito
│   └── seo/              # Componentes de SEO
├── lib/                  # Utilidades y configuración
│   ├── hooks/            # Custom hooks
│   ├── stores/           # Estado global (Zustand)
│   ├── supabase/          # Configuración de Supabase
│   └── types/            # Tipos de TypeScript
└── __tests__/            # Tests unitarios
```

## 🚀 Instalación y Configuración

### 1. **Clonar el repositorio**
```bash
git clone https://github.com/cocomeza/botoncreativo.git
cd botoncreativo
```

### 2. **Instalar dependencias**
```bash
npm install
```

### 3. **Configurar variables de entorno**
```bash
cp env-example.txt .env.local
```

Editar `.env.local` con tus credenciales:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_WHATSAPP_NUMBER=543407498045
NEXT_PUBLIC_BUSINESS_EMAIL=zingaritokids@gmail.com
```

### 4. **Configurar Supabase**
Ejecutar el script SQL en tu proyecto Supabase:
```bash
# Usar el archivo supabase-schema-zingarito.sql
```

### 5. **Ejecutar el proyecto**
```bash
npm run dev
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📊 Funcionalidades Implementadas

### ✅ **Completadas**
- [x] Sistema de autenticación completo
- [x] Panel de administración funcional
- [x] Carrito de compras persistente
- [x] Catálogo de productos con filtros
- [x] Integración con WhatsApp
- [x] Animaciones con Framer Motion
- [x] Error boundaries y manejo de errores
- [x] Loading states y skeletons
- [x] SEO optimizado
- [x] Testing básico
- [x] Responsive design
- [x] Microinteracciones

### 🔄 **En Desarrollo**
- [ ] Optimización de performance avanzada
- [ ] Tests E2E con Playwright
- [ ] PWA (Progressive Web App)
- [ ] Analytics y métricas
- [ ] Internacionalización (i18n)

## 🎯 Tecnologías Utilizadas

### **Frontend**
- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Styling
- **Framer Motion** - Animaciones
- **Zustand** - Estado global
- **React Hook Form** - Formularios
- **Zod** - Validación de esquemas

### **Backend**
- **Supabase** - Backend as a Service
- **PostgreSQL** - Base de datos
- **Row Level Security** - Seguridad

### **Testing**
- **Jest** - Testing framework
- **Testing Library** - Testing utilities
- **MSW** - API mocking

### **Herramientas**
- **ESLint** - Linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Vercel** - Deploy

## 📱 Responsive Design

El sitio está optimizado para:
- **Mobile First** (320px+)
- **Tablet** (768px+)
- **Desktop** (1024px+)
- **Large Desktop** (1440px+)

## 🔒 Seguridad

- **Row Level Security** en Supabase
- **Middleware** de autenticación
- **Error boundaries** para manejo de errores
- **Validación** de formularios
- **Sanitización** de inputs

## 🚀 Deploy

### **Vercel (Recomendado)**
```bash
# Conectar con Vercel
vercel

# Deploy automático desde GitHub
```

### **Variables de entorno en Vercel**
Configurar las mismas variables del `.env.local`

## 📈 Performance

- **Lazy loading** de imágenes y componentes
- **Code splitting** automático
- **Image optimization** con Next.js
- **Bundle analysis** disponible
- **Core Web Vitals** optimizados

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollo:** Botón Creativo
- **Cliente:** Zingarito Kids
- **Contacto:** https://botoncreativo.onrender.com/

## 📞 Soporte

Para soporte técnico o consultas:
- **Email:** zingaritokids@gmail.com
- **WhatsApp:** +54 3407 498045
- **Instagram:** @zingaritokids

---

**Desarrollado con ❤️ por Botón Creativo**
