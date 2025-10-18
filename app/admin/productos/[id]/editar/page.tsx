'use client';

import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ProductForm } from '@/components/admin/ProductForm';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { Product } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditarProductoPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Producto no encontrado');

      setProduct(data);
    } catch (err: any) {
      console.error('Error loading product:', err);
      setError(err.message || 'Error al cargar producto');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading size="lg" text="Cargando producto..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        <Alert variant="error">{error || 'Producto no encontrado'}</Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Editar Producto</h1>
        <p className="text-gray-600 mt-1">Modificá la información del producto</p>
      </div>

      <ProductForm mode="edit" product={product} />
    </div>
  );
}

