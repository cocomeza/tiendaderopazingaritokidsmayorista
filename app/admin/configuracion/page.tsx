'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { BusinessConfig } from '@/lib/types';
import toast from 'react-hot-toast';

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<BusinessConfig | null>(null);

  const [formData, setFormData] = useState({
    business_name: '',
    whatsapp_number: '',
    email: '',
    address: '',
    cbu: '',
    alias_cbu: '',
    bank_name: '',
    account_holder: '',
    min_wholesale_quantity: 5,
    instagram_url: '',
    facebook_url: '',
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('business_config')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        setConfig(data);
        setFormData({
          business_name: data.business_name || '',
          whatsapp_number: data.whatsapp_number || '',
          email: data.email || '',
          address: data.address || '',
          cbu: data.cbu || '',
          alias_cbu: data.alias_cbu || '',
          bank_name: data.bank_name || '',
          account_holder: data.account_holder || '',
          min_wholesale_quantity: data.min_wholesale_quantity || 5,
          instagram_url: data.instagram_url || '',
          facebook_url: data.facebook_url || '',
        });
      }
    } catch (error: any) {
      console.error('Error loading config:', error);
      toast.error('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (config) {
        // Update existing
        const { error } = await supabase
          .from('business_config')
          .update(formData)
          .eq('id', config.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('business_config')
          .insert(formData);

        if (error) throw error;
      }

      toast.success('Configuración guardada exitosamente');
      loadConfig();
    } catch (error: any) {
      console.error('Error saving config:', error);
      toast.error('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading size="lg" text="Cargando configuración..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Configuración del Negocio</h1>
        <p className="text-gray-600 mt-1">
          Administrá la información general de Zingarito Kids
        </p>
      </div>

      <Alert variant="info">
        Los cambios que realices acá se reflejarán en todo el sitio web y en los emails enviados a clientes.
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nombre del Negocio"
              value={formData.business_name}
              onChange={(e) =>
                setFormData({ ...formData, business_name: e.target.value })
              }
              required
              fullWidth
            />

            <Input
              label="Email de Contacto"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              fullWidth
            />

            <Input
              label="Número de WhatsApp"
              value={formData.whatsapp_number}
              onChange={(e) =>
                setFormData({ ...formData, whatsapp_number: e.target.value })
              }
              helperText="Formato: 543407498045 (código de país + número sin espacios)"
              required
              fullWidth
            />

            <Textarea
              label="Dirección Física"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Calle, número, ciudad, provincia"
              fullWidth
            />
          </CardContent>
        </Card>

        {/* Datos Bancarios */}
        <Card>
          <CardHeader>
            <CardTitle>Datos Bancarios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="CBU"
                value={formData.cbu}
                onChange={(e) => setFormData({ ...formData, cbu: e.target.value })}
                placeholder="0170099220000061850011"
                fullWidth
              />

              <Input
                label="Alias CBU"
                value={formData.alias_cbu}
                onChange={(e) =>
                  setFormData({ ...formData, alias_cbu: e.target.value })
                }
                placeholder="ZINGARITO.KIDS.MP"
                fullWidth
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Banco"
                value={formData.bank_name}
                onChange={(e) =>
                  setFormData({ ...formData, bank_name: e.target.value })
                }
                placeholder="Banco Macro"
                fullWidth
              />

              <Input
                label="Titular de la Cuenta"
                value={formData.account_holder}
                onChange={(e) =>
                  setFormData({ ...formData, account_holder: e.target.value })
                }
                placeholder="Zingarito Kids S.R.L."
                fullWidth
              />
            </div>
          </CardContent>
        </Card>

        {/* Políticas de Venta */}
        <Card>
          <CardHeader>
            <CardTitle>Políticas de Venta</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              label="Cantidad Mínima de Compra Mayorista"
              type="number"
              value={formData.min_wholesale_quantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  min_wholesale_quantity: parseInt(e.target.value) || 5,
                })
              }
              helperText="Los clientes deben comprar al menos esta cantidad de productos"
              required
              fullWidth
            />
          </CardContent>
        </Card>

        {/* Redes Sociales */}
        <Card>
          <CardHeader>
            <CardTitle>Redes Sociales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Instagram URL"
              value={formData.instagram_url}
              onChange={(e) =>
                setFormData({ ...formData, instagram_url: e.target.value })
              }
              placeholder="https://instagram.com/zingaritokids"
              fullWidth
            />

            <Input
              label="Facebook URL"
              value={formData.facebook_url}
              onChange={(e) =>
                setFormData({ ...formData, facebook_url: e.target.value })
              }
              placeholder="https://facebook.com/zingaritokids"
              fullWidth
            />
          </CardContent>
        </Card>

        {/* Botón Guardar */}
        <div className="flex justify-end gap-4">
          <Button type="submit" variant="primary" size="lg" loading={saving}>
            Guardar Configuración
          </Button>
        </div>
      </form>
    </div>
  );
}

