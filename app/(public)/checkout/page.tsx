'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Upload, CreditCard } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/hooks/useCart';
import { supabase } from '@/lib/supabase/client';
import { Button, Input, Textarea, Alert } from '@/lib/ui-wrappers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loading } from '@/components/ui/Loading';
import { formatPrice, formatWhatsAppURL } from '@/lib/utils/formatters';
import { toast } from 'sonner';

// DATOS BANCARIOS DE PRUEBA (reemplazar con datos reales del cliente)
const DATOS_BANCARIOS = {
  cbu: '0170099220000061850011',
  alias: 'ZINGARITO.KIDS.MP',
  banco: 'Banco Macro',
  titular: 'Zingarito Kids S.R.L.',
  cuit: '30-71234567-8',
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const { items, getTotal, getItemCount, clearCart, isMinQuantityMet } = useCart();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Review, 2: Shipping, 3: Payment, 4: Confirmation
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [shippingData, setShippingData] = useState({
    name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    province: profile?.province || '',
    postal_code: profile?.postal_code || '',
  });

  const [notes, setNotes] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState('');

  const total = getTotal();
  const itemCount = getItemCount();
  const minQuantity = 5;

  // Redirect si no hay items o no cumple mínimo
  useEffect(() => {
    if (!authLoading && items.length === 0) {
      router.push('/carrito');
    }
    if (!authLoading && !isMinQuantityMet(minQuantity)) {
      toast.error(`Necesitás al menos ${minQuantity} productos para finalizar la compra`);
      router.push('/carrito');
    }
  }, [items, authLoading]);

  // Auto-completar con datos del perfil
  useEffect(() => {
    if (profile) {
      setShippingData({
        name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        province: profile.province || '',
        postal_code: profile.postal_code || '',
      });
    }
  }, [profile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo no puede superar los 5MB');
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten imágenes');
        return;
      }

      setPaymentProof(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateShipping = () => {
    if (!shippingData.name || !shippingData.phone || !shippingData.address || 
        !shippingData.city || !shippingData.province) {
      toast.error('Por favor completá todos los campos obligatorios');
      return false;
    }
    return true;
  };

  const handleCreateOrder = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // 1. Generar número de orden
      const { data: orderNumberData } = await supabase.rpc('generate_order_number');
      const newOrderNumber = orderNumberData;

      // 2. Crear orden
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: newOrderNumber,
          user_id: user.id,
          status: 'pendiente',
          payment_status: 'pendiente',
          subtotal: total,
          discount: 0,
          total: total,
          notes: notes || null,
          shipping_address: shippingData,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Crear items de la orden
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product.name,
        product_sku: item.product.sku,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.unit_price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 4. Subir comprobante si existe (opcional por ahora, requiere Storage configurado)
      // if (paymentProof) {
      //   const fileName = `${user.id}/${order.id}_${Date.now()}.jpg`;
      //   const { error: uploadError } = await supabase.storage
      //     .from('payment-proofs')
      //     .upload(fileName, paymentProof);
      //   
      //   if (!uploadError) {
      //     await supabase
      //       .from('orders')
      //       .update({ payment_proof_url: fileName })
      //       .eq('id', order.id);
      //   }
      // }

      setOrderNumber(newOrderNumber);
      setOrderCreated(true);
      setStep(4);
      
      // Limpiar carrito
      clearCart();

      toast.success('¡Pedido creado exitosamente!');
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error('Error al crear el pedido. Por favor intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppSend = () => {
    const message = `¡Hola! Soy ${shippingData.name}.\n\nAcabo de realizar el pedido ${orderNumber}.\nTotal: ${formatPrice(total)}\n\n¡Gracias!`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = formatWhatsAppURL(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '543407498045', encodedMessage);
    window.open(whatsappUrl, '_blank');
  };

  if (authLoading || (!orderCreated && items.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Cargando..." />
      </div>
    );
  }

  // PASO 4: Confirmación
  if (orderCreated && step === 4) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="text-center py-12 space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="text-green-600" size={32} />
              </div>
              
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                  ¡Pedido Realizado!
                </h2>
                <p className="text-xl text-gray-600">
                  Número de pedido: <strong>{orderNumber}</strong>
                </p>
              </div>

              <Alert variant="info">
                <div className="text-left space-y-2">
                  <p className="font-semibold">Próximos pasos:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Realizá la transferencia bancaria</li>
                    <li>Envianos el comprobante por WhatsApp</li>
                    <li>Confirmaremos tu pedido a la brevedad</li>
                  </ol>
                </div>
              </Alert>

              <div className="space-y-3">
                <Button
                  variant="whatsapp"
                  size="lg"
                  fullWidth
                  onClick={handleWhatsAppSend}
                >
                  Enviar Pedido por WhatsApp
                </Button>
                
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => router.push('/mi-cuenta/pedidos')}
                >
                  Ver Mis Pedidos
                </Button>

                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => router.push('/')}
                >
                  Volver al Inicio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header con Steps */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
            Finalizar Compra
          </h1>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Revisar' },
              { num: 2, label: 'Envío' },
              { num: 3, label: 'Pago' },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                      step >= s.num
                        ? 'bg-[#7B3FBD] text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {s.num}
                  </div>
                  <span className="text-xs mt-2 font-medium text-gray-600">
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={`h-1 flex-1 transition-colors ${
                      step > s.num ? 'bg-[#7B3FBD]' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenido Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* PASO 1: Revisar Pedido */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Revisá tu Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={`${item.product_id}-${item.size}-${item.color}`}
                      className="flex gap-4 pb-4 border-b last:border-0"
                    >
                      <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0">
                        {item.product.images?.[0] && (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {item.size && `Talle: ${item.size}`}
                          {item.size && item.color && ' • '}
                          {item.color && `Color: ${item.color}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {formatPrice(item.unit_price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4">
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => setStep(2)}
                    >
                      Continuar a Datos de Envío
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* PASO 2: Datos de Envío */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Datos de Envío</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      label="Nombre Completo"
                      value={shippingData.name}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, name: e.target.value })
                      }
                      required
                      fullWidth
                    />
                    <Input
                      label="Teléfono"
                      value={shippingData.phone}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, phone: e.target.value })
                      }
                      required
                      fullWidth
                    />
                    <Input
                      label="Dirección"
                      value={shippingData.address}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, address: e.target.value })
                      }
                      required
                      fullWidth
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Ciudad"
                        value={shippingData.city}
                        onChange={(e) =>
                          setShippingData({ ...shippingData, city: e.target.value })
                        }
                        required
                        fullWidth
                      />
                      <Input
                        label="Provincia"
                        value={shippingData.province}
                        onChange={(e) =>
                          setShippingData({
                            ...shippingData,
                            province: e.target.value,
                          })
                        }
                        required
                        fullWidth
                      />
                    </div>
                    <Input
                      label="Código Postal"
                      value={shippingData.postal_code}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          postal_code: e.target.value,
                        })
                      }
                      fullWidth
                    />
                    <Textarea
                      label="Notas (Opcional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ej: Horarios de entrega preferidos, piso, departamento, etc."
                      fullWidth
                    />

                    <div className="flex gap-3 pt-4">
                      <Button variant="ghost" onClick={() => setStep(1)}>
                        Volver
                      </Button>
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={() => {
                          if (validateShipping()) {
                            setStep(3);
                          }
                        }}
                      >
                        Continuar a Pago
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* PASO 3: Datos de Pago */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    <CreditCard className="inline mr-2" size={24} />
                    Datos para Transferencia Bancaria
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert variant="info">
                    Realizá la transferencia a la siguiente cuenta y luego envianos el
                    comprobante por WhatsApp
                  </Alert>

                  {/* Datos Bancarios */}
                  <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">CBU</p>
                        <p className="font-mono font-bold text-lg">
                          {DATOS_BANCARIOS.cbu}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Alias</p>
                        <p className="font-bold text-lg">
                          {DATOS_BANCARIOS.alias}
                        </p>
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <p className="text-sm text-gray-600">Banco</p>
                      <p className="font-semibold">{DATOS_BANCARIOS.banco}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Titular</p>
                      <p className="font-semibold">{DATOS_BANCARIOS.titular}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">CUIT</p>
                      <p className="font-mono">{DATOS_BANCARIOS.cuit}</p>
                    </div>
                  </div>

                  {/* Subir Comprobante (Opcional) */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Comprobante de Pago (Opcional)
                    </label>
                    <p className="text-sm text-gray-600 mb-3">
                      Podés subirlo ahora o enviarlo más tarde por WhatsApp
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {paymentProofPreview ? (
                        <div>
                          <img
                            src={paymentProofPreview}
                            alt="Comprobante"
                            className="max-h-48 mx-auto mb-3 rounded"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPaymentProof(null);
                              setPaymentProofPreview('');
                            }}
                          >
                            Cambiar Imagen
                          </Button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                          <p className="text-sm text-gray-600 mb-2">
                            Click para subir comprobante
                          </p>
                          <p className="text-xs text-gray-500">
                            JPG, PNG hasta 5MB
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="ghost" onClick={() => setStep(2)}>
                      Volver
                    </Button>
                    <Button
                      variant="primary"
                      fullWidth
                      loading={loading}
                      onClick={handleCreateOrder}
                    >
                      Confirmar Pedido
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Resumen del Pedido (Sidebar) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Productos ({itemCount}):
                    </span>
                    <span className="font-medium">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Descuentos:</span>
                    <span className="font-medium text-green-600">$0</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-2xl font-extrabold text-[#7B3FBD]">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 text-xs text-gray-600 space-y-2">
                  <p>✓ Envío coordinado por WhatsApp</p>
                  <p>✓ Pago por transferencia bancaria</p>
                  <p>✓ Confirmación en 24-48hs</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

