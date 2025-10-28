-- =====================================================
-- Optimización de Índices para Mejor Performance
-- =====================================================

-- Estos índices ayudarán a que las queries sean más rápidas

-- 1. Índice en profiles.id (ya existe como PK, pero nos aseguramos)
CREATE INDEX IF NOT EXISTS profiles_id_idx ON profiles(id);

-- 2. Índice en profiles.email para búsquedas
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

-- 3. Índice en profiles.is_admin para queries de admin
CREATE INDEX IF NOT EXISTS profiles_is_admin_idx ON profiles(is_admin);

-- 4. Índice en profiles.is_wholesale_client
CREATE INDEX IF NOT EXISTS profiles_is_wholesale_client_idx ON profiles(is_wholesale_client);

-- 5. Índice en products.active para filtrar productos activos
CREATE INDEX IF NOT EXISTS products_active_idx ON products(active);

-- 6. Índice en products.stock para queries de stock bajo
CREATE INDEX IF NOT EXISTS products_stock_idx ON products(stock);

-- 7. Índice en products.category_id para búsquedas por categoría
CREATE INDEX IF NOT EXISTS products_category_id_idx ON products(category_id);

-- 8. Índice en orders.user_id para filtrar pedidos por usuario
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);

-- 9. Índice en orders.created_at para ordenar pedidos
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);

-- 10. Índice en orders.status para filtrar por estado
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);

-- 11. Índice en order_items.order_id para JOINs
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);

-- 12. Índice en order_items.product_id
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON order_items(product_id);

-- 13. Índice en favorites.user_id
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON favorites(user_id);

-- 14. Índice en favorites.product_id
CREATE INDEX IF NOT EXISTS favorites_product_id_idx ON favorites(product_id);

-- Verificar índices creados
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'products', 'orders', 'order_items', 'favorites')
ORDER BY tablename, indexname;

