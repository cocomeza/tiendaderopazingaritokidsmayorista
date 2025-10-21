'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/hooks/useCart';
import { Button, Alert } from '@/lib/ui-wrappers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils/formatters';

export default function CarritoPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
    getTotal,
    getItemCount,
    isMinQuantityMet,
  } = useCart();

  const minQuantity = 5;
  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const total = getTotal();
  const canCheckout = isMinQuantityMet(minQuantity);
  const remainingItems = Math.max(0, minQuantity - itemCount);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/carrito');
      return;
    }

    if (!canCheckout) {
      return;
    }

    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="text-center py-16">
              <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Tu carrito está vacío
              </h2>
              <p className="text-gray-600 mb-6">
                Empezá a comprar y agregá productos a tu carrito
              </p>
              <Link href="/productos">
                <Button variant="primary" size="lg">
                  Ver Catálogo
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Carrito de Compras
          </h1>
          <p className="mt-2 text-gray-600">
            Revisá tus productos antes de finalizar la compra
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Productos */}
          <div className="lg:col-span-2 space-y-4">
            {/* Alerta de Compra Mayorista */}
            {!canCheckout && (
              <Alert variant="warning">
                <div className="font-semibold mb-1">Pedido mínimo: 5 productos</div>
                <p>
                  Te {remainingItems === 1 ? 'falta' : 'faltan'}{' '}
                  <strong>{remainingItems}</strong>{' '}
                  producto{remainingItems !== 1 ? 's' : ''} para alcanzar el mínimo mayorista.
                </p>
              </Alert>
            )}

            {canCheckout && (
              <Alert variant="success">
                ¡Perfecto! Ya alcanzaste el mínimo de compra mayorista.
              </Alert>
            )}

            {/* Items del Carrito */}
            {items.map((item) => (
              <Card key={`${item.product_id}-${item.size}-${item.color}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Imagen del Producto */}
                    <Link
                      href={`/productos/${item.product_id}`}
                      className="flex-shrink-0"
                    >
                      <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                        {item.product.images && item.product.images.length > 0 ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="text-gray-400" size={32} />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Info del Producto */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/productos/${item.product_id}`}>
                        <h3 className="font-bold text-lg text-gray-900 hover:text-[#7B3FBD] transition-colors line-clamp-1">
                          {item.product.name}
                        </h3>
                      </Link>
                      
                      <div className="mt-1 text-sm text-gray-600 space-y-1">
                        {item.size && <p>Talle: {item.size}</p>}
                        {item.color && <p>Color: {item.color}</p>}
                        <p className="font-semibold text-[#7B3FBD]">
                          {formatPrice(item.unit_price)} c/u
                        </p>
                      </div>

                      {/* Controles de Cantidad */}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product_id,
                                item.size,
                                item.color,
                                item.quantity - 1
                              )
                            }
                            className="w-8 h-8 rounded border-2 border-gray-300 hover:border-[#7B3FBD] flex items-center justify-center transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product_id,
                                item.size,
                                item.color,
                                item.quantity + 1
                              )
                            }
                            className="w-8 h-8 rounded border-2 border-gray-300 hover:border-[#7B3FBD] flex items-center justify-center transition-colors"
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button
                          onClick={() =>
                            removeItem(item.product_id, item.size, item.color)
                          }
                          className="ml-auto text-red-600 hover:text-red-700 transition-colors p-2"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal del Item */}
                    <div className="hidden sm:flex flex-col items-end justify-between">
                      <p className="text-xl font-bold text-gray-900">
                        {formatPrice(item.unit_price * item.quantity)}
                      </p>
                    </div>
                  </div>

                  {/* Subtotal Mobile */}
                  <div className="sm:hidden mt-3 pt-3 border-t border-gray-200 flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(item.unit_price * item.quantity)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Botón Vaciar Carrito */}
            <div className="flex justify-end">
              <Button variant="ghost" onClick={clearCart}>
                <Trash2 size={16} className="mr-2" />
                Vaciar Carrito
              </Button>
            </div>
          </div>

          {/* Resumen del Pedido */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Detalles */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Productos ({itemCount}):</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Descuentos:</span>
                    <span className="font-medium text-green-600">$0</span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-2xl font-extrabold text-[#7B3FBD]">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Botón Finalizar Compra */}
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleCheckout}
                  disabled={!canCheckout}
                >
                  Finalizar Compra
                  <ArrowRight className="ml-2" size={20} />
                </Button>

                {!isAuthenticated && (
                  <p className="text-xs text-center text-gray-500">
                    Necesitás iniciar sesión para continuar
                  </p>
                )}

                {/* Seguir Comprando */}
                <Link href="/productos">
                  <Button variant="secondary" fullWidth>
                    Seguir Comprando
                  </Button>
                </Link>

                {/* Info Adicional */}
                <div className="pt-4 border-t border-gray-200 text-xs text-gray-600 space-y-2">
                  <p>✓ Compra mínima: 5 productos</p>
                  <p>✓ Precios mayoristas</p>
                  <p>✓ Envíos a todo el país</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

