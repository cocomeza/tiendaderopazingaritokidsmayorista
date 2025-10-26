-- =====================================================
-- ZINGARITO KIDS - ESQUEMA COMPLETO DE BASE DE DATOS
-- =====================================================
-- Sistema de gestión para tienda mayorista de ropa infantil
-- Desarrollado para Zingarito Kids, Villa Ramallo, Buenos Aires
-- 
-- INSTRUCCIONES:
-- 1. Ejecutar este script completo en Supabase SQL Editor
-- 2. Crear los buckets de Storage manualmente (ver al final)
-- 3. Configurar las políticas de Storage (ver al final)
-- =====================================================

-- Extensiones necesarias
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =====================================================
-- 1. TABLA: profiles (Usuarios y Clientes)
-- =====================================================
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  phone text,
  address text,
  city text default 'Villa Ramallo',
  province text default 'Buenos Aires',
  postal_code text,
  is_admin boolean default false,
  is_wholesale_client boolean default true, -- Todos son clientes mayoristas
  min_order_amount numeric(10,2) default 5, -- Mínimo 5 productos
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índices para profiles
create index if not exists profiles_email_idx on profiles(email);
create index if not exists profiles_admin_idx on profiles(is_admin);
create index if not exists profiles_wholesale_idx on profiles(is_wholesale_client);

-- =====================================================
-- 2. TABLA: categories (Categorías de Productos)
-- =====================================================
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  image_url text,
  sort_order integer default 0,
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Insertar categorías típicas de ropa infantil
insert into categories (name, slug, description, sort_order) values
('Remeras', 'remeras', 'Remeras y camisetas para niños y niñas', 1),
('Pantalones', 'pantalones', 'Pantalones, jeans y bermudas', 2),
('Vestidos', 'vestidos', 'Vestidos y faldas para niñas', 3),
('Conjuntos', 'conjuntos', 'Conjuntos completos de ropa', 4),
('Ropa Interior', 'ropa-interior', 'Ropa interior y medias', 5),
('Accesorios', 'accesorios', 'Gorros, bufandas, guantes', 6),
('Calzado', 'calzado', 'Zapatos y zapatillas', 7),
('Bebés', 'bebes', 'Ropa especial para bebés', 8)
on conflict (name) do nothing;

-- =====================================================
-- 3. TABLA: products (Productos)
-- =====================================================
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  sku text unique,
  price numeric(10, 2) not null check (price >= 0),
  wholesale_price numeric(10, 2) check (wholesale_price >= 0),
  cost_price numeric(10, 2) check (cost_price >= 0), -- Precio de costo para márgenes
  stock integer default 0 check (stock >= 0),
  low_stock_threshold integer default 10,
  category_id uuid references categories(id),
  subcategory text,
  sizes text[], -- ['2', '4', '6', '8', '10', '12', '14', '16']
  colors text[],
  gender text check (gender in ('niños', 'niñas', 'bebes', 'unisex', null)),
  age_range text, -- '0-2', '3-5', '6-8', '9-12', '13-16'
  season text check (season in ('verano', 'invierno', 'primavera', 'otoño', 'todo-el-año', null)),
  material text, -- 'algodón', 'poliéster', 'mezcla', etc.
  care_instructions text, -- Instrucciones de cuidado
  featured boolean default false,
  active boolean default true,
  images text[], -- URLs de Supabase Storage
  tags text[], -- Tags para búsqueda
  weight numeric(5,2), -- Peso en kg para envío
  dimensions text, -- Dimensiones del producto
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índices para products
create index if not exists products_category_idx on products(category_id);
create index if not exists products_active_idx on products(active);
create index if not exists products_featured_idx on products(featured);
create index if not exists products_sku_idx on products(sku);
create index if not exists products_gender_idx on products(gender);
create index if not exists products_age_range_idx on products(age_range);
create index if not exists products_season_idx on products(season);
create index if not exists products_price_idx on products(price);

