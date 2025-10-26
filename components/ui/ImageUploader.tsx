'use client'

import { useState } from 'react'
import { Upload, X, Image as ImageIcon, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { supabase } from '@/lib/supabase/client-fixed'

interface ImageUploaderProps {
  existingImages?: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  className?: string
}

export function ImageUploader({ 
  existingImages = [], 
  onImagesChange, 
  maxImages = 10,
  className = '' 
}: ImageUploaderProps) {
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)

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

    // Validar límite máximo de imágenes
    const totalImages = existingImages.length + imageFiles.length + validSizeFiles.length
    if (totalImages > maxImages) {
      alert(`No puedes subir más de ${maxImages} imágenes`)
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
    if (index < existingImages.length) {
      const newExistingImages = existingImages.filter((_, i) => i !== index)
      onImagesChange(newExistingImages)
    } else {
      // Si es una imagen nueva, la removemos de los archivos y previews
      const newFileIndex = index - existingImages.length
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

  // Función para obtener todas las imágenes (existentes + nuevas)
  const getAllImages = () => {
    return [...existingImages, ...imagePreviews]
  }

  // Función para obtener solo las URLs de las imágenes existentes
  const getExistingImageUrls = () => {
    return existingImages
  }

  // Función para obtener solo las previews de las nuevas imágenes
  const getNewImagePreviews = () => {
    return imagePreviews
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Imágenes Existentes */}
      {existingImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Imágenes actuales:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {existingImages.map((imageUrl, index) => (
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
          {existingImages.length > 0 ? 'Agregar Imágenes' : 'Seleccionar Imágenes'}
        </label>
        <p className="text-xs text-gray-500 mt-2">
          Máximo 5MB por imagen. Formatos: JPG, PNG, WebP
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {getAllImages().length}/{maxImages} imágenes
        </p>
      </div>

      {/* Image Previews */}
      {imageFiles.length > 0 && (
        <div>
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
                  onClick={() => removeImage(existingImages.length + index)}
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

      {/* Exportar funciones para uso externo */}
      <div style={{ display: 'none' }}>
        {/* Estas funciones están disponibles a través de refs si es necesario */}
        {uploadImagesToSupabase && getAllImages && getExistingImageUrls && getNewImagePreviews}
      </div>
    </div>
  )
}

// Hook personalizado para usar el ImageUploader
export function useImageUploader(existingImages: string[] = []) {
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)

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

  const getAllImages = () => {
    return [...existingImages, ...imagePreviews]
  }

  return {
    imageFiles,
    setImageFiles,
    imagePreviews,
    setImagePreviews,
    uploadingImages,
    uploadImagesToSupabase,
    getAllImages
  }
}
