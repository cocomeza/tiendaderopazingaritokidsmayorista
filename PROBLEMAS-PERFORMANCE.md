# Problemas de Performance Detectados

## 🔴 Problema Crítico: N+1 Query en Mis Pedidos

En `app/mis-pedidos/page.tsx` (líneas 88-100):

```typescript
// ❌ MAL: Hace una query separada para CADA pedido
const ordersWithItems = await Promise.all(
  (data || []).map(async (order) => {
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id)  // ❌ Query individual por cada pedido
    return { ...order, items: items || [] }
  })
)
```

**Problema**: Si tienes 10 pedidos, hace 10 queries adicionales.

**Solución**: Usar una sola query con JOIN.

## 🟡 Otros Problemas Detectados

### 1. Sin Caché en Consultas
- Cada vez que cargas productos, se consulta la DB
- No hay caché de sesión
- Múltiples llamadas a `useAuth()` en diferentes componentes

### 2. Queries No Optimizadas
- Selects con `*` en lugar de campos específicos
- Sin límites en algunos queries
- No se usa `single()` cuando debería usarse

### 3. Posible Falta de Índices en la DB
- Tablas sin índices en campos usados frecuentemente
- Queries sin optimizar

## ✅ Soluciones Propuestas

### 1. Optimizar Mis Pedidos
Usar una sola query con JOIN en lugar de N queries.

### 2. Agregar Índices a la Base de Datos
Crear índices en campos usados frecuentemente.

### 3. Implementar Caché
Usar React Query o similar para cachear queries.

### 4. Optimizar Queries
- Usar campos específicos en lugar de `*`
- Agregar límites donde sea necesario
- Usar `single()` cuando corresponda