-- =====================================================
-- 4. TABLA: orders (Pedidos)
-- =====================================================
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  order_number text unique not null,
  user_id uuid references profiles(id) not null,
  status text check (status in ('pendiente', 'confirmado', 'preparando', 'enviado', 'entregado', 'cancelado')) default 'pendiente',
  subtotal numeric(10, 2) not null,
  shipping_cost numeric(10, 2) default 0,
  discount_amount numeric(10, 2) default 0,
  total numeric(10, 2) not null,
  payment_method text check (payment_method in ('transferencia', 'efectivo', 'tarjeta', 'mercadopago')),
  payment_status text check (payment_status in ('pendiente', 'pagado', 'reembolsado')) default 'pendiente',
  payment_proof_url text, -- URL del comprobante de pago
  shipping_address jsonb not null, -- Dirección de envío completa
  billing_address jsonb, -- Dirección de facturación
  notes text, -- Notas del cliente
  admin_notes text, -- Notas internas del admin
  estimated_delivery_date date,
  actual_delivery_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índices para orders
create index if not exists orders_user_idx on orders(user_id);
create index if not exists orders_status_idx on orders(status);
create index if not exists orders_payment_status_idx on orders(payment_status);
create index if not exists orders_created_idx on orders(created_at);
create index if not exists orders_number_idx on orders(order_number);

-- =====================================================
-- 5. TABLA: order_items (Items de Pedidos)
-- =====================================================
create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null,
  total_price numeric(10, 2) not null,
  size text,
  color text,
  created_at timestamp with time zone default now()
);

-- Índices para order_items
create index if not exists order_items_order_idx on order_items(order_id);
create index if not exists order_items_product_idx on order_items(product_id);

-- =====================================================
-- 6. TABLA: favorites (Productos Favoritos)
-- =====================================================
create table if not exists favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(user_id, product_id)
);

-- Índices para favorites
create index if not exists favorites_user_idx on favorites(user_id);
create index if not exists favorites_product_idx on favorites(product_id);

-- =====================================================
-- 7. TABLA: business_config (Configuración del Negocio)
-- =====================================================
create table if not exists business_config (
  id uuid default gen_random_uuid() primary key,
  business_name text default 'Zingarito Kids',
  business_email text default 'zingaritokids@gmail.com',
  business_phone text default '+54 340 749 8045',
  business_address text default 'San Martín 17, Villa Ramallo, Buenos Aires, Argentina',
  business_description text default 'Tienda mayorista de ropa infantil especializada en productos de calidad para niños y niñas.',
  logo_url text,
  favicon_url text,
  whatsapp_number text default '543407498045',
  min_order_quantity integer default 5,
  min_order_amount numeric(10,2) default 0,
  shipping_cost numeric(10,2) default 0,
  free_shipping_threshold numeric(10,2) default 50000,
  currency text default 'ARS',
  currency_symbol text default '$',
  business_hours jsonb default '{"monday": "9:00-18:00", "tuesday": "9:00-18:00", "wednesday": "9:00-18:00", "thursday": "9:00-18:00", "friday": "9:00-18:00", "saturday": "9:00-13:00", "sunday": "cerrado"}',
  social_media jsonb default '{"instagram": "", "facebook": "", "tiktok": ""}',
  payment_methods jsonb default '["transferencia", "efectivo", "mercadopago"]',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Insertar configuración inicial
insert into business_config (id) values (gen_random_uuid())
on conflict do nothing;

-- =====================================================
-- 8. TABLA: price_history (Historial de Precios)
-- =====================================================
create table if not exists price_history (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade not null,
  old_price numeric(10, 2) not null,
  new_price numeric(10, 2) not null,
  change_type text check (change_type in ('manual', 'bulk_increase', 'bulk_decrease', 'automatic')),
  change_percentage numeric(5,2),
  changed_by uuid references profiles(id),
  reason text,
  created_at timestamp with time zone default now()
);

-- Índices para price_history
create index if not exists price_history_product_idx on price_history(product_id);
create index if not exists price_history_created_idx on price_history(created_at);

-- =====================================================
-- 9. TABLA: inventory_movements (Movimientos de Stock)
-- =====================================================
create table if not exists inventory_movements (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade not null,
  movement_type text check (movement_type in ('entrada', 'salida', 'ajuste', 'venta', 'devolucion')) not null,
  quantity integer not null,
  previous_stock integer not null,
  new_stock integer not null,
  reason text,
  order_id uuid references orders(id),
  created_by uuid references profiles(id),
  created_at timestamp with time zone default now()
);

-- Índices para inventory_movements
create index if not exists inventory_movements_product_idx on inventory_movements(product_id);
create index if not exists inventory_movements_type_idx on inventory_movements(movement_type);
create index if not exists inventory_movements_created_idx on inventory_movements(created_at);

-- =====================================================
-- 10. TABLA: notifications (Notificaciones)
-- =====================================================
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text check (type in ('info', 'success', 'warning', 'error')) default 'info',
  read boolean default false,
  action_url text,
  created_at timestamp with time zone default now()
);

