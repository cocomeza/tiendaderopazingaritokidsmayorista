'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, Building2, Phone, FileText, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'

function RegisterPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/productos'
  
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    companyName: '',
    cuit: '',
    billingAddress: '',
    locality: '',
    salesType: '',
    ages: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar campos obligatorios
    if (!formData.fullName.trim()) {
      toast.error('Por favor ingresa tu nombre completo')
      return
    }

    if (!formData.phone.trim()) {
      toast.error('Por favor ingresa tu teléfono')
      return
    }

    if (!formData.companyName.trim()) {
      toast.error('Por favor ingresa el nombre de tu empresa')
      return
    }

    if (!formData.cuit.trim()) {
      toast.error('Por favor ingresa el CUIT de tu empresa')
      return
    }

    if (!formData.billingAddress.trim()) {
      toast.error('Por favor ingresa la dirección de facturación')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    // Validar que la contraseña tenga al menos una letra y un número
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)/
    if (!passwordRegex.test(formData.password)) {
      toast.error('La contraseña debe tener al menos una letra y un número')
      return
    }

    // Validar formato de CUIT (XX-XXXXXXXX-X)
    const cuitRegex = /^\d{2}-?\d{8}-?\d{1}$/
    if (!cuitRegex.test(formData.cuit.replace(/-/g, ''))) {
      toast.error('El formato del CUIT no es válido. Debe tener 11 dígitos.')
      return
    }

    if (!formData.locality.trim()) {
      toast.error('Por favor ingresa tu localidad')
      return
    }

    if (!formData.salesType) {
      toast.error('Por favor selecciona el tipo de venta')
      return
    }

    setLoading(true)

    try {
      console.log('Intentando registrar usuario:', formData.email)
      
      // Registro en auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            company_name: formData.companyName,
          }
        }
      })

      if (error) {
        console.error('Error de Supabase Auth:', error)
        
        // Errores comunes y mensajes más amigables
        if (error.message.includes('already registered')) {
          toast.error('Este email ya está registrado. Intenta iniciar sesión o recupera tu contraseña.')
        } else if (error.message.includes('Password')) {
          toast.error('La contraseña no cumple los requisitos de seguridad')
        } else if (error.message.includes('Invalid email')) {
          toast.error('El formato del email no es válido')
        } else {
        toast.error('Error al registrarse: ' + error.message)
        }
        
        setLoading(false)
        return
      }

      console.log('Usuario registrado exitosamente:', data.user?.id)

      // Si el registro fue exitoso, actualizar el perfil
      if (data.user) {
        console.log('Creando perfil para usuario:', data.user.id)
        
        // Preparar los datos del perfil - solo campos que existen en DB
        const profileData: any = {
          id: data.user.id,
          email: formData.email,
          full_name: formData.fullName,
          phone: formData.phone,
          company_name: formData.companyName,
          cuit: formData.cuit.replace(/-/g, ''),
          billing_address: formData.billingAddress
        }

        // Agregar los nuevos campos solo si están presentes
        if (formData.locality) {
          profileData.locality = formData.locality
        }
        if (formData.salesType) {
          profileData.sales_type = formData.salesType
        }
        if (formData.ages) {
          profileData.ages = formData.ages
        }

        console.log('Datos del perfil a insertar:', profileData)

        const { data: profileInsertData, error: profileError } = await supabase
          .from('profiles')
          .upsert(profileData, { onConflict: 'id' })

        console.log('Resultado insert perfil:', profileInsertData)
        
        if (profileError) {
          console.error('Error completo del perfil:', JSON.stringify(profileError, null, 2))
          console.error('Código de error:', profileError.code)
          console.error('Mensaje:', profileError.message)
          console.error('Detalles:', profileError.details)
          console.error('Hint:', profileError.hint)
          
          toast.error('Error al crear el perfil: ' + (profileError.message || 'Error desconocido. Verifica la consola para más detalles.'))
          setLoading(false)
      return
    }

        console.log('Perfil creado exitosamente')
      }

    // En desarrollo, si la confirmación por email está desactivada,
    // el usuario puede hacer login inmediatamente
    toast.success('¡Registro exitoso! Ya puedes iniciar sesión')
      router.push('/auth/login')
    } catch (error) {
      toast.error('Error inesperado al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl border-0 bg-white max-h-[90vh] overflow-y-auto">
          <CardHeader className="text-center pb-6 pt-8 sticky top-0 bg-white z-10 border-b">
            <div className="flex items-center justify-between mb-4">
              <Link href="/productos" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Registro Mayorista
              </CardTitle>
              <div className="w-5"></div> {/* Spacer */}
            </div>
            <p className="text-gray-600 text-sm">
              Completa todos los datos para acceder a precios mayoristas
          </p>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Información Personal */}
              <div className="space-y-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Información Personal
                </h3>
                
              <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nombre Completo *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                      placeholder="Juan Pérez"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Teléfono *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="tel"
                      placeholder="11 1234 5678"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Datos del Negocio */}
              <div className="space-y-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Datos del Negocio
                </h3>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nombre de la Empresa *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Mi Empresa S.A."
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">CUIT *</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="20-12345678-9"
                      value={formData.cuit}
                      onChange={(e) => handleInputChange('cuit', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">Formato: XX-XXXXXXXX-X</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Dirección de Facturación *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Calle Falsa 123, CABA"
                      value={formData.billingAddress}
                      onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Localidad *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                      placeholder="Ciudad Autónoma de Buenos Aires"
                      value={formData.locality}
                      onChange={(e) => handleInputChange('locality', e.target.value)}
                      className="pl-10"
                  required
                />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tipo de Venta *</label>
                  <Select value={formData.salesType} onValueChange={(value) => handleInputChange('salesType', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona el tipo de venta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local Físico</SelectItem>
                      <SelectItem value="showroom">Showroom</SelectItem>
                      <SelectItem value="online">Venta Online</SelectItem>
                      <SelectItem value="empezando">Por Iniciar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Edades con las que trabaja (opcional)</label>
                  <Input
                    type="text"
                    placeholder="Ej: 0-2 años, 3-6 años"
                    value={formData.ages}
                    onChange={(e) => handleInputChange('ages', e.target.value)}
                  />
                </div>
              </div>

              {/* Credenciales de Acceso */}
              <div className="space-y-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Credenciales de Acceso
                </h3>

              <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="email"
                    placeholder="tu@empresa.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Contraseña *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Confirmar Contraseña *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-10"
                    required
                  />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
                disabled={loading}
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta Mayorista'}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-2">
                Todos los campos marcados con * son obligatorios
              </p>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link 
                  href={`/auth/login?redirect=${encodeURIComponent(redirectTo)}`}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Inicia sesión aquí
                </Link>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Al registrarte, aceptas nuestros términos y condiciones
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  )
}