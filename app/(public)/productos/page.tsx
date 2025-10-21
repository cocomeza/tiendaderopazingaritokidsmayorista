'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useProducts } from '@/lib/hooks/useProducts';
import { ProductFilter } from '@/components/productos/ProductFilter';
import { ProductGrid } from '@/components/productos/ProductGrid';
import { Select, Input } from '@/lib/ui-wrappers';
import { Loading } from '@/components/ui/Loading';
import { ProductFilters, ProductSortOption } from '@/lib/types';

export default function ProductosPage() {
  const searchParams = useSearchParams();
  
  // Obtener filtros iniciales desde URL
  const [filters, setFilters] = useState<ProductFilters>({
    category: searchParams.get('category') || null,
    gender: searchParams.get('gender') || null,
    featured: searchParams.get('featured') === 'true' || null,
    search: searchParams.get('search') || null,
  });
  
  const [sortBy, setSortBy] = useState<ProductSortOption>('newest');
  const [searchQuery, setSearchQuery] = useState(filters.search || '');

  // Cargar productos
  const { products, loading, error } = useProducts(filters, sortBy);

  // Actualizar búsqueda cuando cambia el query
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery !== filters.search) {
        setFilters(prev => ({ ...prev, search: searchQuery || null }));
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchQuery || null }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Catálogo de Productos
          </h1>
          
          {/* Búsqueda y Ordenamiento */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Buscador */}
            <div className="flex-1">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="search"
                  placeholder="Buscar productos por nombre, SKU o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                  fullWidth
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7B3FBD]"
                >
                  <Search size={20} />
                </button>
              </form>
            </div>

            {/* Ordenamiento */}
            <div className="w-full md:w-64">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as ProductSortOption)}
                options={[
                  { value: 'newest', label: 'Más nuevos' },
                  { value: 'price_asc', label: 'Precio: Menor a Mayor' },
                  { value: 'price_desc', label: 'Precio: Mayor a Menor' },
                  { value: 'name_asc', label: 'Nombre: A-Z' },
                  { value: 'name_desc', label: 'Nombre: Z-A' },
                ]}
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Grid con Filtros y Productos */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtros (Sidebar) */}
          <div className="lg:col-span-1">
            <ProductFilter filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Lista de Productos */}
          <div className="lg:col-span-3">
            {/* Contador de resultados */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                {loading ? (
                  'Cargando productos...'
                ) : (
                  <span>
                    <span className="font-semibold text-gray-900">
                      {products.length}
                    </span>{' '}
                    producto{products.length !== 1 ? 's' : ''} encontrado
                    {products.length !== 1 ? 's' : ''}
                  </span>
                )}
              </p>
            </div>

            {/* Grid de Productos */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loading size="lg" text="Cargando productos..." />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 font-medium">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <ProductGrid products={products} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

