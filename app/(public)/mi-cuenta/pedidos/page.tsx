'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { ORDER_STATUSES, PAYMENT_STATUSES, Order, OrderItem } from '@/lib/types';
import { formatDate, formatPrice } from '@/lib/utils/formatters';
import { Package, User, Heart } from 'lucide-react';
import Link from 'next/link';

export default function MisPedidosPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = ORDER_STATUSES.find((s) => s.value === status);
    if (!statusInfo) return null;

    const variantMap: Record<string, any> = {
      yellow: 'warning',
      blue: 'info',
      purple: 'primary',
      indigo: 'primary',
      green: 'success',
      red: 'danger',
    };

    return (
      <Badge variant={variantMap[statusInfo.color] || 'default'}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getPaymentBadge = (status: string) => {
    const statusInfo = PAYMENT_STATUSES.find((s) => s.value === status);
    if (!statusInfo) return null;

    const variantMap: Record<string, any> = {
      yellow: 'warning',
      green: 'success',
      red: 'danger',
    };

    return (
      <Badge variant={variantMap[statusInfo.color] || 'default'}>
        {statusInfo.label}
      </Badge>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Cargando pedidos..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Mis Pedidos</h1>
          <p className="mt-2 text-gray-600">
            Consultá el estado de tus compras
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4 space-y-2">
                <Link
                  href="/mi-cuenta"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <User size={20} />
                  <span>Mi Perfil</span>
                </Link>
                <Link
                  href="/mi-cuenta/pedidos"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#7B3FBD] text-white font-medium"
                >
                  <Package size={20} />
                  <span>Mis Pedidos</span>
                </Link>
                <Link
                  href="/mi-cuenta/favoritos"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Heart size={20} />
                  <span>Favoritos</span>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Pedidos */}
          <div className="lg:col-span-3 space-y-6">
            {error && (
              <Alert variant="error" dismissible onDismiss={() => setError('')}>
                {error}
              </Alert>
            )}

            {orders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No tenés pedidos todavía
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Empezá a comprar y tus pedidos aparecerán acá
                  </p>
                  <Link href="/productos">
                    <button className="bg-[#7B3FBD] text-white px-6 py-3 rounded-lg hover:bg-[#5A2C8F] transition-colors">
                      Ver Catálogo
                    </button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id} hover>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Pedido {order.order_number}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.created_at, 'dd/MM/yyyy HH:mm')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(order.status)}
                        {getPaymentBadge(order.payment_status)}
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">
                          {formatPrice(order.subtotal)}
                        </span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Descuento:</span>
                          <span>-{formatPrice(order.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-[#7B3FBD]">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <strong>Nota:</strong> {order.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

