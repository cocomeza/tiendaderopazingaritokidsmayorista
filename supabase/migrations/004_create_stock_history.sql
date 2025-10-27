-- =====================================================
-- TABLA: stock_history (historial de movimientos de stock)
-- =====================================================

create table if not exists stock_history (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade not null,
  change_type text not null check (change_type in ('entrada', 'salida', 'ajuste', 'importación', 'venta')),
  quantity integer not null,
  previous_stock integer not null,
  new_stock integer not null,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índices para stock_history
create index if not exists stock_history_product_id_idx on stock_history(product_id);
create index if not exists stock_history_created_at_idx on stock_history(created_at desc);
create index if not exists stock_history_change_type_idx on stock_history(change_type);

-- RLS policies para stock_history
alter table stock_history enable row level security;

-- Eliminar políticas existentes si existen
drop policy if exists "Only admins can view stock history" on stock_history;
drop policy if exists "Only admins can insert stock history" on stock_history;
drop policy if exists "Only admins can update stock history" on stock_history;
drop policy if exists "Only admins can delete stock history" on stock_history;

create policy "Only admins can view stock history"
  on stock_history for select
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

create policy "Only admins can insert stock history"
  on stock_history for insert
  with check (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

create policy "Only admins can update stock history"
  on stock_history for update
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

create policy "Only admins can delete stock history"
  on stock_history for delete
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

-- Trigger para actualizar updated_at
drop trigger if exists update_stock_history_updated_at on stock_history;

create trigger update_stock_history_updated_at
  before update on stock_history
  for each row
  execute function update_updated_at_column();

-- Vista para facilitar consultas de historial con nombres de productos
create or replace view stock_history_with_products as
select 
  sh.id,
  sh.product_id,
  p.name as product_name,
  p.sku,
  sh.change_type,
  sh.quantity,
  sh.previous_stock,
  sh.new_stock,
  sh.notes,
  sh.created_at,
  sh.updated_at
from stock_history sh
left join products p on sh.product_id = p.id
order by sh.created_at desc;

