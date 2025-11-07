# 🗄️ Estructura de la Base de Datos - Zingarito Kids

## 📊 Tablas Principales

### 1. **profiles** (Perfiles de Usuarios)
Almacena información de clientes y administradores.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid | ID del usuario (FK a auth.users) |
| `email` | text | Email único |
| `full_name` | text | Nombre completo |
| `phone` | text | Teléfono |
| `address` | text | Dirección |
| `city` | text | Ciudad |
| `province` | text | Provincia |
| `postal_code` | text | Código postal |
| `company_name` | text | Nombre de la empresa |
| `cuit` | text | CUIT |
| `billing_address` | text | Dirección de facturación |
| `locality` | text | Localidad |
| `sales_type` | text | Tipo de venta |
| `ages` | text | Rangos de edad |
| `is_admin` | boolean | Si es administrador |
| `is_active` | boolean | Si está activo |
| `is_wholesale_client` | boolean | Si es cliente mayorista |
| `min_order_amount` | numeric(10,2) | Monto mínimo de pedido |
| `created_at` | timestamp | Fecha de creación |
| `updated_at` | timestamp | Fecha de actualización |

---

### 2. **categories** (Categorías de Productos)
Categorías jerárquicas de productos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid | ID único |
| `name` | text | Nombre de la categoría |
| `description` | text | Descripción |
| `parent_id` | uuid | ID de categoría padre (self-reference) |
| `group_type` | text | Tipo: 'menu', 'age', 'back-to-school' |
| `age_range` | text | Rango de edad: 'BEBÉS', 'NIÑOS', 'ADULTOS' |
| `display_order` | integer | Orden de visualización |
| `active` | boolean | Si está activa |
| `created_at` | timestamp | Fecha de creación |
| `updated_at` | timestamp | Fecha de actualización |

---

### 3. **products** (Productos)
Catálogo principal de productos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid | ID único |
| `name` | text | Nombre del producto |
| `description` | text | Descripción |
| `sku` | text | SKU único |
| `price` | numeric(10,2) | Precio de referencia (retail) |
| `wholesale_price` | numeric(10,2) | Precio mayorista (principal) |
| `cost_price` | numeric(10,2) | Precio de costo (opcional) |
| `stock` | integer | Stock total |
| `low_stock_threshold` | integer | Umbral de stock bajo (default: 10) |
| `category_id` | uuid | ID de categoría (FK) |
| `sizes` | text[] | Array de tallas: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] |
| `colors` | text[] | Array de colores: ['Blanco', 'Negro', 'Azul', etc.] |
| `images` | text[] | Array de URLs de imágenes (Supabase Storage) |
| `active` | boolean | Si está activo |
| `created_at` | timestamp | Fecha de creación |
| `updated_at` | timestamp | Fecha de actualización |

**Índices importantes:**
- `products_active_idx` - Productos activos
- `products_category_id_idx` - Por categoría
- `products_name_idx` - Búsqueda por nombre
- `products_wholesale_price_idx` - Por precio
- `products_stock_idx` - Por stock

---

### 4. **product_variants** (Variantes de Productos) ⭐
Variantes específicas de cada producto (talla + color).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid | ID único |
| `product_id` | uuid | ID del producto padre (FK) |
| `sku` | text | SKU único de la variante |
| `size` | text | Talla específica |
| `color` | text | Color específico |
| `stock` | integer | Stock de esta variante |
| `price_override` | numeric(10,2) | Precio override (opcional) |
| `wholesale_price_override` | numeric(10,2) | Precio mayorista override |
| `active` | boolean | Si está activa |
| `images` | text[] | Imágenes específicas de esta variante |
| `created_at` | timestamp | Fecha de creación |
| `updated_at` | timestamp | Fecha de actualización |

**Nota:** Esta tabla permite manejar stock por variante (talla + color).

---

### 5. **orders** (Pedidos)
Pedidos realizados por clientes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid | ID único |
| `order_number` | text | Número de pedido único (ZK-YYYYMMDD-XXXX) |
| `user_id` | uuid | ID del cliente (FK a profiles) |
| `status` | order_status | Estado: 'pendiente', 'confirmado', 'preparando', 'enviado', 'entregado', 'cancelado' |
| `payment_status` | payment_status | Estado de pago: 'pendiente', 'pagado', 'rechazado' |
| `subtotal` | numeric(10,2) | Subtotal |
| `discount` | numeric(10,2) | Descuento aplicado |
| `total` | numeric(10,2) | Total final |
| `notes` | text | Notas del pedido |
| `shipping_address` | jsonb | Dirección de envío (JSON) |
| `payment_proof_url` | text | URL de comprobante de pago |
| `created_at` | timestamp | Fecha de creación |
| `updated_at` | timestamp | Fecha de actualización |

---

### 6. **order_items** (Items de Pedidos)
Items individuales de cada pedido.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid | ID único |
| `order_id` | uuid | ID del pedido (FK) |
| `product_id` | uuid | ID del producto (FK) |
| `variant_id` | uuid | ID de la variante (FK, opcional) |
| `quantity` | integer | Cantidad |
| `price` | numeric(10,2) | Precio unitario |
| `wholesale_price` | numeric(10,2) | Precio mayorista unitario |
| `subtotal` | numeric(10,2) | Subtotal (quantity * price) |
| `created_at` | timestamp | Fecha de creación |

