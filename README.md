# 🛍️ Zingarito Kids - Tienda Mayorista

![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?style=for-the-badge&logo=tailwind-css)

## 📖 Descripción

Tienda online mayorista de ropa infantil con sistema completo de gestión de productos, pedidos y clientes. Diseñada específicamente para ventas B2B con compra mínima de 5 productos.

## ✨ Características Principales

### 🛒 Frontend Público
- ✅ Landing page profesional con productos destacados
- ✅ Catálogo con filtros avanzados (categoría, talle, color, precio, edad)
- ✅ Búsqueda en tiempo real
- ✅ Página de detalle de producto con galería
- ✅ Carrito con validación mayorista (mínimo 5 productos)
- ✅ Sistema de autenticación completo
- ✅ Checkout con datos bancarios
- ✅ Integración WhatsApp

### 🎛️ Panel de Administración
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión de productos (CRUD con imágenes)
- ✅ Gestión de pedidos
- ✅ Gestión de clientes
- ✅ Reportes y estadísticas
- ✅ Configuración editable del negocio

## 🚀 Tecnologías

- **Framework:** Next.js 15 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS v4
- **Base de datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth
- **Storage:** Supabase Storage
- **Estado:** Zustand (carrito)
- **Iconos:** Lucide React
- **Notificaciones:** React Hot Toast

## 📦 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/cocomeza/TiendaDeRopa.git
cd TiendaDeRopa
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env.local` en la raíz:

```env
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-key

NEXT_PUBLIC_WHATSAPP_NUMBER=543407498045
NEXT_PUBLIC_BUSINESS_EMAIL=zingaritokids@gmail.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Configurar Supabase

1. Crear proyecto en [Supabase](https://supabase.com)
2. Copiar URL y API Keys
3. Ejecutar el SQL del archivo `supabase/migrations/001_initial_schema.sql` en SQL Editor
4. Crear Storage Buckets:
   - `products` (público) - para imágenes de productos
   - `payment-proofs` (privado) - para comprobantes de pago
   - `business` (público) - para logo del negocio

### 5. Ejecutar el proyecto
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 🎨 Rutas Principales

### Frontend Público
- `/` - Home
- `/productos` - Catálogo
- `/productos/[id]` - Detalle de producto
- `/carrito` - Carrito de compras
- `/checkout` - Finalizar compra
- `/auth/login` - Iniciar sesión
- `/auth/registro` - Registro
- `/mi-cuenta` - Panel del cliente

### Panel Admin (requiere permisos)
- `/admin` - Dashboard
- `/admin/productos` - Gestión de productos
- `/admin/pedidos` - Gestión de pedidos
- `/admin/clientes` - Lista de clientes
- `/admin/reportes` - Reportes y estadísticas
- `/admin/configuracion` - Configuración del negocio

## 👤 Crear Usuario Admin

Después de registrarte, ejecutar en Supabase SQL Editor:

```sql
update profiles
set is_admin = true
where email = 'tu-email@ejemplo.com';
```

## 📊 Base de Datos

### Tablas Principales
- `profiles` - Usuarios y clientes
- `products` - Catálogo de productos
- `orders` - Pedidos
- `order_items` - Items de cada pedido
- `favorites` - Productos favoritos
- `business_config` - Configuración del negocio

Ver esquema completo en `supabase/migrations/001_initial_schema.sql`

## 🎨 Paleta de Colores

- **Primary:** `#7B3FBD` (Morado)
- **Secondary:** `#00D9D4` (Celeste)
- **Accent:** `#FFB700` (Amarillo)
- **WhatsApp:** `#25D366` (Verde)

## 📱 Responsive Design

- ✅ Mobile-first approach
- ✅ Diseño adaptado para tablet y desktop
- ✅ Menú hamburguesa en móvil
- ✅ Grid responsivo de productos
- ✅ Filtros optimizados para móvil

## 🔒 Seguridad

- ✅ Middleware de autenticación
- ✅ Row Level Security (RLS) en Supabase
- ✅ Rutas protegidas
- ✅ Validación de formularios
- ✅ Sanitización de datos

## 📝 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Ejecutar linter
```

## 🚀 Deploy en Vercel

1. Conectar repositorio a Vercel
2. Agregar variables de entorno
3. Deploy automático en cada push a main

## 📄 Licencia

Proyecto privado - Zingarito Kids © 2025

## 👨‍💻 Desarrollo

Desarrollado con ❤️ usando las mejores prácticas de Next.js y TypeScript.

---

## 📞 Contacto

- **WhatsApp:** +54 340 749 8045
- **Email:** zingaritokids@gmail.com
- **Dirección:** San Martín 17, Villa Ramallo, Buenos Aires, Argentina

---

⭐ **Si te gusta este proyecto, dale una estrella en GitHub!**
