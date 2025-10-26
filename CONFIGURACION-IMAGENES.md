# 📸 Configuración de Imágenes para Zingarito Kids

## 🎯 Resumen
Tu aplicación ya está preparada para manejar imágenes de productos. Solo necesitas configurar el almacenamiento en Supabase para que funcione completamente.

## ✅ Lo que ya está implementado

### 1. **Base de Datos**
- ✅ Campo `images` en la tabla `products` (array de URLs)
- ✅ Esquema preparado para almacenar múltiples imágenes por producto

### 2. **Interfaz de Usuario**
- ✅ Formulario de creación de productos con subida de imágenes
- ✅ Página de edición de productos con gestión de imágenes
- ✅ Componente `OptimizedImage` para mostrar imágenes con fallbacks
- ✅ Validación de tipos de archivo (JPG, PNG, WebP)
- ✅ Validación de tamaño máximo (5MB por imagen)
- ✅ Preview de imágenes antes de subir
- ✅ Posibilidad de eliminar imágenes existentes y nuevas

### 3. **Funcionalidades**
- ✅ Subida múltiple de imágenes
- ✅ Integración con Supabase Storage
- ✅ URLs públicas para las imágenes
- ✅ Gestión completa de imágenes en productos existentes

## 🔧 Configuración Pendiente

### Paso 1: Crear Bucket en Supabase
1. Ve al **Dashboard de Supabase** → **Storage**
2. Haz clic en **"Create Bucket"**
3. Configuración:
   - **Nombre**: `products`
   - **Público**: ✅ Sí (marcado)
   - **File size limit**: 5MB (opcional)
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp` (opcional)

### Paso 2: Configurar Políticas de Acceso
Ejecuta el archivo `supabase-storage-setup.sql` en el **SQL Editor** de Supabase:

```sql
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
```

## 🚀 Cómo usar las imágenes

### Para Administradores:

#### 1. **Crear Producto con Imágenes**
1. Ve a **Admin** → **Productos** → **Nuevo Producto**
2. Completa la información básica
3. En la sección **"Imágenes del Producto"**:
   - Haz clic en **"Seleccionar Imágenes"**
   - Elige una o múltiples imágenes
   - Ve el preview antes de subir
   - Haz clic en **"Crear Producto"**

#### 2. **Editar Imágenes de Producto Existente**
1. Ve a **Admin** → **Productos**
2. Haz clic en **"Editar"** en el producto que quieres modificar
3. En la sección **"Imágenes del Producto"**:
   - Ve las imágenes actuales
   - Elimina imágenes haciendo clic en la ❌
   - Agrega nuevas imágenes con **"Agregar Imágenes"**
   - Haz clic en **"Guardar Cambios"**

### Para Clientes:
- Las imágenes se muestran automáticamente en:
  - ✅ Lista de productos
  - ✅ Detalles del producto
  - ✅ Carrito de compras
  - ✅ Pedidos

## 📱 Características Técnicas

### **Formatos Soportados**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

### **Límites**
- **Tamaño máximo**: 5MB por imagen
- **Cantidad máxima**: 10 imágenes por producto
- **Resolución**: Sin límite (se optimiza automáticamente)

### **Optimizaciones**
- ✅ Carga lazy (solo cuando es necesario)
- ✅ Fallback para imágenes rotas
- ✅ Compresión automática
- ✅ URLs públicas optimizadas

## 🔍 Verificación

### Después de configurar Supabase:

1. **Crear un producto de prueba**:
   - Ve a Admin → Productos → Nuevo Producto
   - Completa los campos obligatorios
   - Sube una imagen de prueba
   - Guarda el producto

2. **Verificar que funciona**:
   - La imagen debe aparecer en la lista de productos
   - Debe ser visible para los clientes
   - Debe cargar correctamente

3. **Probar edición**:
   - Edita el producto creado
   - Agrega más imágenes
   - Elimina algunas imágenes
   - Guarda los cambios

## 🆘 Solución de Problemas

### **Error: "Bucket not found"**
- ✅ Verifica que el bucket `products` existe en Supabase Storage
- ✅ Asegúrate de que el nombre sea exactamente `products`

### **Error: "Permission denied"**
- ✅ Verifica que las políticas de Storage están configuradas
- ✅ Asegúrate de estar logueado como administrador

### **Error: "File too large"**
- ✅ Reduce el tamaño de la imagen (máximo 5MB)
- ✅ Usa herramientas online para comprimir imágenes

### **Imágenes no se muestran**
- ✅ Verifica que el bucket es público
- ✅ Revisa la consola del navegador para errores
- ✅ Asegúrate de que las URLs de las imágenes son válidas

## 📞 Soporte

Si tienes problemas con la configuración:
1. Revisa los logs en la consola del navegador
2. Verifica la configuración en Supabase Dashboard
3. Contacta al desarrollador con detalles específicos del error

---

**¡Listo!** 🎉 Una vez configurado Supabase Storage, tendrás un sistema completo de gestión de imágenes para tu tienda mayorista.
