# 📋 Revisión: Categorías, Tallas y Colores

## 🎯 Resumen de Revisión

Este documento contiene la revisión completa de:
1. **Categorías y Subcategorías** del CSV de Tienda Nube
2. **Tallas completas** según tus especificaciones
3. **Colores** extraídos del CSV

---

## 📂 1. CATEGORÍAS Y SUBCATEGORÍAS

### Estructura Actual en Base de Datos

La tabla `categories` tiene:
- `name` - Nombre de la categoría
- `parent_id` - ID de categoría padre (para subcategorías)
- `group_type` - Tipo: 'menu', 'age', 'back-to-school'
- `age_range` - Rango de edad: 'BEBÉS', 'NIÑOS', 'ADULTOS'
- `display_order` - Orden de visualización

### Categorías del CSV de Tienda Nube

**Nota:** El CSV tiene el campo "Categorías" con formato jerárquico como:
- `ADULTOS > ROPA`
- `BEBES > ROPA > Bodys`
- `NIÑOS > ROPA > Pantalones-bermudas`

### Estructura Propuesta

```
CATEGORÍAS PRINCIPALES (group_type: 'menu')
├── Ropa
│   ├── Remeras
│   ├── Pantalones/Bermudas
│   ├── Vestidos
│   ├── Conjuntos
│   ├── Bodys
│   ├── Buzos
│   └── Camisas/Camisacos
├── Calzado
│   └── (tallas 17-44)
├── Accesorios
├── Mochilas
└── Gorros Rocky

CATEGORÍAS POR EDAD (group_type: 'age')
├── BEBÉS
│   ├── Ropa Bebés
│   └── Accesorios Bebés
├── NIÑOS
│   ├── Ropa Niños
│   └── Accesorios Niños
└── ADULTOS
    └── Ropa Adultos
```

**Acción requerida:** Revisar el CSV completo para extraer todas las categorías únicas y crear la estructura jerárquica correcta.

---

## 👕 2. TALLAS COMPLETAS

### Tallas Configuradas

He creado el archivo `lib/config/product-sizes.ts` con todas las tallas:

#### ✅ BEBÉS (5 tallas)
- `1BB`
- `2BB`
- `3BB`
- `4BB`
- `5BB`

#### ✅ NIÑOS (7 tallas numéricas)
- `4`
- `6`
- `8`
- `10`
- `12`
- `14`
- `16`

#### ✅ ADULTOS (5 tallas)
- `S`
- `M`
- `L`
- `XL`
- `XXL`

#### ✅ ZAPATOS (28 tallas: números 17-44)
- `17`, `18`, `19`, `20`, `21`, `22`, `23`, `24`, `25`, `26`, `27`, `28`, `29`, `30`, `31`, `32`, `33`, `34`, `35`, `36`, `37`, `38`, `39`, `40`, `41`, `42`, `43`, `44`

**Total: 45 tallas diferentes**

### Tallas Encontradas en el CSV

Del análisis del CSV encontré estas variaciones:
- `1`, `1 BB`, `1b`, `1BB` (normalizar a `1BB`)
- `2`, `2 BB`, `2b`, `2BB` (normalizar a `2BB`)
- `3`, `3 BB`, `3b`, `3BB` (normalizar a `3BB`)
- `4`, `4 BB`, `4BB` (normalizar a `4BB` o `4` según contexto)
- `5`, `5 BB`, `5BB` (normalizar a `5BB` o `5` según contexto)
- `10`, `12`, `14`, `16`, `19`, `20`, `21`, `22`, `24`, `25`
- `S`, `M`, `L`, `XL`, `XXL`

**Nota:** Hay que normalizar las variaciones (espacios, mayúsculas/minúsculas) durante la importación.

---

## 🎨 3. COLORES

### Colores Configurados

He creado el archivo `lib/config/product-colors.ts` con **70+ colores** extraídos del CSV:

#### Colores Básicos (8)
- Blanco, Negro, Gris, Beige, Crema, Natural, Azul, Rojo, Amarillo, Verde, Rosa, Fucsia, Naranja, Coral

#### Colores Especiales (6)
- Tostado, Oliva, Mostaza, Manteca, Ladrillo, Borravino

#### Colores con Variaciones (10+)
- Azul Marino, Celeste, Aqua, Verde Militar, Verde Musgo, Rosa Chicle, Rosa Viejo, etc.

#### Colores con Rayas (15+)
- Azul Raya Blanca, Blanca Raya Negra, Negra Raya Fucsia, etc.

#### Estampados y Diseños (10+)
- Batik, Estrella Aqua y Gris, Gaspeado Raya Fucsia, etc.

#### Variaciones Especiales (5+)
- Crema Smile, Fucsia Smile, Negro Smile, etc.

### Colores Encontrados en el CSV

**Total: 70+ colores únicos** (incluyendo variaciones con rayas y estampados)

**Nota:** Algunos colores tienen variaciones de mayúsculas/minúsculas que deben normalizarse:
- `Blanco`, `BLANCO`, `blanco` → `Blanco`
- `Negro`, `negro` → `Negro`
- `Gris`, `gris`, `GRIS` → `Gris`

---

## 🔧 Archivos Creados

1. **`lib/config/product-sizes.ts`**
   - Todas las tallas organizadas por tipo
   - Funciones helper para validación y filtrado

2. **`lib/config/product-colors.ts`**
   - Todos los colores del CSV
   - Mapeo a códigos hex para visualización
   - Funciones de normalización

---

## ✅ Próximos Pasos

### 1. Actualizar Formularios de Productos
- [ ] Reemplazar arrays hardcodeados en `app/admin/productos/nuevo/page.tsx`
- [ ] Reemplazar arrays hardcodeados en `app/admin/productos/[id]/page.tsx`
- [ ] Usar `PRODUCT_SIZES.ALL` y `PRODUCT_COLORS` de los archivos de configuración

### 2. Crear Script de Normalización
- [ ] Script para normalizar tallas del CSV (1BB, 1 BB, 1b → 1BB)
- [ ] Script para normalizar colores (mayúsculas/minúsculas)

### 3. Revisar Categorías del CSV
- [ ] Extraer todas las categorías únicas del CSV
- [ ] Crear estructura jerárquica en la base de datos
- [ ] Mapear categorías del CSV a categorías de la BD

### 4. Actualizar Componentes de Filtros
- [ ] Actualizar `components/productos/ProductFilters.tsx` para usar colores completos
- [ ] Agregar filtros por tipo de talla (Bebés, Niños, Adultos, Zapatos)

---

## 📊 Estadísticas

| Tipo | Cantidad | Estado |
|------|----------|--------|
| **Tallas Bebés** | 5 | ✅ Configurado |
| **Tallas Niños** | 7 | ✅ Configurado |
| **Tallas Adultos** | 5 | ✅ Configurado |
| **Tallas Zapatos** | 28 | ✅ Configurado |
| **Total Tallas** | 45 | ✅ Configurado |
| **Colores Básicos** | 8 | ✅ Configurado |
| **Colores Totales** | 70+ | ✅ Configurado |
| **Categorías** | Pendiente | ⏳ Requiere revisión CSV |

---

**Última actualización:** Enero 2025

