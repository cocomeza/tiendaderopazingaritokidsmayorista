-- =====================================================
-- Agregar campos de empresa a la tabla profiles
-- =====================================================

-- Agregar campos de empresa si no existen
alter table profiles 
  add column if not exists company_name text,
  add column if not exists cuit text,
  add column if not exists billing_address text;

