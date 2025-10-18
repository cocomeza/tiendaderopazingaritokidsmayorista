'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Loading } from '@/components/ui/Loading';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Order, OrderWithItems, ORDER_STATUSES, PAYMENT_STATUSES } from '@/lib/types';
import { formatDate, formatPrice } from '@/lib/utils/formatters';
import { Eye, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PedidosAdminPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id (full_name, email, phone),
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setNewPaymentStatus(order.payment_status);
    setNewNotes(order.notes || '');
    setDetailModalOpen(true);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          payment_status: newPaymentStatus,
          notes: newNotes || null,
        })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      toast.success('Pedido actualizado');
      setDetailModalOpen(false);
      loadOrders();
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast.error('Error al actualizar pedido');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading size="lg" text="Cargando pedidos..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Pedidos</h1>
        <p className="text-gray-600 mt-1">Gestiona todos los pedidos de clientes</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pago
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-mono font-semibold">{order.order_number}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{order.profiles?.full_name || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{order.profiles?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(order.created_at, 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 font-bold">{formatPrice(order.total)}</td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        order.status === 'pendiente' ? 'warning' :
                        order.status === 'entregado' ? 'success' :
                        'info'
                      }
                    >
                      {ORDER_STATUSES.find(s => s.value === order.status)?.label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        order.payment_status === 'pagado' ? 'success' :
                        order.payment_status === 'rechazado' ? 'danger' :
                        'warning'
                      }
                    >
                      {PAYMENT_STATUSES.find(s => s.value === order.payment_status)?.label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleOrderClick(order)}
                      className="text-[#7B3FBD] hover:text-[#5A2C8F] p-2"
                      title="Ver detalle"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Detalle */}
      {selectedOrder && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title={`Pedido ${selectedOrder.order_number}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Cliente */}
            <div>
              <h3 className="font-bold mb-2">Cliente</h3>
              <p>{selectedOrder.profiles?.full_name}</p>
              <p className="text-sm text-gray-600">{selectedOrder.profiles?.email}</p>
              <p className="text-sm text-gray-600">{selectedOrder.profiles?.phone}</p>
            </div>

            {/* Dirección de Envío */}
            {selectedOrder.shipping_address && (
              <div>
                <h3 className="font-bold mb-2">Dirección de Envío</h3>
                <p>{selectedOrder.shipping_address.address}</p>
                <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.province}</p>
                <p>CP: {selectedOrder.shipping_address.postal_code}</p>
              </div>
            )}

            {/* Items */}
            <div>
              <h3 className="font-bold mb-2">Productos</h3>
              <div className="space-y-2">
                {selectedOrder.order_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-600">
                        {item.size && `Talle: ${item.size}`} {item.color && `• Color: ${item.color}`}
                      </p>
                      <p className="text-sm">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="font-bold">{formatPrice(item.subtotal)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-[#7B3FBD]">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Estados */}
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Estado del Pedido"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                options={ORDER_STATUSES.map(s => ({ value: s.value, label: s.label }))}
                fullWidth
              />
              <Select
                label="Estado de Pago"
                value={newPaymentStatus}
                onChange={(e) => setNewPaymentStatus(e.target.value)}
                options={PAYMENT_STATUSES.map(s => ({ value: s.value, label: s.label }))}
                fullWidth
              />
            </div>

            {/* Notas */}
            <Textarea
              label="Notas"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Agregar notas sobre el pedido..."
              fullWidth
            />

            <ModalFooter>
              <Button
                variant="ghost"
                onClick={() => setDetailModalOpen(false)}
                disabled={updating}
              >
                Cerrar
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateOrder}
                loading={updating}
              >
                Guardar Cambios
              </Button>
            </ModalFooter>
          </div>
        </Modal>
      )}
    </div>
  );
}

