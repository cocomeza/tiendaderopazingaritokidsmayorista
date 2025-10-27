'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  Plus,
  Loader2,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react'
import { Spotlight } from '@/components/ui/spotlight'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { CardHoverEffect } from '@/components/ui/card-hover-effect'
import { motion } from 'framer-motion'
import { ImageUploader } from '@/components/admin/ImageUploader'

interface Category {
  id: string
  name: string
}

interface NewProduct {
  name: string
  description: string
  price: number
  wholesale_price: number
  cost_price: number
  stock: number
  low_stock_threshold: number
  category_id: string
  categories: string[] // Nuevo campo para múltiples categorías
  sizes: string[]
  colors: string[]
  images: string[]
  active: boolean
}

export default function NuevoProductoPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  
  // Nuevo formato para imágenes
  interface ImageFile {
    id: string
    file: File
    preview: string
    uploading: boolean
    url?: string
  }
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([])
  
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: '',
    description: '',
    price: 0,
    wholesale_price: 0,
    cost_price: 0,
    stock: 0,
    low_stock_threshold: 5,
    category_id: '',
    categories: [] as string[], // Nuevo campo para múltiples categorías
    sizes: [],
    colors: [],
    images: [],
    active: true
  })

  useEffect(() => {
    loadCategories()
  }, [])

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

  const handleCreateProduct = async () => {
    // Validaciones básicas
    if (!newProduct.name.trim()) {
      alert('El nombre del producto es obligatorio')
      return
    }

    if (newProduct.price <= 0) {
      alert('El precio minorista debe ser mayor a 0')
      return
    }

    if (newProduct.wholesale_price <= 0) {
      alert('El precio mayorista debe ser mayor a 0')
      return
    }

    setCreating(true)
    try {
      // Subir imágenes primero
      const imageUrls = await uploadImagesToSupabase()
      
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: newProduct.name.trim(),
          description: newProduct.description.trim() || null,
          price: newProduct.price,
          wholesale_price: newProduct.wholesale_price,
          cost_price: newProduct.cost_price || null,
          stock: newProduct.stock,
          low_stock_threshold: newProduct.low_stock_threshold,
          category_id: newProduct.categories.length > 0 ? newProduct.categories[0] : null, // Usar la primera categoría seleccionada
          sizes: newProduct.sizes,
          colors: newProduct.colors,
          images: imageUrls, // Usar las URLs de las imágenes subidas
          active: newProduct.active
        }])
        .select()

      if (error) {
        console.error('Error creando producto:', error)
        alert('Error al crear el producto: ' + error.message)
        return
      }

      if (data && data[0]) {
        alert('Producto creado exitosamente!')
        router.push('/admin/productos')
      }
    } catch (error) {
      console.error('Error creando producto:', error)
      alert('Error al crear el producto')
    } finally {
      setCreating(false)
    }
  }

  const handleSizeChange = (size: string, checked: boolean) => {
    if (checked) {
      setNewProduct(prev => ({
        ...prev,
        sizes: [...prev.sizes, size]
      }))
    } else {
      setNewProduct(prev => ({
        ...prev,
        sizes: prev.sizes.filter(s => s !== size)
      }))
    }
  }

  const handleColorChange = (color: string, checked: boolean) => {
    if (checked) {
      setNewProduct(prev => ({
        ...prev,
        colors: [...prev.colors, color]
      }))
    } else {
      setNewProduct(prev => ({
        ...prev,
        colors: prev.colors.filter(c => c !== color)
      }))
    }
  }

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setNewProduct(prev => ({
        ...prev,
        categories: [...prev.categories, categoryId]
      }))
    } else {
      setNewProduct(prev => ({
        ...prev,
        categories: prev.categories.filter(c => c !== categoryId)
      }))
    }
  }

  // Las funciones handleImageUpload y removeImage ya no se necesitan
  // Ahora las maneja el componente ImageUploader

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
          <p className="mt-6 text-gray-600 font-medium">Cargando formulario...</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600"></div>
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
                words="Crear Nuevo Producto"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg"
              />
              <p className="text-lg sm:text-xl md:text-2xl mb-6 max-w-2xl mx-auto text-white/90 font-light px-4">
                Completa todos los campos para agregar un nuevo producto al catálogo mayorista
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
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-2xl p-4 sm:p-6">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-bold">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  Información del Producto Mayorista
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
                        value={newProduct.name}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ej: Remera Básica Niña"
                        className="w-full text-sm sm:text-base"
                      />
                    </div>
                    
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <Textarea
                          value={newProduct.description}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descripción del producto..."
                          rows={3}
                          className="w-full text-sm sm:text-base text-white bg-gray-800 border-gray-600 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Categorías</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {categories.map(category => (
                          <div key={category.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <Checkbox
                              id={`category-${category.id}`}
                              checked={newProduct.categories.includes(category.id)}
                              onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                              className="border-2 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                            />
                            <label htmlFor={`category-${category.id}`} className="text-sm font-semibold text-gray-800 cursor-pointer">
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Precios y Stock */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 border-b pb-2">Precios Mayoristas y Stock</h3>
                    
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Referencia (Retail) *</label>
                        <Input
                          type="number"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                          placeholder="0"
                          className="w-full text-sm sm:text-base"
                        />
                        <p className="text-xs text-gray-500 mt-1">Precio de referencia para comparación</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio Mayorista (Principal) *</label>
                        <Input
                          type="number"
                          value={newProduct.wholesale_price}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, wholesale_price: parseFloat(e.target.value) || 0 }))}
                          placeholder="0"
                          className="w-full text-sm sm:text-base"
                        />
                        <p className="text-xs text-gray-500 mt-1">Precio que verán los clientes - Compra mínima 5 unidades</p>
                      </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Costo</label>
                      <Input
                        type="number"
                        value={newProduct.cost_price}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, cost_price: parseFloat(e.target.value) || 0 }))}
                        placeholder="0"
                        className="w-full text-sm sm:text-base"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial</label>
                      <Input
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        className="w-full text-sm sm:text-base"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                      <Input
                        type="number"
                        value={newProduct.low_stock_threshold}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, low_stock_threshold: parseInt(e.target.value) || 5 }))}
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
                              checked={newProduct.sizes.includes(size)}
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
                              checked={newProduct.colors.includes(color)}
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
                        checked={newProduct.active}
                        onCheckedChange={(checked) => setNewProduct(prev => ({ ...prev, active: checked as boolean }))}
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
                  
                  {/* Componente mejorado de Upload */}
                  <ImageUploader
                    images={imageFiles}
                    onImagesChange={setImageFiles}
                    maxImages={10}
                  />
                </div>
                
                {/* Botones de Acción */}
                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/admin/productos')}
                    disabled={creating}
                    className="w-full sm:w-auto"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a Productos
                  </Button>
                  <Button 
                    onClick={handleCreateProduct}
                    disabled={creating || uploadingImages}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold w-full sm:w-auto"
                  >
                    {creating || uploadingImages ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {uploadingImages ? 'Subiendo imágenes...' : 'Creando producto...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Crear Producto
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
