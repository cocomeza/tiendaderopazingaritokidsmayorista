-- =====================================================
-- Agregar política RLS para que los admins puedan eliminar perfiles
-- =====================================================

-- Crear política para que solo los admins puedan eliminar perfiles
create policy "Only admins can delete profiles"
  on profiles for delete
  using (exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));

