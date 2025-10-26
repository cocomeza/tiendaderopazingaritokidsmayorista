'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { supabase } from '@/lib/supabase/client-fixed'
import { 
  Save,
  ArrowLeft,
  Loader2,
  Upload,
  X,
  Image as ImageIcon,
  Trash2
} from 'lucide-react'
import { Spotlight } from '@/components/ui/spotlight'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { CardHoverEffect } from '@/components/ui/card-hover-effect'
import { motion } from 'framer-motion'
import { OptimizedImage } from '@/components/ui/OptimizedImage'

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
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  
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
    }
  }, [productId])

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
        setImagePreviews(data.images || [])
      }
    } catch (error) {
      console.error('Error cargando producto:', error)
      alert('Error al cargar el producto')
      router.push('/admin/productos')
    }
  }

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')

      if (error) {
        console.error('Error cargando categorías:', error)
        return
      }

      setCategories(data || [])
    } catch (error) {
      console.error('Error cargando categorías:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProduct = async () => {
    // Validaciones básicas
    if (!formData.name.trim()) {
      alert('El nombre del producto es obligatorio')
      return
    }

    if (formData.price <= 0) {
      alert('El precio minorista debe ser mayor a 0')
      return
    }

    if (formData.wholesale_price <= 0) {
      alert('El precio mayorista debe ser mayor a 0')
      return
    }

    setSaving(true)
    try {
      // Subir nuevas imágenes si las hay
      const newImageUrls = await uploadImagesToSupabase()
      
      // Combinar imágenes existentes con las nuevas
      const allImages = [...formData.images, ...newImageUrls]
      
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          price: formData.price,
          wholesale_price: formData.wholesale_price,
          cost_price: formData.cost_price || null,
          stock: formData.stock,
          low_stock_threshold: formData.low_stock_threshold,
          category_id: formData.category_id || null,
          sizes: formData.sizes,
          colors: formData.colors,
          images: allImages,
          active: formData.active
        })
        .eq('id', productId)

      if (error) {
        console.error('Error actualizando producto:', error)
        alert('Error al actualizar el producto: ' + error.message)
        return
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
    if (checked) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, size]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        sizes: prev.sizes.filter(s => s !== size)
      }))
    }
  }

  const handleColorChange = (color: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, color]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        colors: prev.colors.filter(c => c !== color)
      }))
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Validar tipos de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const validFiles = files.filter(file => validTypes.includes(file.type))
    
    if (validFiles.length !== files.length) {
      alert('Solo se permiten archivos JPG, PNG y WebP')
      return
    }

    // Validar tamaño (máximo 5MB por imagen)
    const maxSize = 5 * 1024 * 1024 // 5MB
    const validSizeFiles = validFiles.filter(file => file.size <= maxSize)
    
    if (validSizeFiles.length !== validFiles.length) {
      alert('Las imágenes no pueden superar los 5MB cada una')
      return
    }

    setImageFiles(prev => [...prev, ...validSizeFiles])

    // Crear previews
    validSizeFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    // Si es una imagen existente (no nueva), la removemos de la lista de imágenes del producto
    if (index < formData.images.length) {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }))
    } else {
      // Si es una imagen nueva, la removemos de los archivos y previews
      const newFileIndex = index - formData.images.length
      setImageFiles(prev => prev.filter((_, i) => i !== newFileIndex))
    }
    
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImagesToSupabase = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return []

    setUploadingImages(true)
    const uploadedUrls: string[] = []

    try {
      for (const file of imageFiles) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `product-images/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file)

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
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 border-b pb-2">Precios Mayoristas y Stock</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Referencia (Retail) *</label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        placeholder="0"
                        className="w-full text-sm sm:text-base"
                      />
                      <p className="text-xs text-gray-500 mt-1">Precio de referencia para comparación</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio Mayorista (Principal) *</label>
                      <Input
                        type="number"
                        value={formData.wholesale_price}
                        onChange={(e) => setFormData(prev => ({ ...prev, wholesale_price: parseFloat(e.target.value) || 0 }))}
                        placeholder="0"
                        className="w-full text-sm sm:text-base"
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
                        value={formData.stock}
                        onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        className="w-full text-sm sm:text-base"
                      />
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
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                          <div key={size} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <Checkbox
                              id={`size-${size}`}
                              checked={formData.sizes.includes(size)}
                              onCheckedChange={(checked) => handleSizeChange(size, checked as boolean)}
                              className="border-2 border-gray-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 data-[state=checked]:text-white"
                            />
                            <label htmlFor={`size-${size}`} className="text-sm font-semibold text-gray-800 cursor-pointer">
                              {size}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Colores Disponibles</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {['Blanco', 'Negro', 'Azul', 'Rojo', 'Verde', 'Amarillo', 'Rosa', 'Gris'].map(color => (
                          <div key={color} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <Checkbox
                              id={`color-${color}`}
                              checked={formData.colors.includes(color)}
                              onCheckedChange={(checked) => handleColorChange(color, checked as boolean)}
                              className="border-2 border-gray-400 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 data-[state=checked]:text-white"
                            />
                            <label htmlFor={`color-${color}`} className="text-sm font-semibold text-gray-800 cursor-pointer">
                              {color}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
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
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Imágenes actuales:</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {formData.images.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <OptimizedImage
                              src={imageUrl}
                              alt={`Imagen ${index + 1}`}
                              className="w-full h-24 rounded-lg border border-gray-200"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
                    <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-4">
                      Arrastra nuevas imágenes aquí o haz clic para seleccionar
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Agregar Imágenes
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Máximo 5MB por imagen. Formatos: JPG, PNG, WebP
                    </p>
                  </div>

                  {/* Image Previews */}
                  {imageFiles.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Nuevas imágenes:</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {imageFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              onClick={() => removeImage(formData.images.length + index)}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg">
                              {file.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
