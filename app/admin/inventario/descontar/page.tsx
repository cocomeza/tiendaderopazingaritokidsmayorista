'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Loader2, Package, Search, ShoppingBag, Home, LogOut, MinusCircle } from 'lucide-react'

type Product = {
  id: string
  name: string
  stock: number
  category?: string | null
  category_id?: string | null
  sku?: string | null
}

type Variant = {
  id: string
  size: string | null
  color: string | null
  stock: number
}

export default function DescontarStockPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [selectedVariantId, setSelectedVariantId] = useState<string>('')
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    if (!isCheckingAuth) {
      loadProducts()
    }
  }, [isCheckingAuth])

  useEffect(() => {
    if (selectedProductId) {
      loadVariants(selectedProductId)
    } else {
      setVariants([])
      setSelectedVariantId('')
    }
  }, [selectedProductId])

  const checkAdminAccess = async () => {
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/admin/login')
        return
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      if (error || !profile?.is_admin) {
        toast.error('No tienes permisos de administrador')
        router.push('/')
        return
      }

      setIsCheckingAuth(false)
    } catch (error) {
      console.error('Error verificando acceso:', error)
      router.push('/admin/login')
    }
  }

  const loadProducts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock, category_id, sku')
        .eq('active', true)
        .order('name', { ascending: true })

      if (error) {
        console.error('Error cargando productos:', error?.message || error)
        toast.error(error?.message ?? 'No se pudieron cargar los productos.')
        return
      }

      const rows = data || []

      if (rows.length === 0) {
        setProducts([])
        return
      }

      const categoryIds = Array.from(
        new Set(rows.map((product) => product.category_id).filter((value): value is string => Boolean(value)))
      )

      let categoriesMap = new Map<string, string>()

      if (categoryIds.length > 0) {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name')
          .in('id', categoryIds)

        if (!categoriesError && categoriesData) {
          categoriesMap = categoriesData.reduce((map, category) => {
            map.set(category.id, category.name)
            return map
          }, new Map<string, string>())
        }
      }

      const enriched = rows.map((product) => ({
        ...product,
        category: product.category_id ? categoriesMap.get(product.category_id) ?? 'Sin categoría' : 'Sin categoría'
      }))

      setProducts(enriched)
    } catch (error) {
      console.error('Error general cargando productos:', error)
      toast.error('No se pudieron cargar los productos.')
    } finally {
      setLoading(false)
    }
  }

  const loadVariants = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('id, size, color, stock')
        .eq('product_id', productId)
        .order('size', { ascending: true })

      if (error) {
        console.error('Error cargando variantes:', error?.message || error)
        toast.error(error?.message ?? 'No se pudieron cargar las variantes.')
        return
      }

      const filtered = (data || []).filter((variant) => variant.stock > 0)
      setVariants(filtered)
      setSelectedVariantId(filtered.length === 1 ? filtered[0].id : '')
    } catch (error) {
      console.error('Error general cargando variantes:', error instanceof Error ? error.message : error)
      toast.error('No se pudieron cargar las variantes.')
    }
  }

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    if (!term) {
      return products.slice(0, 25)
    }

    return products
      .filter((product) => {
        const name = product.name?.toLowerCase() ?? ''
        const sku = product.sku?.toLowerCase() ?? ''
        return name.includes(term) || sku.includes(term)
      })
      .slice(0, 25)
  }, [products, searchTerm])

  const selectedProduct = useMemo(() => {
    return products.find((product) => product.id === selectedProductId) || null
  }, [products, selectedProductId])

  const selectedVariant = useMemo(() => {
    return variants.find((variant) => variant.id === selectedVariantId) || null
  }, [variants, selectedVariantId])

  const handleDiscount = async () => {
    if (!selectedProduct) {
      toast.error('Selecciona un producto.')
      return
    }

    if (variants.length > 0 && !selectedVariantId) {
      toast.error('Elegí la variante que vendiste.')
      return
    }

    const quantityNumber = Number(quantity)
    if (!quantityNumber || quantityNumber <= 0) {
      toast.error('Ingresa una cantidad válida para descontar.')
      return
    }

    setProcessing(true)

    try {
      const { data: latestProduct, error: latestProductError } = await supabase
        .from('products')
        .select('stock, active')
        .eq('id', selectedProduct.id)
        .single()

      if (latestProductError || !latestProduct) {
        throw new Error('No se pudo obtener el stock actual del producto.')
      }

      if (latestProduct.stock < quantityNumber) {
        throw new Error(`Stock insuficiente. Stock disponible: ${latestProduct.stock}.`)
      }

      if (selectedVariantId) {
        const { data: latestVariant, error: latestVariantError } = await supabase
          .from('product_variants')
          .select('stock, active')
          .eq('id', selectedVariantId)
          .single()

        if (latestVariantError || !latestVariant) {
          throw new Error('No se pudo obtener la variante seleccionada.')
        }

        if (latestVariant.stock < quantityNumber) {
          throw new Error(`Stock insuficiente en la variante seleccionada (${latestVariant.stock} disponibles).`)
        }

        const newVariantStock = latestVariant.stock - quantityNumber
        const { error: updateVariantError } = await supabase
          .from('product_variants')
          .update({
            stock: newVariantStock,
            active: newVariantStock > 0 ? latestVariant.active : false
          })
          .eq('id', selectedVariantId)

        if (updateVariantError) {
          throw new Error('No se pudo actualizar la variante seleccionada.')
        }
      }

      const newProductStock = latestProduct.stock - quantityNumber
      const { error: updateProductError } = await supabase
        .from('products')
        .update({
          stock: newProductStock,
          active: newProductStock > 0 ? latestProduct.active : false
        })
        .eq('id', selectedProduct.id)

      if (updateProductError) {
        throw new Error('No se pudo actualizar el stock del producto.')
      }

      const { error: historyError } = await supabase.from('stock_history').insert({
        product_id: selectedProduct.id,
        change_type: 'salida',
        quantity: quantityNumber,
        previous_stock: latestProduct.stock,
        new_stock: newProductStock,
        notes: notes ? notes.trim() : 'Salida manual de stock (venta)'
      })

      if (historyError) {
        console.warn('No se pudo registrar el historial de stock:', historyError)
      }

      toast.success('Stock actualizado correctamente.')

      setProducts((prev) =>
        prev.map((product) =>
          product.id === selectedProduct.id ? { ...product, stock: newProductStock } : product
        )
      )

      const updatedVariants = variants
        .map((variant) =>
          variant.id === selectedVariantId
            ? { ...variant, stock: Math.max(variant.stock - quantityNumber, 0) }
            : variant
        )
        .filter((variant) => variant.stock > 0)

      setVariants(updatedVariants)

      if (selectedVariantId && !updatedVariants.some((variant) => variant.id === selectedVariantId)) {
        setSelectedVariantId(updatedVariants.length === 1 ? updatedVariants[0].id : '')
      }

      setQuantity('')
      setNotes('')
    } catch (error) {
      console.error('Error descontando stock:', error)
      toast.error(
        error instanceof Error ? error.message : 'Ocurrió un error al descontar el stock.'
      )
    } finally {
      setProcessing(false)
    }
  }

  if (isCheckingAuth || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
          <p className="text-sm text-gray-600">Cargando herramientas de inventario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 flex flex-wrap items-center gap-3 justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Registrar salida de stock</h1>
            <p className="text-sm text-gray-600">
              Descuenta manualmente los productos que ya vendiste para mantener tu inventario al día.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => router.push('/admin/inventario')}>
              <Package className="w-4 h-4 mr-2" />
              Volver a Inventario
            </Button>
            <Button variant="outline" onClick={() => router.push('/admin')}>
              <Home className="w-4 h-4 mr-2" />
              Panel Admin
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut()
                router.push('/')
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-[320px,1fr] gap-6">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="w-4 h-4 text-purple-600" />
              Buscar producto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Nombre del producto..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {filteredProducts.length === 0 && (
                <p className="text-sm text-gray-500">No se encontraron productos</p>
              )}
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProductId(product.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedProductId === product.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/60'
                  }`}
                >
                  <p className="font-semibold text-sm text-gray-900">{product.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      Stock: <span className="font-semibold text-gray-700">{product.stock}</span>
                    </span>
                    {product.category && (
                      <Badge variant="secondary" className="text-xs capitalize">
                        {product.category}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MinusCircle className="w-4 h-4 text-red-500" />
                Registrar salida
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedProduct ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <ShoppingBag className="w-12 h-12 text-purple-300 mb-3" />
                  <p className="text-sm text-gray-600">
                    Seleccioná un producto del listado para comenzar.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
                    <h2 className="font-semibold text-gray-900 text-lg">{selectedProduct.name}</h2>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <span>
                        Stock disponible:{' '}
                        <strong className="text-gray-900">{selectedProduct.stock}</strong>
                      </span>
                      {selectedProduct.category && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {selectedProduct.category}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {variants.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Variante (talle / color)
                      </label>
                      <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Elegí la variante que vendiste" />
                        </SelectTrigger>
                        <SelectContent>
                          {variants.map((variant) => (
                            <SelectItem key={variant.id} value={variant.id}>
                              {variant.size || 'Talle único'} • {variant.color || 'Color único'} —{' '}
                              stock {variant.stock}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        Solo se muestran variantes con stock disponible.
                      </p>
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Cantidad a restar</label>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Ej: 5"
                        value={quantity}
                        onChange={(event) => setQuantity(event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Stock restante*</label>
                      <Input
                        readOnly
                        value={
                          quantity && selectedProduct
                            ? Math.max(
                                selectedProduct.stock - Number(quantity || 0),
                                0
                              )
                            : selectedProduct.stock
                        }
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        *Estimado. Si elegís una variante también se actualiza su stock.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Notas (opcional)</label>
                    <Textarea
                      rows={3}
                      placeholder="Ej: Venta a Cliente Mayorista ABC..."
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handleDiscount}
                    disabled={processing}
                    className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        <MinusCircle className="w-4 h-4 mr-2" />
                        Registrar salida de stock
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowLeft className="w-4 h-4 text-gray-500" />
                Atajos útiles
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-3 gap-3">
              <Button variant="outline" className="justify-start" onClick={() => router.push('/admin/inventario')}>
                <Package className="w-4 h-4 mr-2" />
                Inventario completo
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => router.push('/admin/productos')}>
                <ShoppingBag className="w-4 h-4 mr-2" />
                Gestionar productos
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => router.push('/admin/pedidos')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Pedidos recientes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


