-- =====================================================
-- Permitir que administradores actualicen perfiles
-- =====================================================

-- Eliminar política para evitar duplicados al reaplicar
drop policy if exists "Admins can update profiles" on profiles;

-- Crear política para permitir que administradores actualicen cualquier perfil
create policy "Admins can update profiles"
  on profiles for update
  using (exists (
    select 1 from profiles
    where id = auth.uid() and is_admin = true
  ))
  with check (exists (
    select 1 from profiles
    where id = auth.uid() and is_admin = true
  ));


