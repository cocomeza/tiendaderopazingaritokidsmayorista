# 🔍 Comparación Completa: CSV Tienda Nube vs Base de Datos Supabase

## 📋 Campos del CSV de Tienda Nube (30 campos)

| # | Campo CSV | Estado | Mapeo Actual |
|---|-----------|--------|--------------|
| 0 | `Identificador de URL` | ✅ Usado | Para agrupar productos |
| 1 | `Nombre` | ✅ Mapeado | `products.name` |
| 2 | `Categorías` | ✅ Mapeado | `products.category_id` |
| 3 | `Nombre de propiedad 1` | ✅ Usado | Para detectar Color |
| 4 | `Valor de propiedad 1` | ✅ Mapeado | `products.colors[]` o `product_variants.color` |
| 5 | `Nombre de propiedad 2` | ✅ Usado | Para detectar Talle |
| 6 | `Valor de propiedad 2` | ✅ Mapeado | `products.sizes[]` o `product_variants.size` |
| 7 | `Nombre de propiedad 3` | ⚠️ No usado | - |
| 8 | `Valor de propiedad 3` | ⚠️ No usado | - |
| 9 | `Precio` | ✅ Mapeado | `products.price` |
| 10 | `Precio promocional` | ✅ Mapeado | `products.wholesale_price` |
| 11 | `Peso (kg)` | ❌ **FALTANTE** | - |
| 12 | `Alto (cm)` | ❌ **FALTANTE** | - |
| 13 | `Ancho (cm)` | ❌ **FALTANTE** | - |
| 14 | `Profundidad (cm)` | ❌ **FALTANTE** | - |
| 15 | `Stock` | ✅ Mapeado | `products.stock` o `product_variants.stock` |
| 16 | `SKU` | ✅ Mapeado | `products.sku` o `product_variants.sku` |
| 17 | `Código de barras` | ❌ **FALTANTE** | - |
| 18 | `Mostrar en tienda` | ✅ Mapeado | `products.active` |
| 19 | `Envío sin cargo` | ❌ **FALTANTE** | - |
| 20 | `Descripción` | ✅ Mapeado | `products.description` |
| 21 | `Tags` | ❌ **FALTANTE** | - |
| 22 | `Título para SEO` | ❌ **FALTANTE** | - |
| 23 | `Descripción para SEO` | ❌ **FALTANTE** | - |
| 24 | `Marca` | ❌ **FALTANTE** | - |
| 25 | `Producto Físico` | ⚠️ Asumido | Todos son físicos |
| 26 | `MPN (Número de pieza del fabricante)` | ❌ **FALTANTE** | - |
| 27 | `Sexo` | ❌ **FALTANTE** | - |
| 28 | `Rango de edad` | ❌ **FALTANTE** | - |
| 29 | `Costo` | ✅ Mapeado | `products.cost_price` |

---

## 📊 Resumen de Campos

| Estado | Cantidad | Porcentaje |
|--------|----------|------------|
| ✅ **Mapeados/Usados** | 13 | 43% |
| ⚠️ **No usados pero disponibles** | 2 | 7% |
| ❌ **FALTANTES** | 15 | 50% |

---

## 🚨 Campos Faltantes Críticos

### 1. **Dimensiones y Peso** (Para envíos)
- `Peso (kg)` - Importante para calcular costos de envío
- `Alto (cm)` - Dimensiones del producto
- `Ancho (cm)` - Dimensiones del producto
- `Profundidad (cm)` - Dimensiones del producto

**Impacto:** Sin esto no se puede calcular envíos correctamente.

---

### 2. **Información de Producto**
- `Código de barras` - Para inventario y checkout
- `MPN (Número de pieza del fabricante)` - Referencia del fabricante
- `Marca` - Información importante del producto
- `Tags` - Para búsqueda y filtros avanzados

**Impacto:** Información valiosa para búsqueda y gestión.

---

### 3. **SEO y Marketing**
- `Título para SEO` - Para SEO y meta tags
- `Descripción para SEO` - Para SEO y meta tags

**Impacto:** Afecta posicionamiento en buscadores.

---

### 4. **Clasificación**
- `Sexo` - Para filtros (niños/niñas/unisex)
- `Rango de edad` - Para categorización por edad

**Impacto:** Mejora navegación y filtros.

---

### 5. **Logística**
- `Envío sin cargo` - Si el producto tiene envío gratis

**Impacto:** Información importante para checkout.

---

### 6. **Propiedades Adicionales**
- `Nombre de propiedad 3` - Podría ser material, estilo, etc.
- `Valor de propiedad 3` - Valor de la propiedad adicional

**Impacto:** Información adicional del producto.

---

## 🔧 Recomendaciones: Campos a Agregar a la Base de Datos

### Opción 1: Agregar Campos a `products` (Recomendado)

```sql
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS weight_kg numeric(10, 3),
ADD COLUMN IF NOT EXISTS height_cm numeric(10, 2),
ADD COLUMN IF NOT EXISTS width_cm numeric(10, 2),
ADD COLUMN IF NOT EXISTS depth_cm numeric(10, 2),
ADD COLUMN IF NOT EXISTS barcode text,
ADD COLUMN IF NOT EXISTS mpn text,
ADD COLUMN IF NOT EXISTS brand text,
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS seo_title text,
ADD COLUMN IF NOT EXISTS seo_description text,
ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('niños', 'niñas', 'unisex', null)),
ADD COLUMN IF NOT EXISTS age_range text,
ADD COLUMN IF NOT EXISTS free_shipping boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS property_3_name text,
ADD COLUMN IF NOT EXISTS property_3_value text;
```

