'use client';

import { useState } from 'react';
import { X, Filter } from 'lucide-react';
import { Button, Select, Input } from '@/lib/ui-wrappers';
import { Card } from '@/components/ui/card';
import { ProductFilters, CATEGORIES, GENDERS, AGE_RANGES, SIZES } from '@/lib/types';

interface ProductFilterProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
}

export function ProductFilter({ filters, onFiltersChange }: ProductFilterProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value || null,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== null && v !== undefined && v !== '');

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categoría */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Categoría
        </label>
        <Select
          value={filters.category || ''}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          options={[
            { value: '', label: 'Todas' },
            ...CATEGORIES.map((cat) => ({ value: cat, label: cat })),
          ]}
          fullWidth
        />
      </div>

      {/* Género */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Género
        </label>
        <Select
          value={filters.gender || ''}
          onChange={(e) => handleFilterChange('gender', e.target.value)}
          options={[
            { value: '', label: 'Todos' },
            ...GENDERS.map((g) => ({ 
              value: g, 
              label: g.charAt(0).toUpperCase() + g.slice(1) 
            })),
          ]}
          fullWidth
        />
      </div>

      {/* Rango de Edad */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Edad
        </label>
        <Select
          value={filters.age_range || ''}
          onChange={(e) => handleFilterChange('age_range', e.target.value)}
          options={[
            { value: '', label: 'Todas las edades' },
            ...AGE_RANGES.map((range) => ({ 
              value: range, 
              label: `${range} años` 
            })),
          ]}
          fullWidth
        />
      </div>

      {/* Talle */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Talle
        </label>
        <Select
          value={filters.size || ''}
          onChange={(e) => handleFilterChange('size', e.target.value)}
          options={[
            { value: '', label: 'Todos los talles' },
            ...SIZES.map((size) => ({ value: size, label: size })),
          ]}
          fullWidth
        />
      </div>

      {/* Rango de Precio */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-3">
          Precio
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            placeholder="Mín"
            value={filters.min_price || ''}
            onChange={(e) => handleFilterChange('min_price', e.target.value ? Number(e.target.value) : null)}
            fullWidth
          />
          <Input
            type="number"
            placeholder="Máx"
            value={filters.max_price || ''}
            onChange={(e) => handleFilterChange('max_price', e.target.value ? Number(e.target.value) : null)}
            fullWidth
          />
        </div>
      </div>

      {/* Destacados */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.featured || false}
            onChange={(e) => handleFilterChange('featured', e.target.checked || null)}
            className="h-4 w-4 text-[#7B3FBD] focus:ring-[#7B3FBD] border-gray-300 rounded"
          />
          <span className="text-sm font-medium text-gray-900">
            Solo destacados
          </span>
        </label>
      </div>

      {/* Limpiar Filtros */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          fullWidth
          onClick={clearFilters}
        >
          <X size={16} className="mr-2" />
          Limpiar Filtros
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Filtros</h2>
            <FilterContent />
          </div>
        </Card>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden fixed bottom-6 left-6 z-40">
        <Button
          variant="primary"
          size="lg"
          onClick={() => setShowMobileFilters(true)}
          className="shadow-lg"
        >
          <Filter size={20} className="mr-2" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-2 bg-white text-[#7B3FBD] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              !
            </span>
          )}
        </Button>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <FilterContent />
              <div className="mt-6">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setShowMobileFilters(false)}
                >
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

