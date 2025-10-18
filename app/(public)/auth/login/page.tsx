'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { validateEmail } from '@/lib/utils/validators';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, isAuthenticated, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    }
  }, [isAuthenticated, authLoading, router, searchParams]);

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
    };
    let isValid = true;

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    const result = await signIn(formData.email, formData.password);

    if (result.success) {
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    } else {
      setError(result.error?.message || 'Error al iniciar sesión');
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block mb-6">
            <div className="text-3xl font-extrabold">
              <span className="text-[#7B3FBD]">Zingarito</span>{' '}
              <span className="text-[#00D9D4]">Kids</span>
            </div>
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            ¿No tenés cuenta?{' '}
            <Link
              href="/auth/registro"
              className="font-medium text-[#7B3FBD] hover:text-[#5A2C8F]"
            >
              Registrate gratis
            </Link>
          </p>
        </div>

        {/* Formulario */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="error" dismissible onDismiss={() => setError('')}>
                  {error}
                </Alert>
              )}

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
                fullWidth
                required
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.remember}
                    onChange={(e) =>
                      setFormData({ ...formData, remember: e.target.checked })
                    }
                    className="h-4 w-4 text-[#7B3FBD] focus:ring-[#7B3FBD] border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Recordar sesión
                  </span>
                </label>

                <Link
                  href="/auth/recuperar"
                  className="text-sm font-medium text-[#7B3FBD] hover:text-[#5A2C8F]"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                fullWidth
              >
                Iniciar Sesión
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info adicional */}
        <div className="text-center text-sm text-gray-500">
          <p>Al iniciar sesión, aceptás nuestros</p>
          <a href="#" className="text-[#7B3FBD] hover:underline">
            Términos y Condiciones
          </a>
        </div>
      </div>
    </div>
  );
}

