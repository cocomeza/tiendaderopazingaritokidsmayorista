'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { formatPrice, formatNumber } from '@/lib/utils/formatters';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package } from 'lucide-react';

export default function ReportesPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    topProducts: [] as any[],
    topCustomers: [] as any[],
    salesByMonth: [] as any[],
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);

      // Total ventas
      const { data: orders } = await supabase
        .from('orders')
        .select('total')
        .neq('status', 'cancelado');

      const totalSales = orders?.reduce((sum, o) => sum + o.total, 0) || 0;
      const totalOrders = orders?.length || 0;
      const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      // Top 10 productos más vendidos
      const { data: topItems } = await supabase
        .from('order_items')
        .select('product_name, quantity, unit_price, subtotal')
        .limit(100);

      const productSales = topItems?.reduce((acc: any, item) => {
        if (!acc[item.product_name]) {
          acc[item.product_name] = {
            name: item.product_name,
            quantity: 0,
            revenue: 0,
          };
        }
        acc[item.product_name].quantity += item.quantity;
        acc[item.product_name].revenue += item.subtotal;
        return acc;
      }, {});

      const topProducts = Object.values(productSales || {})
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 10);

      // Top clientes
      const { data: customerOrders } = await supabase
        .from('orders')
        .select(`
          user_id,
          total,
          profiles:user_id (full_name, email)
        `)
        .neq('status', 'cancelado');

      const customerStats = customerOrders?.reduce((acc: any, order: any) => {
        const userId = order.user_id;
        if (!acc[userId]) {
          acc[userId] = {
            name: order.profiles?.full_name || 'Cliente',
            email: order.profiles?.email || '',
            orders: 0,
            total: 0,
          };
        }
        acc[userId].orders += 1;
        acc[userId].total += order.total;
        return acc;
      }, {});

      const topCustomers = Object.values(customerStats || {})
        .sort((a: any, b: any) => b.total - a.total)
        .slice(0, 10);

      setStats({
        totalSales,
        totalOrders,
        avgOrderValue,
        topProducts: topProducts as any[],
        topCustomers: topCustomers as any[],
        salesByMonth: [],
      });
    } catch (error: any) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading size="lg" text="Generando reportes..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Reportes y Estadísticas</h1>
        <p className="text-gray-600 mt-1">Análisis de ventas y rendimiento</p>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ventas Totales</p>
                <p className="text-2xl font-extrabold text-gray-900">
                  {formatPrice(stats.totalSales)}
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
                <p className="text-sm text-gray-600 mb-1">Total Pedidos</p>
                <p className="text-2xl font-extrabold text-gray-900">
                  {formatNumber(stats.totalOrders)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ShoppingCart className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ticket Promedio</p>
                <p className="text-2xl font-extrabold text-gray-900">
                  {formatPrice(stats.avgOrderValue)}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Productos */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay datos</p>
            ) : (
              <div className="space-y-3">
                {stats.topProducts.map((product: any, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#7B3FBD] text-lg">#{index + 1}</span>
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.quantity} vendidos</p>
                      </div>
                    </div>
                    <p className="font-bold">{formatPrice(product.revenue)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Mejores Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topCustomers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay datos</p>
            ) : (
              <div className="space-y-3">
                {stats.topCustomers.map((customer: any, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#00D9D4] text-lg">#{index + 1}</span>
                      <div>
                        <p className="font-semibold">{customer.name}</p>
                        <p className="text-sm text-gray-600">
                          {customer.orders} {customer.orders === 1 ? 'pedido' : 'pedidos'}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold">{formatPrice(customer.total)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

