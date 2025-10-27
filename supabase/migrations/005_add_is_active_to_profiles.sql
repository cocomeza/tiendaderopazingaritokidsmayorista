-- Agregar campo is_active a la tabla profiles
alter table profiles 
  add column if not exists is_active boolean default true;

-- Actualizar todos los registros existentes a activos
update profiles set is_active = true where is_active is null;

