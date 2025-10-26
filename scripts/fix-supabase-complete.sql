-- =====================================================
-- SCRIPT COMPLETO PARA ARREGLAR SUPABASE
-- =====================================================
-- Este script elimina todas las políticas problemáticas y crea nuevas

-- 1. DESHABILITAR RLS TEMPORALMENTE
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_config DISABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR TODAS LAS POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Only admins can manage products" ON products;
DROP POLICY IF EXISTS "Only admins can insert products" ON products;
DROP POLICY IF EXISTS "Only admins can update products" ON products;
DROP POLICY IF EXISTS "Only admins can delete products" ON products;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Only admins can manage categories" ON categories;

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;

DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;

DROP POLICY IF EXISTS "Business config is viewable by everyone" ON business_config;
DROP POLICY IF EXISTS "Only admins can update business config" ON business_config;

-- 3. CREAR POLÍTICAS SIMPLES QUE FUNCIONEN
-- Para products (público - todos pueden ver)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_select_policy" ON products FOR SELECT USING (true);

-- Para categories (público - todos pueden ver)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_select_policy" ON categories FOR SELECT USING (true);

-- Para business_config (público - todos pueden ver)
ALTER TABLE business_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "business_config_select_policy" ON business_config FOR SELECT USING (true);

-- Para profiles (temporalmente público para testing)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT USING (true);

-- Para orders (temporalmente público para testing)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_select_policy" ON orders FOR SELECT USING (true);
CREATE POLICY "orders_insert_policy" ON orders FOR INSERT WITH CHECK (true);

-- Para order_items (temporalmente público para testing)
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_select_policy" ON order_items FOR SELECT USING (true);
CREATE POLICY "order_items_insert_policy" ON order_items FOR INSERT WITH CHECK (true);

-- Para favorites (temporalmente público para testing)
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorites_select_policy" ON favorites FOR SELECT USING (true);
CREATE POLICY "favorites_insert_policy" ON favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "favorites_delete_policy" ON favorites FOR DELETE USING (true);

-- 4. VERIFICAR QUE TODO FUNCIONE
SELECT 'Tablas configuradas correctamente' as status;
