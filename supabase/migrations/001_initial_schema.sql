-- =====================================================
-- ZINGARITO KIDS - SCHEMA INICIAL SUPABASE
-- Tienda Mayorista de Ropa Infantil
-- =====================================================

-- 1. TABLA: profiles (extensión de auth.users)
-- =====================================================
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  phone text,
  address text,
  city text,
  province text,
  postal_code text,
  is_admin boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS policies para profiles
alter table profiles enable row level security;

-- Eliminar políticas existentes si existen
drop policy if exists "Public profiles are viewable by admins" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;

create policy "Public profiles are viewable by admins"
  on profiles for select
  using (auth.uid() = id or exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Trigger para actualizar updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Eliminar trigger existente si existe
drop trigger if exists update_profiles_updated_at on profiles;

create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

-- =====================================================
-- 2. TABLA: products
-- =====================================================
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  sku text unique,
  price numeric(10, 2) not null check (price >= 0),
  wholesale_price numeric(10, 2) check (wholesale_price >= 0),
  stock integer default 0 check (stock >= 0),
  low_stock_threshold integer default 10,
  category text,
  subcategory text,
  sizes text[], -- ['2', '4', '6', '8', '10', '12', '14', '16']
  colors text[],
  gender text check (gender in ('niños', 'niñas', 'bebes', 'unisex', null)),
  age_range text, -- '0-2', '3-5', '6-8', '9-12', '13-16'
  featured boolean default false,
  active boolean default true,
  images text[], -- URLs de Supabase Storage
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índices para products
create index if not exists products_category_idx on products(category);
create index if not exists products_active_idx on products(active);
create index if not exists products_featured_idx on products(featured);
create index if not exists products_sku_idx on products(sku);

-- RLS policies para products
alter table products enable row level security;

-- Eliminar políticas existentes si existen
drop policy if exists "Products are viewable by everyone" on products;
drop policy if exists "Only admins can insert products" on products;
drop policy if exists "Only admins can update products" on products;
drop policy if exists "Only admins can delete products" on products;

create policy "Products are viewable by everyone"
  on products for select
  using (active = true or exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

create policy "Only admins can insert products"
  on products for insert
  with check (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

create policy "Only admins can update products"
  on products for update
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

create policy "Only admins can delete products"
  on products for delete
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

-- Trigger para actualizar updated_at en products
drop trigger if exists update_products_updated_at on products;

create trigger update_products_updated_at
  before update on products
  for each row
  execute function update_updated_at_column();

-- =====================================================
-- 3. TABLA: orders (pedidos)
-- =====================================================
create type order_status as enum ('pendiente', 'confirmado', 'preparando', 'enviado', 'entregado', 'cancelado');
create type payment_status as enum ('pendiente', 'pagado', 'rechazado');

create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  order_number text unique not null,
  user_id uuid references profiles(id) on delete cascade not null,
  status order_status default 'pendiente',
  payment_status payment_status default 'pendiente',
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  discount numeric(10, 2) default 0 check (discount >= 0),
  total numeric(10, 2) not null check (total >= 0),
  notes text,
  shipping_address jsonb, -- {name, phone, address, city, province, postal_code}
  payment_proof_url text, -- URL del comprobante en Storage
  whatsapp_sent boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índices para orders
create index if not exists orders_user_id_idx on orders(user_id);
create index if not exists orders_status_idx on orders(status);
create index if not exists orders_payment_status_idx on orders(payment_status);
create index if not exists orders_created_at_idx on orders(created_at desc);
create index if not exists orders_order_number_idx on orders(order_number);

-- RLS policies para orders
alter table orders enable row level security;

-- Eliminar políticas existentes si existen
drop policy if exists "Users can view own orders" on orders;
drop policy if exists "Users can create own orders" on orders;
drop policy if exists "Only admins can update orders" on orders;
drop policy if exists "Only admins can delete orders" on orders;

create policy "Users can view own orders"
  on orders for select
  using (auth.uid() = user_id or exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

create policy "Users can create own orders"
  on orders for insert
  with check (auth.uid() = user_id);

create policy "Only admins can update orders"
  on orders for update
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

create policy "Only admins can delete orders"
  on orders for delete
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

-- Trigger para actualizar updated_at en orders
drop trigger if exists update_orders_updated_at on orders;

create trigger update_orders_updated_at
  before update on orders
  for each row
  execute function update_updated_at_column();

-- =====================================================
-- 4. TABLA: order_items (items del pedido)
-- =====================================================
create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) on delete restrict not null,
  product_name text not null, -- Snapshot del nombre
  product_sku text,
  size text,
  color text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  created_at timestamp with time zone default now()
);

-- Índices para order_items
create index if not exists order_items_order_id_idx on order_items(order_id);
create index if not exists order_items_product_id_idx on order_items(product_id);

-- RLS policies para order_items
alter table order_items enable row level security;

-- Eliminar políticas existentes si existen
drop policy if exists "Order items viewable with order" on order_items;
drop policy if exists "Order items insertable with order" on order_items;
drop policy if exists "Only admins can update order items" on order_items;
drop policy if exists "Only admins can delete order items" on order_items;

create policy "Order items viewable with order"
  on order_items for select
  using (exists (
    select 1 from orders where id = order_items.order_id 
    and (user_id = auth.uid() or exists (
      select 1 from profiles where id = auth.uid() and is_admin = true
    ))
  ));

create policy "Order items insertable with order"
  on order_items for insert
  with check (exists (
    select 1 from orders where id = order_items.order_id and user_id = auth.uid()
  ));

create policy "Only admins can update order items"
  on order_items for update
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

create policy "Only admins can delete order items"
  on order_items for delete
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

-- =====================================================
-- 5. TABLA: favorites (productos favoritos)
-- =====================================================
create table if not exists favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(user_id, product_id)
);

-- Índices para favorites
create index if not exists favorites_user_id_idx on favorites(user_id);
create index if not exists favorites_product_id_idx on favorites(product_id);

-- RLS policies para favorites
alter table favorites enable row level security;

-- Eliminar políticas existentes si existen
drop policy if exists "Users can view own favorites" on favorites;
drop policy if exists "Users can manage own favorites" on favorites;

create policy "Users can view own favorites"
  on favorites for select
  using (auth.uid() = user_id);

create policy "Users can manage own favorites"
  on favorites for all
  using (auth.uid() = user_id);

-- =====================================================
-- 6. TABLA: business_config (configuración del negocio)
-- =====================================================
create table if not exists business_config (
  id uuid default gen_random_uuid() primary key,
  business_name text default 'Zingarito Kids',
  logo_url text,
  whatsapp_number text not null default '543407498045',
  email text not null default 'zingaritokids@gmail.com',
  cbu text,
  alias_cbu text,
  bank_name text,
  account_holder text,
  address text default 'San Martín 17 - Villa Ramallo, Buenos Aires, Argentina',
  min_wholesale_quantity integer default 5,
  instagram_url text,
  facebook_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Insertar configuración inicial
insert into business_config (whatsapp_number, email, address, min_wholesale_quantity)
values ('543407498045', 'zingaritokids@gmail.com', 'San Martín 17 - Villa Ramallo, Buenos Aires, Argentina', 5)
on conflict do nothing;

-- RLS policies para business_config
alter table business_config enable row level security;

-- Eliminar políticas existentes si existen
drop policy if exists "Config viewable by everyone" on business_config;
drop policy if exists "Only admins can update config" on business_config;

create policy "Config viewable by everyone"
  on business_config for select
  using (true);

create policy "Only admins can update config"
  on business_config for update
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

-- Trigger para actualizar updated_at en business_config
drop trigger if exists update_business_config_updated_at on business_config;

create trigger update_business_config_updated_at
  before update on business_config
  for each row
  execute function update_updated_at_column();

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para generar order_number único
create or replace function generate_order_number()
returns text as $$
declare
  new_number text;
  date_part text;
  counter integer;
begin
  date_part := to_char(now(), 'YYYYMMDD');
  
  select coalesce(max(
    cast(substring(order_number from 'ZK-[0-9]+-([0-9]+)') as integer)
  ), 0) + 1
  into counter
  from orders
  where order_number like 'ZK-' || date_part || '-%';
  
  new_number := 'ZK-' || date_part || '-' || lpad(counter::text, 4, '0');
  
  return new_number;
end;
$$ language plpgsql;

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

-- Eliminar trigger existente si existe
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
  id,
  name,
  sku,
  stock,
  low_stock_threshold,
  category
from products
where stock <= low_stock_threshold
  and active = true
order by stock asc;

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

-- =====================================================
-- STORAGE BUCKETS (ejecutar desde Supabase Dashboard)
-- =====================================================
-- Crear manualmente en Supabase:
-- 1. Bucket "products" (público) - para imágenes de productos
-- 2. Bucket "payment-proofs" (privado) - para comprobantes de pago
-- 3. Bucket "business" (público) - para logo del negocio

-- =====================================================
-- PERMISOS DE STORAGE (ejecutar después de crear buckets)
-- =====================================================

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

-- =====================================================
-- FIN DEL SCHEMA INICIAL
-- =====================================================

