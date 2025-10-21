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
- ✅ **Actualización masiva de precios** con un solo click
  - Aumentar o disminuir precios por porcentaje
  - Aplicar a todos los productos o por categoría
  - Vista previa de cambios antes de aplicar
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

## 💰 Actualización Masiva de Precios

Una de las características más poderosas del panel de administración es la **actualización masiva de precios**. Esta funcionalidad permite modificar los precios de múltiples productos simultáneamente.

### ¿Cómo funciona?

1. **Acceder al módulo:**
   - Ir a `/admin/productos`
   - Click en el botón **"Actualizar Precios"**

2. **Configurar el ajuste:**
   - Elegir **Aumentar** o **Disminuir** precios
   - Ingresar el **porcentaje deseado** (ej: 3, 5, 10, 15.5)
   - Seleccionar **categoría específica** o aplicar a **todos los productos**

3. **Vista Previa:**
   - El sistema muestra una **vista previa en tiempo real**
   - Ver cuántos productos se actualizarán
   - Ver ejemplos de precios antes y después

4. **Confirmar:**
   - Click en **"Actualizar X Productos"**
   - Los cambios se aplican **inmediatamente** a la base de datos

### Ejemplo de uso:
```
Tipo: Aumentar
Porcentaje: 3%
Categoría: Remeras

Resultado: Todos los productos de la categoría "Remeras" 
aumentarán su precio un 3% automáticamente.
```

### Ventajas:
- ✅ Ahorra tiempo (no editar producto por producto)
- ✅ Actualización instantánea en toda la tienda
- ✅ Vista previa para evitar errores
- ✅ Se puede aplicar por categoría o globalmente
- ✅ Acepta decimales para ajustes precisos

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

### Deploy Básico

1. Conectar repositorio a Vercel
2. Agregar variables de entorno
3. Deploy automático en cada push a main

### 🌐 Dominio Personalizado

Para que Zingarito Kids tenga su propio dominio profesional, hay varias opciones:

#### Opciones de Dominios

**OPCIÓN 1: Solo .com (Recomendado - Más Simple)**
- Dominio: `zingaritokids.com`
- Proveedor: [Namecheap](https://namecheap.com)
- Costo: ~USD $12/año (~$12,000 ARS/año)
- ✅ No requiere trámites con AFIP
- ✅ Más profesional internacionalmente
- ✅ Configuración en 10 minutos
- ✅ Ideal para expansión futura

**OPCIÓN 2: .com.ar + .com (Identidad Argentina)**
- Dominios: `zingaritokids.com.ar` (principal) + `zingaritokids.com` (redirección)
- Proveedores:
  - `.com.ar`: [DonWeb](https://donweb.com) (~$4,000 ARS/año)
  - `.com`: [Namecheap](https://namecheap.com) (~USD $12/año)
- Costo total: ~$16,000 ARS/año
- ✅ Identidad argentina clara
- ⚠️ Requiere Clave Fiscal AFIP para .com.ar

#### Configuración del Dominio con Vercel

**1. Comprar el dominio**
- Ir a [Namecheap](https://namecheap.com) o [DonWeb](https://donweb.com)
- Buscar: `zingaritokids.com`
- Completar la compra

**2. Conectar en Vercel**
```bash
# En Vercel Dashboard:
1. Ir a tu proyecto → Settings → Domains
2. Click en "Add Domain"
3. Ingresar: zingaritokids.com
4. Vercel te mostrará los registros DNS necesarios
```

**3. Configurar DNS en Namecheap**
```
1. Login en Namecheap
2. Domain List → Manage → Advanced DNS
3. Agregar estos registros:

   Type: A Record
   Host: @
   Value: 76.76.21.21
   TTL: Automatic

   Type: CNAME
   Host: www
   Value: cname.vercel-dns.com
   TTL: Automatic
```

**4. Verificar y Activar HTTPS**
- Esperar 24-48 horas para propagación DNS
- Vercel detecta automáticamente el dominio
- HTTPS se activa automáticamente (gratis con Let's Encrypt)
- ✅ Tu sitio estará en: `https://zingaritokids.com`

#### Proveedores de Dominios en Argentina

**Para .com.ar (Dominios Argentinos):**
- **NIC Argentina** (oficial): https://nic.ar - ~$3,000 ARS/año
- **DonWeb** (recomendado): https://donweb.com - ~$4,000 ARS/año
- **HostGator Argentina**: https://hostgator.ar - ~$3,500 ARS/año

**Para .com (Internacionales):**
- **Namecheap** (recomendado): https://namecheap.com - ~USD $12/año
- **Google Domains**: https://domains.google - ~USD $12/año
- **GoDaddy**: https://godaddy.com - ~USD $15/año

#### Verificación del Dominio

Después de configurar el DNS, verificar con:
```bash
# Verificar registros DNS
nslookup zingaritokids.com

# Verificar propagación global
# Usar: https://dnschecker.org
```

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
