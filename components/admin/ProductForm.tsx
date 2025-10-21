'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button, Input, Textarea, Select, Alert } from '@/lib/ui-wrappers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Product, CATEGORIES, GENDERS, AGE_RANGES, SIZES } from '@/lib/types';
import { generateSKU } from '@/lib/utils/formatters';
import { X, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface ProductFormProps {
  product?: Product | null;
  mode: 'create' | 'edit';
}

export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    sku: product?.sku || '',
    price: product?.price || 0,
    wholesale_price: product?.wholesale_price || 0,
    stock: product?.stock || 0,
    low_stock_threshold: product?.low_stock_threshold || 10,
    category: product?.category || '',
    subcategory: product?.subcategory || '',
    gender: product?.gender || '',
    age_range: product?.age_range || '',
    featured: product?.featured || false,
    active: product?.active ?? true,
  });

  const [selectedSizes, setSelectedSizes] = useState<string[]>(product?.sizes || []);
  const [colors, setColors] = useState<string[]>(product?.colors || []);
  const [newColor, setNewColor] = useState('');
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [imagePreviews, setImagePreviews] = useState<string[]>(product?.images || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validaciones
      if (!formData.name) {
        toast.error('El nombre es requerido');
        return;
      }
      if (formData.price <= 0) {
        toast.error('El precio debe ser mayor a 0');
        return;
      }

      // Generar SKU si no existe
      let sku = formData.sku;
      if (!sku) {
        sku = generateSKU(formData.name, formData.category);
      }

      const productData = {
        ...formData,
        sku,
        wholesale_price: formData.wholesale_price || formData.price,
        sizes: selectedSizes.length > 0 ? selectedSizes : null,
        colors: colors.length > 0 ? colors : null,
        images: images.length > 0 ? images : null,
      };

      if (mode === 'create') {
        const { error } = await supabase.from('products').insert(productData);
        if (error) throw error;
        toast.success('Producto creado exitosamente');
      } else {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product!.id);
        if (error) throw error;
        toast.success('Producto actualizado exitosamente');
      }

      router.push('/admin/productos');
      router.refresh();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error('Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 5) {
      toast.error('Máximo 5 imágenes por producto');
      return;
    }

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten imágenes');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Las imágenes no pueden superar 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreviews(prev => [...prev, result]);
        // En producción, aquí subirías a Supabase Storage
        // Por ahora guardamos el data URL
        setImages(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const addColor = () => {
    if (newColor && !colors.includes(newColor)) {
      setColors(prev => [...prev, newColor]);
      setNewColor('');
    }
  };

  const removeColor = (color: string) => {
    setColors(prev => prev.filter(c => c !== color));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Nombre del Producto"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            fullWidth
          />

          <Textarea
            label="Descripción"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
            fullWidth
          />

          <Input
            label="SKU"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            helperText="Dejar vacío para generar automáticamente"
            fullWidth
          />
        </CardContent>
      </Card>

      {/* Categorización */}
      <Card>
        <CardHeader>
          <CardTitle>Categorización</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Categoría"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              options={[
                { value: '', label: 'Seleccionar categoría' },
                ...CATEGORIES.map(c => ({ value: c, label: c })),
              ]}
              fullWidth
              required
            />

            <Input
              label="Subcategoría"
              value={formData.subcategory}
              onChange={(e) =>
                setFormData({ ...formData, subcategory: e.target.value })
              }
              placeholder="Ej: Remeras, Pantalones"
              fullWidth
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Género"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={[
                { value: '', label: 'Seleccionar género' },
                ...GENDERS.map(g => ({ 
                  value: g, 
                  label: g.charAt(0).toUpperCase() + g.slice(1) 
                })),
              ]}
              fullWidth
            />

            <Select
              label="Rango de Edad"
              value={formData.age_range}
              onChange={(e) =>
                setFormData({ ...formData, age_range: e.target.value })
              }
              options={[
                { value: '', label: 'Seleccionar edad' },
                ...AGE_RANGES.map(r => ({ value: r, label: `${r} años` })),
              ]}
              fullWidth
            />
          </div>
        </CardContent>
      </Card>

      {/* Precios y Stock */}
      <Card>
        <CardHeader>
          <CardTitle>Precios y Stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Precio"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
              }
              required
              fullWidth
            />

            <Input
              label="Precio Mayorista"
              type="number"
              step="0.01"
              value={formData.wholesale_price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  wholesale_price: parseFloat(e.target.value) || 0,
                })
              }
              helperText="Dejar en 0 para usar precio normal"
              fullWidth
            />

            <Input
              label="Stock"
              type="number"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
              }
              required
              fullWidth
            />
          </div>

          <Input
            label="Umbral de Stock Bajo"
            type="number"
            value={formData.low_stock_threshold}
            onChange={(e) =>
              setFormData({
                ...formData,
                low_stock_threshold: parseInt(e.target.value) || 10,
              })
            }
            helperText="Se mostrará alerta cuando el stock sea menor o igual a este valor"
            fullWidth
          />
        </CardContent>
      </Card>

      {/* Talles */}
      <Card>
        <CardHeader>
          <CardTitle>Talles Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  selectedSizes.includes(size)
                    ? 'bg-[#7B3FBD] border-[#7B3FBD] text-white'
                    : 'border-gray-300 text-gray-700 hover:border-[#7B3FBD]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Colores */}
      <Card>
        <CardHeader>
          <CardTitle>Colores Disponibles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              placeholder="Ej: Rojo, Azul, Negro"
              fullWidth
            />
            <Button type="button" onClick={addColor} variant="secondary">
              Agregar
            </Button>
          </div>

          {colors.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <span
                  key={color}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full"
                >
                  {color}
                  <button
                    type="button"
                    onClick={() => removeColor(color)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Imágenes */}
      <Card>
        <CardHeader>
          <CardTitle>Imágenes (Máximo 5)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {imagePreviews.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`Preview ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {images.length < 5 && (
            <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#7B3FBD] transition-colors block">
              <Upload className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-sm text-gray-600 mb-1">
                Click para subir imágenes
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG hasta 5MB ({5 - images.length} restantes)
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </CardContent>
      </Card>

      {/* Opciones */}
      <Card>
        <CardHeader>
          <CardTitle>Opciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) =>
                setFormData({ ...formData, featured: e.target.checked })
              }
              className="w-5 h-5 text-[#7B3FBD] rounded focus:ring-[#7B3FBD]"
            />
            <div>
              <p className="font-medium">Producto Destacado</p>
              <p className="text-sm text-gray-600">
                Aparecerá en la home y sección destacados
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) =>
                setFormData({ ...formData, active: e.target.checked })
              }
              className="w-5 h-5 text-[#7B3FBD] rounded focus:ring-[#7B3FBD]"
            />
            <div>
              <p className="font-medium">Producto Activo</p>
              <p className="text-sm text-gray-600">
                Visible en el catálogo público
              </p>
            </div>
          </label>
        </CardContent>
      </Card>

      {/* Botones */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={loading} fullWidth>
          {mode === 'create' ? 'Crear Producto' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
}

