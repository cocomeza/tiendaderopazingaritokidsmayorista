'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, ShoppingCart, Share2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/hooks/useCart';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils/formatters';
import toast from 'react-hot-toast';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [resolvedParams.id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Producto no encontrado');

      setProduct(data);
      
      // Pre-seleccionar primer talle y color si existen
      if (data.sizes && data.sizes.length > 0) {
        setSelectedSize(data.sizes[0]);
      }
      if (data.colors && data.colors.length > 0) {
        setSelectedColor(data.colors[0]);
      }
    } catch (err: any) {
      console.error('Error loading product:', err);
      setError(err.message || 'Error al cargar producto');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.stock === 0) {
      toast.error('Producto sin stock');
      return;
    }

    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      toast.error('Por favor selecciona un talle');
      return;
    }

    if (!selectedColor && product.colors && product.colors.length > 0) {
      toast.error('Por favor selecciona un color');
      return;
    }

    if (quantity > product.stock) {
      toast.error(`Solo hay ${product.stock} unidades disponibles`);
      return;
    }

    addItem(product, selectedSize, selectedColor, quantity);
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para agregar favoritos');
      router.push('/auth/login');
      return;
    }

    // TODO: Implementar lógica de favoritos con Supabase
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description || '',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Copiar al portapapeles
      navigator.clipboard.writeText(window.location.href);
      toast.success('¡Link copiado al portapapeles!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Cargando producto..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Alert variant="error">{error || 'Producto no encontrado'}</Alert>
          <Link href="/productos">
            <Button variant="primary">
              <ArrowLeft className="mr-2" size={20} />
              Volver al Catálogo
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const displayPrice = product.wholesale_price || product.price;
  const hasDiscount = product.wholesale_price && product.wholesale_price < product.price;
  const images = product.images && product.images.length > 0 ? product.images : ['/placeholder-product.jpg'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/productos"
            className="flex items-center gap-2 text-gray-600 hover:text-[#7B3FBD] transition-colors"
          >
            <ArrowLeft size={20} />
            Volver al Catálogo
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galería de Imágenes */}
          <div className="space-y-4">
            {/* Imagen Principal */}
            <Card padding="none" className="overflow-hidden">
              <div className="relative aspect-square bg-gray-200">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.category && (
                    <Badge variant="primary">{product.category}</Badge>
                  )}
                  {hasDiscount && <Badge variant="warning">¡OFERTA!</Badge>}
                  {product.stock === 0 && (
                    <Badge variant="danger">SIN STOCK</Badge>
                  )}
                </div>

                {/* Botones de Acción */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={handleToggleFavorite}
                    className={`p-3 rounded-full transition-colors ${
                      isFavorite
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            </Card>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-[#7B3FBD]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del Producto */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                {product.name}
              </h1>
              {product.sku && (
                <p className="text-sm text-gray-500">SKU: {product.sku}</p>
              )}
            </div>

            {/* Precio */}
            <div>
              <div className="flex items-baseline gap-3">
                {hasDiscount && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
                <span className="text-4xl font-extrabold text-[#7B3FBD]">
                  {formatPrice(displayPrice)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Precio mayorista (compra mínima 5 productos)
              </p>
            </div>

            {/* Stock */}
            <div>
              <Badge variant={product.stock > product.low_stock_threshold ? 'success' : 'warning'}>
                {product.stock > 0 ? `${product.stock} unidades disponibles` : 'Sin stock'}
              </Badge>
            </div>

            {/* Descripción */}
            {product.description && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Descripción</h2>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Selección de Talle */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Talle *
                </label>
                <Select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  options={product.sizes.map((size) => ({
                    value: size,
                    label: `Talle ${size}`,
                  }))}
                  fullWidth
                />
              </div>
            )}

            {/* Selección de Color */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Color *
                </label>
                <Select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  options={product.colors.map((color) => ({
                    value: color,
                    label: color,
                  }))}
                  fullWidth
                />
              </div>
            )}

            {/* Cantidad */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Cantidad
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-[#7B3FBD] font-bold transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#7B3FBD]"
                  min="1"
                  max={product.stock}
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-[#7B3FBD] font-bold transition-colors"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Botón Agregar al Carrito */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2" size={20} />
              {product.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
            </Button>

            {/* Información Adicional */}
            <Card>
              <CardContent className="space-y-2 text-sm text-gray-600">
                {product.category && (
                  <div className="flex justify-between">
                    <span>Categoría:</span>
                    <span className="font-medium text-gray-900">{product.category}</span>
                  </div>
                )}
                {product.gender && (
                  <div className="flex justify-between">
                    <span>Género:</span>
                    <span className="font-medium text-gray-900 capitalize">{product.gender}</span>
                  </div>
                )}
                {product.age_range && (
                  <div className="flex justify-between">
                    <span>Edad:</span>
                    <span className="font-medium text-gray-900">{product.age_range} años</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

