'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button, Input, Select } from '@/lib/ui-wrappers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/Loading';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils/formatters';
import { Plus, Search, Edit, Trash2, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductosAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Estados para actualización masiva de precios
  const [priceUpdateModalOpen, setPriceUpdateModalOpen] = useState(false);
  const [priceAdjustment, setPriceAdjustment] = useState<number>(0);
  const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease'>('increase');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [updatingPrices, setUpdatingPrices] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id);

      if (error) throw error;

      toast.success('Producto eliminado');
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar producto');
    } finally {
      setDeleting(false);
    }
  };

  // Obtener todas las categorías únicas
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [products]);

  // Productos que se verán afectados por la actualización de precios
  const productsToUpdate = useMemo(() => {
    if (selectedCategory === 'all') {
      return products;
    }
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  // Calcular vista previa de cambios
  const pricePreview = useMemo(() => {
    const multiplier = adjustmentType === 'increase' 
      ? 1 + (priceAdjustment / 100)
      : 1 - (priceAdjustment / 100);

    return productsToUpdate.slice(0, 5).map(product => ({
      ...product,
      oldPrice: product.price,
      newPrice: Math.round(product.price * multiplier * 100) / 100,
      oldWholesalePrice: product.wholesale_price,
      newWholesalePrice: product.wholesale_price 
        ? Math.round(product.wholesale_price * multiplier * 100) / 100
        : null,
    }));
  }, [productsToUpdate, priceAdjustment, adjustmentType]);

  const handlePriceUpdate = async () => {
    if (priceAdjustment <= 0 || priceAdjustment > 100) {
      toast.error('El porcentaje debe estar entre 0 y 100');
      return;
    }

    if (productsToUpdate.length === 0) {
      toast.error('No hay productos para actualizar');
      return;
    }

    setUpdatingPrices(true);
    try {
      const multiplier = adjustmentType === 'increase' 
        ? 1 + (priceAdjustment / 100)
        : 1 - (priceAdjustment / 100);

      // Actualizar cada producto
      const updates = productsToUpdate.map(product => {
        const newPrice = Math.round(product.price * multiplier * 100) / 100;
        const newWholesalePrice = product.wholesale_price
          ? Math.round(product.wholesale_price * multiplier * 100) / 100
          : null;

        return supabase
          .from('products')
          .update({
            price: newPrice,
            wholesale_price: newWholesalePrice || newPrice,
            updated_at: new Date().toISOString(),
          })
          .eq('id', product.id);
      });

      // Ejecutar todas las actualizaciones
      const results = await Promise.all(updates);
      
      // Verificar si hubo errores
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        throw new Error('Error al actualizar algunos productos');
      }

      toast.success(`✅ ${productsToUpdate.length} productos actualizados exitosamente`);
      
      // Recargar productos
      await loadProducts();
      
      // Cerrar modal y resetear valores
      setPriceUpdateModalOpen(false);
      setPriceAdjustment(0);
      setSelectedCategory('all');
    } catch (error: any) {
      console.error('Error updating prices:', error);
      toast.error('Error al actualizar precios');
    } finally {
      setUpdatingPrices(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading size="lg" text="Cargando productos..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Productos</h1>
          <p className="text-gray-600 mt-1">Gestiona el catálogo de productos</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => setPriceUpdateModalOpen(true)}
            disabled={products.length === 0}
          >
            <TrendingUp size={20} className="mr-2" />
            Actualizar Precios
          </Button>
          <Link href="/admin/productos/nuevo">
            <Button variant="primary" size="lg">
              <Plus size={20} className="mr-2" />
              Nuevo Producto
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="search"
            placeholder="Buscar por nombre, SKU o categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            fullWidth
          />
        </div>
      </Card>

      {/* Products Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {searchQuery ? 'No se encontraron productos' : 'No hay productos todavía'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0">
                          {product.images?.[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.sku || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="default">{product.category || 'Sin categoría'}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatPrice(product.wholesale_price || product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={product.stock > product.low_stock_threshold ? 'success' : 'warning'}>
                        {product.stock}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={product.active ? 'success' : 'danger'}>
                        {product.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/productos/${product.id}`} target="_blank">
                          <button
                            className="text-gray-600 hover:text-[#7B3FBD] p-2"
                            title="Ver producto"
                          >
                            <Eye size={18} />
                          </button>
                        </Link>
                        <Link href={`/admin/productos/${product.id}/editar`}>
                          <button
                            className="text-blue-600 hover:text-blue-700 p-2"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="text-red-600 hover:text-red-700 p-2"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Producto</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 mb-4">
            ¿Estás seguro que querés eliminar el producto{' '}
            <strong>{productToDelete?.name}</strong>? Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Price Update Modal */}
      <Dialog open={priceUpdateModalOpen} onOpenChange={setPriceUpdateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Actualizar Precios Masivamente</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Tipo de ajuste */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Ajuste
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setAdjustmentType('increase')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    adjustmentType === 'increase'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className={adjustmentType === 'increase' ? 'text-green-600' : 'text-gray-400'} />
                    <span className={`font-semibold ${adjustmentType === 'increase' ? 'text-green-700' : 'text-gray-600'}`}>
                      Aumentar
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setAdjustmentType('decrease')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    adjustmentType === 'decrease'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <TrendingDown className={adjustmentType === 'decrease' ? 'text-red-600' : 'text-gray-400'} />
                    <span className={`font-semibold ${adjustmentType === 'decrease' ? 'text-red-700' : 'text-gray-600'}`}>
                      Disminuir
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Porcentaje */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Porcentaje de Ajuste (%)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={priceAdjustment || ''}
                onChange={(e) => setPriceAdjustment(parseFloat(e.target.value) || 0)}
                placeholder="Ej: 3, 5, 10"
                fullWidth
              />
              <p className="text-sm text-gray-500 mt-1">
                Ingresá el porcentaje que querés {adjustmentType === 'increase' ? 'aumentar' : 'disminuir'}
              </p>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                fullWidth
              >
                <option value="all">Todas las categorías ({products.length} productos)</option>
                {categories.map(category => {
                  const count = products.filter(p => p.category === category).length;
                  return (
                    <option key={category} value={category}>
                      {category} ({count} productos)
                    </option>
                  );
                })}
              </Select>
            </div>

            {/* Vista Previa */}
            {priceAdjustment > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">
                  Vista Previa ({productsToUpdate.length} productos se actualizarán)
                </h4>
                <div className="space-y-2">
                  {pricePreview.map((item) => (
                    <div key={item.id} className="bg-white rounded p-3 text-sm">
                      <div className="font-medium text-gray-900 mb-1">{item.name}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">
                          {formatPrice(item.oldPrice)} → <strong className={adjustmentType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                            {formatPrice(item.newPrice)}
                          </strong>
                        </span>
                        <Badge variant={adjustmentType === 'increase' ? 'success' : 'warning'}>
                          {adjustmentType === 'increase' ? '+' : '-'}{priceAdjustment}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {productsToUpdate.length > 5 && (
                    <p className="text-xs text-gray-500 text-center pt-2">
                      ... y {productsToUpdate.length - 5} productos más
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Advertencia */}
            {priceAdjustment > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Atención:</strong> Esta acción modificará los precios de{' '}
                  <strong>{productsToUpdate.length} productos</strong>. Los cambios se aplicarán inmediatamente.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setPriceUpdateModalOpen(false);
                setPriceAdjustment(0);
                setSelectedCategory('all');
              }}
              disabled={updatingPrices}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handlePriceUpdate}
              disabled={updatingPrices || priceAdjustment <= 0}
            >
              {updatingPrices ? 'Actualizando...' : `Actualizar ${productsToUpdate.length} Productos`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

