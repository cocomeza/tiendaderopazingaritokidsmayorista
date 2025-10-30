-- =====================================================
-- Migración: Crear tabla product_variants
-- =====================================================
-- Esta tabla permite manejar stock individual por combinación
-- de color, talle y otros atributos de producto
-- =====================================================

-- Crear tabla product_variants
create table if not exists product_variants (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade not null,
  sku text unique,
  size text,
  color text,
  stock integer default 0 check (stock >= 0),
  price_override numeric(10, 2), -- Precio específico para esta variante (opcional)
  wholesale_price_override numeric(10, 2), -- Precio mayorista específico (opcional)
  active boolean default true,
  images text[], -- Imágenes específicas de esta variante
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índices para product_variants
create index if not exists product_variants_product_id_idx on product_variants(product_id);
create index if not exists product_variants_sku_idx on product_variants(sku);
create index if not exists product_variants_active_idx on product_variants(active);
create index if not exists product_variants_stock_idx on product_variants(stock);
create index if not exists product_variants_size_idx on product_variants(size);
create index if not exists product_variants_color_idx on product_variants(color);

-- Índice compuesto para búsquedas rápidas por producto y disponibilidad
create index if not exists product_variants_product_active_stock_idx 
  on product_variants(product_id, active, stock) 
  where active = true;

-- Habilitar RLS
alter table product_variants enable row level security;

-- Eliminar políticas existentes si existen
drop policy if exists "Product variants are viewable by everyone" on product_variants;
drop policy if exists "Only admins can insert variants" on product_variants;
drop policy if exists "Only admins can update variants" on product_variants;
drop policy if exists "Only admins can delete variants" on product_variants;

-- Política: Variantes activas son visibles por todos
create policy "Product variants are viewable by everyone"
  on product_variants for select
  using (active = true or exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

-- Política: Solo admins pueden insertar variantes
create policy "Only admins can insert variants"
  on product_variants for insert
  with check (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

-- Política: Solo admins pueden actualizar variantes
create policy "Only admins can update variants"
  on product_variants for update
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

-- Política: Solo admins pueden eliminar variantes
create policy "Only admins can delete variants"
  on product_variants for delete
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

-- Trigger para updated_at
drop trigger if exists update_product_variants_updated_at on product_variants;
create trigger update_product_variants_updated_at
  before update on product_variants
  for each row
  execute function update_updated_at_column();

-- Vista: Variantes de productos con información del producto padre
drop view if exists product_variants_with_details;
create view product_variants_with_details as
select 
  v.id as variant_id,
  v.product_id,
  v.sku,
  v.size,
  v.color,
  v.stock,
  v.price_override,
  v.wholesale_price_override,
  v.active as variant_active,
  v.images as variant_images,
  v.created_at,
  v.updated_at,
  -- Campos del producto padre
  p.name as product_name,
  p.description as product_description,
  p.price as product_base_price,
  p.wholesale_price as product_base_wholesale_price,
  p.images as product_base_images,
  p.category_id,
  p.active as product_active
from product_variants v
inner join products p on v.product_id = p.id
where v.active = true and p.active = true;

-- Función para obtener stock total de un producto sumando sus variantes
create or replace function get_product_total_stock(p_product_id uuid)
returns integer as $$
declare
  v_total_stock integer;
begin
  select coalesce(sum(stock), 0)
  into v_total_stock
  from product_variants
  where product_id = p_product_id
    and active = true;
  
  return v_total_stock;
end;
$$ language plpgsql;

-- Comentarios en la tabla
comment on table product_variants is 'Variantes de productos con stock individual por color y talle';
comment on column product_variants.product_id is 'ID del producto padre';
comment on column product_variants.size is 'Talla de la variante';
comment on column product_variants.color is 'Color de la variante';
comment on column product_variants.stock is 'Stock disponible de esta variante';
comment on column product_variants.price_override is 'Precio específico de esta variante (anula precio del producto)';
comment on column product_variants.wholesale_price_override is 'Precio mayorista específico (anula precio mayorista del producto)';

-- =====================================================
-- COMENTARIOS Y NOTAS
-- =====================================================
-- Esta estructura permite:
-- 1. Stock individual por cada combinación color/talle
-- 2. Precios específicos por variante (opcional)
-- 3. Imágenes específicas por variante (opcional)
-- 4. Gestión granular de inventario
-- 5. Si no hay variantes, se usa el stock general del producto
-- =====================================================

