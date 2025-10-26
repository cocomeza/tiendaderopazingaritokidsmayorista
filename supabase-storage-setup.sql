-- =====================================================
-- CONFIGURACIÓN DE SUPABASE STORAGE PARA ZINGARITO KIDS
-- =====================================================
-- Script para configurar el bucket de imágenes de productos
-- y las políticas de acceso necesarias

-- =====================================================
-- 1. CREAR BUCKET PARA IMÁGENES DE PRODUCTOS
-- =====================================================
-- Ejecutar desde el Dashboard de Supabase > Storage > Create Bucket
-- Nombre: products
-- Público: Sí (para que las imágenes sean accesibles públicamente)

-- =====================================================
-- 2. POLÍTICAS DE ACCESO PARA EL BUCKET 'products'
-- =====================================================

-- Permitir lectura pública de todas las imágenes
CREATE POLICY "Public Access for Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Permitir que solo los administradores suban imágenes
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Permitir que solo los administradores actualicen imágenes
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Permitir que solo los administradores eliminen imágenes
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- =====================================================
-- 3. CONFIGURACIÓN ADICIONAL RECOMENDADA
-- =====================================================

-- Configurar límites de tamaño de archivo (opcional)
-- Esto se puede hacer desde el Dashboard de Supabase
-- Recomendado: máximo 5MB por imagen

-- Configurar tipos de archivo permitidos (opcional)
-- Esto se puede hacer desde el Dashboard de Supabase
-- Recomendado: image/jpeg, image/jpg, image/png, image/webp

-- =====================================================
-- 4. VERIFICACIÓN
-- =====================================================

-- Para verificar que las políticas están funcionando:
-- 1. Ir al Dashboard de Supabase > Storage > products
-- 2. Intentar subir una imagen (debe funcionar si eres admin)
-- 3. Verificar que las imágenes son accesibles públicamente

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

-- 1. Este script debe ejecutarse DESPUÉS de crear el bucket 'products'
-- 2. Asegúrate de que el usuario actual tenga permisos de administrador
-- 3. Las imágenes se almacenarán en la ruta: products/product-images/
-- 4. Las URLs públicas seguirán el formato: 
--    https://[project-id].supabase.co/storage/v1/object/public/products/product-images/[filename]

-- =====================================================
-- COMANDOS ALTERNATIVOS (si prefieres usar SQL directo)
-- =====================================================

-- Si prefieres crear el bucket desde SQL (requiere permisos especiales):
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('products', 'products', true);

-- Pero es más fácil y seguro hacerlo desde el Dashboard de Supabase
