-- =====================================================
-- ZINGARITO KIDS - BASE DE DATOS COMPLETA
-- Tienda Mayorista de Ropa Infantil
-- =====================================================
-- Este archivo contiene TODA la estructura de la base de datos
-- Úsalo para configurar una base de datos desde cero
-- 
-- INSTRUCCIONES DE MIGRACIÓN:
-- 1. Crear nuevo proyecto en Supabase
-- 2. Ejecutar este script completo en SQL Editor
-- 3. Crear usuario admin desde Authentication > Add user
-- 4. Ejecutar: UPDATE profiles SET is_admin = true WHERE email = 'tu-email@admin.com';
-- 5. Configurar variables de entorno en .env.local
-- 
-- Última actualización: Enero 2025
-- =====================================================

-- =====================================================
-- 1. EXTENSIÓN Y FUNCIONES AUXILIARES
-- =====================================================

-- Función para actualizar updated_at automáticamente
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

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

-- =====================================================
-- 2. TIPOS DE DATOS ENUMERADOS
-- =====================================================

-- Estado del pedido
create type order_status as enum ('pendiente', 'confirmado', 'preparando', 'enviado', 'entregado', 'cancelado');

-- Estado del pago
create type payment_status as enum ('pendiente', 'pagado', 'rechazado');

-- =====================================================
-- 3. TABLA: profiles (perfiles de usuarios)
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
  is_wholesale_client boolean default true,
  min_order_amount numeric(10, 2) default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índices para profiles
create index if not exists profiles_email_idx on profiles(email);
create index if not exists profiles_is_admin_idx on profiles(is_admin);
create index if not exists profiles_is_wholesale_client_idx on profiles(is_wholesale_client);

-- Habilitar RLS
alter table profiles enable row level security;

-- Eliminar políticas existentes
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Admins can view all profiles" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Only admins can delete profiles" on profiles;

-- Política: Usuarios pueden ver su propio perfil
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

-- Política: Admins pueden ver todos los perfiles
create policy "Admins can view all profiles"
  on profiles for select
  using (
    exists (
      select 1 from profiles 
      where id = auth.uid() 
      and is_admin = true
    )
  );

-- Política: Usuarios pueden insertar su propio perfil
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Política: Usuarios pueden actualizar su propio perfil
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Política: Solo admins pueden eliminar perfiles
create policy "Only admins can delete profiles"
  on profiles for delete
  using (
    exists (
      select 1 from profiles 
      where id = auth.uid() 
      and is_admin = true
    )
  );

-- Trigger para updated_at
drop trigger if exists update_profiles_updated_at on profiles;
create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

-- =====================================================
-- 4. TABLA: categories (categorías de productos)
-- =====================================================

create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índices para categories
create index if not exists categories_active_idx on categories(active);
create index if not exists categories_name_idx on categories(name);

-- Habilitar RLS
alter table categories enable row level security;

-- Política: Público puede ver categorías activas
create policy "Categories are viewable by everyone"
  on categories for select
  using (active = true);

-- =====================================================
-- 5. TABLA: products (productos)
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
  category_id uuid references categories(id) on delete set null,
  sizes text[], -- ['2', '4', '6', '8', '10', '12', '14', '16']
  colors text[],
  images text[], -- URLs de Supabase Storage
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índices para products
create index if not exists products_active_idx on products(active);
create index if not exists products_category_id_idx on products(category_id);
create index if not exists products_name_idx on products(name);
create index if not exists products_wholesale_price_idx on products(wholesale_price);
create index if not exists products_created_at_idx on products(created_at desc);
create index if not exists products_stock_idx on products(stock);

-- Índices compuestos para performance
create index if not exists products_active_created_at_idx 
  on products(active, created_at desc) 
  where active = true;

create index if not exists products_category_active_idx 
  on products(category_id, active) 
  where active = true;

-- Habilitar RLS
alter table products enable row level security;

-- Eliminar políticas existentes
drop policy if exists "Products are viewable by everyone" on products;
drop policy if exists "Only admins can insert products" on products;
drop policy if exists "Only admins can update products" on products;
drop policy if exists "Only admins can delete products" on products;

