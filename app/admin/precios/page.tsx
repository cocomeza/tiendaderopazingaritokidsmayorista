'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client-fixed'
import { ArrowUp, ArrowDown, Percent, Package, AlertCircle, CheckCircle } from 'lucide-react'
import { Spotlight } from '@/components/ui/spotlight'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { CardHoverEffect } from '@/components/ui/card-hover-effect'
import { motion } from 'framer-motion'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  price: number
  wholesale_price: number
  category_id: string
  category_name?: string
  new_retail_price?: number
  new_wholesale_price?: number
}

export default function PreciosPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [percentage, setPercentage] = useState<string>('')
  const [operation, setOperation] = useState<'increase' | 'decrease'>('increase')
  const [priceType, setPriceType] = useState<'all' | 'retail' | 'wholesale'>('wholesale')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<Product[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (percentage && products.length > 0) {
      calculatePreview()
    } else {
      setPreview([])
    }
  }, [percentage, operation, priceType, selectedCategory, products])

  const loadData = async () => {
    try {
      // Cargar categorías
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')

      if (categoriesError) throw categoriesError

      // Cargar productos
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id, 
          name, 
          price, 
          wholesale_price, 
          category_id,
          categories (name)
        `)
        .eq('active', true)

      if (productsError) throw productsError

      const productsWithCategory = productsData.map(product => ({
        ...product,
        category_name: product.categories?.[0]?.name || 'Sin categoría'
      }))

      setCategories(categoriesData || [])
      setProducts(productsWithCategory || [])
    } catch (error) {
      console.error('Error loading data:', error)
      setMessage({ type: 'error', text: 'Error al cargar los datos' })
    }
  }

  const calculatePreview = () => {
    const perc = parseFloat(percentage)
    if (isNaN(perc) || perc <= 0) {
      setPreview([])
      return
    }

    let filteredProducts = products
    if (selectedCategory !== 'all') {
      filteredProducts = products.filter(p => p.category_id === selectedCategory)
    }

    const previewData = filteredProducts.map(product => {
      let newRetailPrice = product.price
      let newWholesalePrice = product.wholesale_price

      if (operation === 'increase') {
        if (priceType === 'all' || priceType === 'retail') {
          newRetailPrice = product.price * (1 + perc / 100)
        }
        if (priceType === 'all' || priceType === 'wholesale') {
          newWholesalePrice = product.wholesale_price * (1 + perc / 100)
        }
      } else {
        if (priceType === 'all' || priceType === 'retail') {
          newRetailPrice = product.price * (1 - perc / 100)
        }
        if (priceType === 'all' || priceType === 'wholesale') {
          newWholesalePrice = product.wholesale_price * (1 - perc / 100)
        }
      }

      return {
        ...product,
        new_retail_price: newRetailPrice,
        new_wholesale_price: newWholesalePrice
      }
    })

    setPreview(previewData)
  }

  const applyPriceChanges = async () => {
    if (!percentage || preview.length === 0) return

    setLoading(true)
    setMessage(null)

    try {
      const updates = preview.map(product => ({
        id: product.id,
        ...(priceType === 'all' || priceType === 'retail' ? { price: product.new_retail_price } : {}),
        ...(priceType === 'all' || priceType === 'wholesale' ? { wholesale_price: product.new_wholesale_price } : {})
      }))

      const { error } = await supabase
        .from('products')
        .upsert(updates)

      if (error) throw error

      setMessage({ 
        type: 'success', 
        text: `Precios actualizados exitosamente para ${updates.length} productos` 
      })
      
      // Recargar datos
      await loadData()
      setPreview([])
      setPercentage('')
    } catch (error) {
      console.error('Error updating prices:', error)
      setMessage({ type: 'error', text: 'Error al actualizar los precios' })
    } finally {
      setLoading(false)
    }
  }

  const getSelectedProductsCount = () => {
    if (selectedCategory === 'all') return products.length
    return products.filter(p => p.category_id === selectedCategory).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Hero Header with Spotlight and TextGenerateEffect */}
      <div className="relative h-[40vh] w-full flex items-center justify-center overflow-hidden rounded-b-3xl shadow-xl">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />
        <BackgroundBeams className="absolute inset-0 z-0" />
        <div className="absolute inset-0 bg-black/30 z-5"></div>
        <div className="relative z-10 text-center p-4">
          <TextGenerateEffect
            words="Gestión de Precios"
            className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg"
          />
          <p className="text-lg md:text-xl text-white/95 mb-8 drop-shadow-md">
            Ajusta precios masivamente por categorías o todos los productos
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-20 relative z-20">

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel de Control */}
          <div className="lg:col-span-1">
            <CardHoverEffect>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-2xl">
                    <CardTitle className="flex items-center gap-2 text-xl font-bold">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Percent className="w-5 h-5" />
                      </div>
                      Ajuste de Precios
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <Label htmlFor="category" className="text-gray-700 font-semibold mb-2 block">Categoría</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="bg-white border-gray-300 rounded-lg h-12 text-base shadow-sm hover:shadow-md transition-all duration-200">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="all" className="py-3 text-base">Todas las categorías</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id} className="py-3 text-base">
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-blue-600 mt-2 font-semibold flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {getSelectedProductsCount()} productos seleccionados
                      </p>
                    </div>

                                                               <div>
                        <Label htmlFor="operation" className="text-gray-700 font-semibold mb-2 block">Operación</Label>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            variant={operation === 'increase' ? 'default' : 'outline'}
                            onClick={() => setOperation('increase')}
                            className={`w-full sm:flex-1 py-3 rounded-xl transition-all duration-300 font-medium ${
                              operation === 'increase' 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl' 
                                : 'bg-white border-gray-300 hover:bg-gray-50 hover:shadow-md'
                            }`}
                          >
                            <ArrowUp className="w-4 h-4 mr-2" />
                            Aumentar
                          </Button>
                          <Button
                            variant={operation === 'decrease' ? 'default' : 'outline'}
                            onClick={() => setOperation('decrease')}
                            className={`w-full sm:flex-1 py-3 rounded-xl transition-all duration-300 font-medium ${
                              operation === 'decrease' 
                                ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl' 
                                : 'bg-white border-gray-300 hover:bg-gray-50 hover:shadow-md'
                            }`}
                          >
                            <ArrowDown className="w-4 h-4 mr-2" />
                            Reducir
                          </Button>
                        </div>
                      </div>

                    <div>
                      <Label htmlFor="percentage" className="text-gray-700 font-semibold mb-2 block">Porcentaje</Label>
                      <Input
                        id="percentage"
                        type="number"
                        placeholder="Ej: 10"
                        value={percentage}
                        onChange={(e) => setPercentage(e.target.value)}
                        min="0"
                        max="100"
                        className="bg-white border-gray-300 rounded-lg h-12 text-base shadow-sm hover:shadow-md transition-all duration-200"
                      />
                    </div>

                    <div>
                      <Label htmlFor="priceType" className="text-gray-700 font-semibold mb-2 block">Tipo de Precio</Label>
                      <Select value={priceType} onValueChange={(value: any) => setPriceType(value)}>
                        <SelectTrigger className="bg-white border-gray-300 rounded-lg h-12 text-base shadow-sm hover:shadow-md transition-all duration-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          <SelectItem value="wholesale" className="py-3 text-base">Mayorista</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-4">
                      <Button
                        onClick={calculatePreview}
                        disabled={!percentage || loading}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        {loading ? 'Generando...' : 'Generar Vista Previa'}
                      </Button>
                    </div>

                    {preview.length > 0 && (
                      <div className="pt-4 border-t border-white/20">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Productos a actualizar:</span>
                            <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">{preview.length}</Badge>
                          </div>
                          <Button 
                            onClick={applyPriceChanges} 
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                          >
                            {loading ? 'Actualizando...' : 'Aplicar Cambios'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </CardHoverEffect>
          </div>

          {/* Vista Previa */}
          <div className="lg:col-span-2">
            <CardHoverEffect>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-2xl">
                    <CardTitle className="flex items-center gap-2 text-xl font-bold">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5" />
                      </div>
                      Vista Previa de Cambios
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {preview.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                          <Package className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium">Configura los parámetros para ver la vista previa</p>
                        <p className="text-sm mt-2">Selecciona categoría, operación y porcentaje</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {preview.map((product) => (
                          <div key={product.id} className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium text-gray-800">{product.name}</h4>
                                <p className="text-sm text-gray-600">{product.category_name}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {(priceType === 'all' || priceType === 'retail') && (
                                <div>
                                  <p className="text-gray-600 font-medium">Precio Retail:</p>
                                  <div className="flex items-center gap-2">
                                    <span className="line-through text-gray-400">
                                      ${product.price.toLocaleString('es-AR')}
                                    </span>
                                    <span className="font-semibold text-green-600">
                                      ${product.new_retail_price?.toLocaleString('es-AR') || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              {(priceType === 'all' || priceType === 'wholesale') && (
                                <div>
                                  <p className="text-gray-600 font-medium">Precio Mayorista:</p>
                                  <div className="flex items-center gap-2">
                                    <span className="line-through text-gray-400">
                                      ${product.wholesale_price.toLocaleString('es-AR')}
                                    </span>
                                    <span className="font-semibold text-blue-600">
                                      ${product.new_wholesale_price?.toLocaleString('es-AR') || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </CardHoverEffect>
          </div>
        </div>
      </div>
    </div>
  )
}