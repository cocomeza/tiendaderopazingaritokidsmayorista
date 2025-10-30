-- =====================================================
-- Migración: Agregar jerarquía y grupos a categories
-- =====================================================
-- Esta migración agrega campos para organizar categorías
-- por tipo (menu/edad) y crear relaciones padre-hijo
-- =====================================================

-- Agregar nuevas columnas a la tabla categories
alter table categories 
  add column if not exists parent_id uuid references categories(id) on delete cascade,
  add column if not exists group_type text check (group_type in ('menu', 'age', 'back-to-school')),
  add column if not exists age_range text,
  add column if not exists display_order integer default 0;

-- Crear índices para mejorar performance
create index if not exists categories_parent_id_idx on categories(parent_id);
create index if not exists categories_group_type_idx on categories(group_type);
create index if not exists categories_age_range_idx on categories(age_range);
create index if not exists categories_display_order_idx on categories(display_order);

-- Agregar políticas de RLS para admins
drop policy if exists "Only admins can insert categories" on categories;
drop policy if exists "Only admins can update categories" on categories;
drop policy if exists "Only admins can delete categories" on categories;

create policy "Only admins can insert categories"
  on categories for insert
  with check (
    exists (
      select 1 from profiles where id = auth.uid() and is_admin = true
    )
  );

create policy "Only admins can update categories"
  on categories for update
  using (
    exists (
      select 1 from profiles where id = auth.uid() and is_admin = true
    )
  );

create policy "Only admins can delete categories"
  on categories for delete
  using (
    exists (
      select 1 from profiles where id = auth.uid() and is_admin = true
    )
  );

-- =====================================================
-- INSERTAR CATEGORÍAS CON LA NUEVA ESTRUCTURA
-- =====================================================

-- Limpiar categorías existentes si es necesario
-- DELETE FROM categories; -- Descomentar si quieres empezar de cero

-- CATEGORÍAS DEL MENÚ PRINCIPAL
-- Grupos: Calzado, Accesorios, Ropa, Mochilas, Gorros Rocky

-- Calzado (menú principal)
INSERT INTO categories (name, description, group_type, age_range, display_order, active)
VALUES ('Calzado', 'Calzado para todas las edades', 'menu', NULL, 1, true)
ON CONFLICT DO NOTHING;

-- Accesorios (menú principal)
INSERT INTO categories (name, description, group_type, age_range, display_order, active)
VALUES ('Accesorios', 'Accesorios diversos', 'menu', NULL, 2, true)
ON CONFLICT DO NOTHING;

-- Ropa (menú principal)
INSERT INTO categories (name, description, group_type, age_range, display_order, active)
VALUES ('Ropa', 'Ropa para todas las edades', 'menu', NULL, 3, true)
ON CONFLICT DO NOTHING;

-- Mochilas (menú principal)
INSERT INTO categories (name, description, group_type, age_range, display_order, active)
VALUES ('Mochilas', 'Mochilas y mochilitas', 'menu', NULL, 4, true)
ON CONFLICT DO NOTHING;

-- Gorros Rocky (menú principal)
INSERT INTO categories (name, description, group_type, age_range, display_order, active)
VALUES ('Gorros Rocky', 'Gorros y accesorios Rocky', 'menu', NULL, 5, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- CATEGORÍAS POR EDAD
-- =====================================================

-- BEBÉS
INSERT INTO categories (name, description, group_type, age_range, display_order, active)
VALUES ('Remeras BEBÉS', 'Remeras para bebés', 'age', 'BEBÉS', 1, true),
       ('Bodys BEBÉS', 'Bodys para bebés', 'age', 'BEBÉS', 2, true),
       ('Camperas BEBÉS', 'Camperas para bebés', 'age', 'BEBÉS', 3, true),
       ('Pantalones BEBÉS', 'Pantalones para bebés', 'age', 'BEBÉS', 4, true),
       ('Accesorios BEBÉS', 'Accesorios para bebés', 'age', 'BEBÉS', 5, true),
       ('Calzado BEBÉS', 'Calzado para bebés', 'age', 'BEBÉS', 6, true)
ON CONFLICT DO NOTHING;

-- NIÑOS
INSERT INTO categories (name, description, group_type, age_range, display_order, active)
VALUES ('Remeras NIÑOS', 'Remeras para niños', 'age', 'NIÑOS', 1, true),
       ('Pantalones bermudas NIÑOS', 'Pantalones y bermudas para niños', 'age', 'NIÑOS', 2, true),
       ('Camperas NIÑOS', 'Camperas para niños', 'age', 'NIÑOS', 3, true),
       ('Accesorios NIÑOS', 'Accesorios para niños', 'age', 'NIÑOS', 4, true),
       ('Calzado NIÑOS', 'Calzado para niños', 'age', 'NIÑOS', 5, true)
ON CONFLICT DO NOTHING;

-- ADULTOS
INSERT INTO categories (name, description, group_type, age_range, display_order, active)
VALUES ('Remeras ADULTOS', 'Remeras para adultos', 'age', 'ADULTOS', 1, true),
       ('Camperas ADULTOS', 'Camperas para adultos', 'age', 'ADULTOS', 2, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- BACK TO SCHOOL
-- =====================================================
INSERT INTO categories (name, description, group_type, age_range, display_order, active)
VALUES ('Remeras BACK TO SCHOOL', 'Remeras para volver al colegio', 'back-to-school', NULL, 1, true),
       ('Buzos BACK TO SCHOOL', 'Buzos para volver al colegio', 'back-to-school', NULL, 2, true),
       ('Camperas BACK TO SCHOOL', 'Camperas para volver al colegio', 'back-to-school', NULL, 3, true),
       ('Pantalones BACK TO SCHOOL', 'Pantalones para volver al colegio', 'back-to-school', NULL, 4, true),
       ('Accesorios BACK TO SCHOOL', 'Accesorios para volver al colegio', 'back-to-school', NULL, 5, true),
       ('Calzado BACK TO SCHOOL', 'Calzado para volver al colegio', 'back-to-school', NULL, 6, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMENTARIOS Y NOTAS
-- =====================================================
-- Para filtrar productos por categoría:
-- 1. Los clientes pueden filtrar por grupo de menú (Calzado, Ropa, etc.)
-- 2. Por edad (BEBÉS, NIÑOS, ADULTOS)
-- 3. Por categorías específicas de BACK TO SCHOOL
-- 4. Las categorías de menú pueden tener subcategorías vinculadas por parent_id
-- =====================================================

