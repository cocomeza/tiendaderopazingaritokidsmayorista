-- Crear índices para mejorar performance

-- Índices para profiles
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_is_admin_idx ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS profiles_is_wholesale_client_idx ON profiles(is_wholesale_client);

-- Índices para products
CREATE INDEX IF NOT EXISTS products_active_idx ON products(active);
CREATE INDEX IF NOT EXISTS products_stock_idx ON products(stock);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON products(category_id);

-- Índices para orders
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);

-- Índices para order_items
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON order_items(product_id);

-- Índices para favorites
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_product_id_idx ON favorites(product_id);

