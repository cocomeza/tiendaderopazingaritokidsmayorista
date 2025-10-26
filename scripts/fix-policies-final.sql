-- SCRIPT DEFINITIVO PARA ARREGLAR SUPABASE
-- ==========================================

-- ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "products_select_policy" ON products;
DROP POLICY IF EXISTS "categories_select_policy" ON categories;
DROP POLICY IF EXISTS "business_config_select_policy" ON business_config;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "orders_select_policy" ON orders;
DROP POLICY IF EXISTS "orders_insert_policy" ON orders;
DROP POLICY IF EXISTS "order_items_select_policy" ON order_items;
DROP POLICY IF EXISTS "order_items_insert_policy" ON order_items;
DROP POLICY IF EXISTS "favorites_select_policy" ON favorites;
DROP POLICY IF EXISTS "favorites_insert_policy" ON favorites;
DROP POLICY IF EXISTS "favorites_delete_policy" ON favorites;

-- ELIMINAR TODAS LAS POLÍTICAS VIEJAS
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

-- DESHABILITAR RLS TEMPORALMENTE
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;

-- HABILITAR RLS Y CREAR POLÍTICAS SIMPLES
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- CREAR POLÍTICAS SIMPLES QUE FUNCIONEN
CREATE POLICY "allow_select_products" ON products FOR SELECT USING (true);
CREATE POLICY "allow_select_categories" ON categories FOR SELECT USING (true);
CREATE POLICY "allow_select_business_config" ON business_config FOR SELECT USING (true);
CREATE POLICY "allow_select_profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "allow_select_orders" ON orders FOR SELECT USING (true);
CREATE POLICY "allow_select_order_items" ON order_items FOR SELECT USING (true);
CREATE POLICY "allow_select_favorites" ON favorites FOR SELECT USING (true);

-- POLÍTICAS DE INSERCIÓN
CREATE POLICY "allow_insert_orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_insert_order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_insert_favorites" ON favorites FOR INSERT WITH CHECK (true);

-- POLÍTICAS DE ELIMINACIÓN
CREATE POLICY "allow_delete_favorites" ON favorites FOR DELETE USING (true);
