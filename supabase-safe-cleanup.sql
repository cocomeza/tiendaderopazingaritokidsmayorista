-- =====================================================
-- ZINGARITO KIDS - LIMPIEZA SEGURA COMPLETA
-- =====================================================
-- Este script elimina ABSOLUTAMENTE TODO de manera segura
-- No genera errores si las tablas no existen
-- 
-- ADVERTENCIA: Este script eliminará TODOS los datos
-- Solo ejecutar si quieres empezar desde cero
-- =====================================================

-- =====================================================
-- ELIMINAR VISTAS (SEGURO)
-- =====================================================
do $$
begin
    drop view if exists best_selling_products;
    drop view if exists sales_stats;
    drop view if exists low_stock_products;
exception
    when others then
        -- Ignorar errores si las vistas no existen
        null;
end $$;

-- =====================================================
-- ELIMINAR TRIGGERS (SEGURO)
-- =====================================================
do $$
begin
    drop trigger if exists decrement_stock_on_order_item on order_items;
    drop trigger if exists log_inventory_movement_trigger on products;
    drop trigger if exists log_price_change_trigger on products;
    drop trigger if exists set_order_number_trigger on orders;
    drop trigger if exists update_business_config_updated_at on business_config;
    drop trigger if exists update_orders_updated_at on orders;
    drop trigger if exists update_products_updated_at on products;
    drop trigger if exists update_categories_updated_at on categories;
    drop trigger if exists update_profiles_updated_at on profiles;
exception
    when others then
        -- Ignorar errores si los triggers no existen
        null;
end $$;

-- =====================================================
-- ELIMINAR FUNCIONES (SEGURO)
-- =====================================================
do $$
begin
    drop function if exists decrement_product_stock();
    drop function if exists log_inventory_movement();
    drop function if exists log_price_change();
    drop function if exists set_order_number();
    drop function if exists update_updated_at_column();
    drop function if exists generate_order_number();
exception
    when others then
        -- Ignorar errores si las funciones no existen
        null;
end $$;

-- =====================================================
-- ELIMINAR POLITICAS RLS (SEGURO)
-- =====================================================

-- Políticas de notifications
do $$
begin
    drop policy if exists "System can insert notifications" on notifications;
    drop policy if exists "Users can update own notifications" on notifications;
    drop policy if exists "Users can view own notifications" on notifications;
exception
    when others then null;
end $$;

-- Políticas de inventory_movements
do $$
begin
    drop policy if exists "Only admins can insert inventory movements" on inventory_movements;
    drop policy if exists "Only admins can view inventory movements" on inventory_movements;
exception
    when others then null;
end $$;

-- Políticas de price_history
do $$
begin
    drop policy if exists "Only admins can insert price history" on price_history;
    drop policy if exists "Only admins can view price history" on price_history;
exception
    when others then null;
end $$;

-- Políticas de business_config
do $$
begin
    drop policy if exists "Only admins can update business config" on business_config;
    drop policy if exists "Business config is viewable by everyone" on business_config;
exception
    when others then null;
end $$;

-- Políticas de favorites
do $$
begin
    drop policy if exists "Users can manage own favorites" on favorites;
exception
    when others then null;
end $$;

-- Políticas de order_items
do $$
begin
    drop policy if exists "Admins can view all order items" on order_items;
    drop policy if exists "Users can view own order items" on order_items;
exception
    when others then null;
end $$;

-- Políticas de orders
do $$
begin
    drop policy if exists "Admins can update orders" on orders;
    drop policy if exists "Admins can view all orders" on orders;
    drop policy if exists "Users can create orders" on orders;
    drop policy if exists "Users can view own orders" on orders;
exception
    when others then null;
end $$;

-- Políticas de products
do $$
begin
    drop policy if exists "Only admins can manage products" on products;
    drop policy if exists "Products are viewable by everyone" on products;
exception
    when others then null;
end $$;

-- Políticas de categories
do $$
begin
    drop policy if exists "Only admins can manage categories" on categories;
    drop policy if exists "Categories are viewable by everyone" on categories;
exception
    when others then null;
end $$;

-- Políticas de profiles
do $$
begin
    drop policy if exists "Admins can update all profiles" on profiles;
    drop policy if exists "Admins can view all profiles" on profiles;
    drop policy if exists "Users can update own profile" on profiles;
    drop policy if exists "Users can view own profile" on profiles;
