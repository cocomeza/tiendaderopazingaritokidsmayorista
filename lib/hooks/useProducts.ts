'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Product, ProductFilters, ProductSortOption } from '@/lib/types';
import toast from 'react-hot-toast';

export function useProducts(
  filters: ProductFilters = {},
  sortBy: ProductSortOption = 'newest',
  limit?: number
) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [filters, sortBy, limit]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('products')
        .select('*')
        .eq('active', true);

      // Aplicar filtros
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.subcategory) {
        query = query.eq('subcategory', filters.subcategory);
      }
      if (filters.gender) {
        query = query.eq('gender', filters.gender);
      }
      if (filters.age_range) {
        query = query.eq('age_range', filters.age_range);
      }
      if (filters.featured !== null && filters.featured !== undefined) {
        query = query.eq('featured', filters.featured);
      }
      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }
      if (filters.min_price !== null && filters.min_price !== undefined) {
        query = query.gte('price', filters.min_price);
      }
      if (filters.max_price !== null && filters.max_price !== undefined) {
        query = query.lte('price', filters.max_price);
      }

      // Aplicar ordenamiento
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'name_asc':
          query = query.order('name', { ascending: true });
          break;
        case 'name_desc':
          query = query.order('name', { ascending: false });
          break;
      }

      // Aplicar límite
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      // Filtrar por talle y color en el cliente (porque son arrays)
      let filteredData = data || [];

      if (filters.size) {
        filteredData = filteredData.filter(
          product => product.sizes && product.sizes.includes(filters.size!)
        );
      }

      if (filters.color) {
        filteredData = filteredData.filter(
          product => product.colors && product.colors.includes(filters.color!)
        );
      }

      setProducts(filteredData);
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError(err.message || 'Error al cargar productos');
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = () => {
    loadProducts();
  };

  return {
    products,
    loading,
    error,
    refreshProducts,
  };
}

