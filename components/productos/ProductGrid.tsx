import { Product } from '@/lib/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onAddToFavorites?: (productId: string) => void;
  favoriteIds?: string[];
}

export function ProductGrid({ products, onAddToFavorites, favoriteIds = [] }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-lg text-gray-600">No se encontraron productos</p>
      </div>
    );
  }

  return (
    <>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToFavorites={onAddToFavorites}
          isFavorite={favoriteIds.includes(product.id)}
        />
      ))}
    </>
  );
}