-- Índices para notifications
create index if not exists notifications_user_idx on notifications(user_id);
create index if not exists notifications_read_idx on notifications(read);
create index if not exists notifications_created_idx on notifications(created_at);

-- =====================================================
-- RLS (Row Level Security) Policies
-- =====================================================

-- Habilitar RLS en todas las tablas
alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table favorites enable row level security;
alter table business_config enable row level security;
alter table price_history enable row level security;
alter table inventory_movements enable row level security;
alter table notifications enable row level security;

-- =====================================================
-- POLICIES PARA PROFILES
-- =====================================================
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Admins can view all profiles" on profiles;
drop policy if exists "Admins can update all profiles" on profiles;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

create policy "Admins can update all profiles"
  on profiles for update
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

-- =====================================================
-- POLICIES PARA CATEGORIES
-- =====================================================
drop policy if exists "Categories are viewable by everyone" on categories;
drop policy if exists "Only admins can manage categories" on categories;

create policy "Categories are viewable by everyone"
  on categories for select
  using (active = true);

create policy "Only admins can manage categories"
  on categories for all
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

-- =====================================================
-- POLICIES PARA PRODUCTS
-- =====================================================
drop policy if exists "Products are viewable by everyone" on products;
drop policy if exists "Only admins can manage products" on products;

create policy "Products are viewable by everyone"
  on products for select
  using (active = true);

create policy "Only admins can manage products"
  on products for all
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

-- =====================================================
-- POLICIES PARA ORDERS
-- =====================================================
drop policy if exists "Users can view own orders" on orders;
drop policy if exists "Users can create orders" on orders;
drop policy if exists "Admins can view all orders" on orders;
drop policy if exists "Admins can update orders" on orders;

create policy "Users can view own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "Users can create orders"
  on orders for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all orders"
  on orders for select
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

create policy "Admins can update orders"
  on orders for update
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

-- =====================================================
-- POLICIES PARA ORDER_ITEMS
-- =====================================================
drop policy if exists "Users can view own order items" on order_items;
drop policy if exists "Admins can view all order items" on order_items;

create policy "Users can view own order items"
  on order_items for select
  using (exists (
    select 1 from orders where id = order_items.order_id and user_id = auth.uid()
  ));

create policy "Admins can view all order items"
  on order_items for select
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

-- =====================================================
-- POLICIES PARA FAVORITES
-- =====================================================
drop policy if exists "Users can manage own favorites" on favorites;

create policy "Users can manage own favorites"
  on favorites for all
  using (auth.uid() = user_id);

-- =====================================================
-- POLICIES PARA BUSINESS_CONFIG
-- =====================================================
drop policy if exists "Business config is viewable by everyone" on business_config;
drop policy if exists "Only admins can update business config" on business_config;

create policy "Business config is viewable by everyone"
  on business_config for select
  using (true);

create policy "Only admins can update business config"
  on business_config for update
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

