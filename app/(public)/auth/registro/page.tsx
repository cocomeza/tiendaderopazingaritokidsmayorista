'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { validateEmail, validatePassword, validatePhone } from '@/lib/utils/validators';
import { PROVINCES_ARGENTINA } from '@/lib/types';

export default function RegistroPage() {
  const router = useRouter();
  const { signUp, isAuthenticated, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    acceptTerms: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Email
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
      isValid = false;
    }

    // Password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.errors[0];
      isValid = false;
    }

    // Confirm Password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
      isValid = false;
    }

    // Nombre
    if (!formData.full_name) {
      newErrors.full_name = 'El nombre completo es requerido';
      isValid = false;
    }

    // Teléfono
    if (!formData.phone) {
      newErrors.phone = 'El teléfono es requerido';
      isValid = false;
    }

    // Dirección
    if (!formData.address) {
      newErrors.address = 'La dirección es requerida';
      isValid = false;
    }

    // Ciudad
    if (!formData.city) {
      newErrors.city = 'La ciudad es requerida';
      isValid = false;
    }

    // Provincia
    if (!formData.province) {
      newErrors.province = 'La provincia es requerida';
      isValid = false;
    }

    // Código postal
    if (!formData.postal_code) {
      newErrors.postal_code = 'El código postal es requerido';
      isValid = false;
    }

    // Términos
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) return;

    setLoading(true);

    const result = await signUp(formData.email, formData.password, {
      full_name: formData.full_name,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      province: formData.province,
      postal_code: formData.postal_code,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } else {
      setError(result.error?.message || 'Error al registrarse');
    }

    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B3FBD]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block mb-6">
            <div className="text-3xl font-extrabold">
              <span className="text-[#7B3FBD]">Zingarito</span>{' '}
              <span className="text-[#00D9D4]">Kids</span>
            </div>
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            ¿Ya tenés cuenta?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-[#7B3FBD] hover:text-[#5A2C8F]"
            >
              Iniciá sesión
            </Link>
          </p>
        </div>

        {/* Formulario */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="error" dismissible onDismiss={() => setError('')}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success">
                  ¡Cuenta creada exitosamente! Redirigiendo...
                </Alert>
              )}

              {/* Datos de Acceso */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Datos de Acceso
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    error={errors.email}
                    fullWidth
                    required
                  />
                  <Input
                    label="Contraseña"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    error={errors.password}
                    helperText="Mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número"
                    fullWidth
                    required
                  />
                  <Input
                    label="Confirmar Contraseña"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    error={errors.confirmPassword}
                    fullWidth
                    required
                  />
                </div>
              </div>

              {/* Datos Personales */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Datos Personales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nombre Completo"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    error={errors.full_name}
                    fullWidth
                    required
                  />
                  <Input
                    label="Teléfono"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    error={errors.phone}
                    placeholder="Ej: 3407498045"
                    fullWidth
                    required
                  />
                </div>
              </div>

              {/* Dirección */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Dirección de Envío
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="Dirección"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    error={errors.address}
                    placeholder="Calle y número"
                    fullWidth
                    required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Ciudad"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      error={errors.city}
                      fullWidth
                      required
                    />
                    <Select
                      label="Provincia"
                      value={formData.province}
                      onChange={(e) =>
                        setFormData({ ...formData, province: e.target.value })
                      }
                      error={errors.province}
                      options={[
                        { value: '', label: 'Seleccionar provincia' },
                        ...PROVINCES_ARGENTINA.map((p) => ({ value: p, label: p })),
                      ]}
                      fullWidth
                      required
                    />
                  </div>
                  <Input
                    label="Código Postal"
                    value={formData.postal_code}
                    onChange={(e) =>
                      setFormData({ ...formData, postal_code: e.target.value })
                    }
                    error={errors.postal_code}
                    placeholder="Ej: 2914"
                    fullWidth
                    required
                  />
                </div>
              </div>

              {/* Términos */}
              <div>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) =>
                      setFormData({ ...formData, acceptTerms: e.target.checked })
                    }
                    className="h-4 w-4 text-[#7B3FBD] focus:ring-[#7B3FBD] border-gray-300 rounded mt-1"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Acepto los{' '}
                    <a href="#" className="text-[#7B3FBD] hover:underline">
                      términos y condiciones
                    </a>{' '}
                    y la{' '}
                    <a href="#" className="text-[#7B3FBD] hover:underline">
                      política de privacidad
                    </a>
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="text-sm text-red-500 mt-1">{errors.acceptTerms}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                fullWidth
              >
                Crear Cuenta
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

