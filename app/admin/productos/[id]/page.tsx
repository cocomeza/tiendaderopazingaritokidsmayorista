'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import { 
  Save,
  ArrowLeft,
  Loader2,
  X
} from 'lucide-react'
import { Spotlight } from '@/components/ui/spotlight'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { CardHoverEffect } from '@/components/ui/card-hover-effect'
import { motion } from 'framer-motion'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { PRODUCT_SIZES } from '@/lib/config/product-sizes'
import { PRODUCT_COLORS } from '@/lib/config/product-colors'
import { AddCustomColor } from '@/components/admin/AddCustomColor'
import { AddCustomSize } from '@/components/admin/AddCustomSize'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  wholesale_price: number
  cost_price: number | null
  stock: number
  low_stock_threshold: number
  category_id: string | null
  sizes: string[]
  colors: string[]
  images: string[]
  active: boolean
  created_at: string
  updated_at: string
}

export default function EditarProductoPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [customColors, setCustomColors] = useState<string[]>([])
  const [customSizes, setCustomSizes] = useState<string[]>([])
  
  // Nuevo formato para imágenes
  interface ImageFile {
    id: string
    file: File
    preview: string
    uploading: boolean
    url?: string
  }
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([])
  
  type VariantFormEntry = {
    key: string
    size: string | null
    color: string | null
    stockInput: string
  }

  const [variantMatrix, setVariantMatrix] = useState<Record<string, VariantFormEntry>>({})

  const getVariantKey = (size: string | null, color: string | null) => `${size ?? 'null'}__${color ?? 'null'}`

  const generateVariantCombos = (sizes: string[], colors: string[]) => {
    if (sizes.length > 0 && colors.length > 0) {
      return sizes.flatMap((size) => colors.map((color) => ({ size, color })))
    }

    if (sizes.length > 0) {
      return sizes.map((size) => ({ size, color: null as string | null }))
    }

    if (colors.length > 0) {
      return colors.map((color) => ({ size: null as string | null, color }))
    }

    return []
  }

  const updateVariantMatrix = (sizes: string[], colors: string[]) => {
    setVariantMatrix((prev) => {
      const combos = generateVariantCombos(sizes, colors)

      if (combos.length === 0) {
        return {}
      }

      const next: Record<string, VariantFormEntry> = {}

      combos.forEach(({ size, color }) => {
        const key = getVariantKey(size, color)
        const previousEntry = prev[key]

        next[key] = {
          key,
          size,
          color,
          stockInput: previousEntry ? previousEntry.stockInput : '',
        }
      })

      return next
    })
  }

  const handleVariantStockInput = (key: string, value: string) => {
    const sanitizedValue = value === '' ? '' : String(Math.max(0, parseInt(value, 10) || 0))

    setVariantMatrix((prev) => {
      const entry = prev[key]
      if (!entry) return prev

      return {
        ...prev,
        [key]: {
          ...entry,
          stockInput: sanitizedValue,
        },
      }
    })
  }

  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    wholesale_price: 0,
    cost_price: 0,
    stock: 0,
    low_stock_threshold: 5,
    category_id: '',
    sizes: [] as string[],
    colors: [] as string[],
    images: [] as string[],
    active: true
  })

  useEffect(() => {
    if (productId) {
      loadProduct()
      loadCategories()
      loadCustomColors()
      loadCustomSizes()
    }
  }, [productId])

  const variantEntries = Object.values(variantMatrix)
  const sortedVariantEntries = [...variantEntries].sort((a, b) => {
    const sizeComparison = (a.size ?? '').localeCompare(b.size ?? '')
    if (sizeComparison !== 0) return sizeComparison
    return (a.color ?? '').localeCompare(b.color ?? '')
  })
  const usingVariants = variantEntries.length > 0
  const totalVariantStock = variantEntries.reduce((sum, entry) => sum + (parseInt(entry.stockInput, 10) || 0), 0)
  const hasSizesSelected = formData.sizes.length > 0
  const hasColorsSelected = formData.colors.length > 0

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error) {
        console.error('Error cargando producto:', error)
        alert('Error al cargar el producto')
        router.push('/admin/productos')
        return
      }

      if (data) {
        setProduct(data)
        setFormData({
          name: data.name || '',
          description: data.description || '',
          price: data.price || 0,
          wholesale_price: data.wholesale_price || 0,
          cost_price: data.cost_price || 0,
          stock: data.stock || 0,
          low_stock_threshold: data.low_stock_threshold || 5,
          category_id: data.category_id || '',
          sizes: data.sizes || [],
          colors: data.colors || [],
          images: data.images || [],
          active: data.active || true
        })
        // Las imágenes existentes se manejan a través de formData.images
        // No necesitamos setImagePreviews ya que el nuevo sistema usa ImageUploader
        await loadVariants(data.id)
      }
    } catch (error) {
      console.error('Error cargando producto:', error)
      alert('Error al cargar el producto')
      router.push('/admin/productos')
    }
  }

  const loadVariants = async (productIdToLoad: string) => {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('id, size, color, stock, active')
        .eq('product_id', productIdToLoad)

      if (error) {
        console.debug('Variantes no disponibles para producto', productIdToLoad, error)
        setVariantMatrix({})
        return
      }

      if (!data || data.length === 0) {
        setVariantMatrix({})
        return
      }

      const variantsMap: Record<string, VariantFormEntry> = {}

      data.forEach((variant) => {
        const key = getVariantKey(variant.size, variant.color)
        variantsMap[key] = {
          key,
          size: variant.size,
          color: variant.color,
          stockInput: variant.stock != null ? String(variant.stock) : '',
        }
      })

      setVariantMatrix(variantsMap)
    } catch (err) {
      console.error('Error general cargando variantes:', err)
    }
  }

  const loadCategories = async () => {
    try {
      // Cargar todas las categorías (activas e inactivas) para admin
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, active')
        .order('name')

      if (error) {
        console.error('Error cargando categorías:', error)
        return
      }

      setCategories(data || [])
      console.log(`✅ Cargadas ${data?.length || 0} categorías`)
    } catch (error) {
      console.error('Error cargando categorías:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCustomColors = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_colors')
        .select('name')
        .order('name')

      if (error) {
        console.error('Error cargando colores personalizados:', error)
        return
      }

      setCustomColors((data || []).map(c => c.name))
    } catch (error) {
      console.error('Error cargando colores personalizados:', error)
    }
  }

  const loadCustomSizes = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_sizes')
        .select('name')
        .order('name')

      if (error) {
        console.error('Error cargando tallas personalizadas:', error)
        return
      }

      setCustomSizes((data || []).map(s => s.name))
    } catch (error) {
      console.error('Error cargando tallas personalizadas:', error)
    }
  }

  const handleColorAdded = (colorName: string) => {
    setCustomColors(prev => [...prev, colorName])
    setFormData(prev => {
      const updatedColors = Array.from(new Set([...prev.colors, colorName]))
      updateVariantMatrix(prev.sizes, updatedColors)
      return {
        ...prev,
        colors: updatedColors
      }
    })
  }

  const handleSizeAdded = (sizeName: string) => {
    setCustomSizes(prev => [...prev, sizeName])
    setFormData(prev => {
      const updatedSizes = Array.from(new Set([...prev.sizes, sizeName]))
      updateVariantMatrix(updatedSizes, prev.colors)
      return {
        ...prev,
        sizes: updatedSizes
      }
    })
  }

  const handleSaveProduct = async () => {
    // Validaciones básicas
    if (!formData.name.trim()) {
      alert('El nombre del producto es obligatorio')
      return
    }

    if (formData.wholesale_price <= 0) {
      alert('El precio mayorista debe ser mayor a 0')
      return
    }

    const variantEntriesForSubmit = Object.values(variantMatrix)
    const useVariants = variantEntriesForSubmit.length > 0
    const totalVariantStockForSubmit = variantEntriesForSubmit.reduce((sum, entry) => sum + (parseInt(entry.stockInput, 10) || 0), 0)

    if (useVariants && totalVariantStockForSubmit === 0) {
      alert('Asigná stock a al menos una variante antes de guardar')
      return
    }

    if (!useVariants && formData.stock <= 0) {
      alert('El stock debe ser mayor a 0')
      return
    }

    setSaving(true)
    try {
      // Subir nuevas imágenes si las hay
      const newImageUrls = await uploadImagesToSupabase()
      
      // Combinar imágenes existentes con las nuevas
      const allImages = [...formData.images, ...newImageUrls]

      const uniqueSizes = useVariants
        ? Array.from(new Set(
            variantEntriesForSubmit
              .map((entry) => entry.size)
              .filter((size): size is string => Boolean(size))
          ))
        : formData.sizes

      const uniqueColors = useVariants
        ? Array.from(new Set(
            variantEntriesForSubmit
              .map((entry) => entry.color)
              .filter((color): color is string => Boolean(color))
          ))
        : formData.colors

      const totalStockToSave = useVariants ? totalVariantStockForSubmit : formData.stock
      
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          price: formData.wholesale_price, // Usar el precio mayorista como precio de referencia
          wholesale_price: formData.wholesale_price,
          cost_price: formData.cost_price || null,
          stock: totalStockToSave,
          low_stock_threshold: formData.low_stock_threshold,
          category_id: formData.category_id || null,
          sizes: uniqueSizes,
          colors: uniqueColors,
          images: allImages,
          active: formData.active
        })
        .eq('id', productId)

      if (error) {
        console.error('Error actualizando producto:', error)
        alert('Error al actualizar el producto: ' + error.message)
        return
      }

      // Actualizar variantes en la base de datos
      const { error: deleteError } = await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', productId)

      if (deleteError) {
        console.debug('No se pudieron limpiar variantes previas, se continuará con el guardado.', deleteError)
      }

      if (useVariants && variantEntriesForSubmit.length > 0) {
        const variantPayload = variantEntriesForSubmit.map((entry) => ({
          product_id: productId,
          size: entry.size,
          color: entry.color,
          stock: parseInt(entry.stockInput, 10) || 0,
          active: (parseInt(entry.stockInput, 10) || 0) > 0,
        }))

        const { error: insertError } = await supabase
          .from('product_variants')
          .insert(variantPayload)

        if (insertError) {
          console.error('Error insertando variantes:', insertError)
          alert('El producto se actualizó, pero ocurrió un error guardando las variantes: ' + insertError.message)
          return
        }
      }

      alert('Producto actualizado exitosamente!')
      router.push('/admin/productos')
    } catch (error) {
      console.error('Error actualizando producto:', error)
      alert('Error al actualizar el producto')
    } finally {
      setSaving(false)
    }
  }

  const handleSizeChange = (size: string, checked: boolean) => {
    setFormData(prev => {
      const updatedSizes = checked
        ? Array.from(new Set([...prev.sizes, size]))
        : prev.sizes.filter(s => s !== size)

      updateVariantMatrix(updatedSizes, prev.colors)

      return {
        ...prev,
        sizes: updatedSizes
      }
    })
  }

  const handleColorChange = (color: string, checked: boolean) => {
    setFormData(prev => {
      const updatedColors = checked
        ? Array.from(new Set([...prev.colors, color]))
        : prev.colors.filter(c => c !== color)

      updateVariantMatrix(prev.sizes, updatedColors)

      return {
        ...prev,
        colors: updatedColors
      }
    })
  }

  // Las funciones handleImageUpload y removeImage ahora se manejan en ImageUploader

  const uploadImagesToSupabase = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return []

    setUploadingImages(true)
    const uploadedUrls: string[] = []

    try {
      for (const imageData of imageFiles) {
        const fileExt = imageData.file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `product-images/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, imageData.file)

        if (uploadError) {
          console.error('Error subiendo imagen:', uploadError)
          throw uploadError
        }

        const { data } = supabase.storage
          .from('products')
          .getPublicUrl(filePath)

        uploadedUrls.push(data.publicUrl)
      }

      return uploadedUrls
    } catch (error) {
      console.error('Error subiendo imágenes:', error)
      throw error
    } finally {
      setUploadingImages(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Cargando producto...</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-medium">Producto no encontrado</p>
          <Button onClick={() => router.push('/admin/productos')} className="mt-4">
            Volver a Productos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        <div className="relative container mx-auto px-4 py-12 sm:py-16">
          <div className="text-center">
            <Spotlight
              className="-top-40 left-0 md:left-60 md:-top-20"
              fill="white"
            />
            <BackgroundBeams className="absolute inset-0 z-0" />
            <div className="relative z-10">
              <TextGenerateEffect
                words="Editar Producto"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg"
              />
              <p className="text-lg sm:text-xl md:text-2xl mb-6 max-w-2xl mx-auto text-white/90 font-light px-4">
                Modifica la información y las imágenes del producto
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="container mx-auto px-4 py-6 sm:py-8 -mt-16 sm:-mt-20 relative z-20">
        <CardHoverEffect>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-2xl p-4 sm:p-6">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-bold">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  Editar Producto: {product.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {/* Información Básica */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 border-b pb-2">Información Básica</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ej: Remera Básica Niña"
                        className="w-full text-sm sm:text-base"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descripción del producto..."
                        rows={3}
                        className="w-full text-sm sm:text-base"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                      <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Precios y Stock */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 border-b pb-2">Precio Mayorista y Stock</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio Mayorista *</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.wholesale_price}
                        onChange={(e) => setFormData(prev => ({ ...prev, wholesale_price: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                        className="w-full text-sm sm:text-base"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Precio que verán los clientes - Compra mínima 5 unidades</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Costo</label>
                      <Input
                        type="number"
                        value={formData.cost_price}
                        onChange={(e) => setFormData(prev => ({ ...prev, cost_price: parseFloat(e.target.value) || 0 }))}
                        placeholder="0"
                        className="w-full text-sm sm:text-base"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Actual</label>
                      <Input
                        type="number"
                        value={usingVariants ? totalVariantStock : formData.stock}
                        onChange={(e) => {
                          if (usingVariants) return
                          const parsed = Math.max(0, parseInt(e.target.value, 10) || 0)
                          setFormData(prev => ({ ...prev, stock: parsed }))
                        }}
                        placeholder="0"
                        className="w-full text-sm sm:text-base"
                        disabled={usingVariants}
                      />
                      {usingVariants && (
                        <p className="text-xs text-purple-600 mt-1">
                          El stock total se calcula automáticamente a partir de las variantes ({totalVariantStock} unidades).
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                      <Input
                        type="number"
                        value={formData.low_stock_threshold}
                        onChange={(e) => setFormData(prev => ({ ...prev, low_stock_threshold: parseInt(e.target.value) || 5 }))}
                        placeholder="5"
                        className="w-full text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  {/* Tallas y Colores */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 border-b pb-2">Tallas y Colores</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tallas Disponibles</label>
                      <div className="space-y-4">
                        {/* Tallas Bebés */}
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-2">BEBÉS</p>
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {PRODUCT_SIZES.BEBES.map(size => (
                              <div key={size} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <Checkbox
                                  id={`size-${size}`}
                                  checked={formData.sizes.includes(size)}
                                  onCheckedChange={(checked) => handleSizeChange(size, checked as boolean)}
                                  className="border-2 border-gray-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 data-[state=checked]:text-white"
                                />
                                <label htmlFor={`size-${size}`} className="text-xs font-semibold text-gray-800 cursor-pointer">
                                  {size}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Tallas Niños */}
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-2">NIÑOS</p>
                          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                            {PRODUCT_SIZES.NINOS.map(size => (
                              <div key={size} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <Checkbox
                                  id={`size-${size}`}
                                  checked={formData.sizes.includes(size)}
                                  onCheckedChange={(checked) => handleSizeChange(size, checked as boolean)}
                                  className="border-2 border-gray-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 data-[state=checked]:text-white"
                                />
                                <label htmlFor={`size-${size}`} className="text-xs font-semibold text-gray-800 cursor-pointer">
                                  {size}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Tallas Adultos */}
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-2">ADULTOS</p>
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {PRODUCT_SIZES.ADULTOS.map(size => (
                              <div key={size} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <Checkbox
                                  id={`size-${size}`}
                                  checked={formData.sizes.includes(size)}
                                  onCheckedChange={(checked) => handleSizeChange(size, checked as boolean)}
                                  className="border-2 border-gray-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 data-[state=checked]:text-white"
                                />
                                <label htmlFor={`size-${size}`} className="text-xs font-semibold text-gray-800 cursor-pointer">
                                  {size}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Tallas Zapatos */}
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-2">ZAPATOS (17-44)</p>
                          <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-10 gap-2 max-h-48 overflow-y-auto">
                            {PRODUCT_SIZES.ZAPATOS.map(size => (
                              <div key={size} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <Checkbox
                                  id={`size-${size}`}
                                  checked={formData.sizes.includes(size)}
                                  onCheckedChange={(checked) => handleSizeChange(size, checked as boolean)}
                                  className="border-2 border-gray-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 data-[state=checked]:text-white"
                                />
                                <label htmlFor={`size-${size}`} className="text-xs font-semibold text-gray-800 cursor-pointer">
                                  {size}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Tallas Personalizadas */}
                        {customSizes.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-2">TALLAS PERSONALIZADAS ⭐</p>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                              {customSizes.map(size => (
                                <div key={`custom-${size}`} className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200">
                                  <Checkbox
                                    id={`size-custom-${size}`}
                                    checked={formData.sizes.includes(size)}
                                    onCheckedChange={(checked) => handleSizeChange(size, checked as boolean)}
                                    className="border-2 border-green-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 data-[state=checked]:text-white"
                                  />
                                  <label htmlFor={`size-custom-${size}`} className="text-xs font-semibold text-green-800 cursor-pointer">
                                    {size} ⭐
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <AddCustomSize 
                        onSizeAdded={handleSizeAdded}
                        existingSizes={[...PRODUCT_SIZES.ALL, ...customSizes]}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Colores Disponibles</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                        {/* Colores estándar */}
                        {PRODUCT_COLORS.map(color => (
                          <div key={color} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <Checkbox
                              id={`color-${color}`}
                              checked={formData.colors.includes(color)}
                              onCheckedChange={(checked) => handleColorChange(color, checked as boolean)}
                              className="border-2 border-gray-400 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 data-[state=checked]:text-white"
                            />
                            <label htmlFor={`color-${color}`} className="text-xs font-semibold text-gray-800 cursor-pointer">
                              {color}
                            </label>
                          </div>
                        ))}
                        {/* Colores personalizados */}
                        {customColors.map(color => (
                          <div key={`custom-${color}`} className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200">
                            <Checkbox
                              id={`color-custom-${color}`}
                              checked={formData.colors.includes(color)}
                              onCheckedChange={(checked) => handleColorChange(color, checked as boolean)}
                              className="border-2 border-purple-400 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 data-[state=checked]:text-white"
                            />
                            <label htmlFor={`color-custom-${color}`} className="text-xs font-semibold text-purple-800 cursor-pointer">
                              {color} ⭐
                            </label>
                          </div>
                        ))}
                      </div>
                      <AddCustomColor 
                        onColorAdded={handleColorAdded}
                        existingColors={[...PRODUCT_COLORS, ...customColors]}
                      />
                    </div>

                    {usingVariants && (
                      <div className="space-y-3">
                        <h4 className="text-sm sm:text-base font-semibold text-gray-800 border-b pb-2">Stock por combinación</h4>
                        <div className="rounded-xl border border-purple-100 bg-white/80 p-3 sm:p-4 shadow-sm">
                          <p className="text-xs text-gray-500 mb-3">
                            Actualizá el stock por talle y color para mantener la disponibilidad real del producto.
                          </p>
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-xs sm:text-sm">
                              <thead className="bg-purple-50">
                                <tr>
                                  {hasSizesSelected && <th className="px-3 py-2 text-left font-semibold text-purple-700">Talle</th>}
                                  {hasColorsSelected && <th className="px-3 py-2 text-left font-semibold text-purple-700">Color</th>}
                                  <th className="px-3 py-2 text-left font-semibold text-purple-700">Stock</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sortedVariantEntries.map((entry) => (
                                  <tr key={entry.key} className="border-b last:border-0">
                                    {hasSizesSelected && (
                                      <td className="px-3 py-2 font-medium text-gray-700">
                                        {entry.size || '—'}
                                      </td>
                                    )}
                                    {hasColorsSelected && (
                                      <td className="px-3 py-2 capitalize text-gray-700">
                                        {entry.color || '—'}
                                      </td>
                                    )}
                                    <td className="px-3 py-2">
                                      <Input
                                        type="number"
                                        min={0}
                                        value={entry.stockInput}
                                        placeholder=""
                                        onChange={(e) => handleVariantStockInput(entry.key, e.target.value)}
                                        className="w-24 text-sm"
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <Badge className="bg-purple-100 text-purple-700 border border-purple-200 font-semibold">
                              Total disponible: {totalVariantStock} unidades
                            </Badge>
                            <span className="text-xs text-gray-500">El stock general del producto se sincroniza con este total.</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Checkbox
                        id="active"
                        checked={formData.active}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked as boolean }))}
                        className="border-2 border-gray-400 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 data-[state=checked]:text-white"
                      />
                      <label htmlFor="active" className="text-sm font-semibold text-gray-800 cursor-pointer">
                        Producto Activo
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Sección de Imágenes */}
                <div className="col-span-full">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Imágenes del Producto</h3>
                  
                  {/* Imágenes Existentes */}
                  {formData.images.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Imágenes actuales del producto:</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {formData.images.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`Imagen ${index + 1}`}
                              className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  images: prev.images.filter((_, i) => i !== index)
                                }))
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Nuevo sistema de upload mejorado */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Agregar nuevas imágenes:</h4>
                    <ImageUploader
                      images={imageFiles}
                      onImagesChange={setImageFiles}
                      maxImages={10}
                    />
                  </div>
                </div>
                
                {/* Botones de Acción */}
                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/admin/productos')}
                    disabled={saving}
                    className="w-full sm:w-auto"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a Productos
                  </Button>
                  <Button 
                    onClick={handleSaveProduct}
                    disabled={saving || uploadingImages}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold w-full sm:w-auto"
                  >
                    {saving || uploadingImages ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {uploadingImages ? 'Subiendo imágenes...' : 'Guardando cambios...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </CardHoverEffect>
      </div>
    </div>
  )
}
