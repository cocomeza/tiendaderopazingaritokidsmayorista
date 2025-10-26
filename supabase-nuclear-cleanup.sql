-- =====================================================
-- ZINGARITO KIDS - LIMPIEZA NUCLEAR COMPLETA
-- =====================================================
-- Este script elimina ABSOLUTAMENTE TODO
-- Incluyendo la tabla profiles y cualquier otra cosa
-- 
-- ADVERTENCIA EXTREMA: Este script eliminará TODOS los datos
-- No hay vuelta atrás después de ejecutar esto
-- =====================================================

-- =====================================================
-- ELIMINAR VISTAS
-- =====================================================
drop view if exists best_selling_products;
drop view if exists sales_stats;
drop view if exists low_stock_products;

-- =====================================================
-- ELIMINAR TRIGGERS
-- =====================================================
drop trigger if exists decrement_stock_on_order_item on order_items;
drop trigger if exists log_inventory_movement_trigger on products;
drop trigger if exists log_price_change_trigger on products;
drop trigger if exists set_order_number_trigger on orders;
drop trigger if exists update_business_config_updated_at on business_config;
drop trigger if exists update_orders_updated_at on orders;
drop trigger if exists update_products_updated_at on products;
drop trigger if exists update_categories_updated_at on categories;
drop trigger if exists update_profiles_updated_at on profiles;

-- =====================================================
-- ELIMINAR FUNCIONES
-- =====================================================
drop function if exists decrement_product_stock();
drop function if exists log_inventory_movement();
drop function if exists log_price_change();
drop function if exists set_order_number();
drop function if exists update_updated_at_column();
drop function if exists generate_order_number();

-- =====================================================
-- ELIMINAR TODAS LAS POLITICAS RLS
-- =====================================================

-- Políticas de notifications
drop policy if exists "System can insert notifications" on notifications;
drop policy if exists "Users can update own notifications" on notifications;
drop policy if exists "Users can view own notifications" on notifications;

-- Políticas de inventory_movements
drop policy if exists "Only admins can insert inventory movements" on inventory_movements;
drop policy if exists "Only admins can view inventory movements" on inventory_movements;

-- Políticas de price_history
drop policy if exists "Only admins can insert price history" on price_history;
drop policy if exists "Only admins can view price history" on price_history;

-- Políticas de business_config
drop policy if exists "Only admins can update business config" on business_config;
drop policy if exists "Business config is viewable by everyone" on business_config;

-- Políticas de favorites
drop policy if exists "Users can manage own favorites" on favorites;

-- Políticas de order_items
drop policy if exists "Admins can view all order items" on order_items;
drop policy if exists "Users can view own order items" on order_items;

-- Políticas de orders
drop policy if exists "Admins can update orders" on orders;
drop policy if exists "Admins can view all orders" on orders;
drop policy if exists "Users can create orders" on orders;
drop policy if exists "Users can view own orders" on orders;

-- Políticas de products
drop policy if exists "Only admins can manage products" on products;
drop policy if exists "Products are viewable by everyone" on products;

-- Políticas de categories
drop policy if exists "Only admins can manage categories" on categories;
drop policy if exists "Categories are viewable by everyone" on categories;

-- Políticas de profiles
drop policy if exists "Admins can update all profiles" on profiles;
drop policy if exists "Admins can view all profiles" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can view own profile" on profiles;

-- =====================================================
-- DESHABILITAR RLS EN TODAS LAS TABLAS
-- =====================================================
alter table notifications disable row level security;
alter table inventory_movements disable row level security;
alter table price_history disable row level security;
alter table business_config disable row level security;
alter table favorites disable row level security;
alter table order_items disable row level security;
alter table orders disable row level security;
alter table products disable row level security;
alter table categories disable row level security;
alter table profiles disable row level security;

-- =====================================================
-- ELIMINAR TODAS LAS TABLAS (ARRASE TOTAL)
-- =====================================================

-- Eliminar tablas que dependen de otras (orden específico)
drop table if exists notifications;
drop table if exists inventory_movements;
drop table if exists price_history;
drop table if exists order_items;
drop table if exists orders;
drop table if exists favorites;
drop table if exists products;
drop table if exists categories;
drop table if exists business_config;

-- ELIMINAR TABLA PROFILES COMPLETAMENTE (NUCLEAR)
drop table if exists profiles;

-- =====================================================
-- ELIMINAR CUALQUIER OTRA TABLA QUE HAYAS CREADO
-- =====================================================

-- Eliminar tablas que puedan haber quedado
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

-- =====================================================
-- ELIMINAR CUALQUIER TIPO PERSONALIZADO
-- =====================================================
drop type if exists order_status;
drop type if exists payment_status;
drop type if exists user_role;
drop type if exists product_status;
drop type if exists inventory_status;

-- =====================================================
-- ELIMINAR CUALQUIER SECUENCIA PERSONALIZADA
-- =====================================================
drop sequence if exists order_number_seq;
drop sequence if exists product_number_seq;
drop sequence if exists customer_number_seq;

-- =====================================================
-- ELIMINAR CUALQUIER FUNCION QUE HAYAS CREADO
-- =====================================================
drop function if exists get_user_role(uuid);
drop function if exists calculate_total(integer, numeric);
drop function if exists format_currency(numeric);
drop function if exists get_product_stock(uuid);
drop function if exists update_product_stock(uuid, integer);
drop function if exists create_order_number();
drop function if exists generate_sku();
drop function if exists validate_email(text);
drop function if exists hash_password(text);
drop function if exists verify_password(text, text);

-- =====================================================
-- ELIMINAR CUALQUIER TRIGGER QUE HAYAS CREADO
-- =====================================================
drop trigger if exists update_created_at on profiles;
drop trigger if exists update_modified_at on profiles;
drop trigger if exists validate_email_trigger on profiles;
drop trigger if exists set_default_values on products;
drop trigger if exists update_product_modified_at on products;
drop trigger if exists validate_price_trigger on products;
drop trigger if exists update_order_modified_at on orders;
drop trigger if exists validate_order_total on orders;

-- =====================================================
-- LIMPIAR CUALQUIER DATO RESIDUAL
-- =====================================================

-- Limpiar cualquier tabla del sistema que pueda tener datos
-- (Esto es opcional y puede ser peligroso)
-- delete from auth.users; -- NO EJECUTAR a menos que sepas lo que haces

-- =====================================================
-- MENSAJE DE CONFIRMACION
-- =====================================================
-- LIMPIEZA NUCLEAR COMPLETADA
-- Todas las tablas, políticas, funciones, triggers y vistas han sido eliminados
-- La base de datos está completamente limpia
-- Ahora puedes ejecutar el script completo de creación desde cero

-- =====================================================
-- INSTRUCCIONES POST-LIMPIEZA NUCLEAR
-- =====================================================
-- Después de ejecutar este script de limpieza nuclear:
-- 1. Ejecuta el script completo: supabase-complete-schema.sql
-- 2. Crea los buckets de Storage manualmente
-- 3. Configura las políticas de Storage
-- 4. Crea el usuario admin inicial
-- 5. Configura la autenticación desde cero

-- =====================================================
-- FIN DEL SCRIPT DE LIMPIEZA NUCLEAR
-- =====================================================
