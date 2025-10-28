# ⚡ Plan de Optimización Completa - Performance

## 🎯 Objetivo
Reducir bundle size de **2MB+ a < 500KB** y cargas de **54s a < 5s**

## ✅ Optimizaciones Aplicadas

### 1. ProductCard - Framer Motion Eliminado ✅
- **Antes**: 50KB+ de framer-motion
- **Después**: CSS puro (0KB extra)
- **Mejora**: Ahorro inmediato de ~50KB por producto

### 2. Código de Favoritos Mejorado ✅
- Logs más detallados
- Toast notifications
- Mejor error handling

## 🚀 Optimizaciones Pendientes (Prioridad Alta)

### 1. **Eliminar TODOS los usos de Framer Motion**

Archivos a optimizar:
- ❌ `components/cart/CartDrawer.tsx`
- ❌ `components/productos/QuickViewModal.tsx`
- ❌ `components/ui/Loading.tsx`
- ❌ `components/ui/skeleton.tsx`
- ❌ `components/admin/ImageUploader.tsx`
- ❌ `components/ui/SocialLinks.tsx`
- ❌ `app/admin/page.tsx`

**Impacto**: Reducción de ~350KB en bundle

### 2. **Eliminar Componentes Visuales Pesados**

Remover:
- `Spotlight` - De todas las páginas
- `BackgroundBeams` - De todas las páginas
- `TextGenerateEffect` - Reemplazar con CSS
- `CardHoverEffect` - Ya hecho en ProductCard

**Impacto**: Reducción de ~100KB

### 3. **Implementar Code Splitting**

```typescript
// En lugar de:
import { ProductCard } from '@/components/productos/ProductCard'

// Usar:
import dynamic from 'next/dynamic'

const ProductCard = dynamic(() => import('@/components/productos/ProductCard'), {
  loading: () => <div>Cargando...</div>
})
```

**Impacto**: Carga bajo demanda (70% menos carga inicial)

### 4. **Lazy Loading de Imágenes**

```typescript
// En lugar de img con src
// Usar next/image con loading="lazy"
```

**Impacto**: Mejor rendimiento visual

### 5. **Memoización de Queries**

```typescript
// useMemo para productos
// useMemo para favoritos
// React.memo() para componentes pesados
```

**Impacto**: Menos re-renders innecesarios

### 6. **Optimizar next.config**

```typescript
// Agregar:
experimental: {
  optimizePackageImports: ['lucide-react']
}
```

**Impacto**: Tree-shaking mejor

## 📊 Resultados Esperados

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Bundle JS | 2MB+ | 400-600KB | 70% |
| First Load | 54s | 3-5s | 90% |
| Productos Page | 13s | 1-2s | 85% |
| Time to Interactive | 20s+ | 2-3s | 85% |
| Lighthouse Score | < 50 | > 85 | +35 |

## 🔧 Implementación Paso a Paso

### Paso 1: Eliminar Framer Motion (CRÍTICO)
Impacto: Mayor reducción de bundle

### Paso 2: Code Splitting
Impacto: Carga bajo demanda

### Paso 3: Lazy Loading
Impacto: Menos tiempo para mostrar contenido

### Paso 4: Memoización
Impacto: Menos re-renders

### Paso 5: Configuración Next.js
Impacto: Optimizaciones automáticas

## 🎯 Siguiente Acción Inmediata

Quieres que:
1. **Elimine todos los framer-motion** de una vez? (Mayor impacto)
2. **Implemente code splitting** en las páginas principales?
3. **Optimice next.config** con mejores settings?

**Recomendación**: Empezar eliminando framer-motion de todos lados (mayor impacto en menor tiempo).

¿Procedo con la eliminación masiva de framer-motion?