-- Política: Productos activos son visibles por todos
create policy "Products are viewable by everyone"
  on products for select
  using (active = true or exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

-- Política: Solo admins pueden insertar productos
create policy "Only admins can insert products"
  on products for insert
  with check (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

-- Política: Solo admins pueden actualizar productos
create policy "Only admins can update products"
  on products for update
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

-- Política: Solo admins pueden eliminar productos
create policy "Only admins can delete products"
  on products for delete
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

-- Trigger para updated_at
drop trigger if exists update_products_updated_at on products;
create trigger update_products_updated_at
  before update on products
  for each row
  execute function update_updated_at_column();

-- =====================================================
-- 6. TABLA: orders (pedidos)
-- =====================================================

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
  payment_proof_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índices para orders
create index if not exists orders_user_id_idx on orders(user_id);
create index if not exists orders_status_idx on orders(status);
create index if not exists orders_created_at_idx on orders(created_at desc);
create index if not exists orders_order_number_idx on orders(order_number);

-- Habilitar RLS
alter table orders enable row level security;

-- Eliminar políticas existentes
drop policy if exists "Users can view own orders" on orders;
drop policy if exists "Users can create own orders" on orders;
drop policy if exists "Only admins can update orders" on orders;
drop policy if exists "Only admins can delete orders" on orders;

-- Política: Usuarios pueden ver sus propios pedidos
create policy "Users can view own orders"
  on orders for select
  using (auth.uid() = user_id or exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

-- Política: Usuarios pueden crear pedidos
create policy "Users can create own orders"
  on orders for insert
  with check (auth.uid() = user_id);

-- Política: Solo admins pueden actualizar pedidos
create policy "Only admins can update orders"
  on orders for update
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

-- Política: Solo admins pueden eliminar pedidos
create policy "Only admins can delete orders"
  on orders for delete
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

-- Trigger para updated_at
drop trigger if exists update_orders_updated_at on orders;
create trigger update_orders_updated_at
  before update on orders
  for each row
  execute function update_updated_at_column();

-- =====================================================
-- 7. TABLA: order_items (items del pedido)
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

-- Habilitar RLS
alter table order_items enable row level security;

-- Eliminar políticas existentes
drop policy if exists "Order items viewable with order" on order_items;
drop policy if exists "Order items insertable with order" on order_items;

-- Política: Items son visibles si pertenecen a un pedido del usuario
create policy "Order items viewable with order"
  on order_items for select
  using (exists (
    select 1 from orders where id = order_items.order_id 
    and (user_id = auth.uid() or exists (
      select 1 from profiles where id = auth.uid() and is_admin = true
    ))
  ));

-- Política: Se pueden insertar items para pedidos del usuario
create policy "Order items insertable with order"
  on order_items for insert
  with check (exists (
    select 1 from orders where id = order_items.order_id and user_id = auth.uid()
  ));

-- Trigger para decrementar stock automáticamente
drop trigger if exists decrement_stock_on_order_item on order_items;
create trigger decrement_stock_on_order_item
  after insert on order_items
  for each row
  execute function decrement_product_stock();

-- =====================================================
-- 8. TABLA: favorites (productos favoritos)
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

-- Habilitar RLS
alter table favorites enable row level security;

-- Eliminar políticas existentes
drop policy if exists "Users can view own favorites" on favorites;
drop policy if exists "Users can manage own favorites" on favorites;

-- Política: Usuarios pueden ver sus propios favoritos
create policy "Users can view own favorites"
  on favorites for select
  using (auth.uid() = user_id);

-- Política: Usuarios pueden gestionar sus propios favoritos
create policy "Users can manage own favorites"
  on favorites for all
  using (auth.uid() = user_id);

-- =====================================================
-- 9. TABLA: business_config (configuración del negocio)
-- =====================================================

create table if not exists business_config (
  id uuid default gen_random_uuid() primary key,
  business_name text default 'Zingarito Kids',
  logo_url text,
  whatsapp_number text not null default '543407498045',
  email text not null default 'zingaritokids@gmail.com',
  address text default 'San Martín 17 - Villa Ramallo, Buenos Aires, Argentina',
  min_wholesale_quantity integer default 5,
  cbu text,
  alias_cbu text,
  instagram_url text,
  facebook_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Insertar configuración inicial
insert into business_config (business_name, whatsapp_number, email, address, min_wholesale_quantity)
values ('Zingarito Kids', '543407498045', 'zingaritokids@gmail.com', 'San Martín 17 - Villa Ramallo, Buenos Aires, Argentina', 5)
on conflict do nothing;

-- Habilitar RLS
alter table business_config enable row level security;

-- Eliminar políticas existentes
drop policy if exists "Config viewable by everyone" on business_config;
drop policy if exists "Only admins can update config" on business_config;

-- Política: Configuración visible para todos
create policy "Config viewable by everyone"
  on business_config for select
  using (true);

-- Política: Solo admins pueden actualizar configuración
create policy "Only admins can update config"
  on business_config for update
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

-- Trigger para updated_at
drop trigger if exists update_business_config_updated_at on business_config;
create trigger update_business_config_updated_at
  before update on business_config
  for each row
  execute function update_updated_at_column();

-- =====================================================
-- 10. VISTAS ÚTILES
-- =====================================================

-- Vista de productos con stock bajo
drop view if exists low_stock_products;
create view low_stock_products as
select 
  id,
  name,
  sku,
  stock,
  active
from products
where stock <= 10
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
-- 11. CONFIGURACIÓN DE STORAGE
-- =====================================================

-- IMPORTANTE: Configura los buckets desde el Dashboard de Supabase
-- Storage → Create bucket

-- Bucket "products" (público)
-- - Configurar: Public bucket
-- - Políticas:
--   * SELECT: Everyone
--   * INSERT: Solo admins autenticados
--   * DELETE: Solo admins autenticados

-- Bucket "payment-proofs" (privado)
-- - Configurar: Private bucket
-- - Políticas:
--   * SELECT: Usuario propietario + admins
--   * INSERT: Usuario autenticado
--   * DELETE: Usuario propietario + admins

-- =====================================================
-- FIN DEL SCHEMA COMPLETO
-- =====================================================

-- Verificación: Listar todas las tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

