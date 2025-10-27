'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Image as ImageIcon, GripVertical, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ImageFile {
  id: string
  file: File
  preview: string
  uploading: boolean
  url?: string
}

interface ImageUploaderProps {
  images: ImageFile[]
  onImagesChange: (images: ImageFile[]) => void
  maxImages?: number
}

export function ImageUploader({ images, onImagesChange, maxImages = 10 }: ImageUploaderProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          const maxSize = 1200

          // Redimensionar si es necesario
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height
              height = maxSize
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('No se pudo obtener el contexto del canvas'))
            return
          }

          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Error al comprimir la imagen'))
                return
              }
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(compressedFile)
            },
            'image/jpeg',
            0.85 // Calidad 85%
          )
        }
        img.onerror = () => reject(new Error('Error al cargar la imagen'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Error al leer el archivo'))
      reader.readAsDataURL(file)
    })
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      if (!validTypes.includes(file.type)) {
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        return false
      }
      return true
    })

    if (validFiles.length !== fileArray.length) {
      alert('Algunos archivos no son válidos. Solo se permiten imágenes JPG, PNG, WebP o GIF menores a 10MB')
    }

    if (images.length + validFiles.length > maxImages) {
      alert(`Solo se pueden subir hasta ${maxImages} imágenes`)
      return
    }

    // Comprimir y agregar imágenes
    const newImages: ImageFile[] = []
    for (const file of validFiles) {
      try {
        const compressed = await compressImage(file)
        const reader = new FileReader()
        
        const imageData: ImageFile = {
          id: `${Date.now()}-${Math.random()}`,
          file: compressed,
          preview: '',
          uploading: false
        }

        reader.onload = (e) => {
          imageData.preview = e.target?.result as string
        }
        reader.readAsDataURL(compressed)

        // Esperar a que termine la lectura
        await new Promise(resolve => setTimeout(resolve, 100))

        newImages.push(imageData)
      } catch (error) {
        console.error('Error comprimiendo imagen:', error)
      }
    }

    onImagesChange([...images, ...newImages])
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }, [images])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const removeImage = (id: string) => {
    onImagesChange(images.filter(img => img.id !== id))
  }

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...images]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex >= 0 && newIndex < images.length) {
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]]
      onImagesChange(newImages)
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 hover:border-purple-500 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="p-12 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                Arrastra imágenes aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Formatos: JPG, PNG, WebP, GIF (hasta 10MB cada una)
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Máximo {maxImages} imágenes • Se optimizarán automáticamente
              </p>
            </div>
            <Button type="button" className="bg-purple-600 hover:bg-purple-700">
              Seleccionar Imágenes
            </Button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </Card>

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative"
              >
                <Card className="overflow-hidden aspect-square">
                  {image.uploading ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
                        <p className="text-xs text-gray-600">Subiendo...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="bg-white text-gray-900 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeImage(image.id)
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          {index > 0 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="bg-white text-gray-900 hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation()
                                moveImage(index, 'up')
                              }}
                            >
                              ↑
                            </Button>
                          )}
                          {index < images.length - 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="bg-white text-gray-900 hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation()
                                moveImage(index, 'down')
                              }}
                            >
                              ↓
                            </Button>
                          )}
                        </div>
                      </div>
                      {index === 0 && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">Principal</span>
                        </div>
                      )}
                    </>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {images.length === 0 && (
        <Card className="p-8 text-center border-dashed">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No hay imágenes seleccionadas</p>
        </Card>
      )}

      {/* Contador */}
      {images.length > 0 && (
        <div className="text-sm text-gray-600 text-center">
          {images.length} de {maxImages} imágenes seleccionadas
        </div>
      )}
    </div>
  )
}