---

### 7. **favorites** (Productos Favoritos)
Productos marcados como favoritos por usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid | ID único |
| `user_id` | uuid | ID del usuario (FK a profiles) |
| `product_id` | uuid | ID del producto (FK a products) |
| `created_at` | timestamp | Fecha de creación |

---

### 8. **discounts** (Descuentos)
Sistema de descuentos configurados.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid | ID único |
| `name` | text | Nombre del descuento |
| `description` | text | Descripción |
| `discount_type` | text | Tipo: 'percentage', 'fixed' |
| `value` | numeric(10,2) | Valor del descuento |
| `min_order_amount` | numeric(10,2) | Monto mínimo de pedido |
| `start_date` | timestamp | Fecha de inicio |
| `end_date` | timestamp | Fecha de fin |
| `active` | boolean | Si está activo |
| `created_at` | timestamp | Fecha de creación |
| `updated_at` | timestamp | Fecha de actualización |

---

## 🔄 Comparación con CSV de Tienda Nube

### Campos del CSV de Tienda Nube:
```
- Identificador de URL
- Nombre
- Categorías
- Nombre de propiedad 1 (Color)
- Valor de propiedad 1
- Nombre de propiedad 2 (Talle)
- Valor de propiedad 2
- Nombre de propiedad 3
- Valor de propiedad 3
- Precio
- Precio promocional
- Peso (kg)
- Alto (cm)
- Ancho (cm)
- Profundidad (cm)
- Stock
- SKU
- Código de barras
- Mostrar en tienda
- Envío sin cargo
- Descripción
- Tags
- Título para SEO
- Descripción para SEO
- Marca
- Producto Físico
- MPN
- Sexo
- Rango de edad
- Costo
```

### Mapeo CSV → Base de Datos

| CSV Tienda Nube | Base de Datos | Notas |
|-----------------|---------------|-------|
| `Nombre` | `products.name` | Directo |
| `Descripción` | `products.description` | Directo |
| `Categorías` | `products.category_id` | Mapear a categoría existente o crear |
| `Precio` | `products.price` | Precio de referencia |
| `Precio promocional` | `products.wholesale_price` | Precio mayorista |
| `Costo` | `products.cost_price` | Si existe |
| `Stock` | `products.stock` o `product_variants.stock` | Depende si usa variantes |
| `SKU` | `products.sku` o `product_variants.sku` | Depende si usa variantes |
| `Mostrar en tienda` | `products.active` | SI = true, NO = false |
| `Valor de propiedad 1` (Color) | `products.colors[]` o `product_variants.color` | Array o variante |
| `Valor de propiedad 2` (Talle) | `products.sizes[]` o `product_variants.size` | Array o variante |
| `Sexo` | (No mapeado actualmente) | Podría agregarse |
| `Rango de edad` | (No mapeado actualmente) | Podría agregarse a categories |
| `Tags` | (No mapeado actualmente) | Podría agregarse como array |
| `Marca` | (No mapeado actualmente) | Podría agregarse |

---

## 📝 Estrategias de Importación

### Opción 1: Sin Variantes (Simple)
- Un producto por fila del CSV
- Colores y tallas como arrays en `products.colors[]` y `products.sizes[]`
- Stock total en `products.stock`

**Ventajas:** Simple, rápido
**Desventajas:** No permite stock por variante

### Opción 2: Con Variantes (Recomendado) ⭐
- Un producto base por "Identificador de URL"
- Una variante (`product_variants`) por cada combinación talla+color
- Stock individual por variante

**Ventajas:** 
- Control de stock por variante
- Precios específicos por variante
- Más flexible

**Desventajas:** Más complejo de importar

---

## 🔍 Ejemplo de Estructura

### Producto Base (products):
```json
{
  "id": "uuid-1",
  "name": "Remera Poker Adulto",
  "description": "...",
  "price": 24149.00,
  "wholesale_price": 24149.00,
  "stock": 0,  // Se calcula desde variantes
  "sizes": ["S", "M", "L", "XL", "XXL"],
  "colors": ["Blanco", "Negro"],
  "category_id": "cat-uuid",
  "active": true
}
```

### Variantes (product_variants):
```json
[
  {
    "product_id": "uuid-1",
    "size": "S",
    "color": "Blanco",
    "stock": 3,
    "sku": "REPOKER-BLAN-S"
  },
  {
    "product_id": "uuid-1",
    "size": "M",
    "color": "Blanco",
    "stock": 3,
    "sku": "REPOKER-BLAN-M"
  },
  // ... más variantes
]
```

---

## 🚀 Próximos Pasos

1. **Analizar CSV completo** para identificar:
   - Cantidad de productos únicos
   - Cantidad de variantes (talla+color)
   - Categorías necesarias

2. **Crear script de importación** que:
   - Parsee el CSV
   - Agrupe por "Identificador de URL"
   - Cree productos base
   - Cree variantes por combinación talla+color

3. **Mapear categorías** de Tienda Nube a categorías existentes

---

**Última actualización:** Enero 2025