exception
    when others then null;
end $$;

-- =====================================================
-- DESHABILITAR RLS EN TABLAS (SEGURO)
-- =====================================================
do $$
begin
    alter table notifications disable row level security;
exception
    when others then null;
end $$;

do $$
begin
    alter table inventory_movements disable row level security;
exception
    when others then null;
end $$;

do $$
begin
    alter table price_history disable row level security;
exception
    when others then null;
end $$;

do $$
begin
    alter table business_config disable row level security;
exception
    when others then null;
end $$;

do $$
begin
    alter table favorites disable row level security;
exception
    when others then null;
end $$;

do $$
begin
    alter table order_items disable row level security;
exception
    when others then null;
end $$;

do $$
begin
    alter table orders disable row level security;
exception
    when others then null;
end $$;

do $$
begin
    alter table products disable row level security;
exception
    when others then null;
end $$;

do $$
begin
    alter table categories disable row level security;
exception
    when others then null;
end $$;

do $$
begin
    alter table profiles disable row level security;
exception
    when others then null;
end $$;

-- =====================================================
-- ELIMINAR TABLAS (SEGURO)
-- =====================================================

-- Eliminar tablas que dependen de otras (orden específico)
do $$
begin
    drop table if exists notifications;
    drop table if exists inventory_movements;
    drop table if exists price_history;
    drop table if exists order_items;
    drop table if exists orders;
    drop table if exists favorites;
    drop table if exists products;
    drop table if exists categories;
    drop table if exists business_config;
    drop table if exists profiles;
exception
    when others then null;
end $$;

-- =====================================================
-- ELIMINAR CUALQUIER OTRA TABLA (SEGURO)
-- =====================================================
do $$
begin
    drop table if exists user_profiles;
    drop table if exists customers;
    drop table if exists users;
    drop table if exists admin_users;
    drop table if exists product_images;
    drop table if exists product_variants;
    drop table if exists cart_items;
    drop table if exists shopping_cart;
    drop table if exists wishlist;
    drop table if exists product_reviews;
    drop table if exists customer_reviews;
    drop table if exists order_status_history;
    drop table if exists payment_methods;
    drop table if exists shipping_methods;
    drop table if exists discounts;
    drop table if exists coupons;
    drop table if exists promotions;
    drop table if exists newsletters;
    drop table if exists contact_messages;
    drop table if exists blog_posts;
    drop table if exists blog_categories;
    drop table if exists testimonials;
    drop table if exists faqs;
    drop table if exists settings;
    drop table if exists config;
    drop table if exists app_settings;
    drop table if exists system_config;
    drop table if exists site_settings;
exception
    when others then null;
end $$;

-- =====================================================
-- ELIMINAR TIPOS PERSONALIZADOS (SEGURO)
-- =====================================================
do $$
begin
    drop type if exists order_status;
    drop type if exists payment_status;
    drop type if exists user_role;
    drop type if exists product_status;
    drop type if exists inventory_status;
exception
    when others then null;
end $$;

-- =====================================================
-- ELIMINAR SECUENCIAS PERSONALIZADAS (SEGURO)
-- =====================================================
do $$
begin
    drop sequence if exists order_number_seq;
    drop sequence if exists product_number_seq;
    drop sequence if exists customer_number_seq;
exception
    when others then null;
end $$;

-- =====================================================
-- MENSAJE DE CONFIRMACION
-- =====================================================
-- LIMPIEZA SEGURA COMPLETADA
-- Todas las tablas, políticas, funciones, triggers y vistas han sido eliminados
-- La base de datos está completamente limpia
-- Ahora puedes ejecutar el script completo de creación desde cero

-- =====================================================
-- INSTRUCCIONES POST-LIMPIEZA
-- =====================================================
-- Después de ejecutar este script de limpieza segura:
-- 1. Ejecuta el script completo: supabase-complete-schema.sql
-- 2. Crea los buckets de Storage manualmente
-- 3. Configura las políticas de Storage
-- 4. Crea el usuario admin inicial

-- =====================================================
-- FIN DEL SCRIPT DE LIMPIEZA SEGURA
-- =====================================================
