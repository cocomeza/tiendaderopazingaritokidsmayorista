# 🎨 Zingarito Kids - Sistema de Gestión

**Sistema web para gestión de tienda mayorista de ropa infantil**

## 📋 Descripción

Zingarito Kids es una plataforma web para tienda mayorista de ropa infantil de diseño sin género. Empresa familiar de Villa Ramallo, Buenos Aires, dedicada 100% al rubro textil, confeccionando cada prenda con amor para que los peques estén siempre cancheros.

---

## 🚀 Características Principales

### ✨ **Página Principal**
- Diseño moderno y responsive
- Logo con gradientes de colores vibrantes
- Hero section con call-to-action
- Secciones de características y categorías
- Footer completo con información de contacto

### 🎨 **Diseño y Branding**
- **Colores Principales:**
  - Violeta: `#7B3FBD` (primary)
  - Cian: `#00D9D4` (secondary)
  - Amarillo: `#FFB700` (accent)
- **Gradientes Personalizados:** Del logo original
- **Fuentes:** Inter para contenido general
- **Responsive Design:** Optimizado para móvil, tablet y desktop

---

## 🛠️ Tecnologías

- **Framework:** Next.js 15.5.6
- **Lenguaje:** TypeScript 5.7.2
- **Estilos:** Tailwind CSS 3.4.17
- **Iconos:** Lucide React 0.460.0
- **Notificaciones:** Sonner 1.7.3
- **Base de Datos:** Supabase (pendiente configuración)

---

## 📦 Instalación

### **Requisitos Previos**
- Node.js >= 18.0.0
- npm >= 8.0.0

### **Pasos de Instalación**

```bash
# 1. Clonar el repositorio
git clone https://github.com/cocomeza/botoncreativo.git
cd botoncreativo

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Crear archivo .env.local con las siguientes variables:
# NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
# NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
# NEXT_PUBLIC_WHATSAPP_NUMBER=+549XXXXXXXXXX
# NEXT_PUBLIC_BUSINESS_EMAIL=info@zingaritokids.com

# 4. Ejecutar en modo desarrollo
npm run dev
```

El proyecto estará disponible en: **http://localhost:3000**

---

## 📁 Estructura del Proyecto

```
botoncreativo/
├── app/                      # Páginas y rutas de Next.js
│   ├── globals.css          # Estilos globales con colores de marca
│   ├── layout.tsx           # Layout principal con metadata
│   └── page.tsx             # Página de inicio
├── components/              # Componentes reutilizables
│   └── ui/                  # Componentes UI básicos
│       ├── button.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       └── input.tsx
├── lib/                     # Utilidades y configuraciones
│   ├── utils.ts            # Funciones auxiliares
│   └── zingarito-config.ts # Configuración de colores y estilos
├── logos/                   # Logos en formato SVG
│   ├── zingarito-kids-color.svg
│   ├── zingarito-kids-bw.svg
│   ├── z-kids-compact.svg
│   └── favicon.svg
├── public/                  # Archivos estáticos
├── tailwind.config.js       # Configuración de Tailwind
├── next.config.ts           # Configuración de Next.js
├── tsconfig.json            # Configuración de TypeScript
└── package.json             # Dependencias del proyecto
```

---

## 🎨 Componentes UI

El proyecto incluye componentes UI básicos personalizados:

### **Button**
```tsx
import { Button } from '@/components/ui/button'

<Button variant="default">Comprar Ahora</Button>
<Button variant="outline">Más Info</Button>
```

### **Card**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    Contenido de la tarjeta
  </CardContent>
</Card>
```

### **Badge**
```tsx
import { Badge } from '@/components/ui/badge'

<Badge variant="success">Disponible</Badge>
<Badge variant="warning">Pocas Unidades</Badge>
```

---

## 🗃️ Base de Datos (Supabase)

El proyecto está diseñado para usar Supabase. Puedes encontrar el schema completo en:
- **Archivo:** `supabase-schema-zingarito.sql`

### **Tablas Principales:**
- `profiles` - Perfiles de usuarios
- `products` - Catálogo de productos
- `orders` - Pedidos de clientes
- `order_items` - Items de cada pedido
- `categories` - Categorías de productos
- `inventory_movements` - Movimientos de stock
- `price_history` - Historial de cambios de precios
- `notifications` - Sistema de notificaciones
- `favorites` - Productos favoritos
- `business_config` - Configuración del negocio

---

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor en modo desarrollo

# Producción
npm run build        # Genera build de producción
npm start            # Inicia servidor en producción

# Linting
npm run lint         # Ejecuta ESLint
```

---

## 🌐 Deploy en Vercel

### **Paso 1: Preparar el Proyecto**
```bash
npm run build  # Verificar que el build funciona
```

### **Paso 2: Deploy**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Hacer deploy
vercel

# Deploy a producción
vercel --prod
```

### **Paso 3: Configurar Variables de Entorno**
En el dashboard de Vercel, agregar:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_BUSINESS_EMAIL`

---

## 🎯 Roadmap

### **Fase 1: Estructura Básica** ✅
- [x] Configuración de Next.js
- [x] Diseño de página principal
- [x] Componentes UI básicos
- [x] Sistema de colores y branding

### **Fase 2: Base de Datos** 🔄
- [ ] Configurar Supabase
- [ ] Crear tablas y relaciones
- [ ] Implementar autenticación
- [ ] Crear hooks personalizados

### **Fase 3: Funcionalidades Core** 📋
- [ ] Catálogo de productos
- [ ] Carrito de compras
- [ ] Sistema de pedidos
- [ ] Panel de administración

### **Fase 4: Avanzado** 🚀
- [ ] Reportes y estadísticas
- [ ] Notificaciones en tiempo real
- [ ] Integración con WhatsApp
- [ ] Sistema de favoritos

---

## 👥 Información de Contacto

**Zingarito Kids**
- **WhatsApp:** 3407 498045 (543407498045)
- **Email:** zingaritokids@gmail.com
- **Instagram:** [@zingaritokids](https://www.instagram.com/zingaritokids)
- **Ubicación:** San Martín 17, Villa Ramallo, Buenos Aires, Argentina

---

## 📄 Licencia

Este proyecto es privado y pertenece a Zingarito Kids. Todos los derechos reservados.

---

## 🤝 Contribuir

Este es un proyecto privado. Para solicitudes especiales, contactar al equipo de desarrollo.

---

## 📝 Notas de Desarrollo

### **Colores Personalizados**
Los colores están definidos en `app/globals.css` usando variables CSS:
```css
--primary: 123 63 189;      /* Violeta */
--secondary: 0 217 212;      /* Cian */
--accent: 255 183 0;         /* Amarillo */
```

### **Gradientes del Logo**
Los gradientes están disponibles como clases de Tailwind:
```css
.text-gradient-zingarito     /* Gradiente de texto */
.bg-gradient-zingarito       /* Gradiente de fondo */
```

---

**Desarrollado con ❤️ para Zingarito Kids**