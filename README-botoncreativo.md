# 🎨 Botón Creativo - Zingarito Kids

![Zingarito Kids Logo](https://via.placeholder.com/300x100/7B3FBD/FFFFFF?text=ZINGARITO+KIDS)

> **Sistema de gestión creativa para Zingarito Kids** - Plataforma integral para la administración de productos, pedidos y clientes de la tienda mayorista de ropa infantil.

## 📖 Descripción

Botón Creativo es una aplicación web moderna desarrollada específicamente para **Zingarito Kids**, una tienda mayorista de ropa infantil ubicada en Villa Ramallo, Buenos Aires. El sistema proporciona herramientas completas para la gestión del negocio, desde el catálogo de productos hasta el procesamiento de pedidos.

## ✨ Características Principales

### 🛒 Frontend Público
- ✅ Landing page con productos destacados de Zingarito Kids
- ✅ Catálogo completo con filtros avanzados (categoría, talle, color, precio, edad)
- ✅ Búsqueda en tiempo real de productos
- ✅ Página de detalle con galería de imágenes
- ✅ Carrito de compras con validación mayorista (mínimo 5 productos)
- ✅ Sistema de autenticación seguro
- ✅ Checkout integrado con datos bancarios
- ✅ Integración directa con WhatsApp (+54 340 749 8045)

### 🎛️ Panel de Administración
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión completa de productos (CRUD con imágenes)
- ✅ **Actualización masiva de precios** con un solo click
  - Aumentar o disminuir precios por porcentaje
  - Aplicar a todos los productos o por categoría
  - Vista previa de cambios antes de aplicar
- ✅ Gestión de pedidos y estados
- ✅ Administración de clientes
- ✅ Reportes y estadísticas de ventas
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
- **Notificaciones:** Sonner
- **UI Components:** Shadcn/ui

## 🎨 Identidad Visual

### Paleta de Colores Zingarito Kids
- **Primary:** `#7B3FBD` (Morado corporativo)
- **Secondary:** `#00D9D4` (Celeste vibrante)
- **Accent:** `#FFB700` (Amarillo energético)
- **WhatsApp:** `#25D366` (Verde WhatsApp)

### Logos Disponibles
El proyecto incluye múltiples variaciones del logo de Zingarito Kids:
- Logo principal con gradiente colorido
- Versión en blanco y negro
- Logo compacto "Z KIDS"
- Variaciones para diferentes contextos

## 📦 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/cocomeza/botoncreativo.git
cd botoncreativo
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
3. Ejecutar el SQL del archivo `supabase/migrations/001_initial_schema.sql`
4. Crear Storage Buckets:
   - `products` (público) - imágenes de productos
   - `payment-proofs` (privado) - comprobantes de pago
   - `business` (público) - logo del negocio

### 5. Ejecutar el proyecto
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 🎨 Rutas Principales

### Frontend Público
- `/` - Home de Zingarito Kids
- `/productos` - Catálogo de ropa infantil
- `/productos/[id]` - Detalle de producto
- `/carrito` - Carrito de compras
- `/checkout` - Finalizar compra
- `/auth/login` - Iniciar sesión
- `/auth/registro` - Registro de clientes
- `/mi-cuenta` - Panel del cliente

### Panel Admin (requiere permisos)
- `/admin` - Dashboard principal
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
- `products` - Catálogo de productos de Zingarito Kids
- `orders` - Pedidos mayoristas
- `order_items` - Items de cada pedido
- `favorites` - Productos favoritos
- `business_config` - Configuración del negocio

Ver esquema completo en `supabase/migrations/001_initial_schema.sql`

## 🌐 Dominio Personalizado

Para que Zingarito Kids tenga su propio dominio profesional:

### Opciones de Dominios

**OPCIÓN 1: Solo .com (Recomendado - Más Simple)**
- Dominio: `zingaritokids.com`
- Proveedor: [Namecheap](https://namecheap.com)
- Costo: ~USD $12/año (~$12,000 ARS/año)
- ✅ No requiere trámites con AFIP
- ✅ Más profesional internacionalmente
- ✅ Configuración en 10 minutos

**OPCIÓN 2: .com.ar + .com (Identidad Argentina)**
- Dominios: `zingaritokids.com.ar` (principal) + `zingaritokids.com` (redirección)
- Proveedores:
  - `.com.ar`: [DonWeb](https://donweb.com) (~$4,000 ARS/año)
  - `.com`: [Namecheap](https://namecheap.com) (~USD $12/año)
- Costo total: ~$16,000 ARS/año
- ✅ Identidad argentina clara
- ⚠️ Requiere Clave Fiscal AFIP para .com.ar

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

### Configuración del Dominio
1. Comprar dominio en [Namecheap](https://namecheap.com)
2. Conectar en Vercel Dashboard → Settings → Domains
3. Configurar DNS con los registros proporcionados por Vercel
4. Esperar propagación DNS (24-48 horas)
5. ✅ HTTPS automático activado

## 📄 Licencia

Proyecto privado - Zingarito Kids © 2025

## 👨‍💻 Desarrollo

Desarrollado con ❤️ para Zingarito Kids usando las mejores prácticas de Next.js y TypeScript.

---

## 📞 Contacto Zingarito Kids

- **WhatsApp:** +54 340 749 8045
- **Email:** zingaritokids@gmail.com
- **Dirección:** San Martín 17, Villa Ramallo, Buenos Aires, Argentina

---

⭐ **Si te gusta este proyecto, dale una estrella en GitHub!**

## 🎯 Sobre Zingarito Kids

Zingarito Kids es una tienda mayorista especializada en ropa infantil, ubicada en Villa Ramallo, Buenos Aires. Con más de [X] años en el mercado, nos especializamos en proporcionar productos de calidad para niños, con un enfoque en ventas B2B y compras mayoristas.

### Nuestros Valores:
- 🎨 **Creatividad:** Diseños únicos y coloridos
- 👶 **Calidad:** Productos seguros para niños
- 🤝 **Confianza:** Relaciones duraderas con nuestros clientes
- 🚀 **Innovación:** Tecnología al servicio del negocio

---

**Desarrollado por:** [Tu Nombre]  
**Para:** Zingarito Kids  
**Año:** 2025
