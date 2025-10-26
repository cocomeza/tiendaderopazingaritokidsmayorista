-- =====================================================
-- ZINGARITO KIDS - SCRIPT DE LIMPIEZA COMPLETA
-- =====================================================
-- Este script elimina TODAS las tablas, políticas, funciones, triggers y vistas
-- creadas anteriormente para Zingarito Kids
-- 
-- ADVERTENCIA: Este script eliminará TODOS los datos
-- Solo ejecutar si quieres empezar desde cero
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
-- ELIMINAR TODAS LAS TABLAS (EN ORDEN CORRECTO POR FOREIGN KEYS)
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

-- Eliminar tabla profiles (extensión de auth.users)
-- NOTA: No eliminamos profiles completamente porque puede estar siendo usada por auth.users
-- Solo eliminamos los datos, pero mantenemos la estructura
-- Si quieres eliminar completamente, descomenta la siguiente línea:
-- drop table if exists profiles;

-- =====================================================
-- LIMPIAR DATOS DE PROFILES (OPCIONAL)
-- =====================================================
-- Si quieres mantener la tabla profiles pero limpiar los datos:
-- delete from profiles;

-- =====================================================
-- MENSAJE DE CONFIRMACION
-- =====================================================
-- El script se ha ejecutado correctamente
-- Todas las tablas, políticas, funciones y triggers han sido eliminados
-- Ahora puedes ejecutar el script completo de creación desde cero

-- =====================================================
-- INSTRUCCIONES POST-LIMPIEZA
-- =====================================================
-- Después de ejecutar este script de limpieza:
-- 1. Ejecuta el script completo: supabase-complete-schema.sql
-- 2. Crea los buckets de Storage manualmente
-- 3. Configura las políticas de Storage
-- 4. Crea el usuario admin inicial

-- =====================================================
-- FIN DEL SCRIPT DE LIMPIEZA
-- =====================================================