### Opción 2: Usar JSONB para Campos Adicionales (Flexible)

```sql
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
```

**Ventajas:**
- Más flexible
- No requiere cambios futuros
- Puede almacenar cualquier campo adicional

**Desventajas:**
- Menos estructura
- Más difícil de consultar

---

## 📝 Plan de Acción Sugerido

### Fase 1: Campos Críticos (Prioridad Alta)
1. ✅ Agregar `weight_kg`, `height_cm`, `width_cm`, `depth_cm` (para envíos)
2. ✅ Agregar `barcode` (para inventario)
3. ✅ Agregar `free_shipping` (para checkout)

### Fase 2: Campos Importantes (Prioridad Media)
4. ✅ Agregar `brand` (marca)
5. ✅ Agregar `tags` (para búsqueda)
6. ✅ Agregar `gender` y `age_range` (para filtros)

### Fase 3: Campos Adicionales (Prioridad Baja)
7. ✅ Agregar `seo_title` y `seo_description` (para SEO)
8. ✅ Agregar `mpn` (referencia fabricante)
9. ✅ Agregar `property_3_name` y `property_3_value` (propiedades adicionales)

---

## 🔄 Mapeo Completo Propuesto

| Campo CSV | Campo Base de Datos | Tipo | Notas |
|-----------|---------------------|------|-------|
| `Nombre` | `products.name` | text | ✅ Actual |
| `Descripción` | `products.description` | text | ✅ Actual |
| `Categorías` | `products.category_id` | uuid | ✅ Actual |
| `Precio` | `products.price` | numeric | ✅ Actual |
| `Precio promocional` | `products.wholesale_price` | numeric | ✅ Actual |
| `Costo` | `products.cost_price` | numeric | ✅ Actual |
| `Stock` | `product_variants.stock` | integer | ✅ Actual (con variantes) |
| `SKU` | `product_variants.sku` | text | ✅ Actual (con variantes) |
| `Mostrar en tienda` | `products.active` | boolean | ✅ Actual |
| `Valor de propiedad 1` (Color) | `product_variants.color` | text | ✅ Actual |
| `Valor de propiedad 2` (Talle) | `product_variants.size` | text | ✅ Actual |
| `Peso (kg)` | `products.weight_kg` | numeric | ❌ **AGREGAR** |
| `Alto (cm)` | `products.height_cm` | numeric | ❌ **AGREGAR** |
| `Ancho (cm)` | `products.width_cm` | numeric | ❌ **AGREGAR** |
| `Profundidad (cm)` | `products.depth_cm` | numeric | ❌ **AGREGAR** |
| `Código de barras` | `products.barcode` | text | ❌ **AGREGAR** |
| `Envío sin cargo` | `products.free_shipping` | boolean | ❌ **AGREGAR** |
| `Tags` | `products.tags` | text[] | ❌ **AGREGAR** |
| `Título para SEO` | `products.seo_title` | text | ❌ **AGREGAR** |
| `Descripción para SEO` | `products.seo_description` | text | ❌ **AGREGAR** |
| `Marca` | `products.brand` | text | ❌ **AGREGAR** |
| `MPN` | `products.mpn` | text | ❌ **AGREGAR** |
| `Sexo` | `products.gender` | text | ❌ **AGREGAR** |
| `Rango de edad` | `products.age_range` | text | ❌ **AGREGAR** |
| `Nombre de propiedad 3` | `products.property_3_name` | text | ❌ **AGREGAR** |
| `Valor de propiedad 3` | `products.property_3_value` | text | ❌ **AGREGAR** |

---

## ✅ Checklist de Implementación

### Base de Datos
- [ ] Crear migración SQL con todos los campos faltantes
- [ ] Agregar índices para campos que se buscarán (brand, tags, gender)
- [ ] Actualizar tipos TypeScript en `lib/types/database.ts`
- [ ] Actualizar documentación

### Script de Importación
- [ ] Actualizar script para mapear todos los campos nuevos
- [ ] Manejar campos opcionales (null si no existen)
- [ ] Validar datos antes de insertar

### Frontend
- [ ] Actualizar formularios de creación/edición de productos
- [ ] Mostrar campos nuevos en listado de productos
- [ ] Agregar filtros por brand, gender, age_range, tags

### Testing
- [ ] Probar importación con datos reales
- [ ] Verificar que todos los campos se importan correctamente
- [ ] Validar que no se pierde información

---

## 📊 Comparación Visual

### Campos Actuales (Supabase)
```
products
├── id
├── name ✅
├── description ✅
├── sku ✅
├── price ✅
├── wholesale_price ✅
├── cost_price ✅
├── stock ✅
├── sizes[] ✅
├── colors[] ✅
├── images[]
├── category_id ✅
├── active ✅
└── timestamps
```

### Campos Faltantes (Tienda Nube)
```
FALTANTES:
├── weight_kg ❌
├── height_cm ❌
├── width_cm ❌
├── depth_cm ❌
├── barcode ❌
├── free_shipping ❌
├── tags[] ❌
├── seo_title ❌
├── seo_description ❌
├── brand ❌
├── mpn ❌
├── gender ❌
├── age_range ❌
└── property_3 (name/value) ❌
```

---

**Última actualización:** Enero 2025

