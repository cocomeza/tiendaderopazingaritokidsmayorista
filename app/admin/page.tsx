'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button, Alert } from '@/lib/ui-wrappers';
import { Loading } from '@/components/ui/Loading';
import { 
  DollarSign, 
  ShoppingCart, 
  AlertTriangle, 
  Users,
  TrendingUp,
  Package
} from 'lucide-react';
import { formatPrice, formatNumber } from '@/lib/utils/formatters';
import Link from 'next/link';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSalesMonth: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Total ventas del mes actual
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthOrders } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', startOfMonth.toISOString())
        .neq('status', 'cancelado');

      const totalSalesMonth = monthOrders?.reduce((sum, order) => sum + order.total, 0) || 0;

      // Pedidos pendientes
      const { count: pendingCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pendiente');

      // Productos con stock bajo
      const { data: lowStock, count: lowStockCount } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .lte('stock', supabase.raw('low_stock_threshold'))
        .eq('active', true)
        .limit(5);

      // Total clientes
      const { count: customersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_admin', false);

      // Últimos 5 pedidos
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalSalesMonth,
        pendingOrders: pendingCount || 0,
        lowStockProducts: lowStockCount || 0,
        totalCustomers: customersCount || 0,
      });

      setRecentOrders(orders || []);
      setLowStockProducts(lowStock || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading size="lg" text="Cargando dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Bienvenido al panel de administración de Zingarito Kids
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ventas del Mes</p>
                <p className="text-2xl font-extrabold text-gray-900">
                  {formatPrice(stats.totalSalesMonth)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pedidos Pendientes</p>
                <p className="text-2xl font-extrabold text-gray-900">
                  {stats.pendingOrders}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <ShoppingCart className="text-yellow-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Stock Bajo</p>
                <p className="text-2xl font-extrabold text-gray-900">
                  {stats.lowStockProducts}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Clientes</p>
                <p className="text-2xl font-extrabold text-gray-900">
                  {formatNumber(stats.totalCustomers)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos Pedidos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Últimos Pedidos</CardTitle>
              <Link
                href="/admin/pedidos"
                className="text-sm text-[#7B3FBD] hover:underline"
              >
                Ver todos
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay pedidos todavía
              </p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {order.order_number}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.profiles?.full_name || 'Cliente'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {formatPrice(order.total)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'entregado' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alertas de Stock Bajo */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Alertas de Stock</CardTitle>
              <Link
                href="/admin/productos"
                className="text-sm text-[#7B3FBD] hover:underline"
              >
                Ver productos
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-green-600 font-medium">
                  ✓ Todos los productos tienen stock suficiente
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <Alert key={product.id} variant="warning">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm">SKU: {product.sku || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-red-600">
                          {product.stock}
                        </span>
                        <p className="text-xs text-gray-600">unidades</p>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Accesos Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle>Accesos Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/productos/nuevo"
              className="flex items-center gap-3 p-4 bg-[#7B3FBD] text-white rounded-lg hover:bg-[#5A2C8F] transition-colors"
            >
              <Package size={24} />
              <span className="font-semibold">Nuevo Producto</span>
            </Link>
            <Link
              href="/admin/pedidos"
              className="flex items-center gap-3 p-4 bg-[#00D9D4] text-gray-900 rounded-lg hover:bg-[#00B8AE] transition-colors"
            >
              <ShoppingCart size={24} />
              <span className="font-semibold">Ver Pedidos</span>
            </Link>
            <Link
              href="/admin/reportes"
              className="flex items-center gap-3 p-4 bg-[#FFB700] text-gray-900 rounded-lg hover:bg-[#E5A400] transition-colors"
            >
              <TrendingUp size={24} />
              <span className="font-semibold">Ver Reportes</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

