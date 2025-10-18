'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { PROVINCES_ARGENTINA } from '@/lib/types';
import { User, Package, Heart, Settings } from 'lucide-react';
import Link from 'next/link';

export default function MiCuentaPage() {
  const { profile, loading: authLoading, updateProfile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    province: profile?.province || '',
    postal_code: profile?.postal_code || '',
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Cargando..." />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    const result = await updateProfile(formData);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || 'Error al actualizar perfil');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Mi Cuenta</h1>
          <p className="mt-2 text-gray-600">
            Gestioná tu información personal y pedidos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4 space-y-2">
                <Link
                  href="/mi-cuenta"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#7B3FBD] text-white font-medium"
                >
                  <User size={20} />
                  <span>Mi Perfil</span>
                </Link>
                <Link
                  href="/mi-cuenta/pedidos"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
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

          {/* Contenido Principal */}
          <div className="lg:col-span-3 space-y-6">
            {/* Información del Usuario */}
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {success && (
                    <Alert variant="success" dismissible onDismiss={() => setSuccess(false)}>
                      ¡Perfil actualizado exitosamente!
                    </Alert>
                  )}

                  {error && (
                    <Alert variant="error" dismissible onDismiss={() => setError('')}>
                      {error}
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Nombre Completo"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      fullWidth
                    />
                    <Input
                      label="Teléfono"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      fullWidth
                    />
                  </div>

                  <Input
                    label="Email"
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    fullWidth
                    helperText="El email no se puede modificar"
                  />

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Dirección de Envío
                    </h3>
                    <div className="space-y-4">
                      <Input
                        label="Dirección"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        fullWidth
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Ciudad"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          fullWidth
                        />
                        <Select
                          label="Provincia"
                          value={formData.province}
                          onChange={(e) =>
                            setFormData({ ...formData, province: e.target.value })
                          }
                          options={[
                            { value: '', label: 'Seleccionar provincia' },
                            ...PROVINCES_ARGENTINA.map((p) => ({ value: p, label: p })),
                          ]}
                          fullWidth
                        />
                      </div>
                      <Input
                        label="Código Postal"
                        value={formData.postal_code}
                        onChange={(e) =>
                          setFormData({ ...formData, postal_code: e.target.value })
                        }
                        fullWidth
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="submit" variant="primary" loading={loading}>
                      Guardar Cambios
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Cambiar Contraseña */}
            <Card>
              <CardHeader>
                <CardTitle>Seguridad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    ¿Querés cambiar tu contraseña?
                  </p>
                  <Link href="/auth/recuperar">
                    <Button variant="secondary">
                      Cambiar Contraseña
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

