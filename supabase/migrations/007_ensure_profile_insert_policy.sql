-- =====================================================
-- Asegurar que los usuarios puedan insertar su propio perfil
-- =====================================================

-- Eliminar política existente si existe
drop policy if exists "Users can insert own profile" on profiles;

-- Crear política para que los usuarios puedan insertar su propio perfil
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- También permitir que los usuarios puedan actualizar campos específicos de su perfil
-- (esto ya existe pero lo garantizamos)
drop policy if exists "Users can update own profile" on profiles;

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

