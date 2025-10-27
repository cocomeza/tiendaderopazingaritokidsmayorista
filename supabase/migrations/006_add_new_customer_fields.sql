-- Agregar nuevos campos de información del cliente
alter table profiles 
  add column if not exists locality text,
  add column if not exists sales_type text,
  add column if not exists ages text;

