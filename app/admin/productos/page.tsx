'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils/formatters';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductosAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

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
        <Link href="/admin/productos/nuevo">
          <Button variant="primary" size="lg">
            <Plus size={20} className="mr-2" />
            Nuevo Producto
          </Button>
        </Link>
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Eliminar Producto"
      >
        <p className="text-gray-600 mb-4">
          ¿Estás seguro que querés eliminar el producto{' '}
          <strong>{productToDelete?.name}</strong>? Esta acción no se puede deshacer.
        </p>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setDeleteModalOpen(false)}
            disabled={deleting}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            loading={deleting}
          >
            Eliminar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

