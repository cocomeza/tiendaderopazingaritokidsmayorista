'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { useCartStore } from '@/lib/stores/cart'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Phone,
  MapPin,
  Mail,
  Save,
  ArrowLeft,
  Shield,
  Package,
  Calendar,
  Building2,
  ShoppingCart,
  X,
  Edit2,
  Check,
  Settings
} from 'lucide-react'
import Link from 'next/link'

interface ProfileData {
  email: string
  full_name: string
  phone: string
  address: string
  city: string
  province: string
  postal_code: string
}

export default function MiPerfilPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const { items: cartItems, removeItem, getTotalItems, getTotalWholesalePrice } = useCartStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isWholesale, setIsWholesale] = useState(false)
  const [createdAt, setCreatedAt] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  
  const [profileData, setProfileData] = useState<ProfileData>({
    email: '',
    full_name: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postal_code: ''
  })

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/mi-perfil')
        return
      }
      loadProfile()
    }
  }, [authLoading, isAuthenticated])

  const loadProfile = async () => {
    try {
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error cargando perfil:', error)
        toast.error('Error al cargar tu perfil')
        setLoading(false)
        return
      }

      if (data) {
        setProfileData({
          email: data.email || user.email || '',
          full_name: data.full_name || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          province: data.province || '',
          postal_code: data.postal_code || ''
        })
        
        setIsAdmin(data.is_admin || false)
        setIsWholesale(data.is_wholesale_client || false)
        setCreatedAt(data.created_at || '')
      } else {
        // Crear perfil básico si no existe
        const newProfile = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          phone: user.user_metadata?.phone || '',
          address: '',
          city: '',
          province: '',
          postal_code: '',
          is_admin: false,
          is_wholesale_client: true
        }

        await supabase.from('profiles').insert(newProfile)
        setProfileData({
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          phone: user.user_metadata?.phone || '',
          address: '',
          city: '',
          province: '',
          postal_code: ''
        })
      }

    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar tu perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = async () => {
    if (!profileData.full_name.trim()) {
      toast.error('El nombre completo es requerido')
      return
    }

    setSaving(true)
    
    try {
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          address: profileData.address,
          city: profileData.city,
          province: profileData.province,
          postal_code: profileData.postal_code
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error:', error)
        toast.error('Error al actualizar: ' + error.message)
        return
      }

      toast.success('✅ Perfil actualizado')
      setIsEditing(false)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Cargando tu perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header Ultra Moderno */}
      <div className="relative overflow-hidden bg-white border-b border-slate-200">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,black)]" />
        
        <div className="relative container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link 
              href="/productos" 
              className="inline-flex items-center text-slate-600 hover:text-purple-600 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Volver
            </Link>
            <Button
              onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
              disabled={saving}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Guardando...
                </>
              ) : isEditing ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Guardar
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar
                </>
              )}
            </Button>
          </div>

          {/* Profile Header */}
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center shadow-lg ring-4 ring-white">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">
                  {profileData.full_name || 'Usuario'}
                </h1>
                {isAdmin && (
                  <Badge className="bg-amber-500 text-white border-0">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
                {isWholesale && (
                  <Badge className="bg-emerald-500 text-white border-0">
                    <Package className="w-3 h-3 mr-1" />
                    Mayorista
                  </Badge>
                )}
              </div>
              <p className="text-slate-600 mb-1 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {profileData.email}
              </p>
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Miembro desde {createdAt ? new Date(createdAt).toLocaleDateString('es-AR', { 
                  month: 'long', 
                  year: 'numeric' 
                }) : 'recientemente'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar - Más delgado y moderno */}
          <div className="lg:col-span-3 space-y-4">
            {/* Quick Stats */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <span className="text-sm font-medium text-slate-600">Estatus</span>
                    <Badge className="bg-green-100 text-green-700 border-0">
                      Activo
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b">
                    <span className="text-sm font-medium text-slate-600">Tipo</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {isWholesale ? 'Mayorista' : 'Minorista'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Total Items</span>
                    <span className="text-sm font-semibold text-purple-600">{getTotalItems()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Carrito */}
            {cartItems.length > 0 && (
              <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-orange-500 to-pink-500 text-white pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Carrito ({getTotalItems()})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.png'
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-slate-500">x{item.quantity}</p>
                        <p className="text-xs font-semibold text-purple-600">
                          ${(item.wholesale_price * item.quantity).toLocaleString('es-AR')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-semibold text-sm">Total</span>
                    <span className="font-bold text-purple-600">
                      ${getTotalWholesalePrice().toLocaleString('es-AR')}
                    </span>
                  </div>
                  <Button 
                    onClick={() => router.push('/checkout')}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-sm"
                  >
                    Ir a Checkout
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Accesos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm font-normal"
                  onClick={() => router.push('/mis-pedidos')}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Mis Pedidos
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm font-normal"
                  onClick={() => router.push('/favoritos')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Favoritos
                </Button>
                {isAdmin && (
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm font-normal text-amber-600"
                    onClick={() => router.push('/admin')}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Panel Admin
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-6">
            {/* Información Personal */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-slate-50 border-slate-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
                    Nombre Completo *
                  </label>
                  <Input
                    type="text"
                    value={profileData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    disabled={!isEditing}
                    className={isEditing ? '' : 'bg-slate-50'}
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
                    Teléfono
                  </label>
                  <Input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className={isEditing ? '' : 'bg-slate-50'}
                    placeholder="11 1234 5678"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dirección */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="w-5 h-5" />
                  Dirección
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
                    Dirección
                  </label>
                  <Input
                    type="text"
                    value={profileData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!isEditing}
                    className={isEditing ? '' : 'bg-slate-50'}
                    placeholder="Calle y número"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
                      Ciudad
                    </label>
                    <Input
                      type="text"
                      value={profileData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={!isEditing}
                      className={isEditing ? '' : 'bg-slate-50'}
                      placeholder="Ciudad"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
                      Provincia
                    </label>
                    <Input
                      type="text"
                      value={profileData.province}
                      onChange={(e) => handleInputChange('province', e.target.value)}
                      disabled={!isEditing}
                      className={isEditing ? '' : 'bg-slate-50'}
                      placeholder="Provincia"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
                    Código Postal
                  </label>
                  <Input
                    type="text"
                    value={profileData.postal_code}
                    onChange={(e) => handleInputChange('postal_code', e.target.value)}
                    disabled={!isEditing}
                    className={isEditing ? '' : 'bg-slate-50'}
                    placeholder="1234"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
