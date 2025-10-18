import { ProductForm } from '@/components/admin/ProductForm';

export default function NuevoProductoPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Nuevo Producto</h1>
        <p className="text-gray-600 mt-1">Agregá un nuevo producto al catálogo</p>
      </div>

      <ProductForm mode="create" />
    </div>
  );
}

