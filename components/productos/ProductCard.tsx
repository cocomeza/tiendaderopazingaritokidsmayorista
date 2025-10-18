import Link from 'next/link';
import { ShoppingBag, Heart } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils/formatters';

interface ProductCardProps {
  product: Product;
  onAddToFavorites?: (productId: string) => void;
  isFavorite?: boolean;
}

export function ProductCard({ product, onAddToFavorites, isFavorite = false }: ProductCardProps) {
  const displayPrice = product.wholesale_price || product.price;
  const hasDiscount = product.wholesale_price && product.wholesale_price < product.price;

  return (
    <Card hover padding="none" className="overflow-hidden relative group">
      <Link href={`/productos/${product.id}`}>
        {/* Imagen del Producto */}
        <div className="relative aspect-square bg-gray-200 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover product-image"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ShoppingBag size={64} />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.category && (
              <Badge variant="primary">{product.category}</Badge>
            )}
            {hasDiscount && <Badge variant="warning">¡OFERTA!</Badge>}
            {product.stock === 0 && (
              <Badge variant="danger">SIN STOCK</Badge>
            )}
            {product.stock > 0 && product.stock <= product.low_stock_threshold && (
              <Badge variant="warning">Últimas unidades</Badge>
            )}
          </div>

          {/* Botón de favoritos */}
          {onAddToFavorites && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToFavorites(product.id);
              }}
              className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                isFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
              }`}
              aria-label="Agregar a favoritos"
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        {/* Info del Producto */}
        <div className="p-4 space-y-2">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 min-h-[3.5rem]">
            {product.name}
          </h3>

          {product.sku && (
            <p className="text-xs text-gray-500">SKU: {product.sku}</p>
          )}

          <div className="flex items-baseline gap-2">
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            )}
            <p className="text-2xl font-extrabold text-[#7B3FBD]">
              {formatPrice(displayPrice)}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Stock: <span className="font-semibold">{product.stock}</span>
            </span>
            {product.sizes && product.sizes.length > 0 && (
              <span className="text-gray-600">
                Talles: {product.sizes.slice(0, 3).join(', ')}
                {product.sizes.length > 3 && '...'}
              </span>
            )}
          </div>

          {/* Botón Ver Detalle (aparece al hover) */}
          <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="w-full bg-[#7B3FBD] hover:bg-[#5A2C8F] text-white py-2 rounded-lg font-medium transition-colors">
              Ver Detalle
            </button>
          </div>
        </div>
      </Link>
    </Card>
  );
}