-- =====================================================
-- POLICIES PARA PRICE_HISTORY
-- =====================================================
drop policy if exists "Only admins can view price history" on price_history;
drop policy if exists "Only admins can insert price history" on price_history;

create policy "Only admins can view price history"
  on price_history for select
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

create policy "Only admins can insert price history"
  on price_history for insert
  with check (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

-- =====================================================
-- POLICIES PARA INVENTORY_MOVEMENTS
-- =====================================================
drop policy if exists "Only admins can view inventory movements" on inventory_movements;
drop policy if exists "Only admins can insert inventory movements" on inventory_movements;

create policy "Only admins can view inventory movements"
  on inventory_movements for select
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

create policy "Only admins can insert inventory movements"
  on inventory_movements for insert
  with check (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

-- =====================================================
-- POLICIES PARA NOTIFICATIONS
-- =====================================================
drop policy if exists "Users can view own notifications" on notifications;
drop policy if exists "Users can update own notifications" on notifications;
drop policy if exists "System can insert notifications" on notifications;

create policy "Users can view own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on notifications for update
  using (auth.uid() = user_id);

create policy "System can insert notifications"
  on notifications for insert
  with check (true);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para generar número de pedido
create or replace function generate_order_number()
returns text as $$
declare
  new_number text;
  counter integer;
begin
  -- Obtener el último número de pedido
  select coalesce(max(cast(substring(order_number from 2) as integer)), 0) + 1
  into counter
  from orders
  where order_number ~ '^Z[0-9]+$';
  
  new_number := 'Z' || lpad(counter::text, 6, '0');
  return new_number;
end;
$$ language plpgsql;

-- Trigger para generar número de pedido automáticamente
drop trigger if exists set_order_number_trigger on orders;
create or replace function set_order_number()
returns trigger as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := generate_order_number();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger set_order_number_trigger
  before insert on orders
  for each row
  execute function set_order_number();

-- Función para actualizar updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers para updated_at
drop trigger if exists update_profiles_updated_at on profiles;
drop trigger if exists update_categories_updated_at on categories;
drop trigger if exists update_products_updated_at on products;
drop trigger if exists update_orders_updated_at on orders;
drop trigger if exists update_business_config_updated_at on business_config;

create trigger update_profiles_updated_at before update on profiles for each row execute function update_updated_at_column();
create trigger update_categories_updated_at before update on categories for each row execute function update_updated_at_column();
create trigger update_products_updated_at before update on products for each row execute function update_updated_at_column();
create trigger update_orders_updated_at before update on orders for each row execute function update_updated_at_column();
create trigger update_business_config_updated_at before update on business_config for each row execute function update_updated_at_column();

-- Función para registrar cambios de precio
create or replace function log_price_change()
returns trigger as $$
begin
  if old.price != new.price then
    insert into price_history (product_id, old_price, new_price, change_type, change_percentage, changed_by)
    values (
      new.id,
      old.price,
      new.price,
      'manual',
      round(((new.price - old.price) / old.price * 100)::numeric, 2),
      auth.uid()
    );
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists log_price_change_trigger on products;
create trigger log_price_change_trigger
  after update on products
  for each row
  execute function log_price_change();

-- Función para registrar movimientos de inventario
create or replace function log_inventory_movement()
returns trigger as $$
begin
  if old.stock != new.stock then
    insert into inventory_movements (product_id, movement_type, quantity, previous_stock, new_stock, reason)
    values (
      new.id,
      case 
        when new.stock > old.stock then 'entrada'
        when new.stock < old.stock then 'salida'
        else 'ajuste'
      end,
      abs(new.stock - old.stock),
      old.stock,
      new.stock,
      'Actualización manual de stock'
    );
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists log_inventory_movement_trigger on products;
create trigger log_inventory_movement_trigger
  after update on products
  for each row
  execute function log_inventory_movement();

-- Función para decrementar stock al crear orden
create or replace function decrement_product_stock()
returns trigger as $$
begin
  update products
  set stock = stock - new.quantity
  where id = new.product_id;
  
  return new;
end;
$$ language plpgsql;

drop trigger if exists decrement_stock_on_order_item on order_items;
create trigger decrement_stock_on_order_item
  after insert on order_items
  for each row
  execute function decrement_product_stock();

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de productos con stock bajo
drop view if exists low_stock_products;
create view low_stock_products as
select 
  p.id,
  p.name,
  p.sku,
  p.stock,
  p.low_stock_threshold,
  c.name as category_name
from products p
left join categories c on p.category_id = c.id
where p.stock <= p.low_stock_threshold
  and p.active = true
order by p.stock asc;

-- Vista de estadísticas de ventas
drop view if exists sales_stats;
create view sales_stats as
select 
  date_trunc('day', created_at) as date,
  count(*) as total_orders,
  sum(total) as total_sales,
  avg(total) as avg_order_value
from orders
where status not in ('cancelado')
group by date_trunc('day', created_at)
order by date desc;

-- Vista de productos más vendidos
drop view if exists best_selling_products;
create view best_selling_products as
select 
  p.id,
  p.name,
  p.sku,
  p.price,
  sum(oi.quantity) as total_sold,
  sum(oi.total_price) as total_revenue
from products p
join order_items oi on p.id = oi.product_id
join orders o on oi.order_id = o.id
where o.status not in ('cancelado')
group by p.id, p.name, p.sku, p.price
order by total_sold desc;

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

-- Este esquema está diseñado específicamente para Zingarito Kids
-- Incluye todas las funcionalidades necesarias para una tienda mayorista de ropa infantil
-- Con seguimiento completo de precios, inventario y pedidos
-- Sistema de notificaciones y favoritos para mejorar la experiencia del cliente

-- =====================================================
-- INSTRUCCIONES ADICIONALES
-- =====================================================

-- DESPUÉS DE EJECUTAR ESTE SCRIPT, DEBES:

-- 1. CREAR BUCKETS DE STORAGE (desde Supabase Dashboard):
--    - Bucket "products" (público) - para imágenes de productos
--    - Bucket "payment-proofs" (privado) - para comprobantes de pago  
--    - Bucket "business" (público) - para logo del negocio

-- 2. EJECUTAR LAS POLÍTICAS DE STORAGE (desde Supabase SQL Editor):

-- Policy para products bucket (público)
-- create policy "Public Access"
--   on storage.objects for select
--   using (bucket_id = 'products');

-- create policy "Admins can upload products"
--   on storage.objects for insert
--   with check (
--     bucket_id = 'products' and
--     exists (select 1 from profiles where id = auth.uid() and is_admin = true)
--   );

-- create policy "Admins can delete products"
--   on storage.objects for delete
--   using (
--     bucket_id = 'products' and
--     exists (select 1 from profiles where id = auth.uid() and is_admin = true)
--   );

-- Policy para payment-proofs bucket (privado)
-- create policy "Users can view own proofs"
--   on storage.objects for select
--   using (
--     bucket_id = 'payment-proofs' and
--     (auth.uid()::text = (storage.foldername(name))[1] or
--      exists (select 1 from profiles where id = auth.uid() and is_admin = true))
--   );

-- create policy "Users can upload own proofs"
--   on storage.objects for insert
--   with check (
--     bucket_id = 'payment-proofs' and
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Policy para business bucket (público)
-- create policy "Public Access to business"
--   on storage.objects for select
--   using (bucket_id = 'business');

-- create policy "Admins can manage business assets"
--   on storage.objects for all
--   using (
--     bucket_id = 'business' and
--     exists (select 1 from profiles where id = auth.uid() and is_admin = true)
--   );

-- 3. CREAR USUARIO ADMIN INICIAL:
-- insert into profiles (id, email, full_name, is_admin)
-- values (
--   'TU_UUID_AQUI', -- Reemplazar con UUID real del usuario
--   'admin@zingaritokids.com',
--   'Administrador Zingarito Kids',
--   true
-- );

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
